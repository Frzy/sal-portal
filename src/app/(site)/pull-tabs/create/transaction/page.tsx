import UnauthorizedAlert from '@c/UnauthorizedAlert'

import { getTransaction } from '@/lib/pullTabTransactions'
import { getServerAuthSession } from '@/util/auth'
import CreatePullTabTransactionView from '@/views/PullTabs/CreatePullTabTransactionView'

export default async function UserPage(): Promise<React.JSX.Element> {
  const session = await getServerAuthSession()

  if (!session?.user) return <UnauthorizedAlert />

  const transactions = await getTransaction()

  const bagTotal = transactions.length
    ? transactions[transactions.length - 1]?.runningTotal ?? 0
    : 0

  return <CreatePullTabTransactionView bagTotal={bagTotal} />
}
