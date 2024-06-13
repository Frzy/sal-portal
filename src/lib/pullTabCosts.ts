import dayjs from 'dayjs'
import { type GoogleSpreadsheetRow } from 'google-spreadsheet'

import { getNumber } from '@/util/functions'

import { getGoogleSheetRows, getGoogleSheetWorkSheet } from './sheets'

type GoogleCostRow = GoogleSpreadsheetRow<PullTab.Cost.ServerItem>
const BASE_COST_ITEM = {
  tabPrice: 0,
  boxPrice: 0,
}

function googleToServer(row: GoogleCostRow): PullTab.Cost.ServerItem {
  return {
    id: row.get('id'),
    tabPrice: getNumber(row.get('tabPrice')),
    boxPrice: getNumber(row.get('boxPrice')),
    created: row.get('created'),
    createdBy: row.get('createdBy'),
    modified: row.get('modified'),
    lastModifiedBy: row.get('lastModifiedBy'),
  }
}

export async function getGoogleCostRows(): Promise<GoogleCostRow[]> {
  return await getGoogleSheetRows<PullTab.Cost.ServerItem>(
    process.env.SPREADSHEET_KEY,
    process.env.PULLTAB_COST_SHEET_KEY,
  )
}
export async function findGoogleCostRows(
  filter: (row: GoogleCostRow) => boolean,
): Promise<GoogleCostRow | undefined> {
  return (await getGoogleCostRows()).find(filter)
}
export async function getCosts(): Promise<PullTab.Cost.ServerItem[]> {
  return (await getGoogleCostRows()).map(googleToServer)
}
export async function getCostsBy(
  filter: (item: PullTab.Cost.ServerItem) => boolean,
): Promise<PullTab.Cost.ServerItem[]> {
  return (await getCosts()).filter(filter)
}
export async function findCostItem(
  filter: (item: PullTab.Cost.ServerItem) => boolean,
): Promise<PullTab.Cost.ServerItem | undefined> {
  return (await getCosts()).find(filter)
}

export async function createCostItem(
  payload: PullTab.Cost.CreatePayload | PullTab.Cost.CreatePayload[],
): Promise<PullTab.Cost.ServerItem[]> {
  const workSheet = await getGoogleSheetWorkSheet(
    process.env.SPREADSHEET_KEY,
    process.env.PULLTAB_COST_SHEET_KEY,
  )
  const payloads: PullTab.Cost.CreatePayload[] = Array.isArray(payload) ? [...payload] : [payload]

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
  payload: PullTab.Cost.EditPayload,
  validator?: (item: GoogleCostRow) => boolean,
): Promise<PullTab.Cost.ServerItem | undefined> {
  const row = await findGoogleCostRows((r) => {
    const isValid = validator ? validator(r) : true
    return r.get('id') === costId && isValid
  })

  if (row) {
    const originalData = row.toObject() as unknown as PullTab.Cost.ServerItem
    const now = dayjs().format()
    const updatedData: PullTab.Cost.ServerItem = {
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
