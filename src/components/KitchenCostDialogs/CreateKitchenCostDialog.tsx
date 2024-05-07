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

import { createKitchenCost } from '@/util/requests'

export interface CreateKitchenCostDialogProps extends Omit<DialogProps, 'onClose'> {
  onCreated?: (newItem: Kitchen.CostItem) => void
  onClose?: () => void
}
export default function CreateKitchenCostDialog({
  onCreated,
  onClose,
  ...other
}: CreateKitchenCostDialogProps): React.JSX.Element {
  const [loading, setLoading] = useState(false)
  const [item, setItem] = useState<Kitchen.CostItemPayload>({
    amount: 0,
  })
  const isFormInvalid = useMemo(() => {
    return item.amount <= 0
  }, [item])

  function handleTextChange(event: React.ChangeEvent<HTMLInputElement>): void {
    const { value, name } = event.target

    setItem((prev) => ({ ...prev, [name]: value }))
  }

  async function handleCreateKitchenCost(): Promise<void> {
    setLoading(true)
    const createdItem = await createKitchenCost(item)

    if (!createdItem) {
      const event = new CustomEvent<INotification>('notify', {
        detail: { message: `Failed to create the cost item.`, severity: 'error' },
      })

      dispatchEvent(event)
    } else {
      const event = new CustomEvent<INotification>('notify', {
        detail: { message: `Successfully created cost item.`, severity: 'success' },
      })

      dispatchEvent(event)

      if (onCreated) onCreated(createdItem)
    }

    setLoading(false)
    if (createdItem && onClose) onClose()
  }

  return (
    <Dialog onClose={onClose} {...other}>
      <DialogTitle>Create Cost Item</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid xs={12}>
            <TextField
              label='Amount'
              name='amount'
              type='number'
              value={item.amount || ''}
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <MoneyIcon />
                  </InputAdornment>
                ),
              }}
              onChange={handleTextChange}
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
          onClick={handleCreateKitchenCost}
        >
          Create
        </LoadingButton>
      </DialogActions>
    </Dialog>
  )
}
