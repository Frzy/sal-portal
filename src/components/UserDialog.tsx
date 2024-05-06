import { type DialogProps } from '@mui/material'

import { DIALOG_TYPES } from '@/util/constants'

import CreateUserDialog from './UserDialogs/CreateUserDialog'
import DeleteUserDialog from './UserDialogs/DeleteUserDialog'
import EditUserDialog from './UserDialogs/EditUserDialog'

interface UserDialogProps extends DialogProps {
  type: DIALOG_TYPES
  user?: User.Base
  isAdmin?: boolean
  onCreated?: (user: User.Base) => void
  onDeleted?: (user: User.Base) => void
  onEdited?: (user: User.Base) => void
  onClose?: () => void
}

export default function UserDialog({
  type,
  user,
  onCreated,
  onDeleted,
  onEdited,
  ...other
}: UserDialogProps): React.JSX.Element | null {
  if (type === DIALOG_TYPES.CREATE) return <CreateUserDialog onCreated={onCreated} {...other} />
  if (user && type === DIALOG_TYPES.DELETE)
    return <DeleteUserDialog user={user} onDeleted={onDeleted} {...other} />
  if (user && type === DIALOG_TYPES.EDIT)
    return <EditUserDialog user={user} onEdited={onEdited} {...other} />

  return null
}
