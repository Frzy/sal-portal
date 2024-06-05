import { useState } from 'react'

import { LoadingButton } from '@mui/lab'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  type DialogProps,
  DialogTitle,
  Stack,
  Typography,
} from '@mui/material'

import { deleteQohEntries } from '@/util/requests'

interface DeleteQohEntryDialogProps extends Omit<DialogProps, 'onClose'> {
  onClose?: () => void
  onDeleted?: (items: QoH.Entry.Item[]) => void
  items: QoH.Entry.GameItem[]
}
export default function DeleteQohEntryDialog({
  onDeleted,
  onClose,
  items,
  ...other
}: DeleteQohEntryDialogProps): React.JSX.Element {
  const [loading, setLoading] = useState(false)

  async function handleDeleteItem(): Promise<void> {
    setLoading(true)
    const deletedItem = await deleteQohEntries(items)

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
        <Stack spacing={1}>
          <Typography>
            Are you sure you want to delete the following game{' '}
            {items.length > 1 ? 'entries' : 'entry'}:
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {items.map((i) => (
              <Typography
                key={i.id}
                component='div'
                fontWeight='fontWeightBold'
                sx={{ flex: '0 1 auto', textTransform: 'uppercase' }}
              >
                {i.name}
              </Typography>
            ))}
          </Box>
        </Stack>
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
