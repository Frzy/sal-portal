import { type DialogProps } from '@mui/material'

import { DIALOG_TYPES } from '@/util/constants'

import CreateMenuItemDialog from './MenuItemDialogs/CreateMenuItemDialog'
import DeleteMenuItemDialog from './MenuItemDialogs/DeleteMenuItemDialog'
import EditMenuItemDialog from './MenuItemDialogs/EditMenuItemDialog'

interface MenuItemDialogProps extends DialogProps {
  type: DIALOG_TYPES
  menuItem?: Kitchen.MenuItem
  onCreated?: (menuItem: Kitchen.MenuItem) => void
  onDeleted?: (menuItem: Kitchen.MenuItem) => void
  onEdited?: (menuItem: Kitchen.MenuItem) => void
  onClose?: () => void
}
export function MenuItemDialog({
  type,
  menuItem,
  onCreated,
  onDeleted,
  onEdited,
  ...other
}: MenuItemDialogProps): React.JSX.Element | null {
  if (type === DIALOG_TYPES.CREATE) return <CreateMenuItemDialog onCreated={onCreated} {...other} />
  if (menuItem && type === DIALOG_TYPES.DELETE)
    return <DeleteMenuItemDialog menuItem={menuItem} onDeleted={onDeleted} {...other} />
  if (menuItem && type === DIALOG_TYPES.EDIT)
    return <EditMenuItemDialog menuItem={menuItem} onEdited={onEdited} {...other} />

  return null
}
