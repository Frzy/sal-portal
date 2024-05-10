import { type Dayjs } from 'dayjs'

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
    }
    interface Item extends ServerItem {
      created: Dayjs
      modified: Dayjs
    }
    interface Payload {
      amount: number
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
      creditCardSales: number
      deposit: number
      drinkChips: number
      expenses: number
      sales: number
      created: string
      createdBy: string
      modified: string
      lastModifiedBy: string
    }
    interface Item extends ServerItem {
      created: Dayjs
      modified: Dayjs
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
}

export {}
