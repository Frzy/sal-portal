import UnauthorizedAlert from '@c/UnauthorizedAlert'

import { getCheckouts } from '@/lib/checkout'
import { getServerAuthSession } from '@/util/auth'
import KitchenSummaryView from '@/views/KitchenSummaryView'

export default async function UserPage(): Promise<React.JSX.Element> {
  const session = await getServerAuthSession()

  if (!session?.user) return <UnauthorizedAlert />

  const checkouts = await getCheckouts()

  return <KitchenSummaryView serverCheckouts={checkouts} />
}
