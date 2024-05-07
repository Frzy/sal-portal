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

import { deleteKitchenCosts } from '@/util/requests'

interface DeleteKitchenCostsDialogProps extends Omit<DialogProps, 'onClose'> {
  onClose?: () => void
  onDeleted?: (items: Kitchen.CostItem[]) => void
  items: Kitchen.CostItem[]
}
export default function DeleteKitchenCostsDialog({
  onDeleted,
  onClose,
  items,
  ...other
}: DeleteKitchenCostsDialogProps): React.JSX.Element {
  const [loading, setLoading] = useState(false)

  async function handleDeleteItem(): Promise<void> {
    setLoading(true)
    const deletedItem = await deleteKitchenCosts(items)

    if (!deletedItem) {
      const event = new CustomEvent<INotification>('notify', {
        detail: { message: 'Failed to delete cost items.', severity: 'error' },
      })

      dispatchEvent(event)
    } else {
      const event = new CustomEvent<INotification>('notify', {
        detail: { message: 'Cost items deleted', severity: 'success' },
      })

      dispatchEvent(event)

      if (onDeleted) onDeleted(items)
    }

    setLoading(false)

    if (deletedItem && onClose) onClose()
  }

  return (
    <Dialog onClose={onClose} {...other}>
      <DialogTitle>Delete Kitchen Costs</DialogTitle>
      <DialogContent dividers>
        <Typography>
          Are you sure you want to delete the following cost items:{' '}
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
        <LoadingButton color='error' loading={loading} onClick={handleDeleteItem}>
          Delete
        </LoadingButton>
      </DialogActions>
    </Dialog>
  )
}
