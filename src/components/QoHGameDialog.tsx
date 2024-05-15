import { type DialogProps } from '@mui/material'

import { DIALOG_TYPES } from '@/util/constants'

import DeleteQohGameDialog from './QoHGameDialogs/DeleteGameDialog'
import EditQohGameDialog from './QoHGameDialogs/EditGameDialog'

interface QohDialogProps extends DialogProps {
  type: DIALOG_TYPES
  item?: QoH.Game.Item
  items?: QoH.Game.Item[]
  onCreated?: (item: QoH.Game.Item) => void
  onDeleted?: (items: QoH.Game.Item[]) => void
  onEdited?: (item: QoH.Game.Item) => void
  onClose?: () => void
}
export function QohDialog({
  type,
  item,
  items = [],
  onCreated,
  onDeleted,
  onEdited,
  ...other
}: QohDialogProps): React.JSX.Element | null {
  if (items.length && type === DIALOG_TYPES.DELETE)
    return <DeleteQohGameDialog items={items} onDeleted={onDeleted} {...other} />
  if (item && type === DIALOG_TYPES.EDIT)
    return <EditQohGameDialog item={item} onEdited={onEdited} {...other} />

  return null
}
