import { createCostItem, deleteCostItems, getCostsBy } from '@/lib/costs'
import { getServerAuthSession } from '@/util/auth'

export async function GET(): Promise<Response> {
  const session = await getServerAuthSession()
  const isAdmin = session?.user.isAdmin ?? false

  if (!session) return Response.json({ message: 'Not Authenticated' }, { status: 401 })

  const menuItems = await getCostsBy((item) => {
    return isAdmin || item.created === session.user.username
  })

  return Response.json(menuItems)
}

export async function POST(request: Request): Promise<Response> {
  const session = await getServerAuthSession()
  if (!session) return Response.json({ message: 'Not Authenticated' }, { status: 401 })

  const payload = (await request.json()) as Kitchen.CostItemPayload
  const user = session?.user.username

  try {
    const response = await createCostItem({ ...payload, createdBy: user })

    return Response.json(response, { status: 201 })
  } catch (error) {
    return Response.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(request: Request): Promise<Response> {
  const session = await getServerAuthSession()
  if (!session) return Response.json({ message: 'Not Authenticated' }, { status: 401 })

  const ids = (await request.json()) as Kitchen.CostItemDeletePayload
  const isAdmin = session?.user.isAdmin

  try {
    const response = await deleteCostItems(ids, (item) => {
      return isAdmin || item.get('created') === session.user.username
    })

    return Response.json(response, { status: 201 })
  } catch (error) {
    return Response.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}
