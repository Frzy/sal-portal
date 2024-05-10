import dayjs, { type Dayjs } from 'dayjs'

import { LEGION_MONTH_START } from './constants'

export function isPasswordValid(password: string): boolean {
  if (password.length < 4) return false

  return true
}

export function formatCurrency(currency: number): string {
  return new Intl.NumberFormat('en-US', {
    currency: 'USD',
    style: 'currency',
  }).format(currency)
}

export function arrayFill<D = unknown>(n: number, filler: (index: number) => D): D[]
export function arrayFill<D = unknown>(n: number, filler: any): D[]
export function arrayFill<D = unknown>(n: number, filler: any): D[] {
  return Array.from({ length: n }, (e, i) => {
    return typeof filler === 'function' ? filler(i) : filler
  })
}

export function getLegionYearDatesFrom(date: Dayjs): { startDate: Dayjs; endDate: Dayjs } {
  const year = date.year()
  const month = date.month()
  const format = 'YYYY-M'
  let startYear = year
  let endYear = year

  if (month < LEGION_MONTH_START) {
    startYear -= 1
  } else {
    endYear += 1
  }

  const startDate = dayjs(`${startYear}-${LEGION_MONTH_START}`, format).startOf('month')
  const endDate = dayjs(`${endYear}-${LEGION_MONTH_START - 1}`, format).endOf('month')

  return { startDate, endDate }
}

export function getNumber(value: unknown, defaultValue: number = 0): number {
  if (!value) return defaultValue

  let number = defaultValue

  if (typeof value === 'string') {
    number = parseFloat(value)
  } else if (typeof value === 'number') {
    number = value
  }

  return isNaN(number) ? defaultValue : number
}

export function serverToCostItem(item: Kitchen.Cost.ServerItem): Kitchen.Cost.Item {
  return { ...item, created: dayjs(item.created), modified: dayjs(item.modified) }
}
export function serverToMenuItem(item: Kitchen.Menu.ServerItem): Kitchen.Menu.Item {
  return { ...item, created: dayjs(item.created), modified: dayjs(item.modified) }
}
export function serverToCheckoutItem(item: Kitchen.Checkout.ServerItem): Kitchen.Checkout.Item {
  const { orders, ...checkout } = item

  return {
    ...checkout,
    created: dayjs(item.created),
    modified: dayjs(item.modified),
    orders: orders.map(serverToOrderItem),
  }
}
export function serverToOrderItem(item: Kitchen.Order.ServerItem): Kitchen.Order.Item {
  return { ...item, created: dayjs(item.created), modified: dayjs(item.modified) }
}
