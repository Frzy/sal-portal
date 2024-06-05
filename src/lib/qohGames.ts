import dayjs from 'dayjs'
import { type GoogleSpreadsheetRow } from 'google-spreadsheet'

import { getNumber } from '@/util/functions'

import { createQohEntries, getGoogleQohEntryRows, getQohEntries } from './qohEntries'
import { getGoogleSheetRows, getGoogleSheetWorkSheet } from './sheets'

type GoogleQohGameRow = GoogleSpreadsheetRow<Omit<QoH.Game.ServerItem, 'entries'>>

const BASE_QOH_GAME = {
  createSeed: false,
  jackpotPercent: 0,
  maxGameReset: 0,
  maxSeed: 0,
  shuffle: 1,
  resetOnTwoJokers: false,
  seedPercent: 0,
  ticketPrice: 0,
}

function googleToServerQohGame(row: GoogleQohGameRow): QoH.Game.ServerItem {
  return {
    id: row.get('id'),
    name: row.get('name'),
    created: row.get('created'),
    createdBy: row.get('createdBy'),
    createSeed: row.get('createSeed') === 'TRUE',
    endDate: row.get('endDate'),
    initialJackpot: getNumber(row.get('initialJackpot')),
    jackpotPercent: getNumber(row.get('jackpotPercent')),
    lastModifiedBy: row.get('lastModifiedBy'),
    lastResetDate: row.get('lastResetDate'),
    maxGameReset: getNumber(row.get('maxGameReset')),
    maxSeed: getNumber(row.get('maxSeed')),
    modified: row.get('modified'),
    paidJackpot: getNumber(row.get('paidJackpot')),
    shuffle: getNumber(row.get('shuffle')),
    resetOnTwoJokers: row.get('resetOnTwoJokers') === 'TRUE',
    seedPercent: getNumber(row.get('seedPercent')),
    startDate: row.get('startDate'),
    ticketPrice: getNumber(row.get('ticketPrice')),
    entries: [],
  }
}

export async function getGoogleQohGameRows(): Promise<GoogleQohGameRow[]> {
  return await getGoogleSheetRows<QoH.Game.ServerItem>(
    process.env.SPREADSHEET_KEY,
    process.env.QUEEN_OF_HEARTS_GAME_SHEET_KEY,
  )
}
export async function findGoogleQohGameRows(
  filter: (row: GoogleQohGameRow) => boolean,
): Promise<GoogleQohGameRow | undefined> {
  return (await getGoogleQohGameRows()).find(filter)
}

export async function getQohGames(): Promise<QoH.Game.ServerItem[]> {
  const allGames = (await getGoogleQohGameRows()).map(googleToServerQohGame)
  const allEntries = await getQohEntries()

  return allGames.map((game) => ({
    ...game,
    entries: allEntries
      .filter((e) => e.gameId === game.id)
      .sort((a, b) => new Date(a.drawDate).getTime() - new Date(b.drawDate).getTime()),
  }))
}
export async function getQohGamesBy(
  filter: (item: QoH.Game.ServerItem) => boolean,
): Promise<QoH.Game.ServerItem[]> {
  return (await getQohGames()).filter(filter)
}
export async function findQohGame(
  filter: (item: QoH.Game.ServerItem) => boolean,
): Promise<QoH.Game.ServerItem | undefined> {
  return (await getQohGames()).find(filter)
}

export async function createQohGame(
  payload: QoH.Game.CreatePayload | QoH.Game.CreatePayload[],
): Promise<QoH.Game.ServerItem[]> {
  const now = dayjs().format()
  const workSheet = await getGoogleSheetWorkSheet(
    process.env.SPREADSHEET_KEY,
    process.env.QUEEN_OF_HEARTS_GAME_SHEET_KEY,
  )
  const payloads: QoH.Game.CreatePayload[] = Array.isArray(payload) ? [...payload] : [payload]

  let gameRows: RawRowData[] = []
  let entryPayloads: QoH.Entry.CreatePayload[] = []

  payloads.forEach((p) => {
    const { entries, ...other } = p
    const id = crypto.randomUUID()
    const gamePayload = {
      ...BASE_QOH_GAME,
      ...other,
      id,
      created: now,
      modified: now,
      lastModifiedBy: p.createdBy,
    } satisfies RawRowData

    gameRows = [...gameRows, gamePayload]

    if (entries?.length) {
      entryPayloads = [
        ...entryPayloads,
        ...entries.map((e) => ({
          ...e,
          gameId: id,
          createdBy: other.createdBy,
        })),
      ]
    }
  })

  const createdEntries = entryPayloads.length ? await createQohEntries(entryPayloads) : undefined
  const createdGames = (await workSheet.addRows(gameRows)).map(googleToServerQohGame)

  return createdEntries
    ? createdGames.map((g) => ({
        ...g,
        entries: createdEntries.filter((e) => e.gameId === g.id),
      }))
    : createdGames
}
export async function updateQohGame(
  gameId: string,
  payload: QoH.Game.EditPayload,
  validator?: (item: GoogleQohGameRow) => boolean,
): Promise<QoH.Game.ServerItem | undefined> {
  const row = await findGoogleQohGameRows((r) => {
    const isValid = validator ? validator(r) : true
    return r.get('id') === gameId && isValid
  })

  if (row) {
    const now = dayjs().format()

    const updatedData: Omit<QoH.Game.ServerItem, 'entries'> = {
      ...(row.toObject() as QoH.Game.ServerItem),
      ...payload,
      modified: now,
    }

    row.assign(updatedData)
    await row.save()

    return await findQohGame((r) => r.id === gameId)
  }
}
export async function deleteQohGame(
  itemIds: string[],
  validator?: (item: GoogleQohGameRow) => boolean,
): Promise<boolean> {
  const rows = (await getGoogleQohGameRows())
    .filter((item) => {
      return itemIds.includes(item.get('id') as string) && (validator ? validator(item) : true)
    })
    .sort((a, b) => b.rowNumber - a.rowNumber)
  const rowIds: string[] = rows.map((r) => r.get('id'))
  const entryRows = (await getGoogleQohEntryRows())
    .filter((item) => {
      const gameId: string = item.get('gameId') ?? ''
      return rowIds.includes(gameId)
    })
    .sort((a, b) => b.rowNumber - a.rowNumber)

  await entryRows.reduce(async (p, row) => {
    return await p.then(async () => await row.delete())
  }, Promise.resolve())

  await rows.reduce(async (p, row) => {
    return await p.then(async () => await row.delete())
  }, Promise.resolve())

  return true
}
