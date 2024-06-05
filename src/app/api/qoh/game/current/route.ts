import { findQohGame } from '@/lib/qohGames'
import { getServerAuthSession } from '@/util/auth'

export async function GET(): Promise<Response> {
  const session = await getServerAuthSession()

  if (!session) return Response.json({ message: 'Not Authenticated' }, { status: 401 })

  const item = await findQohGame((item) => !!item.startDate && !item.endDate)

  return Response.json(item)
}
