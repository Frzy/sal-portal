import { type DialogProps } from '@mui/material'

import { DIALOG_TYPES } from '@/util/constants'

import DeletePulltabCostsDialog from './PulltabCostDialogs/DeletePulltabCostDialog'
import EditPulltabCostDialog from './PulltabCostDialogs/EditPulltabCostDialog'

interface PulltabCostDialogProps extends DialogProps {
  type: DIALOG_TYPES
  items?: PullTab.Cost.Item[]
  onCreated?: (item: PullTab.Cost.Item) => void
  onDeleted?: (items: PullTab.Cost.Item[]) => void
  onEdited?: (item: PullTab.Cost.Item) => void
  onClose?: () => void
}
export function PulltabCostDialog({
  type,
  items = [],
  onCreated,
  onDeleted,
  onEdited,
  ...other
}: PulltabCostDialogProps): React.JSX.Element | null {
  if (items.length && type === DIALOG_TYPES.DELETE)
    return <DeletePulltabCostsDialog items={items} onDeleted={onDeleted} {...other} />
  if (items.length && type === DIALOG_TYPES.EDIT)
    return <EditPulltabCostDialog item={items[0]} onEdited={onEdited} {...other} />

  return null
}
