import UnauthorizedAlert from '@c/UnauthorizedAlert'

import { getTransaction } from '@/lib/pullTabTransactions'
import { getServerAuthSession } from '@/util/auth'
import CreatePullTabPayoutView from '@/views/PullTabs/CreatePullTabPayoutView'

export default async function UserPage(): Promise<React.JSX.Element> {
  const session = await getServerAuthSession()

  if (!session?.user) return <UnauthorizedAlert />

  const serverPayouts = await getTransaction()
  const bagValue = serverPayouts.length ? serverPayouts[serverPayouts.length - 1].runningTotal : 0

  const payouts = serverPayouts.filter((p) => p.type === 'TabPayout').slice(-5)

  return <CreatePullTabPayoutView payouts={payouts} bagValue={bagValue ?? 0} />
}
