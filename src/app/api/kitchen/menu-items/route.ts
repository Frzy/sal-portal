import { createMenuItems, deleteMenuItems, getMenuItems } from '@/lib/menuItems'
import { getServerAuthSession } from '@/util/auth'

export async function GET(): Promise<Response> {
  const session = await getServerAuthSession()

  if (!session) return Response.json({ message: 'Not Authenticated' }, { status: 401 })

  const menuItems = await getMenuItems()

  return Response.json(menuItems)
}

export async function POST(request: Request): Promise<Response> {
  const session = await getServerAuthSession()

  if (!session) return Response.json({ message: 'Not Authenticated' }, { status: 401 })

  const payload = (await request.json()) as Kitchen.MenuItemPayload

  try {
    const response = await createMenuItems({ ...payload, lastModifiedBy: session.user.username })

    return Response.json(response, { status: 201 })
  } catch (error) {
    return Response.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(request: Request): Promise<Response> {
  const session = await getServerAuthSession()
  if (!session) return Response.json({ message: 'Not Authenticated' }, { status: 401 })

  const ids = (await request.json()) as Kitchen.CostItemDeletePayload

  try {
    const response = await deleteMenuItems(ids)

    return Response.json(response, { status: 201 })
  } catch (error) {
    return Response.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}
