import bcrypt from 'bcryptjs'
import { type GoogleSpreadsheetRow } from 'google-spreadsheet'

import { getGoogleSheetRows, getGoogleSheetWorkSheet } from './sheets'

const BASE_USER = {
  email: '',
  phone: '',
  isAdmin: false,
}

function userMapper(row: GoogleSpreadsheetRow<User.Row>): User.Base {
  const u = row.toObject()

  return {
    email: u?.email ?? '',
    id: u?.id ?? '',
    isAdmin: u.administrator === 'TRUE',
    username: u?.username ?? '',
    phone: u?.phone ?? '',
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

export async function getUsersBy(filter: (user: User.Base) => User.Base[]): Promise<User.Base[]> {
  return (await getUsers()).filter(filter)
}

export async function findUser(
  filter: (user: User.Base) => boolean,
): Promise<User.Base | undefined> {
  return (await getUsers()).find(filter)
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

export async function updateUser(payload: User.UpdatePayload): Promise<User.Base | undefined> {
  const googleUser = await findGoogleUserRow((r) => r.get('id') === payload.id)

  if (googleUser) {
    const { isAdmin, ...googlePayload } = payload
    const updatedData: User.Row = {
      ...(googleUser.toObject() as User.Row),
      ...googlePayload,
      administrator: isAdmin ? 'TRUE' : 'FALSE',
    }

    googleUser.assign(updatedData)
    await googleUser.save()

    return userMapper(googleUser)
  }
}

export async function deleteUser(userId: string): Promise<void> {
  const googleUser = await findGoogleUserRow((u) => u.get('id') === userId)

  if (googleUser && googleUser.get('username') !== 'admin') {
    await googleUser.delete()
  }
}

export async function getValidatedUser(
  credentials: Record<'username' | 'password', string>,
): Promise<User.Session | undefined> {
  const { username, password } = credentials
  const rows = await getGoogleSheetRows<User.Row>(
    process.env.SPREADSHEET_KEY,
    process.env.USER_SHEET_KEY,
  )

  const userRow = rows.find((r) => {
    const passwordHash: string = r.get('password')

    return r.get('username') === username && bcrypt.compareSync(password, passwordHash)
  })

  if (userRow) {
    const { phone, ...user } = userMapper(userRow)

    return user
  }
}
