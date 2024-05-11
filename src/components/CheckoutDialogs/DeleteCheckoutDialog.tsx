import { useMemo, useState } from 'react'

import CostIcon from '@mui/icons-material/AttachMoney'
import OrderIcon from '@mui/icons-material/Fastfood'
import CheckoutIcon from '@mui/icons-material/Receipt'
import { LoadingButton } from '@mui/lab'
import {
  Alert,
  Avatar,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  type DialogProps,
  DialogTitle,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
} from '@mui/material'

import { deleteKitchenCheckouts } from '@/util/requests'

interface DeleteCheckoutDialogProps extends Omit<DialogProps, 'onClose'> {
  items?: Kitchen.Checkout.Item[]
  onClose?: () => void
  onDeleted?: (items: Kitchen.Checkout.Item[]) => void
}
export default function DeleteCheckoutDialog({
  items = [],
  onClose,
  onDeleted,
  ...other
}: DeleteCheckoutDialogProps): React.JSX.Element {
  const [loading, setLoading] = useState(false)
  const checkoutLabel = `Checkout${items.length > 1 ? 's' : ''}`
  const counts = useMemo(() => {
    return items.reduce(
      (totals, item) => {
        return {
          orders: totals.orders + item.orders.length,
          costs: totals.costs + (!!item.drinkChips || !!item.expenses ? 1 : 0),
        }
      },
      {
        orders: 0,
        costs: 0,
      },
    )
  }, [items])

  async function handleDeleteMenuItem(): Promise<void> {
    setLoading(true)
    const deletedItems = await deleteKitchenCheckouts(items)

    if (!deletedItems) {
      const event = new CustomEvent<INotification>('notify', {
        detail: { message: `Failed to delete ${checkoutLabel}.`, severity: 'error' },
      })

      dispatchEvent(event)
    } else {
      const event = new CustomEvent<INotification>('notify', {
        detail: { message: `Successfully deleted ${checkoutLabel}`, severity: 'success' },
      })

      dispatchEvent(event)

      if (onDeleted) onDeleted(items)
    }

    setLoading(false)

    if (deletedItems && onClose) onClose()
  }

  function handleClose(): void {
    if (!loading && onClose) onClose()
  }

  return (
    <Dialog onClose={handleClose} {...other}>
      <DialogTitle sx={{ textTransform: 'capitalize' }}>Delete {checkoutLabel}</DialogTitle>
      <DialogContent dividers>
        <Typography>Are you sure you want to continue, this will delete the following:</Typography>

        <List>
          <ListItem>
            <ListItemAvatar>
              <Avatar>
                <CheckoutIcon />
              </Avatar>
            </ListItemAvatar>
            <ListItemText primary={`${items.length} ${checkoutLabel}`} />
          </ListItem>
          {counts.orders > 0 && (
            <ListItem>
              <ListItemAvatar>
                <Avatar>
                  <OrderIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={`${counts.orders} order ${counts.orders > 1 ? 'items' : 'item'}`}
              />
            </ListItem>
          )}
          {counts.costs > 0 && (
            <ListItem>
              <ListItemAvatar>
                <Avatar>
                  <CostIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={`${counts.costs} ${counts.costs > 1 ? 'cost items' : 'cost item'}`}
              />
            </ListItem>
          )}
        </List>
        <Alert severity='error'>This action is permanent and can not be undone.</Alert>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading} color='inherit'>
          Cancel
        </Button>
        <LoadingButton color='error' loading={loading} onClick={handleDeleteMenuItem}>
          Delete
        </LoadingButton>
      </DialogActions>
    </Dialog>
  )
}
