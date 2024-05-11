import { deleteCostItems, findCostItem, updateCostItem } from '@/lib/costs'
import { getServerAuthSession } from '@/util/auth'

export async function GET(
  request: Request,
  { params }: { params: { costId: string } },
): Promise<Response> {
  const { costId } = params
  const session = await getServerAuthSession()

  if (!session) return Response.json({ message: 'Not Authenticated' }, { status: 401 })

  const item = await findCostItem((item) => item.id === costId)

  if (!item) return Response.json({ message: 'Kitchen Cost Item Not Found' }, { status: 404 })

  return Response.json(item)
}
export async function PUT(
  request: Request,
  { params }: { params: { costId: string } },
): Promise<Response> {
  const { costId } = params
  const session = await getServerAuthSession()
  const isAdminLoggedIn = session?.user.isAdmin ?? false

  if (!session) return Response.json({ message: 'Not Authenticated' }, { status: 401 })

  const payload = (await request.json()) as Kitchen.Cost.EditPayload

  try {
    const udpateItem = await updateCostItem(
      costId,
      {
        ...payload,
        lastModifiedBy: session.user.username,
      },
      (item) => {
        return isAdminLoggedIn || item.get('createdBy') === session.user.username
      },
    )

    if (!udpateItem)
      return Response.json({ message: 'Kitchen Cost Item Not Found' }, { status: 404 })

    return Response.json(udpateItem)
  } catch (error) {
    return Response.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}
export async function DELETE(
  request: Request,
  { params }: { params: { costId: string } },
): Promise<Response> {
  const { costId } = params
  const session = await getServerAuthSession()
  const isAdminLoggedIn = session?.user.isAdmin ?? false

  if (!session) return Response.json({ message: 'Not Authenticated' }, { status: 401 })

  const deletedItem = await deleteCostItems([costId], (item) => {
    return isAdminLoggedIn || item.get('createdBy') === session.user.username
  })

  return Response.json(deletedItem)
}
