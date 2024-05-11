import UnauthorizedAlert from '@c/UnauthorizedAlert'

import { getCheckouts, getCheckoutsBy } from '@/lib/checkout'
import { getServerAuthSession } from '@/util/auth'
import CheckoutView from '@/views/CheckoutView'

export default async function UserPage(): Promise<React.JSX.Element> {
  const session = await getServerAuthSession()

  if (!session?.user) return <UnauthorizedAlert />

  const isAdmin = session.user.isAdmin
  const checkouts = isAdmin
    ? await getCheckouts()
    : await getCheckoutsBy((c) => c.createdBy === session.user.username)

  return <CheckoutView serverCheckouts={checkouts} />
}
