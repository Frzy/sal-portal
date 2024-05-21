import { useMemo, useState } from 'react'

import NumberInput, { type HTMLNumericElement } from '@c/NumberInput'
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
} from '@mui/material'
import Grid from '@mui/material/Unstable_Grid2/Grid2'

import { editKitchenCost } from '@/util/requests'

export interface EditKitchenCostDialogProps extends Omit<DialogProps, 'onClose'> {
  item: Kitchen.Cost.Item
  onEdited?: (item: Kitchen.Cost.Item) => void
  onClose?: () => void
}
export default function EditKitchenCostDialog({
  item: initItem,
  onEdited,
  onClose,
  ...other
}: EditKitchenCostDialogProps): React.JSX.Element {
  const [loading, setLoading] = useState(false)
  const [item, setItem] = useState<Kitchen.Cost.Payload>({
    amount: initItem.amount,
  })
  const isFormInvalid = useMemo(() => {
    return item.amount <= 0
  }, [item])

  function handleNumberChange(event: React.ChangeEvent<HTMLNumericElement>): void {
    const { value, name } = event.target

    setItem((prev) => ({ ...prev, [name!]: typeof value === 'number' ? value : 0 }))
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
        detail: { message: `Successfully updated.`, severity: 'success' },
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
            <NumberInput
              label='Amount'
              name='amount'
              value={item.amount}
              onChange={handleNumberChange}
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
