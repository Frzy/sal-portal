import { deleteQohGame, findQohGame, updateQohGame } from '@/lib/qohGames'
import { getServerAuthSession } from '@/util/auth'

export async function GET(
  request: Request,
  { params }: { params: { gameId: string } },
): Promise<Response> {
  const { gameId } = params
  const session = await getServerAuthSession()

  if (!session) return Response.json({ message: 'Not Authenticated' }, { status: 401 })

  const item = await findQohGame((item) => item.id === gameId)

  if (!item) return Response.json({ message: 'Game Not Found' }, { status: 404 })

  return Response.json(item)
}
export async function PUT(
  request: Request,
  { params }: { params: { gameId: string } },
): Promise<Response> {
  const { gameId } = params
  const session = await getServerAuthSession()
  const isAdminLoggedIn = session?.user.isAdmin ?? false

  if (!session) return Response.json({ message: 'Not Authenticated' }, { status: 401 })

  const payload = (await request.json()) as QoH.Game.Payload

  try {
    const udpateItem = await updateQohGame(
      gameId,
      {
        ...payload,
        lastModifiedBy: session.user.username,
      },
      (item) => {
        return isAdminLoggedIn || item.get('createdBy') === session.user.username
      },
    )

    if (!udpateItem) return Response.json({ message: 'Game Not Found' }, { status: 404 })

    return Response.json(udpateItem)
  } catch (error) {
    return Response.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}
export async function DELETE(
  request: Request,
  { params }: { params: { gameId: string } },
): Promise<Response> {
  const { gameId } = params
  const session = await getServerAuthSession()
  const isAdminLoggedIn = session?.user.isAdmin ?? false

  if (!session) return Response.json({ message: 'Not Authenticated' }, { status: 401 })

  const deletedItem = await deleteQohGame([gameId], (item) => {
    return isAdminLoggedIn || item.get('createdBy') === session.user.username
  })

  return Response.json(deletedItem)
}
