import { Box, Checkbox, TableCell, TableHead, TableRow, TableSortLabel } from '@mui/material'
import { visuallyHidden } from '@mui/utils'

type Order = 'asc' | 'desc'
type ListSelection = 'single' | 'multiple' | 'none'
interface ListHeaderProps<T> {
  columns: ListColumns<T>[]
  numSelected: number
  onRequestSort: (event: React.MouseEvent<unknown>, property: string) => void
  onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void
  order: Order
  orderBy: string
  rowCount: number
  selection: ListSelection
}

type StringKeys<T> = {
  [P in keyof T]: P extends string ? P : never
}[keyof T]

export interface ListColumns<T> {
  id: StringKeys<T>
  label: string
  isNumber?: boolean
  isCurrency?: boolean
  isDate?: boolean
  minWidth?: number
  align?: 'left' | 'center' | 'right'
  cellRender?: (data: unknown) => React.ReactNode
}

export default function ListHeader<T>({
  columns,
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
            align={column?.align ?? index === 0 ? 'left' : 'right'}
            padding={selection !== 'none' && index === 0 ? 'none' : 'normal'}
            sortDirection={orderBy === column.id ? order : false}
            sx={{ minWidth: column?.minWidth }}
          >
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
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  )
}
