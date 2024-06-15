import UnauthorizedAlert from '@c/UnauthorizedAlert'

import { getTransaction } from '@/lib/pullTabTransactions'
import { getServerAuthSession } from '@/util/auth'
import CreatePullTabPayoutView from '@/views/PullTabs/CreatePullTabPayoutView'

export default async function UserPage(): Promise<React.JSX.Element> {
  const session = await getServerAuthSession()

  if (!session?.user) return <UnauthorizedAlert />

  const isAdmin = session.user.isAdmin
  const serverPayouts = await getTransaction()
  const bagValue = serverPayouts.length ? serverPayouts[serverPayouts.length - 1].runningTotal : 0

  const payouts = isAdmin
    ? serverPayouts
        .filter((p) => p.type === 'TabPayout')
        .reverse()
        .slice(0, 5)
    : serverPayouts
        .filter((p) => p.type === 'TabPayout' && p.createdBy === session.user.username)
        .reverse()
        .slice(0, 5)

  return <CreatePullTabPayoutView payouts={payouts} bagValue={bagValue ?? 0} />
}
