import { type Dayjs } from 'dayjs'

export type ThemeMode = 'light' | 'dark'

export interface BaseMenuItem {
  id: string
  name: string
  description: string
  amount: number
}
export interface ServerMenuItem extends BaseMenuItem {
  created: string
}
export interface MenuItem extends BaseMenuItem {
  created: Dayjs
}
