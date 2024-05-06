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

import { deleteMenuItem } from '@/util/requests'

interface DeleteMenuItemDialogProps extends Omit<DialogProps, 'onClose'> {
  onClose?: () => void
  onDeleted?: (menuItem: Kitchen.MenuItem) => void
  menuItem: Kitchen.MenuItem
}
export default function DeleteMenuItemDialog({
  onDeleted,
  onClose,
  menuItem,
  ...other
}: DeleteMenuItemDialogProps): React.JSX.Element {
  const [loading, setLoading] = useState(false)

  async function handleDeleteMenuItem(): Promise<void> {
    setLoading(true)
    const deletedMenuItem = await deleteMenuItem(menuItem)

    if (!deletedMenuItem) {
      const event = new CustomEvent<INotification>('notify', {
        detail: { message: 'Failed to delete menu item.', severity: 'error' },
      })

      dispatchEvent(event)
    } else if (onDeleted) onDeleted(menuItem)

    setLoading(false)

    if (deletedMenuItem && onClose) onClose()
  }

  return (
    <Dialog onClose={onClose} {...other}>
      <DialogTitle>Delete Menu Item</DialogTitle>
      <DialogContent dividers>
        <Typography>
          Are you sure you want to delete the following menu item:{' '}
          <Typography
            component='span'
            fontWeight='fontWeightBold'
            sx={{ textTransform: 'uppercase' }}
          >
            {menuItem.name}
          </Typography>
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color='inherit'>
          Cancel
        </Button>
        <LoadingButton color='error' loading={loading} onClick={handleDeleteMenuItem}>
          Delete
        </LoadingButton>
      </DialogActions>
    </Dialog>
  )
}
