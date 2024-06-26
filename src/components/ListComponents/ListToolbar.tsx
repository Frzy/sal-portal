import { useRef, useState } from 'react'

import AddIcon from '@mui/icons-material/Add'
import CloseIcon from '@mui/icons-material/Close'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import FilterListIcon from '@mui/icons-material/FilterList'
import SearchIcon from '@mui/icons-material/Search'
import {
  AppBar,
  Badge,
  Box,
  Button,
  Collapse,
  IconButton,
  InputAdornment,
  InputBase,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
  alpha,
  useMediaQuery,
  useTheme,
} from '@mui/material'

interface ListToolbarProps {
  createText?: string
  hasFilter?: boolean
  numSelected: number
  onDeleteClick?: () => void
  onEditClick?: () => void
  onFilterClick?: () => void
  onCreateClick?: () => void
  onSearchChange?: (term: string) => void
  hideSearch?: boolean
  hideCreateButton?: boolean
  hideFilterButton?: boolean
  title: string
}

export default function ListToolbar({
  hasFilter,
  numSelected,
  onCreateClick,
  onDeleteClick,
  onEditClick,
  onFilterClick,
  onSearchChange,
  hideSearch,
  hideCreateButton,
  hideFilterButton,
  createText = 'add',
  title,
}: ListToolbarProps): React.JSX.Element {
  const theme = useTheme()
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'))
  const fullRowSearch = useMediaQuery(theme.breakpoints.down('md'))
  const hasSelection = numSelected > 0
  const [expandSearch, setExpandSearch] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const searchRef = useRef<HTMLInputElement | null>(null)

  function handleToggleSearch(): void {
    setExpandSearch(!expandSearch)
  }
  function handleSearchTermChange(event: React.ChangeEvent<HTMLInputElement>): void {
    setSearchTerm(event.target.value)

    if (onSearchChange) onSearchChange(event.target.value)
  }

  return (
    <AppBar position='relative' component='div'>
      <Toolbar
        disableGutters
        sx={{
          columnGap: { xs: 0.25, sm: 1 },
          px: 0.5,
          ...(numSelected > 0
            ? {
                backgroundColor: (theme) =>
                  `rgba(${theme.vars.palette.primary.mainChannel} / 0.25)`,
              }
            : {
                backgroundColor: (theme) =>
                  `rgba(${theme.vars.palette.primary.mainChannel} / 0.50)`,
              }),
        }}
      >
        <Typography sx={{ flex: '1 1 100%', pl: 1 }} variant='h6' component='div'>
          {hasSelection ? `${numSelected} selected` : title}
        </Typography>
        {numSelected === 1 && !!onEditClick && (
          <Tooltip title='Edit'>
            <Button onClick={onEditClick} startIcon={<EditIcon />} color='secondary'>
              Edit
            </Button>
          </Tooltip>
        )}
        {hasSelection && !!onDeleteClick && (
          <Tooltip title='Delete'>
            <Button onClick={onDeleteClick} startIcon={<DeleteIcon />} color='secondary'>
              Delete
            </Button>
          </Tooltip>
        )}
        {!hasSelection && !hideSearch && !fullRowSearch && (
          <Box
            sx={{
              position: 'relative',
              borderRadius: 1,
              backgroundColor: alpha(theme.palette.common.white, 0.15),
              '&:hover': {
                backgroundColor: alpha(theme.palette.common.white, 0.25),
              },
              marginLeft: {
                xs: 0,
                md: theme.spacing(1),
              },
              width: {
                xs: '100%',
                md: 'auto',
              },
            }}
          >
            <Box
              sx={{
                padding: theme.spacing(0, 2),
                height: '100%',
                position: 'absolute',
                pointerEvents: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <SearchIcon />
            </Box>
            <InputBase
              ref={searchRef}
              sx={{
                color: 'inherit',
                '& .MuiInputBase-input': {
                  padding: theme.spacing(1, 1, 1, 0),
                  paddingLeft: `calc(1em + ${theme.spacing(4)})`,
                  transition: theme.transitions.create('width'),
                  width: '80px',
                  '&:focus': {
                    width: '150px',
                  },
                },
              }}
              endAdornment={
                <InputAdornment
                  position='start'
                  sx={{
                    transition: theme.transitions.create('opacity'),
                    opacity: searchTerm.length ? 1 : 0,
                  }}
                >
                  <IconButton
                    disabled={!searchTerm.length}
                    onClick={() => {
                      setSearchTerm('')
                      if (onSearchChange) onSearchChange('')
                      if (searchRef.current) searchRef.current.focus()
                    }}
                    size='small'
                  >
                    <CloseIcon sx={{ color: theme.vars.palette.text.secondary }} />
                  </IconButton>
                </InputAdornment>
              }
              placeholder='Search…'
              inputProps={{ 'aria-label': 'search' }}
              value={searchTerm}
              onChange={handleSearchTermChange}
            />
          </Box>
        )}
        {!hasSelection && !hideCreateButton && (
          <Tooltip title={`${createText} Item`}>
            {isSmall ? (
              <IconButton onClick={onCreateClick} size='small'>
                <AddIcon />
              </IconButton>
            ) : (
              <Button
                color='secondary'
                startIcon={<AddIcon />}
                onClick={onCreateClick}
                sx={{ whiteSpace: 'nowrap' }}
              >
                {createText}
              </Button>
            )}
          </Tooltip>
        )}
        {!hasSelection && !hideSearch && fullRowSearch && (
          <Tooltip title={expandSearch ? 'Hide Search' : 'Show Search'}>
            <IconButton size='small' onClick={handleToggleSearch}>
              <SearchIcon />
            </IconButton>
          </Tooltip>
        )}
        {!hasSelection && !hideFilterButton && (
          <Tooltip title='Filter List'>
            <Badge
              color='secondary'
              variant='dot'
              invisible={!hasFilter}
              sx={{
                '& .MuiBadge-badge': {
                  right: 10,
                  top: 25,
                  padding: '0 4px',
                },
              }}
            >
              <IconButton onClick={onFilterClick} size='small'>
                <FilterListIcon color='inherit' />
              </IconButton>
            </Badge>
          </Tooltip>
        )}
      </Toolbar>
      <Collapse in={fullRowSearch && expandSearch} unmountOnExit>
        <Box sx={{ px: 0.5, pb: 1 }}>
          <TextField
            label='Search'
            placeholder='Enter Search...'
            size='small'
            value={searchTerm}
            ref={searchRef}
            onChange={handleSearchTermChange}
            InputProps={{
              endAdornment: (
                <InputAdornment
                  position='end'
                  sx={{
                    transition: theme.transitions.create('opacity'),
                    opacity: searchTerm.length ? 1 : 0,
                  }}
                >
                  <IconButton
                    disabled={!searchTerm}
                    size='small'
                    onClick={() => {
                      setSearchTerm('')
                      if (onSearchChange) onSearchChange('')

                      if (searchRef.current) searchRef.current.focus()
                    }}
                  >
                    <CloseIcon sx={{ color: theme.vars.palette.text.secondary }} />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            fullWidth
          />
        </Box>
      </Collapse>
    </AppBar>
  )
}
