import {
  deleteTransactionItems,
  findTransactionItem,
  updateTransactionItem,
} from '@/lib/pullTabTransactions'
import { getServerAuthSession } from '@/util/auth'

export async function GET(
  request: Request,
  { params }: { params: { transactionId: string } },
): Promise<Response> {
  const { transactionId } = params
  const session = await getServerAuthSession()

  if (!session) return Response.json({ message: 'Not Authenticated' }, { status: 401 })

  const item = await findTransactionItem((item) => item.id === transactionId)

  if (!item) return Response.json({ message: 'Pulltab Cost Item Not Found' }, { status: 404 })

  return Response.json(item)
}
export async function PUT(
  request: Request,
  { params }: { params: { transactionId: string } },
): Promise<Response> {
  const { transactionId } = params
  const session = await getServerAuthSession()
  const isAdminLoggedIn = session?.user.isAdmin ?? false

  if (!session) return Response.json({ message: 'Not Authenticated' }, { status: 401 })

  const payload = (await request.json()) as PullTab.Transaction.EditPayload

  try {
    const udpateItem = await updateTransactionItem(
      transactionId,
      {
        ...payload,
        lastModifiedBy: session.user.username,
      },
      (item) => {
        return isAdminLoggedIn || item.get('createdBy') === session.user.username
      },
    )

    if (!udpateItem)
      return Response.json({ message: 'Pulltab Cost Item Not Found' }, { status: 404 })

    return Response.json(udpateItem)
  } catch (error) {
    return Response.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}
export async function DELETE(
  request: Request,
  { params }: { params: { transactionId: string } },
): Promise<Response> {
  const { transactionId } = params
  const session = await getServerAuthSession()
  const isAdminLoggedIn = session?.user.isAdmin ?? false

  if (!session) return Response.json({ message: 'Not Authenticated' }, { status: 401 })

  const deletedItem = await deleteTransactionItems([transactionId], (item) => {
    return isAdminLoggedIn || item.get('createdBy') === session.user.username
  })

  return Response.json(deletedItem)
}
