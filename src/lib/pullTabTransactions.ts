import dayjs from 'dayjs'
import { type GoogleSpreadsheetRow } from 'google-spreadsheet'

import { getNumber } from '@/util/functions'

import { getGoogleSheetRows, getGoogleSheetWorkSheet } from './sheets'

type GoogleTransactionRow = GoogleSpreadsheetRow<PullTab.Transaction.ServerItem>
const BASE_TRANSACTION_ITEM = {
  type: 'TabPayout',
  amount: 0,
}

function googleToServer(row: GoogleTransactionRow): PullTab.Transaction.ServerItem {
  return {
    id: row.get('id'),
    type: row.get('type'),
    amount: getNumber(row.get('amount')),
    created: row.get('created'),
    createdBy: row.get('createdBy'),
    modified: row.get('modified'),
    lastModifiedBy: row.get('lastModifiedBy'),
  }
}

export async function getGoogleTransactionRows(): Promise<GoogleTransactionRow[]> {
  return await getGoogleSheetRows<PullTab.Transaction.ServerItem>(
    process.env.SPREADSHEET_KEY,
    process.env.PULLTAB_TRANSACTION_SHEET_KEY,
  )
}
export async function findGoogleTransactionRows(
  filter: (row: GoogleTransactionRow) => boolean,
): Promise<GoogleTransactionRow | undefined> {
  return (await getGoogleTransactionRows()).find(filter)
}
export async function getTransaction(): Promise<PullTab.Transaction.ServerItem[]> {
  return (await getGoogleTransactionRows()).map(googleToServer)
}
export async function getTransactionBy(
  filter: (item: PullTab.Transaction.ServerItem) => boolean,
): Promise<PullTab.Transaction.ServerItem[]> {
  return (await getTransaction()).filter(filter)
}
export async function findTransactionItem(
  filter: (item: PullTab.Transaction.ServerItem) => boolean,
): Promise<PullTab.Transaction.ServerItem | undefined> {
  return (await getTransaction()).find(filter)
}

export async function createTransactionItem(
  payload: PullTab.Transaction.CreatePayload | PullTab.Transaction.CreatePayload[],
): Promise<PullTab.Transaction.ServerItem[]> {
  const workSheet = await getGoogleSheetWorkSheet(
    process.env.SPREADSHEET_KEY,
    process.env.PULLTAB_TRANSACTION_SHEET_KEY,
  )
  const payloads: PullTab.Transaction.CreatePayload[] = Array.isArray(payload)
    ? [...payload]
    : [payload]

  const newRows: RawRowData[] = payloads.map((data) => {
    const now = dayjs().format()

    return {
      ...BASE_TRANSACTION_ITEM,
      ...data,
      id: crypto.randomUUID(),
      lastModifiedBy: data.createdBy,
      created: now,
      modified: now,
    }
  })

  return (await workSheet.addRows(newRows)).map(googleToServer)
}
export async function updateTransactionItem(
  transactionId: string,
  payload: PullTab.Transaction.EditPayload,
  validator?: (item: GoogleTransactionRow) => boolean,
): Promise<PullTab.Transaction.ServerItem | undefined> {
  const row = await findGoogleTransactionRows((r) => {
    const isValid = validator ? validator(r) : true
    return r.get('id') === transactionId && isValid
  })

  if (row) {
    const originalData = row.toObject() as unknown as PullTab.Transaction.ServerItem
    const now = dayjs().format()
    const updatedData: PullTab.Transaction.ServerItem = {
      ...originalData,
      ...payload,
      modified: now,
    }

    row.assign(updatedData)
    await row.save()

    return googleToServer(row)
  }
}
export async function deleteTransactionItems(
  ids: string[],
  validator?: (item: GoogleTransactionRow) => boolean,
): Promise<boolean> {
  const rows = (await getGoogleTransactionRows()).filter((item) => {
    return ids.includes(item.get('id') as string) && (validator ? validator(item) : true)
  })

  await rows.reduce(async (p, row) => {
    return await p.then(async () => await row.delete())
  }, Promise.resolve())

  return true
}
