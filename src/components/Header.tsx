'use client'

import { Fragment } from 'react'

import CostIcon from '@mui/icons-material/AttachMoney'
import MenuIcon from '@mui/icons-material/Fastfood'
import QueenHeartIcon from '@mui/icons-material/Favorite'
import UsersIcon from '@mui/icons-material/Group'
import PullTabIcon from '@mui/icons-material/LocalActivity'
import LogoutIcon from '@mui/icons-material/Logout'
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
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Toolbar,
  Typography,
} from '@mui/material'
import { signOut, useSession } from 'next-auth/react'

const drawerWidth = 240

export default function Header(): React.JSX.Element {
  const { data: session } = useSession()
  const isAdmin = session?.user.isAdmin ?? false

  return (
    <header>
      <AppBar position='fixed' sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant='h6' noWrap component='div'>
            SAL 91 Portal
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        variant='permanent'
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
            <ListSubheader component='div'>Information</ListSubheader>
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
            <ListSubheader component='div'>Kitchen</ListSubheader>
            <Divider />
            <ListItem disablePadding>
              <ListItemButton>
                <ListItemIcon>
                  <MenuIcon />
                </ListItemIcon>
                <ListItemText primary='Menu Items' />
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
              <ListItemButton>
                <ListItemIcon>
                  <ReceiptIcon />
                </ListItemIcon>
                <ListItemText primary='Summary' />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton>
                <ListItemIcon>
                  <CheckoutIcon />
                </ListItemIcon>
                <ListItemText primary='Checkout' />
              </ListItemButton>
            </ListItem>
            <Divider />
            <ListSubheader component='div'>Pull Tabs</ListSubheader>
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
            <ListSubheader component='div'>Queen of Hearts</ListSubheader>
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
            {isAdmin && (
              <Fragment>
                <Divider />
                <ListSubheader component='div'>Admin Section</ListSubheader>
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
