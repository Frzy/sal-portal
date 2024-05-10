import dayjs from 'dayjs'
import { type GoogleSpreadsheetRow } from 'google-spreadsheet'

import { getNumber } from '@/util/functions'

import { createCostItem } from './costs'
import { createOrders, getOrders } from './orders'
import { getGoogleSheetRows, getGoogleSheetWorkSheet } from './sheets'

type GoogleCheckoutRow = GoogleSpreadsheetRow<Omit<Kitchen.Checkout.ServerItem, 'orders' | 'name'>>

const BASE_CHECKOUT_ITEM = {
  totalSales: 0,
  creditCardSales: 0,
  deposit: 0,
}

function googleToServerCheckout(row: GoogleCheckoutRow): Kitchen.Checkout.ServerItem {
  return {
    id: row.get('id'),
    name: `Checkout #${(row.rowNumber - 1).toString().padStart(4, '0')}`,
    created: row.get('created'),
    createdBy: row.get('createdBy'),
    creditCardSales: getNumber(row.get('creditCardSales')),
    deposit: getNumber(row.get('deposit')),
    drinkChips: getNumber(row.get('drinkChips')),
    expenses: row.get('expenses'),
    lastModifiedBy: row.get('lastModifiedBy'),
    modified: row.get('modified'),
    sales: getNumber(row.get('sales')),
    orders: [],
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
  const allCheckouts = (await getGoogleCheckoutRows()).map(googleToServerCheckout)
  const allOrders = await getOrders()

  return allCheckouts.map((checkout) => ({
    ...checkout,
    orders: allOrders.filter((o) => o.checkoutId === checkout.id),
  }))
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
  const now = dayjs().format()
  const workSheet = await getGoogleSheetWorkSheet(
    process.env.SPREADSHEET_KEY,
    process.env.KITCHEN_CHECKOUT_SHEET_KEY,
  )
  const payloads: Kitchen.Checkout.CreatePayload[] = Array.isArray(payload)
    ? [...payload]
    : [payload]

  let checkoutRows: RawRowData[] = []
  let costPayloads: Kitchen.Cost.CreatePayload[] = []
  let orderPayloads: Kitchen.Order.CreatePayload[] = []

  payloads.forEach((p) => {
    const { orders, ...other } = p
    const id = crypto.randomUUID()
    const checkPayload = {
      ...BASE_CHECKOUT_ITEM,
      ...other,
      id,
      created: now,
      modified: now,
      lastModifiedBy: p.createdBy,
    } satisfies RawRowData

    if (p.drinkChips + p.expenses > 0) {
      costPayloads = [
        ...costPayloads,
        { amount: p.drinkChips + p.expenses, createdBy: p.createdBy },
      ]
    }

    checkoutRows = [...checkoutRows, checkPayload]
    orderPayloads = [
      ...orderPayloads,
      ...orders.map((o) => ({
        checkoutId: id,
        menuItemHasDrinkChip: o.menuItem.hasDrinkChip,
        menuItemName: o.menuItem.name,
        menuItemPrice: o.menuItem.price,
        menuItemQuantity: o.quantity,
        createdBy: p.createdBy,
      })),
    ]
  })

  let allOrders: Kitchen.Order.ServerItem[] = []

  if (costPayloads.length) {
    await createCostItem(costPayloads)
  }

  if (orderPayloads.length) {
    allOrders = await createOrders(orderPayloads)
  }

  const allCheckouts = (await workSheet.addRows(checkoutRows)).map(googleToServerCheckout)

  if (allOrders.length) {
    return allCheckouts.map((checkout) => ({
      ...checkout,
      orders: allOrders.filter((o) => o.checkoutId === checkout.id),
    }))
  }

  return allCheckouts
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

    const updatedData: Omit<Kitchen.Checkout.ServerItem, 'orders' | 'name'> = {
      ...(rowItem.toObject() as Kitchen.Checkout.ServerItem),
      ...payload,
      modified: now,
    }

    rowItem.assign(updatedData)
    await rowItem.save()

    return googleToServerCheckout(rowItem)
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
