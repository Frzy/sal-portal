'use client'

import {
  Box,
  Container,
  CssBaseline,
  Experimental_CssVarsProvider as CssVarsProvider,
  Toolbar,
  getInitColorSchemeScript,
} from '@mui/material'
import { AppRouterCacheProvider } from '@mui/material-nextjs/v13-appRouter'

import theme from '@/theme'

import Header from './Header'
import Notifier from './Notifier'

interface AppProps {
  children: React.ReactNode
}
export default function App({ children }: AppProps): React.JSX.Element {
  return (
    <CssVarsProvider theme={theme} defaultMode='dark'>
      <Box component='body' sx={{ display: 'flex' }}>
        <CssBaseline />
        <AppRouterCacheProvider>
          {getInitColorSchemeScript()}
          <Header />
          <Container component={'main'} maxWidth='xl'>
            <Toolbar sx={{ mb: 1 }} />
            {children}
            <Notifier />
          </Container>
        </AppRouterCacheProvider>
      </Box>
    </CssVarsProvider>
  )
}
