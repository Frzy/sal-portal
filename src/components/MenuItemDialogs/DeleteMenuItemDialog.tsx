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

import { deleteMKitchenenuItems } from '@/util/requests'

interface DeleteMenuItemDialogProps extends Omit<DialogProps, 'onClose'> {
  onClose?: () => void
  onDeleted?: (items: Kitchen.Menu.Item[]) => void
  items?: Kitchen.Menu.Item[]
}
export default function DeleteMenuItemDialog({
  onDeleted,
  onClose,
  items = [],
  ...other
}: DeleteMenuItemDialogProps): React.JSX.Element {
  const [loading, setLoading] = useState(false)

  async function handleDeleteMenuItem(): Promise<void> {
    setLoading(true)
    const deletedMenuItem = await deleteMKitchenenuItems(items)

    if (!deletedMenuItem) {
      const event = new CustomEvent<INotification>('notify', {
        detail: { message: 'Failed to delete menu item.', severity: 'error' },
      })

      dispatchEvent(event)
    } else if (onDeleted) onDeleted(items)

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
            {items.map((i) => i.name)}
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
