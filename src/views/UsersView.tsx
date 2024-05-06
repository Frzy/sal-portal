'use client'

import { useMemo, useState } from 'react'

import UserDialog from '@c/UserDialog'
import CreateIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import UserIcon from '@mui/icons-material/Person'
import SecurityIcon from '@mui/icons-material/Security'
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Tooltip,
  Typography,
} from '@mui/material'

import { DIALOG_TYPES } from '@/util/constants'

interface UsersViewProps {
  users: User.Base[]
}
export default function UsersView({ users: initUsers = [] }: UsersViewProps): React.JSX.Element {
  const [users, setUsers] = useState(initUsers)
  const [showCreateUser, setShowCreateUser] = useState(false)
  const [userToEdit, setUserToEdit] = useState<User.Base>()
  const [userToDelete, setUserToDelete] = useState<User.Base>()
  const { type, user, open } = useMemo(() => {
    let type = DIALOG_TYPES.CREATE
    let user: User.Base | undefined

    if (userToEdit) {
      type = DIALOG_TYPES.EDIT
      user = userToEdit
    }
    if (userToDelete) {
      type = DIALOG_TYPES.DELETE
      user = userToDelete
    }

    return { type, user, open: showCreateUser || !!userToEdit || !!userToDelete }
  }, [userToEdit, userToDelete, showCreateUser])
  const hasUsers = users.length > 1

  function handleUserCreated(newUser: User.Base): void {
    setUsers((prev) => [...prev, newUser])
  }
  function handleUserDeleted(deletedUser: User.Base): void {
    setUsers(users.filter((u) => u.id !== deletedUser.id))
  }
  function handleUserEdited(editedUser: User.Base): void {
    setUsers(users.map((u) => (u.id === editedUser.id ? editedUser : u)))
  }
  function handleUserClose(): void {
    setShowCreateUser(false)
    setUserToDelete(undefined)
    setUserToEdit(undefined)
  }

  return (
    <Paper sx={{ p: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Typography variant='h3' sx={{ flexGrow: 1 }}>
          Users
        </Typography>
        <Tooltip title='Create an User Account'>
          <Button
            color='secondary'
            onClick={() => {
              setShowCreateUser(true)
            }}
          >
            Create User
          </Button>
        </Tooltip>
      </Box>
      {hasUsers && <Divider sx={{ mt: 1 }} />}
      {hasUsers ? (
        <List disablePadding>
          {users.map((user, index) => {
            if (user.username === 'admin') return null

            return (
              <ListItem
                divider={index < users.length - 1}
                key={user.id}
                secondaryAction={
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title={`Delete ${user.username}`}>
                      <IconButton
                        color='primary'
                        onClick={() => {
                          setUserToDelete(user)
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={`Edit ${user.username}`}>
                      <IconButton
                        color='primary'
                        onClick={() => {
                          setUserToEdit(user)
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                }
              >
                <ListItemIcon>
                  {user.isAdmin ? (
                    <Tooltip title='Administrator'>
                      <SecurityIcon />
                    </Tooltip>
                  ) : (
                    <UserIcon />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={user.name ? user.name : user.username}
                  secondary={user.name ? user.username : undefined}
                />
              </ListItem>
            )
          })}
        </List>
      ) : (
        <Alert severity='info' sx={{ '& .MuiAlert-message': { flexGrow: 1 } }}>
          <AlertTitle>No Current Users Accounts</AlertTitle>
          <Typography gutterBottom>Please use the button below to create user accounts</Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Button
              color='secondary'
              onClick={() => {
                setShowCreateUser(true)
              }}
              startIcon={<CreateIcon />}
            >
              Create User Account
            </Button>
          </Box>
        </Alert>
      )}

      <UserDialog
        open={open}
        type={type}
        user={user}
        onCreated={handleUserCreated}
        onDeleted={handleUserDeleted}
        onEdited={handleUserEdited}
        onClose={handleUserClose}
      />
    </Paper>
  )
}
