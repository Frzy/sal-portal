import { useState } from 'react'

import NumberInput, { type HTMLNumericElement } from '@c/NumberInput'
import MoneyIcon from '@mui/icons-material/AttachMoney'
import ResetIcon from '@mui/icons-material/RestartAlt'
import { LoadingButton } from '@mui/lab'
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  type DialogProps,
  DialogTitle,
  IconButton,
  InputAdornment,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material'
import Grid from '@mui/material/Unstable_Grid2/Grid2'

import { formatCurrency } from '@/util/functions'
import { editKitchenCheckout } from '@/util/requests'

export interface EditCheckoutDialogProps extends Omit<DialogProps, 'onClose'> {
  item: Kitchen.Checkout.Item
  onEdited?: (item: Kitchen.Checkout.Item) => void
  onClose?: () => void
}
export default function EditCheckoutDialog({
  item: initItem,
  onEdited,
  onClose,
  ...other
}: EditCheckoutDialogProps): React.JSX.Element {
  const [loading, setLoading] = useState(false)
  const [item, setItem] = useState<Kitchen.Checkout.UiEditPayload>({
    creditCardSales: initItem.creditCardSales,
    deposit: initItem.deposit,
    drinkChips: initItem.drinkChips,
    sales: initItem.sales,
    expenses: initItem.expenses,
    orders: [...initItem.orders],
  })

  function updateItem(partialItem: Partial<Kitchen.Checkout.UiEditPayload>): void {
    const newItem = { ...item, ...partialItem }
    const deposit = newItem.sales - newItem.drinkChips - newItem.expenses
    setItem({ ...newItem, deposit })
  }

  function handleNumberChange(event: React.ChangeEvent<HTMLNumericElement>): void {
    const { value, name } = event.target

    updateItem({ [name!]: typeof value === 'number' ? value : 0 })
  }
  async function handleEditItem(): Promise<void> {
    setLoading(true)
    const editedItem = await editKitchenCheckout(initItem.id, item)

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

  function handleClose(): void {
    if (!loading && onClose) onClose()
  }

  return (
    <Dialog onClose={handleClose} {...other}>
      <DialogTitle>Edit Checkout</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={1}>
          <Typography>Please use the inputs below to update a kitchen service checkout.</Typography>
          <Alert severity='info'>
            Editing the orders of a checkout is not supported. A work is to delete this checkout and
            re-create another one with the right order information.
          </Alert>
          <Alert severity='warning'>
            Updating checkouts has the possibility to create/update kitchen costs.
          </Alert>
          <Grid container spacing={2}>
            <Grid xs={12}>
              <NumberInput
                label='Sales'
                name='sales'
                value={item.sales}
                onChange={handleNumberChange}
                helperText={
                  item.sales !== initItem.calculated.sales
                    ? `Calculated sales are ${formatCurrency(initItem.calculated.sales)}`
                    : undefined
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <MoneyIcon />
                    </InputAdornment>
                  ),
                  endAdornment:
                    item.sales !== initItem.sales ? (
                      <InputAdornment position='end'>
                        <Tooltip
                          title={`Reset to original value of ${formatCurrency(initItem.sales)}`}
                        >
                          <IconButton
                            onClick={() => {
                              updateItem({ sales: initItem.sales })
                            }}
                          >
                            <ResetIcon />
                          </IconButton>
                        </Tooltip>
                      </InputAdornment>
                    ) : undefined,
                }}
                fullWidth
              />
            </Grid>
            <Grid xs={12}>
              <NumberInput
                label='Credit Card Sales'
                name='creditCardSales'
                value={item.creditCardSales}
                onChange={handleNumberChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <MoneyIcon />
                    </InputAdornment>
                  ),
                  endAdornment:
                    item.creditCardSales !== initItem.creditCardSales ? (
                      <InputAdornment position='end'>
                        <Tooltip
                          title={`Reset to original value of ${formatCurrency(initItem.creditCardSales)}`}
                        >
                          <IconButton
                            onClick={() => {
                              updateItem({ creditCardSales: initItem.creditCardSales })
                            }}
                          >
                            <ResetIcon />
                          </IconButton>
                        </Tooltip>
                      </InputAdornment>
                    ) : undefined,
                }}
                fullWidth
              />
            </Grid>
            <Grid xs={12}>
              <NumberInput
                label='Additional Expenses'
                name='expenses'
                value={item.expenses}
                onChange={handleNumberChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <MoneyIcon />
                    </InputAdornment>
                  ),
                  endAdornment:
                    item.expenses !== initItem.expenses ? (
                      <InputAdornment position='end'>
                        <Tooltip
                          title={`Reset to original value of ${formatCurrency(initItem.expenses)}`}
                        >
                          <IconButton
                            onClick={() => {
                              updateItem({ expenses: initItem.expenses })
                            }}
                          >
                            <ResetIcon />
                          </IconButton>
                        </Tooltip>
                      </InputAdornment>
                    ) : undefined,
                }}
                fullWidth
              />
            </Grid>
            <Grid xs={12}>
              <NumberInput
                label='Drink Chips'
                name='drinkChips'
                value={item.drinkChips}
                onChange={handleNumberChange}
                precision={0}
                helperText={
                  item.drinkChips !== initItem.calculated.drinkChips
                    ? `Calculated drink chips are ${initItem.calculated.drinkChips}`
                    : undefined
                }
                InputProps={{
                  endAdornment:
                    item.drinkChips !== initItem.drinkChips ? (
                      <InputAdornment position='end'>
                        <Tooltip title={`Reset to original value of ${initItem.drinkChips}`}>
                          <IconButton
                            onClick={() => {
                              updateItem({ drinkChips: initItem.drinkChips })
                            }}
                          >
                            <ResetIcon />
                          </IconButton>
                        </Tooltip>
                      </InputAdornment>
                    ) : undefined,
                }}
                fullWidth
              />
            </Grid>
            <Grid xs={6}>
              <Typography sx={{ fontSize: '2rem' }}>
                {initItem.deposit !== item.deposit ? 'New Deposit' : 'Deposit'}
              </Typography>
            </Grid>
            <Grid xs={6}>
              <Typography align='right' sx={{ fontFamily: 'monospace', fontSize: '2rem' }}>
                {formatCurrency(item.deposit)}
              </Typography>
            </Grid>
          </Grid>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading} color='inherit'>
          Cancel
        </Button>
        <LoadingButton color='secondary' loading={loading} onClick={handleEditItem}>
          Update
        </LoadingButton>
      </DialogActions>
    </Dialog>
  )
}
