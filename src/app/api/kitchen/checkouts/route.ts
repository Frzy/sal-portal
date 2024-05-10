import { createCheckouts, deleteCheckouts, getCheckoutsBy } from '@/lib/checkout'
import { getServerAuthSession } from '@/util/auth'

export async function GET(): Promise<Response> {
  const session = await getServerAuthSession()
  const isAdmin = session?.user.isAdmin ?? false

  if (!session) return Response.json({ message: 'Not Authenticated' }, { status: 401 })

  const items = await getCheckoutsBy((item) => {
    return isAdmin || item.createdBy === session.user.username
  })

  return Response.json(items)
}
export async function POST(request: Request): Promise<Response> {
  const session = await getServerAuthSession()
  if (!session) return Response.json({ message: 'Not Authenticated' }, { status: 401 })

  const payloadData = (await request.json()) as
    | Kitchen.Checkout.CreatePayload
    | Kitchen.Checkout.CreatePayload[]
  const payloads = Array.isArray(payloadData) ? payloadData : [payloadData]
  const user = session?.user.username

  try {
    const response = await createCheckouts(payloads.map((p) => ({ ...p, createdBy: user })))

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
    const response = await deleteCheckouts(ids, (item) => {
      return isAdmin || item.get('createdBy') === session.user.username
    })

    return Response.json(response, { status: 200 })
  } catch (error) {
    return Response.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}
