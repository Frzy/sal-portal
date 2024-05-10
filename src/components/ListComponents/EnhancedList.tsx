'use client'

import React, { forwardRef, useImperativeHandle, useMemo, useState } from 'react'

import { Collapse, Tooltip, Typography } from '@mui/material'
import Box from '@mui/material/Box'
import Checkbox from '@mui/material/Checkbox'
import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TablePagination from '@mui/material/TablePagination'
import TableRow from '@mui/material/TableRow'
import dayjs from 'dayjs'
import minMax from 'dayjs/plugin/minMax'
import relativeTime from 'dayjs/plugin/relativeTime'

import { LONG_TIME_FORMAT } from '@/util/constants'
import { formatCurrency } from '@/util/functions'

import ListHeader, { type ListColumns } from './ListHeader'
import ListToolbar from './ListToolbar'

dayjs.extend(relativeTime)
dayjs.extend(minMax)

type ListSelection = 'single' | 'multiple' | 'none'
type Order = 'asc' | 'desc'

type Row<T> = { id: string } & {
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
  order: Order,
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
  rows: T[]
  selection?: ListSelection
  sortOrder?: Order
  title?: string
  totalRows: number
}
type PropsWithForwardRef<T extends Row<T>> = Props<T> & { forwardedRef: React.Ref<EnhancedListRef> }
type PropsWithStandardRef<T extends Row<T>> = Props<T> & { ref?: React.Ref<EnhancedListRef> }

function ListComponent<T extends Row<T>>({
  columns,
  filterComponent,
  hasFilters,
  onCreate,
  onDelete,
  onEdit,
  onSearch,
  orderBy: initOrderBy,
  rows,
  selection = 'single',
  sortOrder: initSortOrder = 'asc',
  title = 'List',
  forwardedRef,
}: PropsWithForwardRef<T>): React.JSX.Element {
  const [order, setOrder] = useState<Order>(initSortOrder)
  const [orderBy, setOrderBy] = useState<string>(initOrderBy as string)
  const [selected, setSelected] = useState<readonly string[]>([])
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const [showFilters, setShowFilters] = useState(false)
  const props = useMemo<(keyof T)[]>(() => columns.map((c) => c.id), [columns])
  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0
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
  function handleClick(event: React.MouseEvent<unknown>, id: string): void {
    const selectedIndex = selected.indexOf(id)
    let newSelected: readonly string[] = []

    if (selection === 'single') {
      if (selectedIndex === -1) {
        setSelected([id])
      } else {
        setSelected([])
      }
    } else {
      if (selectedIndex === -1) {
        newSelected = newSelected.concat(selected, id)
      } else if (selectedIndex === 0) {
        newSelected = newSelected.concat(selected.slice(1))
      } else if (selectedIndex === selected.length - 1) {
        newSelected = newSelected.concat(selected.slice(0, -1))
      } else if (selectedIndex > 0) {
        newSelected = newSelected.concat(
          selected.slice(0, selectedIndex),
          selected.slice(selectedIndex + 1),
        )
      }
      setSelected(newSelected)
    }
  }
  function handleChangePage(event: unknown, newPage: number): void {
    setPage(newPage)
  }
  function handleChangeRowsPerPage(event: React.ChangeEvent<HTMLInputElement>): void {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }
  function isSelected(id: string): boolean {
    return selection !== 'none' ? selected.includes(id) : false
  }
  function formatRowData(column: ListColumns<T>, data: string | number | boolean): React.ReactNode {
    if (column.cellRender) return column.cellRender(data)
    if (column.isCurrency && typeof data === 'number') return formatCurrency(data)
    if (column.isDate && dayjs.isDayjs(data)) {
      return (
        <Tooltip title={`${data.format(LONG_TIME_FORMAT)}`} placement='bottom-end'>
          <Typography>{data.fromNow()}</Typography>
        </Tooltip>
      )
    }

    return `${data}`
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
            />
            <TableBody>
              {visibleRows.map((row, rowIndex) => {
                const isItemSelected = isSelected(row.id)
                const labelId = `enhanced-table-checkbox-${rowIndex}`

                return (
                  <TableRow
                    hover
                    onClick={
                      selection !== 'none'
                        ? (event) => {
                            handleClick(event, row.id)
                          }
                        : undefined
                    }
                    role='checkbox'
                    aria-checked={isItemSelected}
                    tabIndex={-1}
                    key={row.id}
                    selected={isItemSelected}
                    sx={{ cursor: selection !== 'none' ? 'pointer' : 'default' }}
                  >
                    {selection !== 'none' && (
                      <TableCell padding='checkbox'>
                        <Checkbox
                          color='primary'
                          checked={isItemSelected}
                          inputProps={{
                            'aria-labelledby': labelId,
                          }}
                        />
                      </TableCell>
                    )}
                    {props.map((key, colIndex) => {
                      return colIndex === 0 ? (
                        <TableCell
                          key={colIndex}
                          align={columns[colIndex]?.align ?? 'left'}
                          component='th'
                          id={labelId}
                          scope='row'
                          padding={selection !== 'none' ? 'none' : undefined}
                        >
                          {formatRowData(columns[colIndex], row[key])}
                        </TableCell>
                      ) : (
                        <TableCell key={colIndex} align={columns[colIndex]?.align ?? 'right'}>
                          {formatRowData(columns[colIndex], row[key])}
                        </TableCell>
                      )
                    })}
                  </TableRow>
                )
              })}
              {emptyRows > 0 && (
                <TableRow
                  style={{
                    height: 63 * emptyRows,
                  }}
                >
                  <TableCell colSpan={columns.length} />
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
