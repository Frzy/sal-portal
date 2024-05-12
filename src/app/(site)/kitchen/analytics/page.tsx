import AdminAccessOnly from '@c/AdminAccessOnly'
import UnauthorizedAlert from '@c/UnauthorizedAlert'

import { getCheckouts, getCheckoutsBy } from '@/lib/checkout'
import { getCosts } from '@/lib/costs'
import { getServerAuthSession } from '@/util/auth'
import CheckoutView from '@/views/CheckoutView'
import KitchenAnalyticsView from '@/views/KitchenAnalytics'

export default async function KitchenAnalyticsPage(): Promise<React.JSX.Element> {
  const session = await getServerAuthSession()
  const isAdmin = session?.user.isAdmin ?? false

  if (!session?.user) return <UnauthorizedAlert />
  if (!isAdmin) return <AdminAccessOnly />

  const costs = await getCosts()
  const checkouts = await getCheckouts()

  return <KitchenAnalyticsView checkouts={checkouts} costs={costs} />
}
