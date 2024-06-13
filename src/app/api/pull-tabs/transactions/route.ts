import {
  createTransactionItem,
  deleteTransactionItems,
  getTransactionBy,
} from '@/lib/pullTabTransactions'
import { getServerAuthSession } from '@/util/auth'

export async function GET(): Promise<Response> {
  const session = await getServerAuthSession()
  const isAdmin = session?.user.isAdmin ?? false

  if (!session) return Response.json({ message: 'Not Authenticated' }, { status: 401 })

  const items = await getTransactionBy((item) => {
    return isAdmin || item.createdBy === session.user.username
  })

  return Response.json(items)
}
export async function POST(request: Request): Promise<Response> {
  const session = await getServerAuthSession()
  if (!session) return Response.json({ message: 'Not Authenticated' }, { status: 401 })

  const payload = (await request.json()) as PullTab.Transaction.CreatePayload
  const user = session?.user.username

  try {
    const response = await createTransactionItem({ ...payload, createdBy: user })

    return Response.json(response, { status: 201 })
  } catch (error) {
    return Response.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}
export async function DELETE(request: Request): Promise<Response> {
  const session = await getServerAuthSession()
  if (!session) return Response.json({ message: 'Not Authenticated' }, { status: 401 })

  const ids = (await request.json()) as string[]
  const isAdmin = session?.user.isAdmin

  try {
    const response = await deleteTransactionItems(ids, (item) => {
      return isAdmin || item.get('createdBy') === session.user.username
    })

    return Response.json(response, { status: 200 })
  } catch (error) {
    return Response.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}
