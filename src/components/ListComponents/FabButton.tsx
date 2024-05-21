import { useMemo, useState } from 'react'

import EditRowIcon from '@mui/icons-material/EditNote'
import AddRowIcon from '@mui/icons-material/PlaylistAdd'
import DeleteRowIcon from '@mui/icons-material/PlaylistRemove'
import {
  Box,
  type FabProps,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Typography,
} from '@mui/material'

interface FabListButtonProps {
  itemsSelected?: number
  onCreate?: () => void
  onDelete?: () => void
  onEdit?: () => void
}
export default function FabListButton({
  itemsSelected = 0,
  onCreate,
  onDelete,
  onEdit,
}: FabListButtonProps): React.ReactNode {
  const [open, setOpen] = useState(false)
  const { hidden, variant } = useMemo<{ hidden: boolean; variant: FabProps['variant'] }>(() => {
    if (!onCreate && !onDelete && !onEdit) return { hidden: true, variant: 'circular' }

    // Only show when items selected
    if (itemsSelected === 0)
      return { hidden: !onCreate, variant: onCreate ? 'extended' : 'circular' }

    if (itemsSelected === 1)
      return { hidden: !onEdit && !onDelete, variant: onEdit && onDelete ? 'circular' : 'extended' }

    if (itemsSelected > 1) return { hidden: !onDelete, variant: onDelete ? 'extended' : 'circular' }

    return { hidden: true, variant: 'circular' }
  }, [itemsSelected, onCreate, onEdit, onDelete])
  const fabIcon = useMemo(() => {
    if (!onCreate && !onDelete && !onEdit) return <SpeedDialIcon />

    if (onCreate && itemsSelected === 0) {
      return (
        <Box sx={{ display: 'flex' }}>
          <AddRowIcon sx={{ mr: 1 }} />
          <Typography>Create</Typography>
        </Box>
      )
    }
    if (onEdit && !onDelete && itemsSelected === 1) {
      return (
        <Box sx={{ display: 'flex' }}>
          <EditRowIcon sx={{ mr: 1 }} />
          <Typography>Edit</Typography>
        </Box>
      )
    }
    if (onDelete && ((!onEdit && itemsSelected > 0) || (onEdit && itemsSelected > 1))) {
      return (
        <Box sx={{ display: 'flex' }}>
          <DeleteRowIcon sx={{ mr: 1 }} />
          <Typography>Delete</Typography>
        </Box>
      )
    }

    return <SpeedDialIcon />
  }, [itemsSelected, onCreate, onEdit, onDelete])

  function handleClose(): void {
    setOpen(false)
  }

  return (
    <SpeedDial
      ariaLabel='list tools'
      sx={{
        position: 'fixed',
        bottom: 8,
        right: { xs: 16, sm: 24 },
        '& .MuiSpeedDialAction-staticTooltipLabel': { whiteSpace: 'nowrap' },
      }}
      icon={fabIcon}
      onClose={handleClose}
      hidden={hidden}
      onOpen={(event, reason) => {
        if (reason !== 'toggle') return

        if (onCreate && itemsSelected === 0) onCreate()
        else if (onEdit && !onDelete && itemsSelected === 1) onEdit()
        else if (onDelete && ((!onEdit && itemsSelected > 0) || (onEdit && itemsSelected > 1))) {
          onDelete()
        }

        setOpen(true)
      }}
      FabProps={{ variant }}
      open={open}
    >
      {onEdit && itemsSelected === 1 && (
        <SpeedDialAction icon={<EditRowIcon />} tooltipTitle='Edit' tooltipOpen onClick={onEdit} />
      )}
      {onDelete && itemsSelected > 0 && (
        <SpeedDialAction
          icon={<DeleteRowIcon />}
          tooltipTitle='Delete'
          tooltipOpen
          onClick={onDelete}
        />
      )}
    </SpeedDial>
  )
}
