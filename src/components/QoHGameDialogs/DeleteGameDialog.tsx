import { type DialogProps } from '@mui/material'

interface DeleteQohGameDialogProps extends Omit<DialogProps, 'onClose'> {
  items?: QoH.Game.Item[]
  onClose?: () => void
  onDeleted?: (items: QoH.Game.Item[]) => void
}
export default function DeleteQohGameDialog({
  items = [],
  onClose,
  onDeleted,
  ...other
}: DeleteQohGameDialogProps): React.JSX.Element {
  return <h2>Under Construction</h2>
}
