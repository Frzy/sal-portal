import dayjs from 'dayjs'
import { type GoogleSpreadsheetRow } from 'google-spreadsheet'

import { getNumber } from '@/util/functions'

import { getGoogleSheetRows, getGoogleSheetWorkSheet } from './sheets'

type GoogleOrderRow = GoogleSpreadsheetRow<Kitchen.Order.ServerItem>

const BASE_ORDER_ITEM = {
  menuItemName: '',
  menuItemPrice: 0,
  menuItemQuantity: 0,
  menuItemHasDrinkChip: false,
}

function googleToServerOrder(row: GoogleOrderRow): Kitchen.Order.ServerItem {
  return {
    id: row.get('id'),
    checkoutId: row.get('checkoutId'),
    menuItemName: row.get('menuItemName'),
    menuItemPrice: getNumber(row.get('menuItemPrice')),
    menuItemQuantity: getNumber(row.get('menuItemQuantity')),
    menuItemHasDrinkChip: row.get('menuItemHasDrinkChip') === 'TRUE',
    created: row.get('created'),
    createdBy: row.get('createdBy'),
    modified: row.get('modified'),
    lastModifiedBy: row.get('lastModifiedBy'),
  }
}

export async function getGoogleOrderRows(): Promise<GoogleOrderRow[]> {
  return await getGoogleSheetRows<Kitchen.Order.ServerItem>(
    process.env.SPREADSHEET_KEY,
    process.env.KITCHEN_ORDER_SHEET_KEY,
  )
}
export async function findGoogleOrderRows(
  filter: (row: GoogleOrderRow) => boolean,
): Promise<GoogleOrderRow | undefined> {
  return (await getGoogleOrderRows()).find(filter)
}

export async function getOrders(): Promise<Kitchen.Order.ServerItem[]> {
  return (await getGoogleOrderRows()).map(googleToServerOrder)
}
export async function getOrdersBy(
  filter: (item: Kitchen.Order.ServerItem) => boolean,
): Promise<Kitchen.Order.ServerItem[]> {
  return (await getOrders()).filter(filter)
}
export async function findCheckout(
  filter: (item: Kitchen.Order.ServerItem) => boolean,
): Promise<Kitchen.Order.ServerItem | undefined> {
  return (await getOrders()).find(filter)
}

export async function createOrders(
  payload: Kitchen.Order.CreatePayload | Kitchen.Order.CreatePayload[],
): Promise<Kitchen.Order.ServerItem[]> {
  const workSheet = await getGoogleSheetWorkSheet(
    process.env.SPREADSHEET_KEY,
    process.env.KITCHEN_ORDER_SHEET_KEY,
  )

  const payloads: Kitchen.Order.CreatePayload[] = Array.isArray(payload) ? [...payload] : [payload]

  const newRows: RawRowData[] = payloads.map((data) => {
    const now = dayjs().format()

    return {
      ...BASE_ORDER_ITEM,
      ...data,
      id: crypto.randomUUID(),
      lastModifiedBy: data.createdBy,
      created: now,
      modified: now,
    }
  })

  return (await workSheet.addRows(newRows)).map(googleToServerOrder)
}
export async function updateOrder(
  costId: string,
  payload: Kitchen.Checkout.EditPayload,
  validator?: (item: GoogleOrderRow) => boolean,
): Promise<Kitchen.Order.ServerItem | undefined> {
  const rowItem = await findGoogleOrderRows((r) => r.get('id') === costId)

  if (rowItem) {
    if (validator && !validator(rowItem)) return undefined

    const now = dayjs().format()

    const updatedData: Kitchen.Order.ServerItem = {
      ...(rowItem.toObject() as Kitchen.Order.ServerItem),
      ...payload,
      modified: now,
    }

    rowItem.assign(updatedData)
    await rowItem.save()

    return googleToServerOrder(rowItem)
  }
}
export async function deleteOrder(
  itemId: string,
  validator?: (item: GoogleOrderRow) => boolean,
): Promise<boolean> {
  const rowItem = await findGoogleOrderRows((u) => u.get('id') === itemId)

  if (rowItem) {
    if (validator && !validator(rowItem)) return false

    await rowItem.delete()

    return true
  }

  return false
}
export async function deleteOrders(
  itemIds: string[],
  validator?: (item: GoogleOrderRow) => boolean,
): Promise<boolean> {
  const rows = (await getGoogleOrderRows()).filter((item) => {
    return itemIds.includes(item.get('id') as string) && (validator ? validator(item) : true)
  })

  await Promise.all(
    rows.map(async (r) => {
      await r.delete()

      return true
    }),
  )

  return true
}
