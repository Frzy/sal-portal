import dayjs from 'dayjs'
import { type GoogleSpreadsheetRow } from 'google-spreadsheet'

import { getNumber } from '@/util/functions'

import { getGoogleSheetRows, getGoogleSheetWorkSheet } from './sheets'

type GoogleQohEntryRow = GoogleSpreadsheetRow<Omit<QoH.Entry.ServerItem, 'orders' | 'name'>>

const BASE_QOH_ENTRY = {
  ticketSales: 0,
  cardPayout: 0,
  additionalPayouts: 0,
  shuffel: 1,
  cardPosition: 0,
}

function googleToServerQohEntry(row: GoogleQohEntryRow): QoH.Entry.ServerItem {
  const cardDrawn = row.get('cardDrawn') ?? ''
  const [cardValue, cardSuit] = cardDrawn.split('_')
  const validCard = !!cardValue && !!cardSuit
  const cardPosition = getNumber(row.get('cardPosition'))

  return {
    id: row.get('id'),
    gameId: row.get('gameId'),
    created: row.get('created'),
    createdBy: row.get('createdBy'),
    lastModifiedBy: row.get('lastModifiedBy'),
    modified: row.get('modified'),
    cardDrawn: validCard ? { suit: cardSuit, value: cardValue } : undefined,
    payout: getNumber(row.get('payout')),
    cardPosition: cardPosition || undefined,
    ticketSales: getNumber(row.get('ticketSales')),
    drawDate: row.get('drawDate'),
    shuffel: getNumber(row.get('shuffel')),
  }
}

export async function getGoogleQohEntryRows(): Promise<GoogleQohEntryRow[]> {
  return await getGoogleSheetRows<QoH.Entry.ServerItem>(
    process.env.SPREADSHEET_KEY,
    process.env.QUEEN_OF_HEARTS_ENTRY_SHEET_KEY,
  )
}
export async function findGoogleQohEntryRows(
  filter: (row: GoogleQohEntryRow) => boolean,
): Promise<GoogleQohEntryRow | undefined> {
  return (await getGoogleQohEntryRows()).find(filter)
}

export async function getQohEntries(): Promise<QoH.Entry.ServerItem[]> {
  return (await getGoogleQohEntryRows()).map(googleToServerQohEntry)
}
export async function getQohEntriesBy(
  filter: (item: QoH.Entry.ServerItem) => boolean,
): Promise<QoH.Entry.ServerItem[]> {
  return (await getQohEntries()).filter(filter)
}
export async function findQohEntry(
  filter: (item: QoH.Entry.ServerItem) => boolean,
): Promise<QoH.Entry.ServerItem | undefined> {
  return (await getQohEntries()).find(filter)
}

export async function createQohEntries(
  payload: QoH.Entry.CreatePayload | QoH.Entry.CreatePayload[],
): Promise<QoH.Entry.ServerItem[]> {
  const now = dayjs().format()
  const workSheet = await getGoogleSheetWorkSheet(
    process.env.SPREADSHEET_KEY,
    process.env.KITCHEN_CHECKOUT_SHEET_KEY,
  )
  const payloads: QoH.Entry.CreatePayload[] = Array.isArray(payload) ? [...payload] : [payload]

  const rows: RawRowData[] = payloads.map((p) => {
    return {
      ...BASE_QOH_ENTRY,
      ...p,
      id: crypto.randomUUID(),
      created: now,
      modified: now,
      lastModifiedBy: p.createdBy,
    } satisfies RawRowData
  })

  return (await workSheet.addRows(rows)).map(googleToServerQohEntry)
}
export async function updateQohEntry(
  id: string,
  payload: QoH.Entry.EditPayload,
  validator?: (item: GoogleQohEntryRow) => boolean,
): Promise<QoH.Entry.ServerItem | undefined> {
  const row = await findGoogleQohEntryRows((r) => {
    const isValid = validator ? validator(r) : true
    return r.get('id') === id && isValid
  })

  if (row) {
    const now = dayjs().format()

    const updatedData: Omit<QoH.Entry.ServerItem, 'cardDrawn'> = {
      ...(row.toObject() as QoH.Entry.ServerItem),
      ...payload,
      modified: now,
    }

    row.assign(updatedData)
    await row.save()

    return await findQohEntry((r) => r.id === id)
  }
}
export async function deleteQohEntries(
  itemIds: string[],
  validator?: (item: GoogleQohEntryRow) => boolean,
): Promise<boolean> {
  const rows = (await getGoogleQohEntryRows())
    .filter((item) => {
      return itemIds.includes(item.get('id') as string) && (validator ? validator(item) : true)
    })
    .sort((a, b) => b.rowNumber - a.rowNumber)

  await rows.reduce(async (p, row) => {
    return await p.then(async () => await row.delete())
  }, Promise.resolve())

  return true
}
