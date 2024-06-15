'use client'

import { Fragment, useState } from 'react'

import AddCardIcon from '@mui/icons-material/AddCard'
import AnalyticsIcon from '@mui/icons-material/Analytics'
import CostIcon from '@mui/icons-material/AttachMoney'
import MenuIcon from '@mui/icons-material/Fastfood'
import UsersIcon from '@mui/icons-material/Group'
import InsightsIcon from '@mui/icons-material/Insights'
import PullTabIcon from '@mui/icons-material/LocalActivity'
import LogoutIcon from '@mui/icons-material/Logout'
import DrawerMenuIcon from '@mui/icons-material/Menu'
import ProfileIcon from '@mui/icons-material/Person'
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd'
import CheckoutIcon from '@mui/icons-material/PointOfSale'
import ReceiptIcon from '@mui/icons-material/Receipt'
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

import DiagnosisIcon from '@/icons/Diagnosis'
import HeartPlusIcon from '@/icons/HeartPlus'
import PlayingCardsIcon from '@/icons/PlayingCards'
import { DRAWER_WIDTH } from '@/util/constants'

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
        component='div'
        sx={{
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
          width: DRAWER_WIDTH,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: DRAWER_WIDTH, boxSizing: 'border-box' },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List sx={{ py: 0 }}>
            <Divider />
            <ListSubheader
              component='div'
              sx={{
                backgroundColor: (theme) => theme.vars.palette.primary.main,
                color: (theme) => theme.vars.palette.primary.contrastText,
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
                <ListItemText primary='Home' />
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
                backgroundColor: (theme) => theme.vars.palette.primary.main,
                color: (theme) => theme.vars.palette.primary.contrastText,
              }}
            >
              Kitchen
            </ListSubheader>
            <Divider />
            {isAdminLoggedIn && (
              <ListItem disablePadding>
                <ListItemButton href='/kitchen/analytics' onClick={handleDrawerClose}>
                  <ListItemIcon>
                    <AnalyticsIcon />
                  </ListItemIcon>
                  <ListItemText primary='Analytics' />
                </ListItemButton>
              </ListItem>
            )}
            {isAdminLoggedIn && (
              <ListItem disablePadding>
                <ListItemButton href='/kitchen/menu-items' onClick={handleDrawerClose}>
                  <ListItemIcon>
                    <MenuIcon />
                  </ListItemIcon>
                  <ListItemText primary='Menu Items' />
                </ListItemButton>
              </ListItem>
            )}
            <ListItem disablePadding>
              <ListItemButton href='/kitchen/checkouts' onClick={handleDrawerClose}>
                <ListItemIcon>
                  <ReceiptIcon />
                </ListItemIcon>
                <ListItemText primary='Checkouts' />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton href='/kitchen/costs' onClick={handleDrawerClose}>
                <ListItemIcon>
                  <CostIcon />
                </ListItemIcon>
                <ListItemText primary='Costs' />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton href='/kitchen/checkouts/create' onClick={handleDrawerClose}>
                <ListItemIcon>
                  <CheckoutIcon />
                </ListItemIcon>
                <ListItemText primary='Checkout Form' />
              </ListItemButton>
            </ListItem>
            <Divider />
            <ListSubheader
              component='div'
              sx={{
                backgroundColor: (theme) => theme.vars.palette.primary.main,
                color: (theme) => theme.vars.palette.primary.contrastText,
              }}
            >
              Pull Tabs
            </ListSubheader>
            <Divider />
            <ListItem disablePadding>
              <ListItemButton>
                <ListItemIcon>
                  <InsightsIcon />
                </ListItemIcon>
                <ListItemText primary='Summary' />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton href='/pull-tabs/transactions' onClick={handleDrawerClose}>
                <ListItemIcon>
                  <ReceiptIcon />
                </ListItemIcon>
                <ListItemText primary='Transactions' />
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
            <ListItem disablePadding>
              <ListItemButton href='/pull-tabs/create/payout' onClick={handleDrawerClose}>
                <ListItemIcon>
                  <PullTabIcon />
                </ListItemIcon>
                <ListItemText primary='Payout Form' />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton href='/pull-tabs/create/cost' onClick={handleDrawerClose}>
                <ListItemIcon>
                  <AddCardIcon />
                </ListItemIcon>
                <ListItemText primary='Cost Form' />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton href='/pull-tabs/create/transaction' onClick={handleDrawerClose}>
                <ListItemIcon>
                  <PlaylistAddIcon />
                </ListItemIcon>
                <ListItemText primary='Transaction Form' />
              </ListItemButton>
            </ListItem>
            <Divider />
            <ListSubheader
              component='div'
              sx={{
                backgroundColor: (theme) => theme.vars.palette.primary.main,
                color: (theme) => theme.vars.palette.primary.contrastText,
              }}
            >
              Queen of Hearts
            </ListSubheader>
            <Divider />
            <ListItem disablePadding>
              <ListItemButton href='/qoh/games' onClick={handleDrawerClose}>
                <ListItemIcon>
                  <PlayingCardsIcon />
                </ListItemIcon>
                <ListItemText primary='Games' />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton href='/qoh/game/current' onClick={handleDrawerClose}>
                <ListItemIcon>
                  <DiagnosisIcon />
                </ListItemIcon>
                <ListItemText primary='Current Game' />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton href='/qoh/game/current/add-entry' onClick={handleDrawerClose}>
                <ListItemIcon>
                  <HeartPlusIcon />
                </ListItemIcon>
                <ListItemText primary='Game Entry Form' />
              </ListItemButton>
            </ListItem>
            {isAdminLoggedIn && (
              <Fragment>
                <Divider />
                <ListSubheader
                  component='div'
                  sx={{
                    backgroundColor: (theme) => theme.vars.palette.primary.main,
                    color: (theme) => theme.vars.palette.primary.contrastText,
                  }}
                >
                  Admin Section
                </ListSubheader>
                <Divider />
                <ListItem disablePadding>
                  <ListItemButton href='/users' onClick={handleDrawerClose}>
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
