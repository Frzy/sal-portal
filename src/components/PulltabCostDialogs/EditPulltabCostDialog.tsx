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

import { editPullTabCost } from '@/util/requests'

export interface EditPulltabCostDialogProps extends Omit<DialogProps, 'onClose'> {
  item: PullTab.Cost.Item
  onEdited?: (item: PullTab.Cost.Item) => void
  onClose?: () => void
}
export default function EditPulltabCostDialog({
  item: initItem,
  onEdited,
  onClose,
  ...other
}: EditPulltabCostDialogProps): React.JSX.Element {
  const [loading, setLoading] = useState(false)
  const [item, setItem] = useState<PullTab.Cost.Payload>({
    boxPrice: initItem.boxPrice,
    tabPrice: initItem.tabPrice,
  })
  const isFormInvalid = useMemo(() => {
    return item.boxPrice <= 0
  }, [item])

  function handleNumberChange(event: React.ChangeEvent<HTMLNumericElement>): void {
    const { value, name } = event.target

    setItem((prev) => ({ ...prev, [name!]: typeof value === 'number' ? value : 0 }))
  }

  async function handleEditItem(): Promise<void> {
    setLoading(true)
    const editedItem = await editPullTabCost(initItem.id, item)

    if (!editedItem) {
      const event = new CustomEvent<INotification>('notify', {
        detail: { message: `Failed to edit cost item: ${initItem.name}`, severity: 'error' },
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
          <Grid xs={12} md={6}>
            <NumberInput
              value={item?.boxPrice ?? 0}
              disabled={loading}
              label='Box Price'
              name='boxPrice'
              onChange={handleNumberChange}
              sx={{ '& .MuiInputBase-input': { fontSize: 32 } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <MoneyIcon sx={{ fontSize: 32 }} />
                  </InputAdornment>
                ),
              }}
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
