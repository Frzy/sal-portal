import { useMemo, useState } from 'react'

import { LoadingButton } from '@mui/lab'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  type DialogProps,
  DialogTitle,
  FormControlLabel,
  Switch,
  TextField,
} from '@mui/material'
import Grid from '@mui/material/Unstable_Grid2/Grid2'

import { isPasswordValid } from '@/util/functions'
import { createUser } from '@/util/requests'

export interface CreateUserDialogProps extends Omit<DialogProps, 'onClose'> {
  onCreated?: (newUser: User.Base) => void
  onClose?: () => void
}
export default function CreateUserDialog({
  onCreated,
  onClose,
  ...other
}: CreateUserDialogProps): React.JSX.Element {
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<User.CreatePayload>({
    username: '',
    password: '',
    name: '',
    isAdmin: false,
  })
  const [passwordCopy, setPasswordCopy] = useState('')
  const isFormInvalid = useMemo(() => {
    return (
      !user.username ||
      !user.password ||
      !isPasswordValid(user.password) ||
      user.password !== passwordCopy
    )
  }, [user, passwordCopy])

  function handleTextChange(event: React.ChangeEvent<HTMLInputElement>): void {
    const { value, name } = event.target

    if (name === 'passwordCopy') {
      setPasswordCopy(value)
    } else {
      setUser((prev) => ({ ...prev, [name]: value }))
    }
  }
  function handleAdminChange(event: React.ChangeEvent<HTMLInputElement>): void {
    const { checked } = event.target

    setUser((prev) => ({ ...prev, isAdmin: checked }))
  }

  async function handleCreateUser(): Promise<void> {
    setLoading(true)
    const createdUser = await createUser(user)

    if (!createdUser) {
      const event = new CustomEvent<INotification>('notify', {
        detail: { message: 'Failed to create user account.', severity: 'error' },
      })

      dispatchEvent(event)
    } else if (onCreated) onCreated(createdUser)

    setLoading(false)
    if (createdUser && onClose) onClose()
  }

  return (
    <Dialog onClose={onClose} {...other}>
      <DialogTitle>Create User Account</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid xs={12}>
            <TextField
              label='User Name'
              name='username'
              value={user.username}
              onChange={handleTextChange}
              required
              fullWidth
            />
          </Grid>
          <Grid xs={12}>
            <TextField
              label='Display Name'
              name='name'
              value={user.name}
              onChange={handleTextChange}
              fullWidth
            />
          </Grid>
          <Grid xs={12}>
            <TextField
              label='Password'
              type='password'
              name='password'
              value={user.password}
              onChange={handleTextChange}
              required
              fullWidth
            />
          </Grid>
          <Grid xs={12}>
            <TextField
              label='Re-Enter Password'
              type='password'
              name='passwordCopy'
              value={passwordCopy}
              onChange={handleTextChange}
              required
              fullWidth
            />
          </Grid>
          <Grid xs={12}>
            <FormControlLabel
              control={<Switch checked={user.isAdmin} onChange={handleAdminChange} />}
              label='Is Administrator'
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color='inherit'>
          Cancel
        </Button>
        <LoadingButton
          color='secondary'
          loading={loading}
          disabled={isFormInvalid}
          onClick={handleCreateUser}
        >
          Create
        </LoadingButton>
      </DialogActions>
    </Dialog>
  )
}
