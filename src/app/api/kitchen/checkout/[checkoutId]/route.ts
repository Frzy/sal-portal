import { deleteCheckouts, findCheckout, updateCheckout } from '@/lib/checkout'
import { getServerAuthSession } from '@/util/auth'

export async function GET(
  request: Request,
  { params }: { params: { checkoutId: string } },
): Promise<Response> {
  const { checkoutId } = params
  const session = await getServerAuthSession()

  if (!session) return Response.json({ message: 'Not Authenticated' }, { status: 401 })

  const item = await findCheckout((item) => item.id === checkoutId)

  if (!item) return Response.json({ message: 'Kitchen Checkout not found' }, { status: 404 })

  return Response.json(item)
}
export async function PUT(
  request: Request,
  { params }: { params: { checkoutId: string } },
): Promise<Response> {
  const { checkoutId } = params
  const session = await getServerAuthSession()
  const isAdminLoggedIn = session?.user.isAdmin ?? false

  if (!session) return Response.json({ message: 'Not Authenticated' }, { status: 401 })

  const payload = (await request.json()) as Kitchen.Checkout.EditPayload

  try {
    const udpateItem = await updateCheckout(
      checkoutId,
      {
        ...payload,
        lastModifiedBy: session.user.username,
      },
      (item) => {
        return isAdminLoggedIn || item.get('createdBy') === session.user.username
      },
    )

    if (!udpateItem)
      return Response.json({ message: 'Kitchen Checkout Not Found' }, { status: 404 })

    return Response.json(udpateItem)
  } catch (error) {
    return Response.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}
export async function DELETE(
  request: Request,
  { params }: { params: { checkoutId: string } },
): Promise<Response> {
  const { checkoutId } = params
  const session = await getServerAuthSession()
  const isAdminLoggedIn = session?.user.isAdmin ?? false

  if (!session) return Response.json({ message: 'Not Authenticated' }, { status: 401 })

  const deletedItem = await deleteCheckouts([checkoutId], (item) => {
    return isAdminLoggedIn || item.get('createdBy') === session.user.username
  })

  return Response.json(deletedItem)
}
