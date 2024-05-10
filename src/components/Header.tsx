'use client'

import { Fragment, useState } from 'react'

import CostIcon from '@mui/icons-material/AttachMoney'
import MenuIcon from '@mui/icons-material/Fastfood'
import QueenHeartIcon from '@mui/icons-material/Favorite'
import UsersIcon from '@mui/icons-material/Group'
import PullTabIcon from '@mui/icons-material/LocalActivity'
import LogoutIcon from '@mui/icons-material/Logout'
import DrawerMenuIcon from '@mui/icons-material/Menu'
import ProfileIcon from '@mui/icons-material/Person'
import CheckoutIcon from '@mui/icons-material/PointOfSale'
import ReceiptIcon from '@mui/icons-material/Receipt'
import BankIcon from '@mui/icons-material/Savings'
import QuuenDetailIcon from '@mui/icons-material/TurnedIn'
import {
  AppBar,
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import { signOut, useSession } from 'next-auth/react'

const drawerWidth = 240

export default function Header(): React.JSX.Element {
  const { data: session } = useSession()
  const theme = useTheme()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const isAdminLoggedIn = session?.user.isAdmin ?? false
  const isBig = useMediaQuery(theme.breakpoints.up('md'))

  function handleDrawerClose(): void {
    setIsClosing(true)
    setMobileOpen(false)
  }

  function handleDrawerTransitionEnd(): void {
    setIsClosing(false)
  }

  function handleDrawerToggle(): void {
    if (!isClosing) {
      setMobileOpen(!mobileOpen)
    }
  }

  return (
    <header>
      <AppBar
        position='fixed'
        sx={{
          backgroundColor: (theme) => theme.vars.palette.primary.main,
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar>
          <IconButton
            color='inherit'
            aria-label='open drawer'
            edge='start'
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <DrawerMenuIcon />
          </IconButton>
          <Typography variant='h6' noWrap component='div'>
            SAL 91 Portal
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        variant={isBig ? 'permanent' : 'temporary'}
        open={isBig ? undefined : mobileOpen}
        onTransitionEnd={isBig ? undefined : handleDrawerTransitionEnd}
        onClose={isBig ? undefined : handleDrawerClose}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List sx={{ py: 0 }}>
            <Divider />
            <ListSubheader
              component='div'
              sx={{
                backgroundColor: (theme) => theme.vars.palette.secondary.main,
                color: (theme) => theme.vars.palette.secondary.contrastText,
              }}
            >
              Information
            </ListSubheader>
            <Divider />
            <ListItem disablePadding>
              <ListItemButton>
                <ListItemIcon>
                  <ProfileIcon />
                </ListItemIcon>
                <ListItemText primary='Profile' />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => {
                  void signOut({ callbackUrl: '/login' })
                }}
              >
                <ListItemIcon>
                  <LogoutIcon />
                </ListItemIcon>
                <ListItemText primary='Log Out' />
              </ListItemButton>
            </ListItem>

            <Divider />
            <ListSubheader
              component='div'
              sx={{
                backgroundColor: (theme) => theme.vars.palette.secondary.main,
                color: (theme) => theme.vars.palette.secondary.contrastText,
              }}
            >
              Kitchen
            </ListSubheader>
            <Divider />
            {isAdminLoggedIn && (
              <ListItem disablePadding>
                <ListItemButton href='/kitchen/menu-items'>
                  <ListItemIcon>
                    <MenuIcon />
                  </ListItemIcon>
                  <ListItemText primary='Menu Items' />
                </ListItemButton>
              </ListItem>
            )}
            <ListItem disablePadding>
              <ListItemButton href='/kitchen/costs'>
                <ListItemIcon>
                  <CostIcon />
                </ListItemIcon>
                <ListItemText primary='Costs' />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton href='/kitchen/summary'>
                <ListItemIcon>
                  <ReceiptIcon />
                </ListItemIcon>
                <ListItemText primary='Summary' />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton href='/kitchen/checkout'>
                <ListItemIcon>
                  <CheckoutIcon />
                </ListItemIcon>
                <ListItemText primary='Checkout' />
              </ListItemButton>
            </ListItem>
            <Divider />
            <ListSubheader
              component='div'
              sx={{
                backgroundColor: (theme) => theme.vars.palette.secondary.main,
                color: (theme) => theme.vars.palette.secondary.contrastText,
              }}
            >
              Pull Tabs
            </ListSubheader>
            <Divider />
            <ListItem disablePadding>
              <ListItemButton>
                <ListItemIcon>
                  <BankIcon />
                </ListItemIcon>
                <ListItemText primary='Account Summary' />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton>
                <ListItemIcon>
                  <PullTabIcon />
                </ListItemIcon>
                <ListItemText primary='Daily Payouts' />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton>
                <ListItemIcon>
                  <CostIcon />
                </ListItemIcon>
                <ListItemText primary='Costs' />
              </ListItemButton>
            </ListItem>
            <Divider />
            <ListSubheader
              component='div'
              sx={{
                backgroundColor: (theme) => theme.vars.palette.secondary.main,
                color: (theme) => theme.vars.palette.secondary.contrastText,
              }}
            >
              Queen of Hearts
            </ListSubheader>
            <Divider />
            <ListItem disablePadding>
              <ListItemButton>
                <ListItemIcon>
                  <QueenHeartIcon />
                </ListItemIcon>
                <ListItemText primary='Summary' />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton>
                <ListItemIcon>
                  <QuuenDetailIcon />
                </ListItemIcon>
                <ListItemText primary='Details' />
              </ListItemButton>
            </ListItem>
            {isAdminLoggedIn && (
              <Fragment>
                <Divider />
                <ListSubheader
                  component='div'
                  sx={{
                    backgroundColor: (theme) => theme.vars.palette.secondary.main,
                    color: (theme) => theme.vars.palette.secondary.contrastText,
                  }}
                >
                  Admin Section
                </ListSubheader>
                <Divider />
                <ListItem disablePadding>
                  <ListItemButton href='/users'>
                    <ListItemIcon>
                      <UsersIcon />
                    </ListItemIcon>
                    <ListItemText primary='Manage Users' />
                  </ListItemButton>
                </ListItem>
              </Fragment>
            )}
          </List>
        </Box>
      </Drawer>
    </header>
  )
}
