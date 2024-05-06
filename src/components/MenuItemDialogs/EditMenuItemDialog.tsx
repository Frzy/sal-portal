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

import { editMenuItem } from '@/util/requests'

export interface EditMenuItemDialogProps extends Omit<DialogProps, 'onClose'> {
  menuItem: Kitchen.MenuItem
  onEdited?: (menuItem: Kitchen.MenuItem) => void
  onClose?: () => void
}
export default function EditMenuItemDialog({
  menuItem: initItem,
  onEdited,
  onClose,
  ...other
}: EditMenuItemDialogProps): React.JSX.Element {
  const [loading, setLoading] = useState(false)
  const [menuItem, setMenuItem] = useState<Kitchen.MenuItemPayload>({
    amount: initItem.amount,
    description: initItem.description,
    name: initItem.name,
  })
  const isFormInvalid = useMemo(() => {
    return !menuItem.name || !menuItem.amount
  }, [menuItem])

  function handleTextChange(event: React.ChangeEvent<HTMLInputElement>): void {
    const { value, name } = event.target

    if (name === 'amount') {
      setMenuItem((prev) => ({ ...prev, [name]: parseInt(value) }))
    } else {
      setMenuItem((prev) => ({ ...prev, [name]: value }))
    }
  }

  async function handleEditMenuItem(): Promise<void> {
    setLoading(true)
    const editedMenuItem = await editMenuItem(initItem.id, menuItem)

    if (!editedMenuItem) {
      const event = new CustomEvent<INotification>('notify', {
        detail: { message: `Failed to edit menu item: ${initItem.name}`, severity: 'error' },
      })

      window.dispatchEvent(event)
    } else if (onEdited) onEdited(editedMenuItem)

    setLoading(false)
    if (editedMenuItem && onClose) onClose()
  }

  return (
    <Dialog onClose={onClose} {...other}>
      <DialogTitle>Edit Menu Item</DialogTitle>
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
              label='Amount'
              name='amount'
              type='number'
              value={menuItem.amount || ''}
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
          onClick={handleEditMenuItem}
        >
          Update
        </LoadingButton>
      </DialogActions>
    </Dialog>
  )
}
