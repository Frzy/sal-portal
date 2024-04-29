declare global {
  export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>

  namespace User {
    interface Row {
      id: string
      username: string
      password: string
      email: string
      phone: string
      administrator: 'TRUE' | 'FALSE'
    }

    interface Session {
      email: string
      id: string
      isAdmin: boolean
      username: string
    }

    interface Base extends Session {
      phone: string
    }

    interface UpdatePayload extends Omit<Partial<User>, 'id', 'administrator'> {
      id: string
      isAdmin?: boolean
    }

    interface CreatePayload {
      username: string
      password: string
      email?: string
      phone?: string
      isAdmin?: boolean
    }
  }
}

export {}
