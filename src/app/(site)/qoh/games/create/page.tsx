import AdminAccessOnly from '@c/AdminAccessOnly'
import UnauthorizedAlert from '@c/UnauthorizedAlert'

import { findQohGame } from '@/lib/qohGames'
import { getServerAuthSession } from '@/util/auth'
import QohCreateGameView from '@/views/QoH/CreateGameView'

export default async function QohGamesPage(): Promise<React.JSX.Element> {
  const session = await getServerAuthSession()
  const isAdmin = session?.user.isAdmin ?? false

  if (!session?.user) return <UnauthorizedAlert />
  if (!isAdmin) return <AdminAccessOnly />

  const currentGame = await findQohGame((item) => !!item.startDate && !item.endDate)

  return <QohCreateGameView currentGame={currentGame} />
}
