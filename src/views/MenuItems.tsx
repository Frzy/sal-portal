'use client'

import { Fragment, useMemo, useState } from 'react'

import { MenuItemDialog } from '@c/MenuItemDialog'
import CreateIcon from '@mui/icons-material/Add'
import ExpandLess from '@mui/icons-material/ExpandLess'
import ExpandMore from '@mui/icons-material/ExpandMore'
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Collapse,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

import { DIALOG_TYPES } from '@/util/constants'
import { arrayFill, formatCurrency } from '@/util/functions'

dayjs.extend(relativeTime)

interface MenuItemsViewProps {
  menuItems: Kitchen.MenuItem[]
}
export default function MenuItemsView({
  menuItems: intiItems = [],
}: MenuItemsViewProps): React.JSX.Element {
  const [menuItems, setMenuItems] = useState(intiItems)
  const [menuItemsOpen, setMenuItemsOpen] = useState(arrayFill<boolean>(menuItems.length, false))
  const [showCreate, setShowCreate] = useState(false)
  const [toEdit, setToEdit] = useState<Kitchen.MenuItem>()
  const [toDelete, setToDelete] = useState<Kitchen.MenuItem>()
  const { type, menuItem, open } = useMemo(() => {
    let type = DIALOG_TYPES.CREATE
    let menuItem: Kitchen.MenuItem | undefined

    if (toEdit) {
      type = DIALOG_TYPES.EDIT
      menuItem = toEdit
    }
    if (toDelete) {
      type = DIALOG_TYPES.DELETE
      menuItem = toDelete
    }

    return { type, menuItem, open: showCreate || !!toEdit || !!toDelete }
  }, [toEdit, toDelete, showCreate])
  const hasItems = menuItems.length > 1

  function handleCreated(newItem: Kitchen.MenuItem): void {
    setMenuItems((prev) => [...prev, newItem])
  }
  function handleDeleted(deletedItem: Kitchen.MenuItem): void {
    setMenuItems(menuItems.filter((u) => u.id !== deletedItem.id))
  }
  function handleEdited(editedItem: Kitchen.MenuItem): void {
    setMenuItems(menuItems.map((item) => (item.id === editedItem.id ? editedItem : item)))
  }
  function handleClose(): void {
    setShowCreate(false)
    setToDelete(undefined)
    setToEdit(undefined)
  }

  return (
    <Paper sx={{ p: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Typography variant='h3' sx={{ flexGrow: 1 }}>
          Items
        </Typography>
        <Button
          color='secondary'
          onClick={() => {
            setShowCreate(true)
          }}
        >
          Create Menu Item
        </Button>
      </Box>
      {hasItems && <Divider sx={{ mt: 1 }} />}
      {hasItems ? (
        <List disablePadding>
          {menuItems.map((item, index) => {
            return (
              <Fragment key={item.id}>
                <ListItemButton
                  divider={!menuItemsOpen[index]}
                  onClick={() => {
                    const newData = [...menuItemsOpen]
                    newData[index] = !newData[index]

                    setMenuItemsOpen(newData)
                  }}
                >
                  <ListItemText sx={{ flexGrow: 1 }} primary={item.name} />
                  <Typography
                    sx={{
                      fontFamily: 'monospace',
                      fontSize: 18,
                      pr: {
                        xs: 1,
                        sm: 3,
                      },
                    }}
                  >
                    {formatCurrency(item.amount)}
                  </Typography>
                  {menuItemsOpen[index] ? <ExpandLess /> : <ExpandMore />}
                </ListItemButton>
                <Collapse in={menuItemsOpen[index]} timeout='auto' unmountOnExit>
                  <ListItem component='div' divider sx={{ alignItems: 'stretch' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, flexGrow: 1 }}>
                      <Typography sx={{ flexGrow: 1 }}>{item.description}</Typography>
                      {item.created === item.modified ? (
                        <Box sx={{ display: 'flex', pr: 2 }}>
                          <Tooltip
                            title={`Created @ ${dayjs(item.created).format()}`}
                            enterDelay={250}
                            placement='bottom-start'
                          >
                            <Typography
                              variant='caption'
                              color='text.secondary'
                              sx={{ flexGrow: 1 }}
                            >
                              Created by {item.lastModifiedBy} {dayjs(item.created).fromNow()}
                            </Typography>
                          </Tooltip>
                        </Box>
                      ) : (
                        <Box sx={{ display: 'flex', pr: 2 }}>
                          <Tooltip
                            title={`Modified @ ${dayjs(item.created).format()}`}
                            enterDelay={250}
                            placement='bottom-start'
                          >
                            <Typography variant='caption' color='text.secondary'>
                              Modified by {item.lastModifiedBy} {dayjs(item.modified).fromNow()}
                            </Typography>
                          </Tooltip>
                        </Box>
                      )}
                    </Box>
                    <Stack spacing={1}>
                      <Button
                        size='small'
                        onClick={() => {
                          setToEdit(item)
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        size='small'
                        onClick={() => {
                          setToDelete(item)
                        }}
                      >
                        Delete
                      </Button>
                    </Stack>
                  </ListItem>
                </Collapse>
              </Fragment>
            )
          })}
        </List>
      ) : (
        <Alert severity='info' sx={{ '& .MuiAlert-message': { flexGrow: 1 } }}>
          <AlertTitle>No Current Users Accounts</AlertTitle>
          <Typography gutterBottom>Please use the button below to create a menu item.</Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Button
              color='secondary'
              onClick={() => {
                setShowCreate(true)
              }}
              startIcon={<CreateIcon />}
            >
              Create Menu Item
            </Button>
          </Box>
        </Alert>
      )}
      <MenuItemDialog
        open={open}
        type={type}
        menuItem={menuItem}
        onCreated={handleCreated}
        onDeleted={handleDeleted}
        onEdited={handleEdited}
        onClose={handleClose}
      />
    </Paper>
  )
}
