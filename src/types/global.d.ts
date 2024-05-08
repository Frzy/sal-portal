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
      includesDrinkChip: boolean
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
      includesDrinkChip?: boolean
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
      totalSales: number
      creditCardSales: number
      deposit: number
      description: string
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
      creditCardSales: number
      deposit: number
      description?: string
      totalSales: number
    }
    interface CreatePayload extends Payload {
      createdBy: string
    }
    interface EditPayload extends Payload {
      lastModifiedBy: string
    }
  }
  namespace Kitchen.CheckoutDetail {
    interface Row {
      checkoutId: string
      created: string
      createdBy: string
      id: string
      lastModifiedBy: string
      menuItemDrinkChip: string
      menuItemName: string
      menuItemPrice: string | number
      menuItemQuantity: string | number
      modified: string
    }
    interface Item extends Row {
      created: Dayjs
      menuItemDrinkChip: boolean
      menuItemPrice: number
      menuItemQuantity: number
      modified: Dayjs
    }
    interface Payload {
      checkoutId: string
      creditCardSales: number
      menuItemName: string
      menuItemPrice: number
      menuItemQuantity: number
      totalSales: number
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
