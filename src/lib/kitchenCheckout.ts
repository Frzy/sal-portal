import dayjs from 'dayjs'
import { type GoogleSpreadsheetRow } from 'google-spreadsheet'

import { getNumber } from '@/util/functions'

import { getGoogleSheetRows, getGoogleSheetWorkSheet } from './sheets'

type GoogleCheckoutRow = GoogleSpreadsheetRow<Kitchen.Checkout.ServerItem>

const BASE_CHECKOUT_ITEM = {
  totalSales: 0,
  creditCardSales: 0,
  deposit: 0,
}

function checkoutMapper(row: GoogleCheckoutRow): Kitchen.Checkout.ServerItem {
  return {
    created: row.get('created'),
    createdBy: row.get('createdBy'),
    creditCardSales: getNumber(row.get('creditCardSales')),
    deposit: getNumber(row.get('deposit')),
    description: row.get('description'),
    id: row.get('id'),
    lastModifiedBy: row.get('lastModifiedBy'),
    modified: row.get('modified'),
    totalSales: getNumber(row.get('totalSales')),
  }
}

export async function getGoogleCheckoutRows(): Promise<GoogleCheckoutRow[]> {
  return await getGoogleSheetRows<Kitchen.Checkout.ServerItem>(
    process.env.SPREADSHEET_KEY,
    process.env.KITCHEN_CHECKOUT_SHEET_KEY,
  )
}
export async function findGoogleCheckoutRows(
  filter: (row: GoogleCheckoutRow) => boolean,
): Promise<GoogleCheckoutRow | undefined> {
  return (await getGoogleCheckoutRows()).find(filter)
}

export async function getCheckouts(): Promise<Kitchen.Checkout.ServerItem[]> {
  return (await getGoogleCheckoutRows()).map(checkoutMapper)
}
export async function getCheckoutsBy(
  filter: (item: Kitchen.Checkout.ServerItem) => boolean,
): Promise<Kitchen.Checkout.ServerItem[]> {
  return (await getCheckouts()).filter(filter)
}
export async function findCheckout(
  filter: (item: Kitchen.Checkout.ServerItem) => boolean,
): Promise<Kitchen.Checkout.ServerItem | undefined> {
  return (await getCheckouts()).find(filter)
}

export async function createCheckouts(
  payload: Kitchen.Checkout.CreatePayload | Kitchen.Checkout.CreatePayload[],
): Promise<Kitchen.Checkout.ServerItem[]> {
  const workSheet = await getGoogleSheetWorkSheet(
    process.env.SPREADSHEET_KEY,
    process.env.KITCHEN_CHECKOUT_SHEET_KEY,
  )
  const newItems: Kitchen.Checkout.CreatePayload[] = Array.isArray(payload)
    ? [...payload]
    : [payload]

  const newRows: RawRowData[] = newItems.map((data) => {
    const { description, ...details } = data
    const now = dayjs().format()

    return {
      ...BASE_CHECKOUT_ITEM,
      ...details,
      id: crypto.randomUUID(),
      description: description ?? '',
      created: now,
      modified: now,
      lastModifiedBy: details.createdBy,
    }
  })

  return ((await workSheet.addRows(newRows)) as unknown as GoogleCheckoutRow[]).map(checkoutMapper)
}
export async function updateCheckout(
  costId: string,
  payload: Kitchen.Checkout.EditPayload,
  validator?: (item: GoogleCheckoutRow) => boolean,
): Promise<Kitchen.Checkout.ServerItem | undefined> {
  const rowItem = await findGoogleCheckoutRows((r) => r.get('id') === costId)

  if (rowItem) {
    if (validator && !validator(rowItem)) return undefined

    const now = dayjs().format()

    const updatedData: Kitchen.Checkout.ServerItem = {
      ...(rowItem.toObject() as Kitchen.Checkout.ServerItem),
      ...payload,
      modified: now,
    }

    rowItem.assign(updatedData)
    await rowItem.save()

    return checkoutMapper(rowItem)
  }
}
export async function deleteCheckout(
  itemId: string,
  validator?: (item: GoogleCheckoutRow) => boolean,
): Promise<boolean> {
  const rowItem = await findGoogleCheckoutRows((u) => u.get('id') === itemId)

  if (rowItem) {
    if (validator && !validator(rowItem)) return false

    await rowItem.delete()
    // TODO - Need to delete the associated CheckoutDetails

    return true
  }

  return false
}
export async function deleteCheckouts(
  itemIds: string[],
  validator?: (item: GoogleCheckoutRow) => boolean,
): Promise<boolean> {
  const rows = (await getGoogleCheckoutRows()).filter((item) => {
    return itemIds.includes(item.get('id') as string) && (validator ? validator(item) : true)
  })
  // const rowIds = rows.map((r) => r.get('id') as string)

  await Promise.all(
    rows.map(async (r) => {
      await r.delete()

      return true
    }),
  )

  // TODO - Need to use rowIds to delete all associated CheckoutDetails

  return true
}
