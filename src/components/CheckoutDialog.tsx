import { type DialogProps } from '@mui/material'

import { DIALOG_TYPES } from '@/util/constants'

import DeleteCheckoutDialog from './CheckoutDialogs/DeleteCheckoutDialog'
import EditCheckoutDialog from './CheckoutDialogs/EditCheckoutDialog'

interface CheckoutDialogProps extends DialogProps {
  type: DIALOG_TYPES
  items: Kitchen.Checkout.Item[]
  onDeleted?: (items: Kitchen.Checkout.Item[]) => void
  onEdited?: (item: Kitchen.Checkout.Item) => void
  onClose?: () => void
}
export function CheckoutDialog({
  type,
  items = [],
  onDeleted,
  onEdited,
  ...other
}: CheckoutDialogProps): React.JSX.Element | null {
  if (type === DIALOG_TYPES.DELETE)
    return <DeleteCheckoutDialog items={items} onDeleted={onDeleted} {...other} />
  if (type === DIALOG_TYPES.EDIT)
    return <EditCheckoutDialog item={items[0]} onEdited={onEdited} {...other} />

  return null
}
