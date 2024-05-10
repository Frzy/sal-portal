import { useState } from 'react'

import { LoadingButton } from '@mui/lab'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  type DialogProps,
  DialogTitle,
  Typography,
} from '@mui/material'

import { deleteUser } from '@/util/requests'

interface DeleteUserDialogProps extends Omit<DialogProps, 'onClose'> {
  onClose?: () => void
  onDeleted?: (user: User.Base) => void
  user: User.Base
}
export default function DeleteUserDialog({
  onDeleted,
  onClose,
  user,
  ...other
}: DeleteUserDialogProps): React.JSX.Element {
  const [loading, setLoading] = useState(false)

  async function handleDeleteUser(): Promise<void> {
    setLoading(true)
    const deletedUser = await deleteUser(user)

    if (!deletedUser) {
      const event = new CustomEvent<INotification>('notify', {
        detail: { message: 'Failed to delete user.', severity: 'error' },
      })

      dispatchEvent(event)
    } else {
      const event = new CustomEvent<INotification>('notify', {
        detail: { message: `Successfully deleted user.`, severity: 'success' },
      })

      dispatchEvent(event)

      if (onDeleted) onDeleted(user)
    }

    setLoading(false)

    if (deletedUser && onClose) onClose()
  }

  return (
    <Dialog onClose={onClose} {...other}>
      <DialogTitle>Delete User Account</DialogTitle>
      <DialogContent dividers>
        <Typography>
          Are you sure you want to delete the following user account:{' '}
          <Typography
            component='span'
            fontWeight='fontWeightBold'
            sx={{ textTransform: 'uppercase' }}
          >
            {user.username}
          </Typography>
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color='inherit'>
          Cancel
        </Button>
        <LoadingButton color='error' loading={loading} onClick={handleDeleteUser}>
          Delete
        </LoadingButton>
      </DialogActions>
    </Dialog>
  )
}
