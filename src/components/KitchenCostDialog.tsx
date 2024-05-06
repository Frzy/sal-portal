import { type DialogProps } from '@mui/material'

import { DIALOG_TYPES } from '@/util/constants'

import CreateKitchenCostDialog from './KitchenCostDialogs/CreateKitchenCostDialog'
import DeleteKitchenCostsDialog from './KitchenCostDialogs/DeleteKitchenCostDialog'
import EditKitchenCostDialog from './KitchenCostDialogs/EditKitchenCostDialog'

interface KitchenCostDialogProps extends DialogProps {
  type: DIALOG_TYPES
  item?: Kitchen.CostItem
  items?: Kitchen.CostItem[]
  onCreated?: (item: Kitchen.CostItem) => void
  onDeleted?: (items: Kitchen.CostItem[]) => void
  onEdited?: (item: Kitchen.CostItem) => void
  onClose?: () => void
}
export function KitchenCostDialog({
  type,
  item,
  items = [],
  onCreated,
  onDeleted,
  onEdited,
  ...other
}: KitchenCostDialogProps): React.JSX.Element | null {
  if (type === DIALOG_TYPES.CREATE)
    return <CreateKitchenCostDialog onCreated={onCreated} {...other} />
  if (items.length && type === DIALOG_TYPES.DELETE)
    return <DeleteKitchenCostsDialog items={items} onDeleted={onDeleted} {...other} />
  if (item && type === DIALOG_TYPES.EDIT)
    return <EditKitchenCostDialog item={item} onEdited={onEdited} {...other} />

  return null
}
