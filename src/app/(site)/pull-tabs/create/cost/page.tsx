import UnauthorizedAlert from '@c/UnauthorizedAlert'

import { getCosts, getCostsBy } from '@/lib/pullTabCosts'
import { getServerAuthSession } from '@/util/auth'
import CreatePulltabCostView from '@/views/PullTabs/CreatePulltabCostView'

export default async function UserPage(): Promise<React.JSX.Element> {
  const session = await getServerAuthSession()

  if (!session?.user) return <UnauthorizedAlert />

  const isAdmin = session.user.isAdmin
  const costs = isAdmin
    ? await getCosts()
    : await getCostsBy((c) => c.createdBy === session.user.username)

  return <CreatePulltabCostView costs={costs.reverse().slice(0, 5)} />
}
