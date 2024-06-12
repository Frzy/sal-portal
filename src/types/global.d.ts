import { type SvgIconProps } from '@mui/material'
import { type Dayjs } from 'dayjs'

import { type DIALOG_TYPES } from '@/util/constants'

declare global {
  interface WindowEventMap {
    // Notification
    notify: CustomEvent<NativeLocation>
  }

  type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>

  type RowCellData = string | number | boolean | Date
  type RawRowData = RowCellData[] | Record<string, RowCellData>
  interface INotification {
    title?: string
    message: string
    severity: 'info' | 'success' | 'warning' | 'error'
  }
  interface PortalIconProps extends SvgIconProps {
    variant?: 'filled' | 'outlined'
  }

  interface DialogProperties<T> {
    type: DIALOG_TYPES
    items?: T[]
  }

  namespace List {
    type SelectionMode = 'single' | 'multiple' | 'none'
    type Order = 'asc' | 'desc'

    interface AdminOptions {
      showAdminColumns: boolean
    }
  }

  namespace User {
    interface Row {
      id: string
      username: string
      password: string
      name: string
      administrator: 'TRUE' | 'FALSE'
    }
    interface Session {
      id: string
      isAdmin: boolean
      username: string
      name: string
    }
    interface Base extends Session {}
    interface UpdatePayload {
      username: string
      name: string
      isAdmin: boolean
      oldPassword?: string
      newPassword?: string
    }
    interface CreatePayload {
      username: string
      password: string
      name: string
      isAdmin?: boolean
    }
  }
  namespace Kitchen.Cost {
    interface ServerItem {
      amount: number
      created: string
      createdBy: string
      id: string
      lastModifiedBy: string
      modified: string
      name: string
      checkoutId?: string
    }
    interface Item extends ServerItem {
      created: Dayjs
      modified: Dayjs
    }
    interface Payload {
      amount: number
      checkoutId?: string
    }
    interface CreatePayload extends Payload {
      createdBy: string
    }
    interface EditPayload extends Payload {
      lastModifiedBy: string
    }
  }
  namespace Kitchen.Menu {
    interface ServerItem {
      created: string
      createdBy: string
      description: string
      id: string
      hasDrinkChip: boolean
      lastModifiedBy: string
      modified: string
      name: string
      price: number
    }
    interface Item extends ServerItem {
      created: Dayjs
      modified: Dayjs
    }
    interface Payload {
      description?: string
      hasDrinkChip?: boolean
      name: string
      price: number
    }
    interface CreatePayload extends Payload {
      createdBy: string
    }
    interface EditPayload extends Payload {
      lastModifiedBy: string
    }
  }
  namespace Kitchen.Checkout {
    interface ServerItem {
      id: string
      created: string
      createdBy: string
      creditCardSales: number
      deposit: number
      depositChange: number
      drinkChips: number
      expenses: number
      lastModifiedBy: string
      modified: string
      name: string
      sales: number
      salesChange: number
      orders: Kitchen.Order.ServerItem[]
    }
    interface Item extends ServerItem {
      created: Dayjs
      modified: Dayjs
      totalOrders: number
      orders: Kitchen.Order.Item[]
      calculated: {
        sales: number
        drinkChips: number
      }
    }

    interface Order {
      quantity: number
      menuItem: Kitchen.Menu.Item
    }
    interface Payload {
      creditCardSales: number
      deposit: number
      drinkChips: number
      sales: number
      expenses: number
      orders: Order[]
    }

    interface UiEditPayload extends Payload {
      orders: Kitchen.Order.Item[]
    }

    interface CreatePayload extends Payload {
      createdBy: string
    }
    interface EditPayload extends Payload {
      lastModifiedBy: string
    }
  }
  namespace Kitchen.Order {
    interface ServerItem {
      id: string
      checkoutId: string
      menuItemName: string
      menuItemPrice: number
      menuItemQuantity: number
      menuItemHasDrinkChip: boolean
      created: string
      createdBy: string
      modified: string
      lastModifiedBy: string
    }
    interface Item extends ServerItem {
      created: Dayjs
      modified: Dayjs
    }
    interface Payload {
      checkoutId: string
      menuItemHasDrinkChip: boolean
      menuItemName: string
      menuItemPrice: number
      menuItemQuantity: number
    }

    interface CreatePayload extends Payload {
      createdBy: string
    }
    interface EditPayload extends Payload {
      lastModifiedBy: string
    }
  }

  namespace QoH.Game {
    interface ServerItem {
      id: string
      created: string
      createdBy: string
      createSeed: boolean
      endDate?: string
      initialJackpot: number
      jackpotPercent: number
      lastModifiedBy: string
      lastResetDate?: string
      maxGameReset: number
      maxSeed: number
      modified: string
      name: string
      name: string
      paidJackpot: number
      shuffle: number
      resetOnTwoJokers: boolean
      seedPercent: number
      startDate: string
      ticketPrice: number
      entries: QoH.Entry.ServerItem[]
    }

    interface Item extends ServerItem {
      created: Dayjs
      endDate?: Dayjs
      hasAllCards: boolean
      hasAllPositions: boolean
      isActive: boolean
      isOldGame: boolean
      lastResetDate?: Dayjs
      modified: Dayjs
      startDate: Dayjs
      totals: {
        availableFund: number
        jackpot: number
        payout: number
        profit: number
        sales: number
        seed: number
      }
      entries: QoH.Entry.GameItem[]
    }

    interface Payload {
      createSeed: boolean
      endDate?: string
      initialJackpot: number
      jackpotPercent: number
      lastResetDate?: string
      maxGameReset: number
      maxSeed: number
      name: string
      paidJackpot: number
      shuffle: number
      resetOnTwoJokers: boolean
      seedPercent: number
      startDate: string
      ticketPrice: number
    }

    interface UiPayload extends Payload {
      startDate: Dayjs
      endDate?: Dayjs
      lastResetDate?: Dayjs
    }

    interface CreatePayload extends Payload {
      createdBy: string
    }
    interface EditPayload extends Payload {
      lastModifiedBy: string
    }
  }

  namespace QoH.Entry {
    interface ServerItem {
      id: string
      gameId: string
      createdBy: string
      created: string
      modified: string
      lastModifiedBy: string
      drawDate: string
      ticketSales: number
      payout: number
      shuffle: number
      cardPosition?: number
      cardDrawn?: Card.Item
    }

    interface Item extends ServerItem {
      drawDate: Dayjs
      created: Dayjs
      modified: Dayjs
    }

    interface GameItem extends Item {
      availableFund: number
      jackpot: number
      name: string
      profit: number
      seed: number
      percentChange: number
      totals: {
        availableFund: number
        jackpot: number
        payout: number
        profit: number
        sales: number
        seed: number
      }
    }

    interface Payload {
      drawDate: string
      ticketSales: number
      payout: number
      shuffle: number
      cardPosition: number
      cardDrawn: string
    }

    interface UiPayload extends Payload {
      drawDate: Dayjs
    }
    interface CreatePayload extends Payload {
      gameId: string
      createdBy: string
    }
    interface EditPayload extends Payload {
      lastModifiedBy: string
    }
  }

  namespace Card {
    interface Item {
      id: string
      label: string
      suit: Suit
      value: Value
    }
    interface IconProps extends PortalIconProps {
      suit: Suit
    }
    type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades' | 'red' | 'black'
    type Value = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A' | 'X'
  }
}

export {}
