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

import { createKitchenMenuItem } from '@/util/requests'

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
  const [menuItem, setMenuItem] = useState<Kitchen.Menu.Payload>({
    price: 0,
    description: '',
    includesDrinkChip: false,
    name: '',
  })
  const isFormInvalid = useMemo(() => {
    return !menuItem.name && menuItem.price > 0
  }, [menuItem])

  function handleTextChange(event: React.ChangeEvent<HTMLInputElement>): void {
    const { value, name } = event.target

    setMenuItem((prev) => ({ ...prev, [name]: value }))
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
    if (createdMenuItem && onClose) onClose()
  }

  return (
    <Dialog onClose={onClose} {...other}>
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
          <Grid xs={12}>
            <TextField
              label='Price'
              name='price'
              type='number'
              value={menuItem.price || ''}
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
        <Button onClick={onClose} color='inherit'>
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
