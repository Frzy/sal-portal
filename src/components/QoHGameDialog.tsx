import { type DialogProps } from '@mui/material'

import { DIALOG_TYPES } from '@/util/constants'

import DeleteQohGameDialog from './QoHGameDialogs/DeleteGameDialog'
import EditQohGameDialog from './QoHGameDialogs/EditGameDialog'

interface QohGameDialogProps extends DialogProps {
  type: DIALOG_TYPES
  items?: QoH.Game.Item[]
  onDeleted?: (items: QoH.Game.Item[]) => void
  onEdited?: (item: QoH.Game.Item) => void
  onClose?: () => void
}
export function QohGameDialog({
  type,
  items = [],
  onDeleted,
  onEdited,
  ...other
}: QohGameDialogProps): React.JSX.Element | null {
  if (items.length && type === DIALOG_TYPES.DELETE)
    return <DeleteQohGameDialog items={items} onDeleted={onDeleted} {...other} />
  if (items.length && type === DIALOG_TYPES.EDIT)
    return <EditQohGameDialog item={items[0]} onEdited={onEdited} {...other} />

  return null
}
