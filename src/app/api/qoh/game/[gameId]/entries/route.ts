import { createQohEntry, getQohEntriesBy } from '@/lib/qohEntries'
import { findQohGame } from '@/lib/qohGames'
import { getServerAuthSession } from '@/util/auth'

export async function GET(
  request: Request,
  { params }: { params: { gameId: string } },
): Promise<Response> {
  const { gameId } = params
  const session = await getServerAuthSession()

  if (!session) return Response.json({ message: 'Not Authenticated' }, { status: 401 })

  const item = await getQohEntriesBy((item) => item.gameId === gameId)

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

    if (!game) return Response.json({ message: 'Queen of Hearts Game Not Found' }, { status: 404 })

    const response = await createQohEntry({ ...payload, gameId, createdBy: user })

    return Response.json(response, { status: 201 })
  } catch (error) {
    return Response.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}
