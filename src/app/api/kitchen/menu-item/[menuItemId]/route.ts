import { deleteMenuItem, findMenuItem, updateMenuItem } from '@/lib/menuItems'
import { getServerAuthSession } from '@/util/auth'

export async function GET(
  request: Request,
  { params }: { params: { menuItemId: string } },
): Promise<Response> {
  const { menuItemId } = params
  const session = await getServerAuthSession()

  if (!session) return Response.json({ message: 'Not Authenticated' }, { status: 401 })
  if (!session.user.isAdmin) return Response.json({ message: 'Unauthorized' }, { status: 403 })

  const menuItem = await findMenuItem((item) => item.id === menuItemId)

  if (!menuItem) return Response.json({ message: 'Menu Item Not Found' }, { status: 404 })

  return Response.json(menuItem)
}

export async function PUT(
  request: Request,
  { params }: { params: { menuItemId: string } },
): Promise<Response> {
  const { menuItemId } = params
  const session = await getServerAuthSession()
  const isAdminLoggedIn = session?.user.isAdmin

  if (!session) return Response.json({ message: 'Not Authenticated' }, { status: 401 })
  if (!isAdminLoggedIn) return Response.json({ message: 'Unauthorized' }, { status: 403 })

  const payload = (await request.json()) as Kitchen.Menu.EditPayload

  try {
    const updatedMenuItem = await updateMenuItem(menuItemId, {
      ...payload,
      lastModifiedBy: session.user.username,
    })

    if (!updatedMenuItem) return Response.json({ message: 'Menu Item Not Found' }, { status: 404 })

    return Response.json(updatedMenuItem)
  } catch (error) {
    return Response.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { menuItemId: string } },
): Promise<Response> {
  const { menuItemId } = params
  const session = await getServerAuthSession()

  if (!session) return Response.json({ message: 'Not Authenticated' }, { status: 401 })
  if (!session.user.isAdmin) return Response.json({ message: 'Unauthorized' }, { status: 403 })

  const deletedMenuItem = await deleteMenuItem(menuItemId)

  return Response.json(deletedMenuItem)
}
