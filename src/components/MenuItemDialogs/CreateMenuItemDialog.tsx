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
  FormControlLabel,
  InputAdornment,
  Switch,
  TextField,
} from '@mui/material'
import Grid from '@mui/material/Unstable_Grid2/Grid2'

import { createKitchenMenuItem } from '@/util/requests'

const BASE = {
  price: 0,
  description: '',
  hasDrinkChip: false,
  name: '',
}

export interface CreateMenuItemDialogProps extends Omit<DialogProps, 'onClose'> {
  onCreated?: (newMenuItem: Kitchen.Menu.Item) => void
  onClose?: () => void
}
export default function CreateMenuItemDialog({
  onCreated,
  onClose,
  ...other
}: CreateMenuItemDialogProps): React.JSX.Element {
  const [loading, setLoading] = useState(false)
  const [menuItem, setMenuItem] = useState<Kitchen.Menu.Payload>(BASE)
  const isFormInvalid = useMemo(() => {
    return !menuItem.name && menuItem.price > 0
  }, [menuItem])

  function handleTextChange(event: React.ChangeEvent<HTMLInputElement>): void {
    const { value, name } = event.target

    setMenuItem((prev) => ({ ...prev, [name]: value }))
  }
  function handleNumberChange(event: React.ChangeEvent<HTMLNumericElement>): void {
    const { value, name } = event.target

    setMenuItem((prev) => ({ ...prev, [name!]: typeof value === 'number' ? value : 0 }))
  }
  function handleSwitchChange(event: React.ChangeEvent<HTMLInputElement>): void {
    setMenuItem((prev) => ({ ...prev, hasDrinkChip: event.target.checked }))
  }
  function handleClose(): void {
    if (onClose) {
      setMenuItem(BASE)
      onClose()
    }
  }

  async function handleCreateMenuItem(): Promise<void> {
    setLoading(true)
    const createdMenuItem = await createKitchenMenuItem(menuItem)

    if (!createdMenuItem) {
      const event = new CustomEvent<INotification>('notify', {
        detail: { message: `Failed to create the menu item: ${menuItem.name}.`, severity: 'error' },
      })

      dispatchEvent(event)
    } else if (onCreated) onCreated(createdMenuItem)

    setLoading(false)
    if (createdMenuItem) handleClose()
  }

  return (
    <Dialog onClose={handleClose} {...other}>
      <DialogTitle>Create Menu Item</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid xs={12}>
            <TextField
              label='Name'
              placeholder='Enter Name'
              name='name'
              value={menuItem.name}
              onChange={handleTextChange}
              required
              fullWidth
            />
          </Grid>
          <Grid xs={12} sm={6} md={7}>
            <NumberInput
              label='Price'
              name='price'
              type='number'
              value={menuItem.price}
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <MoneyIcon />
                  </InputAdornment>
                ),
              }}
              onChange={handleNumberChange}
              required
              fullWidth
            />
          </Grid>
          <Grid xs={12} sm={6} md={5} sx={{ display: 'flex', alignItems: 'center' }}>
            <FormControlLabel
              control={<Switch value={menuItem.hasDrinkChip} onChange={handleSwitchChange} />}
              label='Includes Drink Chip'
            />
          </Grid>
          <Grid xs={12}>
            <TextField
              label='Description'
              name='description'
              value={menuItem.description}
              onChange={handleTextChange}
              placeholder='Enter Description'
              minRows={2}
              maxRows={5}
              multiline
              fullWidth
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color='inherit'>
          Cancel
        </Button>
        <LoadingButton
          color='secondary'
          loading={loading}
          disabled={isFormInvalid}
          onClick={handleCreateMenuItem}
        >
          Create
        </LoadingButton>
      </DialogActions>
    </Dialog>
  )
}
