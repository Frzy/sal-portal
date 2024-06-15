import UnauthorizedAlert from '@c/UnauthorizedAlert'

import { getTransaction, getTransactionBy } from '@/lib/pullTabTransactions'
import { getServerAuthSession } from '@/util/auth'
import CreatePullTabTransactionView from '@/views/PullTabs/CreatePullTabTransactionView'

export default async function UserPage(): Promise<React.JSX.Element> {
  const session = await getServerAuthSession()

  if (!session?.user) return <UnauthorizedAlert />

  const isAdmin = session.user.isAdmin
  const transactions = isAdmin
    ? await getTransaction()
    : await getTransactionBy((t) => t.createdBy === session.user.username)
  const bagTotal = transactions.length
    ? transactions[transactions.length - 1]?.runningTotal ?? 0
    : 0

  return <CreatePullTabTransactionView bagTotal={bagTotal} />
}
