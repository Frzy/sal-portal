import AdminAccessOnly from '@c/AdminAccessOnly'
import UnauthorizedAlert from '@c/UnauthorizedAlert'

import { getCheckouts } from '@/lib/checkouts'
import { getCosts } from '@/lib/costs'
import { getServerAuthSession } from '@/util/auth'
import KitchenAnalyticsView from '@/views/Kitchen/KitchenAnalytics'

export default async function KitchenAnalyticsPage(): Promise<React.JSX.Element> {
  const session = await getServerAuthSession()
  const isAdmin = session?.user.isAdmin ?? false

  if (!session?.user) return <UnauthorizedAlert />
  if (!isAdmin) return <AdminAccessOnly />

  const costs = await getCosts()
  const checkouts = await getCheckouts()

  return <KitchenAnalyticsView checkouts={checkouts} costs={costs} />
}
