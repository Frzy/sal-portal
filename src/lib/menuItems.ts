import dayjs from 'dayjs'
import { type GoogleSpreadsheetRow } from 'google-spreadsheet'

import { getGoogleSheetRows, getGoogleSheetWorkSheet } from './sheets'

const BASE_MENU_ITEM = {
  name: '',
  description: '',
  amount: '0',
}

function menuItemMapper(row: GoogleSpreadsheetRow<Kitchen.MenuItemRow>): Kitchen.MenuItem {
  const menuItem = row.toObject()
  const amount = parseInt(menuItem?.amount ?? '0')

  return {
    id: menuItem?.id ?? '',
    name: menuItem?.name ?? '',
    description: menuItem?.description ?? '',
    amount: isNaN(amount) ? 0 : amount,
    created: menuItem?.created ?? '',
    modified: menuItem?.modified ?? '',
    lastModifiedBy: menuItem?.lastModifiedBy ?? '',
  } satisfies Kitchen.MenuItem
}

export async function getGoogleMenuItemRows(): Promise<
  GoogleSpreadsheetRow<Kitchen.MenuItemRow>[]
> {
  return await getGoogleSheetRows<Kitchen.MenuItemRow>(
    process.env.SPREADSHEET_KEY,
    process.env.MENU_ITEM_SHEET_KEY,
  )
}
export async function findGoogleMenuItemRows(
  filter: (row: GoogleSpreadsheetRow<Kitchen.MenuItemRow>) => boolean,
): Promise<GoogleSpreadsheetRow<Kitchen.MenuItemRow> | undefined> {
  return (await getGoogleMenuItemRows()).find(filter)
}
export async function getMenuItems(): Promise<Kitchen.MenuItem[]> {
  return (await getGoogleMenuItemRows()).map(menuItemMapper)
}
export async function getMenuItemsBy(
  filter: (item: Kitchen.MenuItem) => boolean,
): Promise<Kitchen.MenuItem[]> {
  return (await getMenuItems()).filter(filter)
}
export async function findMenuItem(
  filter: (item: Kitchen.MenuItem) => boolean,
): Promise<Kitchen.MenuItem | undefined> {
  return (await getMenuItems()).find(filter)
}

export async function createMenuItems(
  payload: Kitchen.MenuItemServerPayload | Kitchen.MenuItemServerPayload[],
): Promise<Kitchen.MenuItem> {
  const workSheet = await getGoogleSheetWorkSheet(
    process.env.SPREADSHEET_KEY,
    process.env.MENU_ITEM_SHEET_KEY,
  )
  const newMenuItemPayload: Kitchen.MenuItemServerPayload[] = Array.isArray(payload)
    ? [...payload]
    : [payload]

  const newMenuItemData: Kitchen.MenuItemRow[] = newMenuItemPayload.map((menuItem) => {
    const { amount, ...details } = menuItem
    const now = dayjs().format()

    return {
      ...BASE_MENU_ITEM,
      ...details,
      amount: `${amount}`,
      id: crypto.randomUUID(),
      created: now,
      modified: now,
    }
  })

  // @ts-expect-error Not sure how to cast this
  return (await workSheet.addRows(newMenuItemData)).map(menuItemMapper)
}
export async function updateMenuItem(
  menuItemId: string,
  menuItemData: Kitchen.MenuItemServerPayload,
  validator?: (item: GoogleSpreadsheetRow<Kitchen.MenuItemRow>) => boolean,
): Promise<Kitchen.MenuItem | undefined> {
  const googleMenuItem = await findGoogleMenuItemRows((r) => r.get('id') === menuItemId)

  if (googleMenuItem) {
    if (validator && !validator(googleMenuItem)) return undefined

    const { amount, ...googlePayload } = menuItemData
    const now = dayjs().format()

    const updatedData: Kitchen.MenuItemRow = {
      ...(googleMenuItem.toObject() as Kitchen.MenuItemRow),
      ...googlePayload,
      amount: `${amount}`,
      modified: now,
    }

    googleMenuItem.assign(updatedData)
    await googleMenuItem.save()

    return menuItemMapper(googleMenuItem)
  }
}
export async function deleteMenuItem(
  menuItemId: string,
  validator?: (item: GoogleSpreadsheetRow<Kitchen.MenuItemRow>) => boolean,
): Promise<boolean> {
  const googleMenuItem = await findGoogleMenuItemRows((u) => u.get('id') === menuItemId)

  if (googleMenuItem) {
    if (validator && !validator(googleMenuItem)) return false

    await googleMenuItem.delete()

    return true
  }

  return false
}
