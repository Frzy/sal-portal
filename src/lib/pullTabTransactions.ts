import dayjs from 'dayjs'
import { type GoogleSpreadsheetRow } from 'google-spreadsheet'

import { getNumber } from '@/util/functions'

import { getGoogleSheetRows, getGoogleSheetWorkSheet } from './sheets'

type GoogleTransactionRow = GoogleSpreadsheetRow<PullTab.Transaction.ServerItem>

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
  let runningTotal = 0
  return (await getGoogleTransactionRows()).map((row) => {
    const item = googleToServer(row)
    runningTotal +=
      item.type === 'MachineWithdrawal' || item.type === 'BankDeposit' ? 0 : item.amount

    return { ...item, runningTotal }
  })
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
  payload: PullTab.Transaction.CreatePayload,
): Promise<PullTab.Transaction.ServerItem[]> {
  const workSheet = await getGoogleSheetWorkSheet(
    process.env.SPREADSHEET_KEY,
    process.env.PULLTAB_TRANSACTION_SHEET_KEY,
  )
  const payloads: PullTab.Transaction.ItemPayload[] = []

  if (payload.machine) {
    payloads.push({ type: 'MachineWithdrawal', amount: payload.machine })
  }
  if (payload.bar) {
    payloads.push({ type: 'BarPayback', amount: payload.bar })
  }
  if (payload.bag) {
    payloads.push({ type: 'BagPayback', amount: payload.bag })
  }
  if (payload.bagWithdrawal) {
    payloads.push({ type: 'BagWithdrawal', amount: Math.abs(payload.bagWithdrawal) * -1 })
  }
  if (payload.bank) {
    payloads.push({ type: 'BankDeposit', amount: payload.bank })
  }
  if (payload.payout) {
    payloads.push({ type: 'TabPayout', amount: Math.abs(payload.payout) * -1 })
  }

  const newRows: RawRowData[] = payloads.map((data) => {
    const now = dayjs().format()

    return {
      ...data,
      id: crypto.randomUUID(),
      createdBy: payload.createdBy,
      lastModifiedBy: payload.createdBy,
      created: now,
      modified: now,
    }
  })

  if (newRows.length) {
    return (await workSheet.addRows(newRows)).map(googleToServer)
  }

  return []
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
