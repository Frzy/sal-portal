import { deleteQohEntries, findQohEntry, updateQohEntry } from '@/lib/qohEntries'
import { getServerAuthSession } from '@/util/auth'

export async function GET(
  request: Request,
  { params }: { params: { entryId: string } },
): Promise<Response> {
  const { entryId } = params
  const session = await getServerAuthSession()

  if (!session) return Response.json({ message: 'Not Authenticated' }, { status: 401 })

  const item = await findQohEntry((item) => item.id === entryId)

  if (!item) return Response.json({ message: 'Game Entry Not Found' }, { status: 404 })

  return Response.json(item)
}
export async function PUT(
  request: Request,
  { params }: { params: { entryId: string } },
): Promise<Response> {
  const { entryId } = params
  const session = await getServerAuthSession()
  const isAdminLoggedIn = session?.user.isAdmin ?? false

  if (!session) return Response.json({ message: 'Not Authenticated' }, { status: 401 })

  const payload = (await request.json()) as QoH.Entry.Payload

  try {
    const udpateItem = await updateQohEntry(
      entryId,
      {
        ...payload,
        lastModifiedBy: session.user.username,
      },
      (item) => {
        return isAdminLoggedIn || item.get('createdBy') === session.user.username
      },
    )

    if (!udpateItem) return Response.json({ message: 'Game Entry Not Found' }, { status: 404 })

    return Response.json(udpateItem)
  } catch (error) {
    return Response.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}
export async function DELETE(
  request: Request,
  { params }: { params: { entryId: string } },
): Promise<Response> {
  const { entryId } = params
  const session = await getServerAuthSession()
  const isAdminLoggedIn = session?.user.isAdmin ?? false

  if (!session) return Response.json({ message: 'Not Authenticated' }, { status: 401 })

  const deletedItem = await deleteQohEntries([entryId], (item) => {
    return isAdminLoggedIn || item.get('createdBy') === session.user.username
  })

  return Response.json(deletedItem)
}
