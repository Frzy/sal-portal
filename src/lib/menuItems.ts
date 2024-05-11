import dayjs from 'dayjs'
import { type GoogleSpreadsheetRow } from 'google-spreadsheet'

import { getNumber } from '@/util/functions'

import { getGoogleSheetRows, getGoogleSheetWorkSheet } from './sheets'

type GoogleMenuRow = GoogleSpreadsheetRow<Kitchen.Menu.ServerItem>

const BASE_MENU_ITEM = {
  name: '',
  description: '',
  price: 0,
}

function googleToServer(row: GoogleMenuRow): Kitchen.Menu.ServerItem {
  return {
    created: row.get('created'),
    createdBy: row.get('createdBy'),
    description: row.get('description'),
    id: row.get('id'),
    hasDrinkChip: row.get('hasDrinkChip') === 'TRUE',
    lastModifiedBy: row.get('lastModifiedBy'),
    modified: row.get('modified'),
    name: row.get('name'),
    price: getNumber(row.get('price')),
  }
}

export async function getGoogleMenuItemRows(): Promise<GoogleMenuRow[]> {
  return await getGoogleSheetRows<Kitchen.Menu.ServerItem>(
    process.env.SPREADSHEET_KEY,
    process.env.MENU_ITEM_SHEET_KEY,
  )
}
export async function findGoogleMenuItemRows(
  filter: (row: GoogleMenuRow) => boolean,
): Promise<GoogleMenuRow | undefined> {
  return (await getGoogleMenuItemRows()).find(filter)
}
export async function getMenuItems(): Promise<Kitchen.Menu.ServerItem[]> {
  return (await getGoogleMenuItemRows()).map(googleToServer)
}
export async function getMenuItemsBy(
  filter: (item: Kitchen.Menu.ServerItem) => boolean,
): Promise<Kitchen.Menu.ServerItem[]> {
  return (await getMenuItems()).filter(filter)
}
export async function findMenuItem(
  filter: (item: Kitchen.Menu.ServerItem) => boolean,
): Promise<Kitchen.Menu.ServerItem | undefined> {
  return (await getMenuItems()).find(filter)
}

export async function createMenuItems(
  payload: Kitchen.Menu.CreatePayload | Kitchen.Menu.CreatePayload[],
): Promise<Kitchen.Menu.ServerItem[]> {
  const workSheet = await getGoogleSheetWorkSheet(
    process.env.SPREADSHEET_KEY,
    process.env.MENU_ITEM_SHEET_KEY,
  )
  const payloads: Kitchen.Menu.CreatePayload[] = Array.isArray(payload) ? [...payload] : [payload]

  const newRows: RawRowData[] = payloads.map((menuItem) => {
    const now = dayjs().format()
    return {
      ...BASE_MENU_ITEM,
      ...menuItem,
      description: menuItem?.description ?? '',
      hasDrinkChip: !!menuItem.hasDrinkChip,
      id: crypto.randomUUID(),
      created: now,
      modified: now,
      lastModifiedBy: menuItem.createdBy,
    }
  })

  return (await workSheet.addRows(newRows)).map(googleToServer)
}
export async function updateMenuItem(
  id: string,
  payload: Kitchen.Menu.EditPayload,
  validator?: (item: GoogleMenuRow) => boolean,
): Promise<Kitchen.Menu.ServerItem | undefined> {
  const googleMenuItem = await findGoogleMenuItemRows((r) => r.get('id') === id)

  if (googleMenuItem) {
    if (validator && !validator(googleMenuItem)) return undefined
    const originalData = googleMenuItem.toObject() as unknown as Kitchen.Menu.ServerItem
    const now = dayjs().format()
    const updatedData: Kitchen.Menu.ServerItem = {
      ...originalData,
      ...payload,
      modified: now,
    }

    googleMenuItem.assign(updatedData)
    await googleMenuItem.save()

    return googleToServer(googleMenuItem)
  }
}
export async function deleteMenuItems(
  itemIds: string[],
  validator?: (item: GoogleMenuRow) => boolean,
): Promise<boolean> {
  const rows = (await getGoogleMenuItemRows()).filter((item) => {
    return itemIds.includes(item.get('id') as string) && (validator ? validator(item) : true)
  })

  await rows.reduce(async (p, row) => {
    return await p.then(async () => await row.delete())
  }, Promise.resolve())

  return true
}
