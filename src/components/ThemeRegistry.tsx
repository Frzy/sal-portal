'use client'

import { AppRouterCacheProvider } from '@mui/material-nextjs/v13-appRouter'
import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider } from '@mui/material/styles'

import theme from '@/theme'

export default function ThemeRegistry({
  children,
  deviceType,
}: {
  children: React.ReactNode
  deviceType: string
}): React.JSX.Element {
  const mainTheme = theme(deviceType)
  return (
    <AppRouterCacheProvider options={{ key: 'mui' }}>
      <ThemeProvider theme={mainTheme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </AppRouterCacheProvider>
  )
}
