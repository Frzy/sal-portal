'use client'

import { forwardRef, useImperativeHandle, useMemo, useState } from 'react'

import {
  Box,
  Collapse,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TablePagination,
  TableRow,
} from '@mui/material'
import dayjs from 'dayjs'
import minMax from 'dayjs/plugin/minMax'
import relativeTime from 'dayjs/plugin/relativeTime'

import ListHeader, { type ListColumns } from './ListHeader'
import ListRow from './ListRow'
import ListToolbar from './ListToolbar'

dayjs.extend(relativeTime)
dayjs.extend(minMax)

export type Row<T> = { id: string } & {
  [K in keyof T]: T[K]
}

function descendingComparator<T>(a: T, b: T, orderBy: keyof T): number {
  if (b[orderBy] < a[orderBy]) {
    return -1
  }
  if (b[orderBy] > a[orderBy]) {
    return 1
  }
  return 0
}
function getComparator<Key extends keyof any>(
  order: List.Order,
  orderBy: Key,
): (a: { [key in Key]: number | string }, b: { [key in Key]: number | string }) => number {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy)
}

export interface EnhancedListRef {
  clearSelection: () => void
  closeFilters: () => void
  openFilters: () => void
}

interface Props<T extends Row<T>> {
  columns: ListColumns<T>[]
  filterComponent?: React.ReactNode
  hasFilters?: boolean
  onCreate?: () => void
  onDelete?: (items: T[]) => void
  onEdit?: (item: T) => void
  onSearch?: (term: string) => void
  orderBy: keyof T
  renderExpandable?: (
    row: T,
    options: {
      selected: boolean
      expanded: boolean
    },
  ) => React.ReactNode
  rows: T[]
  selection?: List.SelectionMode
  sortOrder?: List.Order
  title?: string
  totalRows: number
}
type PropsWithForwardRef<T extends Row<T>> = Props<T> & { forwardedRef: React.Ref<EnhancedListRef> }
type PropsWithStandardRef<T extends Row<T>> = Props<T> & { ref?: React.Ref<EnhancedListRef> }

function ListComponent<T extends Row<T>>({
  columns,
  filterComponent,
  forwardedRef,
  hasFilters,
  onCreate,
  onDelete,
  onEdit,
  onSearch,
  orderBy: initOrderBy,
  renderExpandable,
  rows,
  selection = 'single',
  sortOrder: initSortOrder = 'asc',
  title = 'List',
}: PropsWithForwardRef<T>): React.JSX.Element {
  const [order, setOrder] = useState<List.Order>(initSortOrder)
  const [orderBy, setOrderBy] = useState<string>(initOrderBy as string)
  const [selected, setSelected] = useState<readonly string[]>([])
  const [expanded, setExpanded] = useState<readonly string[]>([])
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const [showFilters, setShowFilters] = useState(false)
  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0
  const totalColumns = columns.length + (selection !== 'none' ? 1 : 0) + (renderExpandable ? 1 : 0)
  const visibleRows = useMemo(() => {
    return rows
      .sort(getComparator(order, orderBy))
      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
  }, [order, orderBy, page, rows, rowsPerPage])

  function handleRequestSort(event: React.MouseEvent<unknown>, property: string): void {
    const isAsc = orderBy === property && order === 'asc'
    setOrder(isAsc ? 'desc' : 'asc')
    setOrderBy(property)
  }
  function handleSelectAllClick(event: React.ChangeEvent<HTMLInputElement>): void {
    if (event.target.checked) {
      const newSelected = rows.map((n) => n.id)
      setSelected(newSelected)
      return
    }
    setSelected([])
  }
  function handleExpandChange(row: T): void {
    const expandIndex = expanded.indexOf(row.id)

    if (expandIndex === -1) {
      setExpanded((prev) => [...prev, row.id])
    } else {
      const newExpanded = [...expanded]
      newExpanded.splice(expandIndex, 1)

      setExpanded(newExpanded)
    }
  }
  function isExpanded(id: string): boolean {
    return expanded.includes(id)
  }
  function handleSelectionChange(row: T): void {
    const selectedIndex = selected.indexOf(row.id)

    // Need to add it to the selected id array
    if (selectedIndex === -1) {
      if (selection === 'single') setSelected([row.id])
      else setSelected((prev) => [...prev, row.id])
    } else {
      if (selection === 'single') setSelected([])
      else {
        const newSelected = [...selected]
        newSelected.splice(selectedIndex, 1)
        setSelected(newSelected)
      }
    }
  }
  function isSelected(id: string): boolean {
    return selection !== 'none' ? selected.includes(id) : false
  }
  function handleChangePage(event: unknown, newPage: number): void {
    setPage(newPage)
  }
  function handleChangeRowsPerPage(event: React.ChangeEvent<HTMLInputElement>): void {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  function handleEditClick(): void {
    const editId = selected.length ? selected[0] : undefined

    if (editId) {
      const item = rows.find((r) => r.id === editId)

      if (item && onEdit) onEdit(item)
    }
  }
  function handleDeleteClick(): void {
    const items: T[] = []

    selected.forEach((id) => {
      const item = rows.find((r) => r.id === id)

      if (item) items.push(item)
    })

    if (onDelete) onDelete(items)

    setSelected([])
  }

  useImperativeHandle(
    forwardedRef,
    () => {
      return {
        clearSelection() {
          setSelected([])
        },
        closeFilters() {
          setShowFilters(false)
        },
        openFilters() {
          setShowFilters(true)
        },
      }
    },
    [],
  )

  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ width: '100%', mb: 2 }}>
        <ListToolbar
          title={title}
          numSelected={selected.length}
          hideFilterButton={!filterComponent}
          hideCreateButton={!onCreate}
          hideSearch={!onSearch}
          hasFilter={hasFilters}
          onCreateClick={onCreate}
          onEditClick={onEdit ? handleEditClick : undefined}
          onDeleteClick={onDelete ? handleDeleteClick : undefined}
          onSearchChange={onSearch}
          onFilterClick={() => {
            setShowFilters(!showFilters)
          }}
        />
        <Collapse in={showFilters}>{filterComponent}</Collapse>
        <TableContainer>
          <Table aria-labelledby='tableTitle'>
            <ListHeader
              columns={columns}
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              onSelectAllClick={handleSelectAllClick}
              onRequestSort={handleRequestSort}
              rowCount={rows.length}
              selection={selection}
              expandable={!!renderExpandable}
            />
            <TableBody>
              {visibleRows.map((row) => {
                const selected = isSelected(row.id)
                const expanded = isExpanded(row.id)
                return (
                  <ListRow
                    key={row.id}
                    row={row}
                    columns={columns}
                    selection={selection}
                    selected={selected}
                    expanded={expanded}
                    totalColumns={totalColumns}
                    onSelectionChange={handleSelectionChange}
                    onExpandChange={handleExpandChange}
                  >
                    {!!renderExpandable && renderExpandable(row, { selected, expanded })}
                  </ListRow>
                )
              })}
              {emptyRows > 0 && (
                <TableRow
                  style={{
                    height: 63 * emptyRows,
                  }}
                >
                  <TableCell colSpan={totalColumns} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component='div'
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  )
}

// @ts-expect-error Have no idea how to type this properly
const EnhancedList: <T extends Row<T>>(
  props: PropsWithStandardRef<T>,
  // @ts-expect-error Have no idea how to type this properly
) => React.ReactElement | null = forwardRef<EnhancedListRef, Props<Row<T>>>((props, ref) => (
  <ListComponent {...props} forwardedRef={ref} />
))
// @ts-expect-error Not sure why the display name isn't on the return type
EnhancedList.displayName = 'EnhancedList'

export default EnhancedList
