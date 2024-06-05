import {
  Box,
  Checkbox,
  TableCell,
  type TableCellProps,
  TableHead,
  TableRow,
  TableSortLabel,
} from '@mui/material'
import { visuallyHidden } from '@mui/utils'

interface ListHeaderProps<T> {
  columns: ListColumn<T>[]
  disableSorting?: boolean
  expandable?: boolean
  headerGroupRow?: React.ReactNode
  numSelected: number
  onRequestSort: (event: React.MouseEvent<unknown>, property: string) => void
  onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void
  order: List.Order
  orderBy: string
  rowCount: number
  selection: List.SelectionMode
}

export interface ListColumn<T> {
  align?: 'left' | 'center' | 'right'
  cellRender?: (
    row: T,
    state: { disabled: boolean; selected: boolean; expanded: boolean },
  ) => React.ReactNode
  disableSort?: boolean
  id: string
  isCurrency?: boolean
  label: string
  minWidth?: number
  sx?: TableCellProps['sx']
  cellStyle?: TableCellProps['sx']
}

export default function ListHeader<T>({
  columns,
  disableSorting,
  expandable,
  headerGroupRow,
  numSelected,
  onRequestSort,
  onSelectAllClick,
  order,
  orderBy,
  rowCount,
  selection,
}: ListHeaderProps<T>): React.JSX.Element {
  const createSortHandler = (property: string) => (event: React.MouseEvent<unknown>) => {
    onRequestSort(event, property)
  }

  return (
    <TableHead>
      {headerGroupRow}
      <TableRow>
        {selection !== 'none' && (
          <TableCell padding='checkbox'>
            {selection === 'multiple' && (
              <Checkbox
                color='primary'
                indeterminate={numSelected > 0 && numSelected < rowCount}
                checked={rowCount > 0 && numSelected === rowCount}
                onChange={onSelectAllClick}
                inputProps={{
                  'aria-label': 'select all desserts',
                }}
              />
            )}
          </TableCell>
        )}
        {columns.map((column, index) => (
          <TableCell
            key={column.id}
            align={index === 0 ? 'left' : column?.align ?? 'right'}
            padding={selection !== 'none' && index === 0 ? 'none' : 'normal'}
            sortDirection={orderBy === column.id ? order : false}
            sx={{ minWidth: column?.minWidth, ...column.sx }}
          >
            {!!disableSorting || !!column.disableSort ? (
              column.label
            ) : (
              <TableSortLabel
                active={orderBy === column.id}
                direction={orderBy === column.id ? order : 'asc'}
                onClick={createSortHandler(column.id)}
              >
                {column.label}
                {orderBy === column.id ? (
                  <Box component='span' sx={visuallyHidden}>
                    {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                  </Box>
                ) : null}
              </TableSortLabel>
            )}
          </TableCell>
        ))}
        {expandable && <TableCell padding='checkbox' />}
      </TableRow>
    </TableHead>
  )
}
