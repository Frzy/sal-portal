declare global {
  namespace NodeJS {
    interface ProcessEnv {
      API_EMAIL: string
      API_KEY: string
      NEXTAUTH_SECRET: string
      NEXTAUTH_URL: string
      KITCHEN_CHECKOUT_SHEET_KEY: number
      KITCHEN_COST_SHEET_KEY: number
      KITCHEN_ORDER_SHEET_KEY: number
      MENU_ITEM_SHEET_KEY: number
      QUEEN_OF_HEARTS_ENTRY_SHEET_KEY: number
      QUEEN_OF_HEARTS_GAME_SHEET_KEY: number
      SPREADSHEET_KEY: string
      USER_SHEET_KEY: number
    }
  }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {}
