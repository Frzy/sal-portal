import { JWT } from 'google-auth-library'
import {
  GoogleSpreadsheet,
  type GoogleSpreadsheetRow,
  type GoogleSpreadsheetWorksheet,
} from 'google-spreadsheet'

const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.file',
]

export async function getGoogleSheetDocument(
  spreadSheetKey: string,
  scopes: string[] = SCOPES,
): Promise<GoogleSpreadsheet> {
  const jwt = new JWT({
    email: process.env.API_EMAIL,
    key: process.env.API_KEY.replace(/\\n/g, '\n').replace(/\\n/g, '\n'),
    scopes,
  })

  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const doc = new GoogleSpreadsheet(spreadSheetKey, jwt)
  await doc.loadInfo()

  return doc
}

export async function getGoogleSheetWorkSheet(
  spreadSheetKey: string,
  sheetKey: number,
): Promise<GoogleSpreadsheetWorksheet> {
  const doc = await getGoogleSheetDocument(spreadSheetKey)

  return doc.sheetsById[sheetKey]
}

export async function getGoogleSheetRows<D extends Record<string, any>>(
  spreadSheetKey: string,
  sheetKey: number,
): Promise<GoogleSpreadsheetRow<D>[]> {
  const worksheet = await getGoogleSheetWorkSheet(spreadSheetKey, sheetKey)
  const rows = await worksheet.getRows<D>()

  return rows
}
