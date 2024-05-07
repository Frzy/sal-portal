import App from '@c/App'
import { NextAuthProvider } from '@c/NextAuthProvider'
import { Box } from '@mui/material'
import type { Metadata } from 'next'
import { headers } from 'next/headers'
import parser from 'ua-parser-js'

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
  const headersList = headers()
  const referer = headersList.get('user-agent')
  const parsed = parser(referer?.toString()).device.type ?? 'desktop'

  return (
    <html lang='en' suppressHydrationWarning={true}>
      <NextAuthProvider session={session}>
        <Box component='body' sx={{ display: 'flex' }}>
          <App deviceType={parsed}>{children}</App>
        </Box>
      </NextAuthProvider>
    </html>
  )
}
