import dayjs from 'dayjs'

import { createQohGame, deleteQohGame, findGoogleQohGameRows, getQohGames } from '@/lib/qohGames'
import { getServerAuthSession } from '@/util/auth'

export async function GET(): Promise<Response> {
  const session = await getServerAuthSession()

  if (!session) return Response.json({ message: 'Not Authenticated' }, { status: 401 })

  const items = await getQohGames()

  return Response.json(items)
}
export async function POST(request: Request): Promise<Response> {
  const session = await getServerAuthSession()
  if (!session) return Response.json({ message: 'Not Authenticated' }, { status: 401 })

  const payload = (await request.json()) as QoH.Game.Payload
  const user = session?.user.username

  try {
    const activeGame = await findGoogleQohGameRows((item) => {
      return !!item.get('startDate') && !item.get('endDate')
    })

    if (activeGame) {
      activeGame.set('endDate', dayjs().format())
      await activeGame.save()
    }

    const response = await createQohGame({ ...payload, createdBy: user })

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
    const response = await deleteQohGame(ids, (item) => {
      return isAdmin || item.get('createdBy') === session.user.username
    })

    return Response.json(response, { status: 200 })
  } catch (error) {
    return Response.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}
