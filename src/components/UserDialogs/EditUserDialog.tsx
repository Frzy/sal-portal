import { Fragment, useMemo, useState } from 'react'

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
import { useSession } from 'next-auth/react'

import { isPasswordValid } from '@/util/functions'
import { editUser } from '@/util/requests'

export interface EditUserDialogProps extends Omit<DialogProps, 'onClose'> {
  user: User.Base
  onEdited?: (newUser: User.Base) => void
  onClose?: () => void
}
export default function EditUserDialog({
  user: initUser,
  onEdited,
  onClose,
  ...other
}: EditUserDialogProps): React.JSX.Element {
  const { data: session } = useSession()
  const isAdminLoggedIn = session?.user.isAdmin
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<User.UpdatePayload>({
    username: initUser.username,
    name: initUser.name,
    isAdmin: initUser.isAdmin,
    newPassword: '',
  })
  const [updatePassword, setUpdatePassword] = useState(false)
  const [passwordCopy, setPasswordCopy] = useState('')
  const isFormInvalid = useMemo(() => {
    if (!user.username) return true

    if (updatePassword) {
      if (!isAdminLoggedIn && !user.oldPassword) return true

      if (user.newPassword !== passwordCopy) return true

      return !isPasswordValid(user.newPassword)
    }

    return false
  }, [user, passwordCopy, updatePassword, isAdminLoggedIn])

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
  function handleShowPasswordUi(event: React.ChangeEvent<HTMLInputElement>): void {
    setUpdatePassword(event.target.checked)
  }

  async function handleEditUser(): Promise<void> {
    setLoading(true)
    const editedUser = await editUser(initUser.id, user)

    if (!editedUser) {
      const event = new CustomEvent<INotification>('notify', {
        detail: { message: 'Failed to edit user account.', severity: 'error' },
      })

      dispatchEvent(event)
    } else if (onEdited) onEdited(editedUser)

    setLoading(false)
    if (editedUser && onClose) onClose()
  }

  return (
    <Dialog onClose={onClose} {...other}>
      <DialogTitle>Create User Account</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid xs={12}>
            <TextField
              label='User Name'
              placeholder='Enter User Name ...'
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
              placeholder='Enter Display Name ...'
              name='name'
              value={user.name}
              onChange={handleTextChange}
              fullWidth
            />
          </Grid>
          <Grid xs={12}>
            <FormControlLabel
              control={<Switch checked={updatePassword} onChange={handleShowPasswordUi} />}
              label='Update Password'
            />
          </Grid>
          {updatePassword && (
            <Fragment>
              {!isAdminLoggedIn && (
                <Grid xs={12}>
                  <TextField
                    label='Old Password'
                    placeholder='Enter Old Password ...'
                    type='password'
                    name='password'
                    value={user.oldPassword}
                    onChange={handleTextChange}
                    required
                    fullWidth
                  />
                </Grid>
              )}
              <Grid xs={12}>
                <TextField
                  label='New Password'
                  type='password'
                  name='newPassword'
                  placeholder='Enter Password ...'
                  value={user.newPassword}
                  onChange={handleTextChange}
                  required
                  fullWidth
                />
              </Grid>
              <Grid xs={12}>
                <TextField
                  label='Re-Enter New Password'
                  placeholder='Enter Password ...'
                  type='password'
                  name='passwordCopy'
                  value={passwordCopy}
                  onChange={handleTextChange}
                  required
                  fullWidth
                />
              </Grid>
            </Fragment>
          )}
          {isAdminLoggedIn && (
            <Grid xs={12}>
              <FormControlLabel
                control={<Switch checked={user.isAdmin} onChange={handleAdminChange} />}
                label='Is Administrator'
              />
            </Grid>
          )}
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
          onClick={handleEditUser}
        >
          Update
        </LoadingButton>
      </DialogActions>
    </Dialog>
  )
}
