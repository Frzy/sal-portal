import UserIcon from '@mui/icons-material/Person'
import SecurityIcon from '@mui/icons-material/Security'
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from '@mui/material'

import { getUsers } from '@/lib/users'
import { getServerAuthSession } from '@/util/auth'

export default async function UserPage(): Promise<React.JSX.Element> {
  const session = await getServerAuthSession()

  if (!session?.user.isAdmin)
    return (
      <Paper>
        <Alert severity='error'>
          <AlertTitle>Unauthorized</AlertTitle>
          <Typography>
            You do not have the access to view this page. If this is a mistake please contact the
            site administrator.
          </Typography>
        </Alert>
      </Paper>
    )

  const users = await getUsers()
  const hasUsers = users.length > 1

  return (
    <Paper sx={{ p: 1 }}>
      <Stack spacing={1}>
        <Typography variant='h3'>Users</Typography>
        {hasUsers && <Divider />}
        {hasUsers ? (
          <List>
            {users.map((user) => {
              if (user.username === 'admin') return null

              return (
                <ListItem key={user.id}>
                  <ListItemIcon>{user.isAdmin ? <SecurityIcon /> : <UserIcon />}</ListItemIcon>
                  <ListItemText primary={user.username} />
                </ListItem>
              )
            })}
          </List>
        ) : (
          <Alert severity='info' sx={{ '& .MuiAlert-message': { flexGrow: 1 } }}>
            <AlertTitle>No Current Users Accounts</AlertTitle>
            <Typography gutterBottom>
              Please use the button below to create user accounts
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Button color='secondary'>Create User Account</Button>
            </Box>
          </Alert>
        )}
      </Stack>
    </Paper>
  )
}
