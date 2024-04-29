import { type AlertProps } from '@mui/material'
import { type Dayjs } from 'dayjs'

export type ThemeMode = 'light' | 'dark'

export interface Notification {
  severity: AlertProps['severity']
  message: string
}
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
