import UnauthorizedAlert from '@c/UnauthorizedAlert'

import { getServerAuthSession } from '@/util/auth'
import CheckoutView from '@/views/CheckoutView'

export default async function UserPage(): Promise<React.JSX.Element> {
  const session = await getServerAuthSession()

  if (!session?.user) return <UnauthorizedAlert />

  return <CheckoutView />
}
