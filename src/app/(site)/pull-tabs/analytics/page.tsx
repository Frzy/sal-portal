import AdminAccessOnly from '@c/AdminAccessOnly'
import UnauthorizedAlert from '@c/UnauthorizedAlert'

import { getCosts } from '@/lib/pullTabCosts'
import { getTransaction } from '@/lib/pullTabTransactions'
import { getServerAuthSession } from '@/util/auth'
import PullTabAnalyticsView from '@/views/PullTabs/PullTabsAnalytics'

export default async function PullTabAnalyticsPage(): Promise<React.JSX.Element> {
  const session = await getServerAuthSession()
  const isAdmin = session?.user.isAdmin ?? false

  if (!session?.user) return <UnauthorizedAlert />
  if (!isAdmin) return <AdminAccessOnly />

  const costs = await getCosts()
  const transactions = await getTransaction()

  return <PullTabAnalyticsView transactions={transactions} costs={costs} />
}
