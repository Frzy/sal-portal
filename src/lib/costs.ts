import dayjs from 'dayjs'
import { type GoogleSpreadsheetRow } from 'google-spreadsheet'

import { getCurrentLegionYear, getNumber } from '@/util/functions'

import { getGoogleSheetRows, getGoogleSheetWorkSheet } from './sheets'

type GoogleCostRow = GoogleSpreadsheetRow<Omit<Kitchen.Cost.ServerItem, 'name'>>
const BASE_COST_ITEM = {
  amount: 0,
}

function googleToServer(row: GoogleCostRow): Kitchen.Cost.ServerItem {
  return {
    id: row.get('id'),
    name: `Cost #${(row.rowNumber - 1).toString().padStart(4, '0')}`,
    amount: getNumber(row.get('amount')),
    created: row.get('created'),
    createdBy: row.get('createdBy'),
    modified: row.get('modified'),
    lastModifiedBy: row.get('lastModifiedBy'),
    checkoutId: row.get('checkoutId') ? row.get('checkoutId') : undefined,
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
export async function getCurrentYearCosts(): Promise<Kitchen.Cost.ServerItem[]> {
  const dates = getCurrentLegionYear()

  return await getCostsBy((item) => {
    const created = dayjs(item.created)

    return created.isAfter(dates.startDate) && created.isBefore(dates.endDate)
  })
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
    const now = dayjs().format()

    return {
      ...BASE_COST_ITEM,
      ...data,
      id: crypto.randomUUID(),
      lastModifiedBy: data.createdBy,
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
  const row = await findGoogleCostRows((r) => {
    const isValid = validator ? validator(r) : true
    return r.get('id') === costId && isValid
  })

  if (row) {
    const originalData = row.toObject() as unknown as Omit<Kitchen.Cost.ServerItem, 'name'>
    const now = dayjs().format()
    const updatedData: Omit<Kitchen.Cost.ServerItem, 'name'> = {
      ...originalData,
      ...payload,
      modified: now,
    }

    row.assign(updatedData)
    await row.save()

    return googleToServer(row)
  }
}
export async function deleteCostItems(
  ids: string[],
  validator?: (item: GoogleCostRow) => boolean,
): Promise<boolean> {
  const rows = (await getGoogleCostRows()).filter((item) => {
    return ids.includes(item.get('id') as string) && (validator ? validator(item) : true)
  })

  await rows.reduce(async (p, row) => {
    return await p.then(async () => await row.delete())
  }, Promise.resolve())

  return true
}
