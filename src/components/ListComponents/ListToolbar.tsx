import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import FilterListIcon from '@mui/icons-material/FilterList'
import { Button, IconButton, Toolbar, Tooltip, Typography, alpha } from '@mui/material'

interface ListToolbarProps {
  hasFilter?: boolean
  numSelected: number
  onDeleteClick?: () => void
  onEditClick?: () => void
  onFilterClick?: () => void
  onCreateClick?: () => void
  showCreateButton?: boolean
  showFilterButton?: boolean
  title: string
}

export default function ListToolbar({
  hasFilter,
  numSelected,
  onCreateClick,
  onDeleteClick,
  onEditClick,
  onFilterClick,
  showCreateButton,
  showFilterButton,
  title,
}: ListToolbarProps): React.JSX.Element {
  return (
    <Toolbar
      sx={{
        pl: { sm: 2 },
        pr: { xs: 1, sm: 1 },
        ...(numSelected > 0 && {
          backgroundColor: (theme) =>
            alpha(
              `rgb(${theme.vars.palette.primary.mainChannel})`,
              theme.vars.palette.action.activatedOpacity,
            ),
        }),
      }}
    >
      {numSelected > 0 ? (
        <Typography sx={{ flex: '1 1 100%' }} color='inherit' variant='subtitle1' component='div'>
          {numSelected} selected
        </Typography>
      ) : (
        <Typography sx={{ flex: '1 1 100%' }} variant='h6' id='tableTitle' component='div'>
          {title}
        </Typography>
      )}
      {numSelected === 1 && (
        <Tooltip title='Edit'>
          <IconButton onClick={onEditClick}>
            <EditIcon />
          </IconButton>
        </Tooltip>
      )}
      {numSelected > 0 && (
        <Tooltip title='Delete'>
          <IconButton onClick={onDeleteClick}>
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      )}
      {!numSelected && showCreateButton && (
        <Tooltip title='Add Item'>
          <Button color='secondary' onClick={onCreateClick}>
            Add
          </Button>
        </Tooltip>
      )}
      {!numSelected && showFilterButton && (
        <Tooltip title='Filter List'>
          <IconButton onClick={onFilterClick}>
            <FilterListIcon color={hasFilter ? 'secondary' : 'inherit'} />
          </IconButton>
        </Tooltip>
      )}
    </Toolbar>
  )
}
