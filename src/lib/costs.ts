import dayjs from 'dayjs'
import { type GoogleSpreadsheetRow } from 'google-spreadsheet'

import { getNumber } from '@/util/functions'

import { getGoogleSheetRows, getGoogleSheetWorkSheet } from './sheets'

type GoogleCostRow = GoogleSpreadsheetRow<Omit<Kitchen.Cost.ServerItem, 'name'>>
const BASE_COST_ITEM = {
  amount: 0,
}

export function serverToCostItem(item: Kitchen.Cost.ServerItem): Kitchen.Cost.Item {
  return { ...item, created: dayjs(item.created), modified: dayjs(item.modified) }
}

function googleToServer(row: GoogleCostRow): Kitchen.Cost.ServerItem {
  return {
    id: row.get('id'),
    name: `Cost #${row.rowNumber.toString().padStart(3, '0')}`,
    amount: getNumber(row.get('amount')),
    created: row.get('created'),
    createdBy: row.get('createdBy'),
    modified: row.get('modified'),
    lastModifiedBy: row.get('lastModifiedBy'),
  }
}

export async function getGoogleCostRows(): Promise<GoogleCostRow[]> {
  return await getGoogleSheetRows<Kitchen.Cost.ServerItem>(
    process.env.SPREADSHEET_KEY,
    process.env.KITCHEN_COST_SHEET_KEY,
  )
}
export async function findGoogleCostRows(
  filter: (row: GoogleCostRow) => boolean,
): Promise<GoogleCostRow | undefined> {
  return (await getGoogleCostRows()).find(filter)
}
export async function getCosts(): Promise<Kitchen.Cost.ServerItem[]> {
  return (await getGoogleCostRows()).map(googleToServer)
}
export async function getCostsBy(
  filter: (item: Kitchen.Cost.ServerItem) => boolean,
): Promise<Kitchen.Cost.ServerItem[]> {
  return (await getCosts()).filter(filter)
}
export async function findCostItem(
  filter: (item: Kitchen.Cost.ServerItem) => boolean,
): Promise<Kitchen.Cost.ServerItem | undefined> {
  return (await getCosts()).find(filter)
}

export async function createCostItem(
  payload: Kitchen.Cost.CreatePayload | Kitchen.Cost.CreatePayload[],
): Promise<Kitchen.Cost.ServerItem[]> {
  const workSheet = await getGoogleSheetWorkSheet(
    process.env.SPREADSHEET_KEY,
    process.env.KITCHEN_COST_SHEET_KEY,
  )
  const payloads: Kitchen.Cost.CreatePayload[] = Array.isArray(payload) ? [...payload] : [payload]

  const newRows: RawRowData[] = payloads.map((data) => {
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

  return (await workSheet.addRows(newRows)).map(googleToServer)
}
export async function updateCostItem(
  costId: string,
  payload: Kitchen.Cost.EditPayload,
  validator?: (item: GoogleCostRow) => boolean,
): Promise<Kitchen.Cost.ServerItem | undefined> {
  const googleItem = await findGoogleCostRows((r) => r.get('id') === costId)

  if (googleItem) {
    if (validator && !validator(googleItem)) return undefined
    const originalData = googleItem.toObject() as unknown as Omit<Kitchen.Cost.ServerItem, 'name'>
    const now = dayjs().format()
    const updatedData: Omit<Kitchen.Cost.ServerItem, 'name'> = {
      ...originalData,
      ...payload,
      modified: now,
    }

    googleItem.assign(updatedData)
    await googleItem.save()

    return googleToServer(googleItem)
  }
}
export async function deleteCostItem(
  costId: string,
  validator?: (item: GoogleCostRow) => boolean,
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
  ids: string[],
  validator?: (item: GoogleCostRow) => boolean,
): Promise<boolean> {
  const rows = (await getGoogleCostRows()).filter((item) => {
    return ids.includes(item.get('id') as string) && (validator ? validator(item) : true)
  })

  await Promise.all(
    rows.map(async (r) => {
      await r.delete()

      return true
    }),
  )

  return true
}
