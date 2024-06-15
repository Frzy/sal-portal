import UnauthorizedAlert from '@c/UnauthorizedAlert'

import { getCosts, getCostsBy } from '@/lib/pullTabCosts'
import { getServerAuthSession } from '@/util/auth'
import CostView from '@/views/PullTabs/CostView'

export const revalidate = 0

export default async function UserPage(): Promise<React.JSX.Element> {
  const session = await getServerAuthSession()

  if (!session?.user) return <UnauthorizedAlert />

  const isAdmin = session.user.isAdmin
  const costs = isAdmin
    ? await getCosts()
    : await getCostsBy((c) => c.createdBy === session.user.username)

  return <CostView costItems={costs} />
}
