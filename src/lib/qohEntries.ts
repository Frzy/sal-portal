import dayjs from 'dayjs'
import { type GoogleSpreadsheetRow } from 'google-spreadsheet'

import { getCardLabel, getNumber } from '@/util/functions'

import { findGoogleQohGameRows } from './qohGames'
import { getGoogleSheetRows, getGoogleSheetWorkSheet } from './sheets'

type GoogleQohEntryRow = GoogleSpreadsheetRow<Omit<QoH.Entry.ServerItem, 'orders' | 'name'>>

const BASE_QOH_ENTRY = {
  ticketSales: 0,
  cardPayout: 0,
  additionalPayouts: 0,
  shuffle: 1,
  cardPosition: 0,
}

function googleToServerQohEntry(row: GoogleQohEntryRow): QoH.Entry.ServerItem {
  const cardDrawn = row.get('cardDrawn') ?? ''
  const [cardValue, cardSuit]: [Card.Value, Card.Suit] = cardDrawn.split('_')
  const validCard = !!cardValue && !!cardSuit
  const cardPosition = getNumber(row.get('cardPosition'))

  return {
    id: row.get('id'),
    gameId: row.get('gameId'),
    created: row.get('created'),
    createdBy: row.get('createdBy'),
    lastModifiedBy: row.get('lastModifiedBy'),
    modified: row.get('modified'),
    cardDrawn: validCard
      ? {
          suit: cardSuit,
          value: cardValue,
          id: cardDrawn,
          label: getCardLabel(cardValue, cardSuit),
        }
      : undefined,
    payout: getNumber(row.get('payout')),
    cardPosition: cardPosition || undefined,
    ticketSales: getNumber(row.get('ticketSales')),
    drawDate: row.get('drawDate'),
    shuffle: getNumber(row.get('shuffle')),
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
  const game = row
    ? await findGoogleQohGameRows((r) => r.get('id') === row.get('gameId'))
    : undefined

  if (row && game) {
    const now = dayjs().format()
    const drawDate = dayjs(payload.drawDate)
    const jokerReset = !!game.get('resetOnTwoJokers')
    const maxResets = getNumber(game.get('maxGameReset'), 0)
    const originalCard = row.get('cardDrawn') ?? ''

    const updatedData: Omit<QoH.Entry.ServerItem, 'cardDrawn'> = {
      ...(row.toObject() as QoH.Entry.ServerItem),
      ...payload,
      modified: now,
    }

    row.assign(updatedData)

    if (payload.cardDrawn === 'Q_hearts') {
      // Get all game entries after items drawn date
      const toDelete = (
        await getQohEntriesBy(
          (r) => r.gameId === row.get('gameId') && dayjs(r.drawDate).isAfter(drawDate),
        )
      ).map((r) => r.id)

      if (toDelete.length) await deleteQohEntries(toDelete)

      game.set('endDate', drawDate.format())
      await game.save()
    } else if (jokerReset && (payload.cardDrawn.includes('X') || originalCard.includes('X'))) {
      // Handle changing normal card to joker
      const gameEntries = (await getGoogleQohEntryRows())
        .filter((r) => r.get('gameId') === row.get('gameId'))
        .sort((a, b) =>
          dayjs(a.get('drawDate') as string).isAfter(dayjs(b.get('drawDate') as string)) ? 1 : -1,
        )

      const rowsToBeSaved: GoogleQohEntryRow[] = []
      let gameShuffle = 1
      let jokerCount = 0
      gameEntries.forEach((e) => {
        const item = e.get('id') === row.get('id') ? row : e
        const eShuffel = getNumber(item.get('shuffle'), 1)
        const card: string = item.get('cardDrawn') ?? ''
        const isJoker = card.includes('X')

        if (eShuffel !== gameShuffle) {
          item.set('shuffle', gameShuffle)

          if (item !== row) rowsToBeSaved.push(item)
        }

        if (isJoker) jokerCount += 1
        if (jokerCount === 2 && gameShuffle <= maxResets) {
          gameShuffle += 1
          jokerCount = 0
          game.set('lastResetDate', item.get('drawDate') as string)
        }
      })

      await rowsToBeSaved.reduce(async (p, row) => {
        await p.then(async () => {
          await row.save()
        })
      }, Promise.resolve())

      if (gameShuffle === 1) game.set('lastResetDate', '')

      game.set('shuffle', gameShuffle)
      await game.save()
    }

    await row.save()

    return googleToServerQohEntry(row)
  }

  return undefined
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
