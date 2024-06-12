import UnauthorizedAlert from '@c/UnauthorizedAlert'
import { redirect } from 'next/navigation'

import { findQohGame } from '@/lib/qohGames'
import { getServerAuthSession } from '@/util/auth'
import QohGameDetailsView from '@/views/QoH/GameDetails'

export default async function QohDetailPage({
  params,
}: {
  params: { gameId: string }
}): Promise<React.JSX.Element> {
  const { gameId } = params
  const session = await getServerAuthSession()

  if (!session?.user) return <UnauthorizedAlert />

  const game = await findQohGame((g) => g.id === gameId)

  if (game) return <QohGameDetailsView game={game} />

  redirect('/error')
}
