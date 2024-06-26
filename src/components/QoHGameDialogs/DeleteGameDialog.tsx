import { useMemo, useState } from 'react'

import { LoadingButton } from '@mui/lab'
import {
  Alert,
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
  const entries = useMemo(() => {
    return items.reduce((prev, curr) => prev + curr.entries.length, 0)
  }, [items])

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
      <DialogTitle>Delete QoH {items.length > 1 ? 'Games' : 'Game'}</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={1}>
          <Typography>Are you sure you want to delete the following games:</Typography>
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
          {!!entries && (
            <Alert severity='warning'>
              This will also delete the {entries} {entries > 1 ? 'entries' : 'entry'} associated
              with the {items.length > 1 ? 'games' : 'game'} listed above.
            </Alert>
          )}
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
