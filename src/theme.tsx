'use client'

import {
  type CssVarsTheme,
  type Theme,
  experimental_extendTheme as extendTheme,
} from '@mui/material/styles'
import type {} from '@mui/material/themeCssVarsAugmentation'
import mediaQuery from 'css-mediaquery'
import { Roboto } from 'next/font/google'

const SAL_BLUE = '#008bff'
const SAL_YELLOW = '#FFD400'

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
})

const ssrMatchMedia = (deviceType: string) => (query: string) => ({
  matches: mediaQuery.match(query, {
    width: deviceType === 'mobile' ? '0px' : '1024px',
  }),
})

const theme = (deviceType: string): Omit<Theme, 'palette' | 'applyStyles'> & CssVarsTheme => {
  const newTheme = extendTheme({
    colorSchemes: {
      light: {
        palette: {
          primary: { main: SAL_BLUE },
          secondary: { main: SAL_YELLOW },
        },
      },
      dark: {
        palette: {
          primary: { main: SAL_BLUE },
          secondary: { main: SAL_YELLOW },
        },
      },
    },
    components: {
      MuiUseMediaQuery: {
        defaultProps: {
          ssrMatchMedia: ssrMatchMedia(deviceType),
        },
      },
    },
    typography: {
      fontFamily: roboto.style.fontFamily,
    },
  })

  // @ts-expect-error Needed to remove unwanted theme
  delete newTheme.colorSchemes.light

  return newTheme
}

export default theme
