import { useMemo } from 'react'

import { type DialogProps } from '@mui/material'

import { DIALOG_TYPES } from '@/util/constants'

import DeleteQohEntryDialog from './QoHEntryDialogs/DeleteEntryDialog'
import EditQohEntryDialog from './QoHEntryDialogs/EditEntryDialog'

interface QohEntryDialogProps extends DialogProps {
  type: DIALOG_TYPES
  qohGame: QoH.Game.Item
  items?: QoH.Entry.GameItem[]
  onCreated?: (item: QoH.Entry.Item) => void
  onDeleted?: (items: QoH.Entry.Item[]) => void
  onEdited?: (item: QoH.Entry.Item) => void
  onClose?: () => void
}
export function QohEntryDialog({
  type,
  qohGame,
  items = [],
  onCreated,
  onDeleted,
  onEdited,
  ...other
}: QohEntryDialogProps): React.JSX.Element | null {
  const item = items[0]
  const disabledCards = useMemo(() => {
    if (!item) return []

    return qohGame.entries
      .filter((entry) => {
        return entry.shuffle === item.shuffle && !!entry.cardDrawn
      })
      .map((entry) => entry.cardDrawn!.id)
  }, [qohGame, item])

  // if (type === DIALOG_TYPES.CREATE)
  //   return <CreateQohEntryDialog onCreated={onCreated} {...other} />
  if (items.length && type === DIALOG_TYPES.DELETE)
    return <DeleteQohEntryDialog items={items} onDeleted={onDeleted} {...other} />
  if (items.length && type === DIALOG_TYPES.EDIT)
    return (
      <EditQohEntryDialog
        game={qohGame}
        item={items[0]}
        onEdited={onEdited}
        disabledCards={disabledCards}
        {...other}
      />
    )

  return null
}
