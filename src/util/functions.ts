import { type CalculatedCheckoutValues } from '@c/CheckoutSteps/DetailStep'
import dayjs, { type Dayjs } from 'dayjs'

import { LEGION_MONTH_START, OLD_SCHOOL_QOH } from './constants'

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
export function getValueByPath<T extends Record<string, any>>(obj: T, path: string): any {
  const keys = path.split('.')
  let current = obj
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(current, key)) {
      current = current[key]
    } else {
      return undefined
    }
  }
  return current
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function serverToCostItem(item: Kitchen.Cost.ServerItem): Kitchen.Cost.Item {
  return { ...item, created: dayjs(item.created), modified: dayjs(item.modified) }
}
export function serverToMenuItem(item: Kitchen.Menu.ServerItem): Kitchen.Menu.Item {
  return { ...item, created: dayjs(item.created), modified: dayjs(item.modified) }
}
export function serverToCheckoutItem(item: Kitchen.Checkout.ServerItem): Kitchen.Checkout.Item {
  const { orders, ...checkout } = item
  const checkoutOrders = orders.map(serverToOrderItem)

  return {
    ...checkout,
    created: dayjs(item.created),
    modified: dayjs(item.modified),
    totalOrders: orders.reduce((sum, o) => sum + o.menuItemQuantity, 0),
    orders: checkoutOrders,
    calculated: checkoutOrders.reduce<CalculatedCheckoutValues>(
      (totals, item) => {
        return {
          sales: totals.sales + item.menuItemQuantity * item.menuItemPrice,
          drinkChips: totals.drinkChips + (item.menuItemHasDrinkChip ? item.menuItemQuantity : 0),
        }
      },
      { sales: 0, drinkChips: 0 },
    ),
  }
}
export function serverToOrderItem(item: Kitchen.Order.ServerItem): Kitchen.Order.Item {
  return { ...item, created: dayjs(item.created), modified: dayjs(item.modified) }
}
export function serverToQoHGameItem(item: QoH.Game.ServerItem): QoH.Game.Item {
  const isOldGame = OLD_SCHOOL_QOH.includes(item.id)
  const entries = isOldGame
    ? serverToOldSchoolQoHEntryGameItem(item, item.entries)
    : serverToQoHEntryGameItem(item, item.entries)
  const lastEntry = entries[entries.length - 1]
  const hasAllCards = entries.every((e) => !!e.cardDrawn)
  const hasAllPositions = entries.every((e) => !!e.cardPosition)

  return {
    ...item,
    isOldGame,
    created: dayjs(item.created),
    modified: dayjs(item.modified),
    startDate: dayjs(item.startDate),
    endDate: item.endDate ? dayjs(item.endDate) : undefined,
    lastResetDate: item.lastResetDate ? dayjs(item.lastResetDate) : undefined,
    hasAllCards,
    hasAllPositions,
    entries,
    totals: lastEntry
      ? { ...lastEntry.totals }
      : {
          availableFund: 0,
          jackpot: 0,
          payout: 0,
          profit: 0,
          sales: 0,
          seed: 0,
        },
  }
}
export function serverToOldSchoolQoHEntryGameItem(
  game: QoH.Game.ServerItem,
  entries: QoH.Entry.ServerItem[],
): QoH.Entry.GameItem[] {
  let totalFund = game.initialJackpot
  let totalSeed = 0
  let totalJackpot = game.initialJackpot
  let totalPayout = 0
  let totalSales = 0

  return entries.map((entry, index, arr) => {
    const item = serverToQoHEntryItem(entry)
    const hasMaxSeed = game.maxSeed > 0
    const seed =
      game.createSeed && (!hasMaxSeed || game.maxSeed > totalSeed)
        ? Math.floor(item.ticketSales * game.seedPercent)
        : 0
    const jackpotPercent =
      game.createSeed && (!hasMaxSeed || game.maxSeed > totalSeed)
        ? game.jackpotPercent - game.seedPercent
        : game.jackpotPercent
    const jackpot = Math.ceil(item.ticketSales * jackpotPercent - entry.payout)
    const profit = Math.floor(item.ticketSales * (1 - game.jackpotPercent))
    const availableFund = jackpot
    let percentChange = 0

    totalFund += availableFund
    totalSeed += seed
    totalJackpot += jackpot
    totalPayout += item.payout
    totalSales += item.ticketSales

    const searchArr = arr.slice(0, index).reverse()
    const prevEntry = searchArr.find((e) => !!e.ticketSales)

    if (prevEntry && !!entry.ticketSales) {
      percentChange = (entry.ticketSales - prevEntry.ticketSales) / prevEntry.ticketSales
    }

    return {
      ...item,
      name: `Draw #${(index + 1).toString().padStart(3, '0')}`,
      seed,
      availableFund,
      jackpot,
      profit,
      percentChange,
      totals: {
        availableFund: totalFund,
        jackpot: totalJackpot,
        payout: totalPayout,
        profit: Math.floor(totalSales * (1 - game.jackpotPercent)),
        sales: totalSales,
        seed: totalSeed,
      },
    }
  })
}
export function serverToQoHEntryGameItem(
  game: QoH.Game.ServerItem,
  entries: QoH.Entry.ServerItem[],
): QoH.Entry.GameItem[] {
  let totalFund = game.initialJackpot
  let totalSeed = 0
  let totalPayout = 0
  let totalSales = 0
  let totalJackpot = 0
  let totalProfit = 0

  return entries.map((entry, index, arr) => {
    const item = serverToQoHEntryItem(entry)
    const seed = game.createSeed ? Math.floor(item.ticketSales * game.seedPercent) : 0
    const availableFund = item.ticketSales - item.payout - seed
    const jackpot = Math.floor(availableFund * game.jackpotPercent)
    const profit = Math.ceil(availableFund * (1 - game.jackpotPercent))
    let percentChange = 0

    totalFund += availableFund
    totalSeed += seed
    totalPayout += item.payout
    totalSales += item.ticketSales
    totalJackpot = Math.floor(totalFund * game.jackpotPercent)
    totalProfit = Math.ceil(totalFund * (1 - game.jackpotPercent))

    const prevEntry = arr[index - 1]

    if (prevEntry) {
      percentChange = (entry.ticketSales - prevEntry.ticketSales) / prevEntry.ticketSales
    }

    return {
      ...item,
      name: `Draw #${(index + 1).toString().padStart(3, '0')}`,
      seed,
      availableFund,
      jackpot,
      profit,
      percentChange,
      totals: {
        availableFund: totalFund,
        jackpot: totalJackpot,
        payout: totalPayout,
        profit: totalProfit,
        sales: totalSales,
        seed: totalSeed,
      },
    }
  })
}
export function serverToQoHEntryItem(item: QoH.Entry.ServerItem): QoH.Entry.Item {
  return {
    ...item,
    drawDate: dayjs(item.drawDate),
    created: dayjs(item.created),
    modified: dayjs(item.modified),
  }
}
