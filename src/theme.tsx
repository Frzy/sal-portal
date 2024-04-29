'use client'

import { experimental_extendTheme as extendTheme } from '@mui/material/styles'
import type {} from '@mui/material/themeCssVarsAugmentation'
import { Roboto } from 'next/font/google'

const SAL_BLUE = '#008bff'
const SAL_YELLOW = '#FFD400'

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
})

const theme = extendTheme({
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
  typography: {
    fontFamily: roboto.style.fontFamily,
  },
})

// @ts-expect-error Need to remove the light theme
delete theme.colorSchemes.light

export default theme
