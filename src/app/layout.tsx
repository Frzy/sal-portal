import App from '@c/App'
import { NextAuthProvider } from '@c/NextAuthProvider'
import type { Metadata } from 'next'

import { getServerAuthSession } from '@/util/auth'

export const metadata: Metadata = {
  title: 'SAL 91 Portal',
  description: 'Sons of the American Legion Portal Website',
}

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode
}>): Promise<React.JSX.Element> {
  const session = await getServerAuthSession()

  return (
    <html lang='en' suppressHydrationWarning={true}>
      <NextAuthProvider session={session}>
        <App>{children}</App>
      </NextAuthProvider>
    </html>
  )
}
