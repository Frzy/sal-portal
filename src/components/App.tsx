'use client'

import {
  Container,
  CssBaseline,
  Experimental_CssVarsProvider as CssVarsProvider,
  Toolbar,
  getInitColorSchemeScript,
} from '@mui/material'
import { AppRouterCacheProvider } from '@mui/material-nextjs/v13-appRouter'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'

import theme from '@/theme'
import { DRAWER_WIDTH } from '@/util/constants'

import Header from './Header'
import Notifier from './Notifier'

interface AppProps {
  children: React.ReactNode
  deviceType: string
}
export default function App({ children, deviceType }: AppProps): React.JSX.Element {
  return (
    <AppRouterCacheProvider>
      <CssVarsProvider theme={theme(deviceType)} defaultMode='dark'>
        {getInitColorSchemeScript()}
        <CssBaseline />
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Header />
          <Container
            component={'main'}
            maxWidth='xl'
            sx={{ pb: 1, width: { xs: '100%', md: `calc(100% - ${DRAWER_WIDTH}px)` } }}
          >
            <Toolbar sx={{ mb: 1 }} />
            {children}
            <Notifier />
          </Container>
        </LocalizationProvider>
      </CssVarsProvider>
    </AppRouterCacheProvider>
  )
}
