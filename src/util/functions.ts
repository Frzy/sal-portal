import { type CalculatedCheckoutValues } from '@c/CheckoutSteps/DetailStep'
import dayjs, { type Dayjs } from 'dayjs'

import { CARD_VALUE_MAP, LEGION_MONTH_START, OLD_SCHOOL_QOH } from './constants'

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
export function formatPercent(percent: number, decimal = 0): string {
  return `${(percent * 100).toFixed(decimal)}%`
}
export function arrayFill<D = unknown>(n: number, filler: (index: number) => D): D[]
export function arrayFill<D = unknown>(n: number, filler: any): D[]
export function arrayFill<D = unknown>(n: number, filler: any): D[] {
  return Array.from({ length: n }, (e, i) => {
    return typeof filler === 'function' ? filler(i) : filler
  })
}
export function getLegionYearDatesFrom(date: Dayjs): { startDate: Dayjs; endDate: Dayjs } {
  const month = date.month()
  const year = date.year()
  const startMonth = `${LEGION_MONTH_START + 1}`.padStart(2, '0')
  const endMonth = LEGION_MONTH_START > 0 ? `${LEGION_MONTH_START}`.padStart(2, '0') : '12'

  const startDate = dayjs(
    `${startMonth}-01-${month >= LEGION_MONTH_START ? year : year - 1}`,
    'MM-DD-YYYY',
  ).startOf('month')
  const endDate = dayjs(
    `${endMonth}-30-${month >= LEGION_MONTH_START ? year + 1 : year}`,
    'MM-DD-YYYY',
  ).endOf('month')

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
export function toCardString(item: Card.Item | undefined): string {
  if (!item) return ''

  return `${item.value}_${item.suit}`
}
export function getCardLabel(value: Card.Value, suit: Card.Suit): string {
  if (value === 'X') {
    return `${capitalize(suit)} Joker`
  }

  return `${CARD_VALUE_MAP[value]} of ${capitalize(suit)}`
}
export function getAllCards(): Card.Item[] {
  const values = Object.keys(CARD_VALUE_MAP).filter((v) => v !== 'X') as unknown as Card.Value[]
  const suits = ['hearts', 'diamonds', 'clubs', 'spades'] as unknown as Card.Suit[]

  const mainCards: Card.Item[] = [
    {
      id: 'X_black',
      label: 'Black Joker',
      suit: 'black',
      value: 'X',
    },
    {
      id: 'X_red',
      label: 'Red Joker',
      suit: 'red',
      value: 'X',
    },
  ]

  suits.forEach((suit) => {
    values.forEach((value) => {
      mainCards.push({
        id: `${value}_${suit}`,
        label: getCardLabel(value, suit),
        suit,
        value,
      })
    })
  })

  return mainCards
}
export function getGamesDisabledCards(game: QoH.Game.Item, cardShuffle?: number): Card.Item[] {
  const shuffle = cardShuffle ? Math.min(Math.max(cardShuffle, 1), game.shuffle) : game.shuffle

  const cards = game.entries
    .filter((e) => e.shuffle === shuffle && e.cardDrawn)
    .map((e) => e.cardDrawn)

  return cards as Card.Item[]
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
    isActive: !item.endDate,
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
    const hasMaxSeed = game.maxSeed > 0
    const seed =
      game.createSeed && (!hasMaxSeed || game.maxSeed > totalSeed)
        ? Math.floor(item.ticketSales * game.seedPercent)
        : 0
    const availableFund = item.ticketSales - item.payout - seed
    const jackpot = Math.floor(availableFund * game.jackpotPercent)
    let profit = Math.ceil(availableFund * (1 - game.jackpotPercent))

    // Need this to correct rounding erros that can pop up
    if (jackpot + profit !== availableFund) {
      profit += availableFund - (jackpot + profit)
    }

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
export function serverToPullTabTransactionItem(
  item: PullTab.Transaction.ServerItem,
): PullTab.Transaction.Item {
  return { ...item, created: dayjs(item.created), modified: dayjs(item.modified) }
}
export function serverToPullTabCostItem(item: PullTab.Cost.ServerItem): PullTab.Cost.Item {
  return { ...item, created: dayjs(item.created), modified: dayjs(item.modified) }
}
export function getCurrentLegionYear(): { startDate: Dayjs; endDate: Dayjs } {
  return getLegionYearDatesFrom(dayjs())
}

export function getKitchenStats(
  costs: Kitchen.Cost.ServerItem[] | Kitchen.Cost.Item[],
  checkouts: Kitchen.Checkout.ServerItem[] | Kitchen.Checkout.Item[],
): Kitchen.Stats {
  const checkoutStats = checkouts.reduce(
    (stats, c) => {
      return {
        ...stats,
        totalDeposits: stats.totalDeposits + c.deposit,
        totalSales: stats.totalSales + c.sales,
        totalDrinkChips: stats.totalDrinkChips + c.drinkChips,
        totalOrders: stats.totalOrders + c.orders.reduce((sum, o) => sum + o.menuItemQuantity, 0),
        totalServices: stats.totalServices + 1,
      }
    },
    {
      totalDeposits: 0,
      totalSales: 0,
      totalDrinkChips: 0,
      totalOrders: 0,
      totalServices: 0,
    },
  )
  const totalCost = costs.reduce((sum, c) => sum + c.amount, 0)
  const netProfit = checkoutStats.totalSales - totalCost
  const netProfitMargin = checkoutStats.totalSales ? netProfit / checkoutStats.totalSales : 0
  const profitPercent = totalCost ? netProfit / totalCost : 0

  return {
    ...checkoutStats,
    totalCost,
    profitPercent,
    netProfit,
    netProfitMargin,
  }
}

export function getPullTabStats(
  costs: PullTab.Cost.ServerItem[] | PullTab.Cost.Item[],
  transactions: PullTab.Transaction.ServerItem[] | PullTab.Transaction.Item[],
): PullTab.Stats {
  const bag = transactions.length ? transactions[transactions.length - 1].runningTotal ?? 0 : 0
  const totalTabCosts = costs.reduce((sum, c) => sum + c.boxPrice, 0)

  const sums = transactions.reduce(
    (sums, t) => {
      return {
        ...sums,
        totalDeposits: sums.totalDeposits + (t.type === 'BankDeposit' ? t.amount : 0),
        totalSales: sums.totalSales + (t.type === 'MachineWithdrawal' ? t.amount : 0),
        totalPayouts: sums.totalPayouts + (t.type === 'TabPayout' ? Math.abs(t.amount) : 0),
        totalCosts: sums.totalCosts + (t.type === 'TabPayout' ? Math.abs(t.amount) : 0),
        numOfDeposits: t.type === 'BankDeposit' ? sums.numOfDeposits + 1 : sums.numOfDeposits,
        numOfPayouts: t.type === 'BankDeposit' ? sums.numOfPayouts + 1 : sums.numOfPayouts,
      }
    },
    {
      totalDeposits: 0,
      totalSales: 0,
      totalCosts: totalTabCosts,
      totalPayouts: 0,
      numOfDeposits: 0,
      numOfPayouts: 0,
    },
  )

  const netProfit = sums.totalSales - sums.totalCosts
  const netProfitMargin = sums.totalSales ? netProfit / sums.totalSales : 0
  const profitPercent = sums.totalCosts ? netProfit / sums.totalCosts : 0

  return {
    bag,
    totalTabCosts,
    numOfCosts: costs.length,
    ...sums,
    netProfit,
    netProfitMargin,
    profitPercent,
  }
}
