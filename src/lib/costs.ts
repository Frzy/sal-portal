import dayjs from 'dayjs'
import { type GoogleSpreadsheetRow } from 'google-spreadsheet'

import { getGoogleSheetRows, getGoogleSheetWorkSheet } from './sheets'

const BASE_COST_ITEM = {
  amount: '0',
}

function costMapper(row: GoogleSpreadsheetRow<Kitchen.CostRow>): Kitchen.CostItem {
  const item = row.toObject()
  const amount = parseInt(item?.amount ?? '0')

  return {
    id: item?.id ?? '',
    name: `Cost #${row.rowNumber.toString().padStart(3, '0')}`,
    amount,
    created: item?.created ?? '',
    createdBy: item?.createdBy ?? '',
    modified: item?.modified ?? '',
    lastModifiedBy: item?.lastModifiedBy ?? '',
  } satisfies Kitchen.CostItem
}

export async function getGoogleCostRows(): Promise<GoogleSpreadsheetRow<Kitchen.CostRow>[]> {
  return await getGoogleSheetRows<Kitchen.CostRow>(
    process.env.SPREADSHEET_KEY,
    process.env.KITCHEN_COST_SHEET_KEY,
  )
}
export async function findGoogleCostRows(
  filter: (row: GoogleSpreadsheetRow<Kitchen.CostRow>) => boolean,
): Promise<GoogleSpreadsheetRow<Kitchen.CostRow> | undefined> {
  return (await getGoogleCostRows()).find(filter)
}
export async function getCosts(): Promise<Kitchen.CostItem[]> {
  return (await getGoogleCostRows()).map(costMapper)
}
export async function getCostsBy(
  filter: (item: Kitchen.CostItem) => boolean,
): Promise<Kitchen.CostItem[]> {
  return (await getCosts()).filter(filter)
}
export async function findCostItem(
  filter: (item: Kitchen.CostItem) => boolean,
): Promise<Kitchen.CostItem | undefined> {
  return (await getCosts()).find(filter)
}

export async function createCostItem(
  payload: Kitchen.CostItemCreatePayload | Kitchen.CostItemCreatePayload[],
): Promise<Kitchen.CostItem> {
  const workSheet = await getGoogleSheetWorkSheet(
    process.env.SPREADSHEET_KEY,
    process.env.KITCHEN_COST_SHEET_KEY,
  )
  const newItems: Kitchen.CostItemCreatePayload[] = Array.isArray(payload)
    ? [...payload]
    : [payload]

  const newRows: Kitchen.CostRow[] = newItems.map((data) => {
    const { amount, ...details } = data
    const now = dayjs().format()

    return {
      ...BASE_COST_ITEM,
      ...details,
      amount: `${amount}`,
      id: crypto.randomUUID(),
      lastModifiedBy: details.createdBy,
      created: now,
      modified: now,
    }
  })

  // @ts-expect-error Not sure how to cast this
  return (await workSheet.addRows(newRows)).map(costMapper)
}
export async function updateCostItem(
  costId: string,
  payloadData: Kitchen.CostItemEditPayload,
  validator?: (item: GoogleSpreadsheetRow<Kitchen.CostRow>) => boolean,
): Promise<Kitchen.CostItem | undefined> {
  const rowItem = await findGoogleCostRows((r) => r.get('id') === costId)

  if (rowItem) {
    if (validator && !validator(rowItem)) return undefined

    const { amount, ...payload } = payloadData
    const now = dayjs().format()

    const updatedData: Kitchen.CostRow = {
      ...(rowItem.toObject() as Kitchen.CostRow),
      ...payload,
      amount: `${amount}`,
      modified: now,
    }

    rowItem.assign(updatedData)
    await rowItem.save()

    return costMapper(rowItem)
  }
}
export async function deleteCostItem(
  costId: string,
  validator?: (item: GoogleSpreadsheetRow<Kitchen.CostRow>) => boolean,
): Promise<boolean> {
  const rowItem = await findGoogleCostRows((u) => u.get('id') === costId)

  if (rowItem) {
    if (validator && !validator(rowItem)) return false

    await rowItem.delete()

    return true
  }

  return false
}
export async function deleteCostItems(
  costIds: string[],
  validator?: (item: GoogleSpreadsheetRow<Kitchen.CostRow>) => boolean,
): Promise<boolean> {
  const rows = (await getGoogleCostRows()).filter((item) => {
    return costIds.includes(item.get('id') as string) && (validator ? validator(item) : true)
  })

  await Promise.all(
    rows.map(async (r) => {
      await r.delete()

      return true
    }),
  )

  return true
}
