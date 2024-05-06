import { createMenuItems, getMenuItems } from '@/lib/menuItems'
import { getServerAuthSession } from '@/util/auth'

export async function GET(): Promise<Response> {
  const session = await getServerAuthSession()

  if (!session) return Response.json({ message: 'Not Authenticated' }, { status: 401 })
  if (!session.user.isAdmin) return Response.json({ message: 'Unauthorized' }, { status: 403 })

  const menuItems = await getMenuItems()

  return Response.json(menuItems)
}

export async function POST(request: Request): Promise<Response> {
  const session = await getServerAuthSession()

  if (!session) return Response.json({ message: 'Not Authenticated' }, { status: 401 })
  if (!session.user.isAdmin) return Response.json({ message: 'Unauthorized' }, { status: 403 })

  const payload = (await request.json()) as Kitchen.MenuItemPayload

  try {
    const response = await createMenuItems({ ...payload, lastModifiedBy: session.user.username })

    return Response.json(response, { status: 201 })
  } catch (error) {
    return Response.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}
