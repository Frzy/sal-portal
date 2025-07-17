import UnauthorizedAlert from '@c/UnauthorizedAlert'

import { getCosts } from '@/lib/pullTabCosts'
import { getServerAuthSession } from '@/util/auth'
import CreatePulltabCostView from '@/views/PullTabs/CreatePulltabCostView'

export default async function UserPage(): Promise<React.JSX.Element> {
  const session = await getServerAuthSession()

  if (!session?.user) return <UnauthorizedAlert />

  let costs = await getCosts()
  costs = costs.slice(-5)

  return <CreatePulltabCostView costs={costs} />
}
