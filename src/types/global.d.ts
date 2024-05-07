import { type Dayjs } from 'dayjs'

declare global {
  interface WindowEventMap {
    // Notification
    notify: CustomEvent<NativeLocation>
  }

  type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>

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

  namespace Kitchen {
    interface MenuItemRow {
      id: string
      name: string
      description: string
      price: string
      created: string
      modified: string
      lastModifiedBy: string
    }
    interface ServerMenuItem extends Omit<MenuItemRow, 'price'> {
      price: number
    }
    interface MenuItem extends Omit<ServerMenuItem, 'created' | 'modified'> {
      created: Dayjs
      modified: Dayjs
    }
    interface MenuItemPayload {
      name: string
      description?: string
      price: number
    }
    interface MenuItemServerPayload extends MenuItemPayload {
      lastModifiedBy: string
    }

    interface CostRow {
      id: string
      amount: string
      created: string
      createdBy: string
      modified: string
      lastModifiedBy: string
    }

    interface ServerCostItem extends Omit<CostRow, 'amount'> {
      amount: number
      name: string
    }
    interface CostItem extends Omit<ServerCostItem, 'created' | 'modified'> {
      created: Dayjs
      modified: Dayjs
    }

    interface CostItemPayload {
      amount: number
    }

    type CostItemDeletePayload = string[]
    interface CostItemCreatePayload extends CostItemPayload {
      createdBy: string
    }
    interface CostItemEditPayload extends CostItemPayload {
      lastModifiedBy: string
    }
  }
}

export {}
