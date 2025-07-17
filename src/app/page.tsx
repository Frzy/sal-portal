import UnauthorizedAlert from '@c/UnauthorizedAlert'

import { getCurrentYearCheckouts } from '@/lib/checkouts'
import { getCurrentYearCosts as getCurrentYearKitchenCosts } from '@/lib/costs'
import { getCurrentYearCosts as getCurrentYearPullTabCosts } from '@/lib/pullTabCosts'
import { getCurrentYearTransactions } from '@/lib/pullTabTransactions'
import { findQohGame } from '@/lib/qohGames'
import { getServerAuthSession } from '@/util/auth'
import { getKitchenStats, getPullTabStats } from '@/util/functions'
import DashboardView from '@/views/dashboard'

export default async function Home(): Promise<React.JSX.Element> {
  const session = await getServerAuthSession()

  if (!session?.user) return <UnauthorizedAlert />

  const kitchenCosts = await getCurrentYearKitchenCosts()
  const kitchenServices = await getCurrentYearCheckouts()
  const kitchenStats = getKitchenStats(kitchenCosts, kitchenServices)

  const qohGame = await findQohGame((g) => !g.endDate)

  const pullTabCosts = await getCurrentYearPullTabCosts()
  const pullTabTransactions = await getCurrentYearTransactions()
  const pullTabStats = getPullTabStats(pullTabCosts, pullTabTransactions)

  return (
    <DashboardView
      qohGame={qohGame}
      kitchenStats={kitchenStats}
      lastService={kitchenServices[kitchenServices.length - 1]}
      pullTabStats={pullTabStats}
    />
  )
}
