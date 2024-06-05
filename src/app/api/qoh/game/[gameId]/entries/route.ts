import { createQohEntries, findQohEntry } from '@/lib/qohEntries'
import { findQohGame } from '@/lib/qohGames'
import { getServerAuthSession } from '@/util/auth'

export async function GET(
  request: Request,
  { params }: { params: { gameId: string } },
): Promise<Response> {
  const { gameId } = params
  const session = await getServerAuthSession()

  if (!session) return Response.json({ message: 'Not Authenticated' }, { status: 401 })

  const item = await findQohEntry((item) => item.gameId === gameId)

  if (!item) return Response.json({ message: 'Game Entry Not Found' }, { status: 404 })

  return Response.json(item)
}

export async function POST(
  request: Request,
  { params }: { params: { gameId: string } },
): Promise<Response> {
  const { gameId } = params
  const session = await getServerAuthSession()
  if (!session) return Response.json({ message: 'Not Authenticated' }, { status: 401 })

  const payload = (await request.json()) as QoH.Entry.Payload
  const user = session?.user.username

  try {
    const game = await findQohGame((item) => item.id === gameId)

    if (!game) return Response.json({ message: 'Game Not Found' }, { status: 404 })

    const response = await createQohEntries({ ...payload, gameId, createdBy: user })

    return Response.json(response, { status: 201 })
  } catch (error) {
    return Response.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}
