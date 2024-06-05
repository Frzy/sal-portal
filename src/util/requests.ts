import {
  serverToCheckoutItem,
  serverToCostItem,
  serverToMenuItem,
  serverToQoHEntryItem,
  serverToQoHGameItem,
} from './functions'

export async function createUser(payload: User.CreatePayload): Promise<User.Base | undefined> {
  return await create<User.Base, User.CreatePayload>('/api/users', payload)
}
export async function editUser(
  id: string,
  payload: User.UpdatePayload,
): Promise<User.Base | undefined> {
  return await edit(`/api/user/${id}`, payload)
}
export async function deleteUser(user: User.Base): Promise<boolean> {
  return await deleted(`/api/user/${user.id}`)
}

export async function createKitchenMenuItem(
  payload: Kitchen.Menu.Payload,
): Promise<Kitchen.Menu.Item | undefined> {
  const item = await create<Kitchen.Menu.ServerItem, Kitchen.Menu.Payload>(
    '/api/kitchen/menu-items',
    payload,
  )

  return item ? serverToMenuItem(item) : undefined
}
export async function editKitchenMenuItem(
  id: string,
  payload: Kitchen.Menu.Payload,
): Promise<Kitchen.Menu.Item | undefined> {
  const item = await edit<Kitchen.Menu.ServerItem, Kitchen.Menu.Payload>(
    `/api/kitchen/menu-item/${id}`,
    payload,
  )

  return item ? serverToMenuItem(item) : undefined
}
export async function deleteKitchenMenuItem(menuItem: Kitchen.Menu.Item): Promise<boolean> {
  return await deleted(`/api/kitchen/menu-item/${menuItem.id}`)
}
export async function deleteMKitchenenuItems(items: Kitchen.Menu.Item[]): Promise<boolean> {
  return await deletedAll(
    '/api/kitchen/menu-items',
    items.map((i) => i.id),
  )
}

export async function createKitchenCost(
  payload: Kitchen.Cost.Payload,
): Promise<Kitchen.Cost.Item | undefined> {
  const item = await create<Kitchen.Cost.ServerItem, Kitchen.Cost.Payload>(
    '/api/kitchen/costs',
    payload,
  )

  return item ? serverToCostItem(item) : undefined
}
export async function editKitchenCost(
  id: string,
  payload: Kitchen.Cost.Payload,
): Promise<Kitchen.Cost.Item | undefined> {
  const item = await edit<Kitchen.Cost.ServerItem, Kitchen.Cost.Payload>(
    `/api/kitchen/cost/${id}`,
    payload,
  )

  return item ? serverToCostItem(item) : undefined
}
export async function deleteKitchenCosts(items: Kitchen.Cost.Item[]): Promise<boolean> {
  return await deletedAll(
    '/api/kitchen/costs',
    items.map((i) => i.id),
  )
}

export async function createKitchenCheckout(
  payload: Kitchen.Checkout.Payload,
): Promise<Kitchen.Checkout.Item | undefined> {
  const item = await create<Kitchen.Checkout.ServerItem, Kitchen.Checkout.Payload>(
    '/api/kitchen/checkouts',
    payload,
  )

  return item ? serverToCheckoutItem(item) : undefined
}
export async function editKitchenCheckout(
  id: string,
  payload: Kitchen.Checkout.UiEditPayload,
): Promise<Kitchen.Checkout.Item | undefined> {
  const item = await edit<Kitchen.Checkout.ServerItem, Kitchen.Checkout.UiEditPayload>(
    `/api/kitchen/checkout/${id}`,
    payload,
  )

  return item ? serverToCheckoutItem(item) : undefined
}
export async function deleteKitchenCheckouts(items: Kitchen.Checkout.Item[]): Promise<boolean> {
  return await deletedAll(
    '/api/kitchen/checkouts',
    items.map((i) => i.id),
  )
}

export async function createQohGame(payload: QoH.Game.Payload): Promise<QoH.Game.Item | undefined> {
  const item = await create<QoH.Game.ServerItem, QoH.Game.Payload>('/api/qoh/games', payload)

  return item ? serverToQoHGameItem(item) : undefined
}
export async function editQohGame(
  id: string,
  payload: QoH.Game.UiPayload,
): Promise<QoH.Game.Item | undefined> {
  const item = await edit<QoH.Game.ServerItem, QoH.Game.UiPayload>(`/api/qoh/game/${id}`, payload)

  return item ? serverToQoHGameItem(item) : undefined
}
export async function deleteQohGames(items: QoH.Game.Item[]): Promise<boolean> {
  return await deletedAll(
    '/api/qoh/games',
    items.map((i) => i.id),
  )
}
export async function getQohGameById(gameId: string): Promise<QoH.Game.Item | undefined> {
  const url = `/api/qoh/game/${gameId}`

  const game = await get<QoH.Game.ServerItem>(url)

  return game ? serverToQoHGameItem(game) : undefined
}

export async function createQohEntry(
  gameId: string,
  payload: QoH.Entry.Payload,
): Promise<QoH.Entry.Item | undefined> {
  const item = await create<QoH.Entry.ServerItem, QoH.Entry.Payload>(
    `/api/qoh/game/${gameId}/entries`,
    payload,
  )

  return item ? serverToQoHEntryItem(item) : undefined
}
export async function editQohEntry(
  id: string,
  payload: QoH.Entry.UiPayload,
): Promise<QoH.Entry.Item | undefined> {
  const item = await edit<QoH.Entry.ServerItem, QoH.Entry.UiPayload>(
    `/api/qoh/entry/${id}`,
    payload,
  )

  return item ? serverToQoHEntryItem(item) : undefined
}
export async function deleteQohEntries(items: QoH.Entry.Item[]): Promise<boolean> {
  return await deletedAll(
    '/api/qoh/entries',
    items.map((i) => i.id),
  )
}

async function get<D = unknown>(url: string): Promise<D | undefined> {
  const response = await fetch(url, {
    method: 'get',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  })

  if (response.ok) {
    const data = (await response.json()) as D

    return data
  }

  return undefined
}
async function create<D = unknown, P = unknown>(url: string, payload: P): Promise<D | undefined> {
  try {
    const response = await fetch(url, {
      method: 'post',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (response.ok) {
      const data = (await response.json()) as D | D[]
      const responseData: D = Array.isArray(data) ? data[0] : data

      return responseData
    }

    return undefined
  } catch (error) {
    return undefined
  }
}
async function edit<D = unknown, P = unknown>(url: string, payload: P): Promise<D | undefined> {
  try {
    const response = await fetch(url, {
      method: 'put',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    return response.ok ? ((await response.json()) as D) : undefined
  } catch (error) {
    return undefined
  }
}
async function deleted(url: string): Promise<boolean> {
  try {
    await fetch(url, {
      method: 'delete',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })

    return true
  } catch (error) {
    return false
  }
}
async function deletedAll(url: string, ids: string[]): Promise<boolean> {
  try {
    await fetch(url, {
      method: 'delete',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(ids),
    })

    return true
  } catch (error) {
    return false
  }
}
