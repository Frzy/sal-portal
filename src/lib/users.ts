import bcrypt from 'bcryptjs'
import { type GoogleSpreadsheetRow } from 'google-spreadsheet'

import { getGoogleSheetRows, getGoogleSheetWorkSheet } from './sheets'

const BASE_USER = {
  name: '',
  isAdmin: false,
}

function userMapper(row: GoogleSpreadsheetRow<User.Row>): User.Base {
  const u = row.toObject()

  return {
    id: u?.id ?? '',
    isAdmin: u.administrator === 'TRUE',
    username: u?.username ?? '',
    name: u?.name ?? '',
  } satisfies User.Base
}

export async function getGoogleUserRows(): Promise<GoogleSpreadsheetRow<User.Row>[]> {
  return await getGoogleSheetRows<User.Row>(process.env.SPREADSHEET_KEY, process.env.USER_SHEET_KEY)
}
export async function findGoogleUserRow(
  filter: (googleUser: GoogleSpreadsheetRow<User.Row>) => boolean,
): Promise<GoogleSpreadsheetRow<User.Row> | undefined> {
  return (await getGoogleUserRows()).find(filter)
}
export async function getUsers(): Promise<User.Base[]> {
  return (await getGoogleUserRows()).map(userMapper)
}
export async function getUsersBy(filter: (user: User.Base) => boolean): Promise<User.Base[]> {
  return (await getUsers()).filter(filter)
}
export async function findUser(
  filter: (user: User.Base) => boolean,
): Promise<User.Base | undefined> {
  return (await getUsers()).find(filter)
}

export async function getValidatedUser(
  credentials: Record<'username' | 'password', string>,
): Promise<User.Session | undefined> {
  const { username, password } = credentials

  const user = await findGoogleUserRow((r) => {
    const passwordHash: string = r.get('password')

    return r.get('username') === username && bcrypt.compareSync(password, passwordHash)
  })

  if (user) return userMapper(user)
}
export async function validateOldPassword(userId: string, oldPassword: string): Promise<boolean> {
  const googleUser = await findGoogleUserRow((r) => r.get('id') === userId)
  const originalPassword: string = googleUser?.get('password') ?? ''

  return googleUser ? bcrypt.compareSync(oldPassword, originalPassword) : false
}

export async function createUsers(
  payload: User.CreatePayload | User.CreatePayload[],
): Promise<User.Base> {
  const workSheet = await getGoogleSheetWorkSheet(
    process.env.SPREADSHEET_KEY,
    process.env.USER_SHEET_KEY,
  )
  const salt = await bcrypt.genSalt(10)
  const newUserPayloads: User.CreatePayload[] = Array.isArray(payload) ? [...payload] : [payload]

  const newUserData: User.Row[] = newUserPayloads.map((u) => {
    const { isAdmin, ...userDetails } = u

    return {
      ...BASE_USER,
      ...userDetails,
      id: crypto.randomUUID(),
      password: bcrypt.hashSync(u.password, salt),
      administrator: isAdmin ? 'TRUE' : 'FALSE',
    }
  })

  // @ts-expect-error Not sure how to cast this
  return (await workSheet.addRows(newUserData)).map(userMapper)
}
export async function updateUser(
  userId: string,
  newUserData: User.UpdatePayload,
): Promise<User.Base | undefined> {
  const googleUser = await findGoogleUserRow((r) => r.get('id') === userId)
  const salt = await bcrypt.genSalt(10)

  if (googleUser) {
    const { isAdmin, oldPassword, newPassword, ...googlePayload } = newUserData

    const updatedData: User.Row = {
      ...(googleUser.toObject() as User.Row),
      ...googlePayload,
      administrator: isAdmin ? 'TRUE' : 'FALSE',
      ...(newPassword ? { password: bcrypt.hashSync(newPassword, salt) } : {}),
    }

    googleUser.assign(updatedData)
    await googleUser.save()

    return userMapper(googleUser)
  }
}
export async function deleteUser(userId: string): Promise<boolean> {
  const googleUser = await findGoogleUserRow((u) => u.get('id') === userId)

  if (googleUser && googleUser.get('username') !== 'admin') {
    await googleUser.delete()

    return true
  }

  return false
}
