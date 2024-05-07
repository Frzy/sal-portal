import { useMemo, useState } from 'react'

import MoneyIcon from '@mui/icons-material/AttachMoney'
import { LoadingButton } from '@mui/lab'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  type DialogProps,
  DialogTitle,
  InputAdornment,
  TextField,
} from '@mui/material'
import Grid from '@mui/material/Unstable_Grid2/Grid2'

import { editKitchenCost } from '@/util/requests'

export interface EditKitchenCostDialogProps extends Omit<DialogProps, 'onClose'> {
  item: Kitchen.CostItem
  onEdited?: (item: Kitchen.CostItem) => void
  onClose?: () => void
}
export default function EditKitchenCostDialog({
  item: initItem,
  onEdited,
  onClose,
  ...other
}: EditKitchenCostDialogProps): React.JSX.Element {
  const [loading, setLoading] = useState(false)
  const [item, setItem] = useState<Kitchen.CostItemPayload>({
    amount: initItem.amount,
  })
  const isFormInvalid = useMemo(() => {
    return item.amount <= 0
  }, [item])

  function handleTextChange(event: React.ChangeEvent<HTMLInputElement>): void {
    const { value, name } = event.target

    setItem((prev) => ({ ...prev, [name]: parseInt(value) }))
  }

  async function handleEditItem(): Promise<void> {
    setLoading(true)
    const editedItem = await editKitchenCost(initItem.id, item)

    if (!editedItem) {
      const event = new CustomEvent<INotification>('notify', {
        detail: { message: `Failed to edit menu item: ${initItem.name}`, severity: 'error' },
      })

      window.dispatchEvent(event)
    } else {
      const event = new CustomEvent<INotification>('notify', {
        detail: { message: `Successfully updated cost item.`, severity: 'success' },
      })

      window.dispatchEvent(event)
      if (onEdited) onEdited(editedItem)
    }

    setLoading(false)
    if (editedItem && onClose) onClose()
  }

  return (
    <Dialog onClose={onClose} {...other}>
      <DialogTitle>Edit Cost Item</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid xs={12}>
            <TextField
              label='Amount'
              name='amount'
              type='number'
              value={item.amount || ''}
              onChange={handleTextChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <MoneyIcon />
                  </InputAdornment>
                ),
              }}
              required
              fullWidth
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
          onClick={handleEditItem}
        >
          Update
        </LoadingButton>
      </DialogActions>
    </Dialog>
  )
}
