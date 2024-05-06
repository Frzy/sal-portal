'use client'

import React, { useMemo, useState } from 'react'

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
import relativeTime from 'dayjs/plugin/relativeTime'

import { LONG_TIME_FORMAT } from '@/util/constants'
import { formatCurrency } from '@/util/functions'

import ListHeader, { type ListColumns } from './ListHeader'
import ListToolbar from './ListToolbar'

dayjs.extend(relativeTime)

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

interface EnhancedListProps<T extends Row<T>> {
  columns: ListColumns<T>[]
  rows: T[]

  filter?: (item: T) => boolean
  filterComponent?: React.ReactNode
  onEdit?: (item: T) => void
  onCreate?: () => void
  onDelete?: (items: T[]) => void
  sortOrder?: Order
  orderBy: keyof T
}
export default function EnhancedList<T extends Row<T>>({
  columns,
  filter,
  filterComponent,
  onCreate,
  onDelete,
  onEdit,
  orderBy: initOrderBy,
  rows,
  sortOrder: initSortOrder = 'asc',
}: EnhancedListProps<T>): React.JSX.Element {
  const [order, setOrder] = useState<Order>(initSortOrder)
  const [orderBy, setOrderBy] = useState<string>(initOrderBy as string)
  const [selected, setSelected] = useState<readonly string[]>([])
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const [showFilters, setShowFilters] = useState(false)
  const props = useMemo<(keyof T)[]>(() => columns.map((c) => c.id), [columns])
  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0
  const visibleRows = useMemo(() => {
    if (filter) {
      return rows
        .filter(filter)
        .sort(getComparator(order, orderBy))
        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
    }
    return rows
      .sort(getComparator(order, orderBy))
      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
  }, [order, orderBy, page, rows, rowsPerPage, filter])

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
  function handleChangePage(event: unknown, newPage: number): void {
    setPage(newPage)
  }
  function handleChangeRowsPerPage(event: React.ChangeEvent<HTMLInputElement>): void {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }
  function isSelected(id: string): boolean {
    return selected.includes(id)
  }
  function formatRowData(column: ListColumns<T>, data: string | number): React.ReactNode {
    if (column.isCurrency && typeof data === 'number') return formatCurrency(data)
    if (column.isDate && typeof data === 'string') {
      const date = dayjs(data)

      return (
        <Tooltip title={`${date.format(LONG_TIME_FORMAT)}`} placement='bottom-end'>
          <Typography>{date.fromNow()}</Typography>
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

  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ width: '100%', mb: 2 }}>
        <ListToolbar
          title='Cost Entries'
          numSelected={selected.length}
          showFilterButton={!!filterComponent}
          hasFilter={!!filter}
          showCreateButton={!!onCreate}
          onCreateClick={onCreate}
          onEditClick={onEdit ? handleEditClick : undefined}
          onDeleteClick={onDelete ? handleDeleteClick : undefined}
          onFilterClick={() => {
            setShowFilters(!showFilters)
          }}
        />
        <Collapse in={showFilters}>{filterComponent}</Collapse>
        <TableContainer>
          <Table sx={{ minWidth: 750 }} aria-labelledby='tableTitle'>
            <ListHeader
              columns={columns}
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              onSelectAllClick={handleSelectAllClick}
              onRequestSort={handleRequestSort}
              rowCount={rows.length}
            />
            <TableBody>
              {visibleRows.map((row, rowIndex) => {
                const isItemSelected = isSelected(row.id)
                const labelId = `enhanced-table-checkbox-${rowIndex}`

                return (
                  <TableRow
                    hover
                    onClick={(event) => {
                      handleClick(event, row.id)
                    }}
                    role='checkbox'
                    aria-checked={isItemSelected}
                    tabIndex={-1}
                    key={row.id}
                    selected={isItemSelected}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell padding='checkbox'>
                      <Checkbox
                        color='primary'
                        checked={isItemSelected}
                        inputProps={{
                          'aria-labelledby': labelId,
                        }}
                      />
                    </TableCell>
                    {props.map((key, colIndex) => {
                      return colIndex === 0 ? (
                        <TableCell
                          key={colIndex}
                          component='th'
                          id={labelId}
                          scope='row'
                          padding='none'
                        >
                          {formatRowData(columns[colIndex], row[key])}
                        </TableCell>
                      ) : (
                        <TableCell key={colIndex} align='right'>
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
                    height: 53 * emptyRows,
                  }}
                >
                  <TableCell colSpan={6} />
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
