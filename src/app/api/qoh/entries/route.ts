import { deleteQohEntries, getQohEntries } from '@/lib/qohEntries'
import { getServerAuthSession } from '@/util/auth'

export async function GET(): Promise<Response> {
  const session = await getServerAuthSession()

  if (!session) return Response.json({ message: 'Not Authenticated' }, { status: 401 })

  const items = await getQohEntries()

  return Response.json(items)
}
export async function DELETE(request: Request): Promise<Response> {
  const session = await getServerAuthSession()
  if (!session) return Response.json({ message: 'Not Authenticated' }, { status: 401 })

  const ids = (await request.json()) as string[]
  const isAdmin = session?.user.isAdmin

  try {
    const response = await deleteQohEntries(ids, (item) => {
      return isAdmin || item.get('createdBy') === session.user.username
    })

    return Response.json(response, { status: 200 })
  } catch (error) {
    return Response.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}
