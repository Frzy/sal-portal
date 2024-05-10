import UnauthorizedAlert from '@c/UnauthorizedAlert'

import { getMenuItems } from '@/lib/menuItems'
import { getServerAuthSession } from '@/util/auth'
import CheckoutView from '@/views/CheckoutView'

export default async function UserPage(): Promise<React.JSX.Element> {
  const session = await getServerAuthSession()

  if (!session?.user) return <UnauthorizedAlert />

  const menuItems = await getMenuItems()

  return <CheckoutView serverMenuItems={menuItems} />
}
