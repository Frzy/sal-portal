import dayjs from 'dayjs'

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

export async function createMenuItem(
  payload: Kitchen.MenuItemPayload,
): Promise<Kitchen.MenuItem | undefined> {
  const item = await create<Kitchen.ServerMenuItem, Kitchen.MenuItemPayload>(
    '/api/kitchen/menu-items',
    payload,
  )

  return item
    ? { ...item, created: dayjs(item.created), modified: dayjs(item.modified) }
    : undefined
}
export async function editMenuItem(
  id: string,
  payload: Kitchen.MenuItemPayload,
): Promise<Kitchen.MenuItem | undefined> {
  const item = await edit<Kitchen.ServerMenuItem, Kitchen.MenuItemPayload>(
    `/api/kitchen/menu-item/${id}`,
    payload,
  )

  return item
    ? { ...item, created: dayjs(item.created), modified: dayjs(item.modified) }
    : undefined
}
export async function deleteMenuItem(menuItem: Kitchen.MenuItem): Promise<boolean> {
  return await deleted(`/api/kitchen/menu-item/${menuItem.id}`)
}
export async function deleteMenuItems(items: Kitchen.MenuItem[]): Promise<boolean> {
  if (items.length > 1) {
    return await deletedAll(
      '/api/kitchen/menu-items',
      items.map((i) => i.id),
    )
  }
  const item = items[0]
  return await deleted(`/api/kitchen/menu-item/${item.id}`)
}

export async function createKitchenCost(
  payload: Kitchen.CostItemPayload,
): Promise<Kitchen.CostItem | undefined> {
  const item = await create<Kitchen.ServerCostItem, Kitchen.CostItemPayload>(
    '/api/kitchen/costs',
    payload,
  )

  return item
    ? { ...item, created: dayjs(item.created), modified: dayjs(item.modified) }
    : undefined
}
export async function editKitchenCost(
  id: string,
  payload: Kitchen.CostItemPayload,
): Promise<Kitchen.CostItem | undefined> {
  const item = await edit<Kitchen.ServerCostItem, Kitchen.CostItemPayload>(
    `/api/kitchen/cost/${id}`,
    payload,
  )

  return item
    ? { ...item, created: dayjs(item.created), modified: dayjs(item.modified) }
    : undefined
}
export async function deleteKitchenCosts(items: Kitchen.CostItem[]): Promise<boolean> {
  if (items.length > 1) {
    return await deletedAll(
      '/api/kitchen/costs',
      items.map((i) => i.id),
    )
  }
  const item = items[0]
  return await deleted(`/api/kitchen/cost/${item.id}`)
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

    return response.ok ? ((await response.json()) as D) : undefined
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
