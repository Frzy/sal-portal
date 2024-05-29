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

import { deleteQohGames } from '@/util/requests'

interface DeleteQohGameDialogProps extends Omit<DialogProps, 'onClose'> {
  onClose?: () => void
  onDeleted?: (items: QoH.Game.Item[]) => void
  items: QoH.Game.Item[]
}
export default function DeleteQohGameDialog({
  onDeleted,
  onClose,
  items,
  ...other
}: DeleteQohGameDialogProps): React.JSX.Element {
  const [loading, setLoading] = useState(false)

  async function handleDeleteItem(): Promise<void> {
    setLoading(true)
    const deletedItem = await deleteQohGames(items)

    if (!deletedItem) {
      const event = new CustomEvent<INotification>('notify', {
        detail: { message: 'Failed to delete QoH game.', severity: 'error' },
      })

      dispatchEvent(event)
    } else {
      const event = new CustomEvent<INotification>('notify', {
        detail: { message: 'QoH games deleted', severity: 'success' },
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
          Are you sure you want to delete the following games:{' '}
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
