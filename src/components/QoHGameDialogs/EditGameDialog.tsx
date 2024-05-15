import { type DialogProps } from '@mui/material'

export interface EditQohGameDialogProps extends Omit<DialogProps, 'onClose'> {
  item: QoH.Game.Item
  onEdited?: (item: QoH.Game.Item) => void
  onClose?: () => void
}
export default function EditQohGameDialog({
  item: initItem,
  onEdited,
  onClose,
  ...other
}: EditQohGameDialogProps): React.JSX.Element {
  return <h2>Under Construction</h2>
}
