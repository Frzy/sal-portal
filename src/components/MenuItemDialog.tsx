import { type DialogProps } from '@mui/material'

import { DIALOG_TYPES } from '@/util/constants'

import CreateMenuItemDialog from './MenuItemDialogs/CreateMenuItemDialog'
import DeleteMenuItemDialog from './MenuItemDialogs/DeleteMenuItemDialog'
import EditMenuItemDialog from './MenuItemDialogs/EditMenuItemDialog'

interface MenuItemDialogProps extends DialogProps {
  type: DIALOG_TYPES
  item?: Kitchen.MenuItem
  items?: Kitchen.MenuItem[]
  onCreated?: (item: Kitchen.MenuItem) => void
  onDeleted?: (items: Kitchen.MenuItem[]) => void
  onEdited?: (item: Kitchen.MenuItem) => void
  onClose?: () => void
}
export function MenuItemDialog({
  type,
  item,
  items,
  onCreated,
  onDeleted,
  onEdited,
  ...other
}: MenuItemDialogProps): React.JSX.Element | null {
  if (type === DIALOG_TYPES.CREATE) return <CreateMenuItemDialog onCreated={onCreated} {...other} />
  if (item && type === DIALOG_TYPES.DELETE)
    return <DeleteMenuItemDialog items={items} onDeleted={onDeleted} {...other} />
  if (item && type === DIALOG_TYPES.EDIT)
    return <EditMenuItemDialog menuItem={item} onEdited={onEdited} {...other} />

  return null
}
