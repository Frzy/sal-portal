import { Fragment, useMemo } from 'react'

import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import {
  Checkbox,
  Collapse,
  IconButton,
  TableCell,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material'
import dayjs, { type Dayjs } from 'dayjs'

import { LONG_TIME_FORMAT } from '@/util/constants'
import { formatCurrency, getValueByPath } from '@/util/functions'

import { type Row } from './EnhancedList'
import { type ListColumn } from './ListHeader'

interface ListRowProps<T extends Row<T>> {
  columns: ListColumn<T>[]
  row: T
  totalColumns: number
  selection: List.SelectionMode
  onSelectionChange?: (row: T, selected: boolean) => void
  onExpandChange?: (row: T, expanded: boolean) => void
  selected?: boolean
  expanded?: boolean
  children?: React.ReactNode
  disabled?: boolean
}
export default function ListRow<T extends Row<T>>({
  children,
  columns,
  disabled = false,
  expanded = false,
  onExpandChange,
  onSelectionChange,
  row,
  selected = false,
  selection,
  totalColumns,
}: ListRowProps<T>): React.JSX.Element {
  const isExpandable = !!children
  const columnKeys = useMemo<string[]>(() => columns.map((c) => c.id), [columns])

  function formatRowData(column: ListColumn<T>, row: T, path: string): React.ReactNode {
    const cellData: string | number | Dayjs = getValueByPath(row, path)

    if (column.cellRender) {
      const cell = column.cellRender(row, {
        disabled,
        selected,
        expanded,
      })

      if (cell) return cell
    }
    if (dayjs.isDayjs(cellData)) {
      return (
        <Tooltip title={`${cellData.format(LONG_TIME_FORMAT)}`} placement='bottom-end'>
          <Typography>{cellData.fromNow()}</Typography>
        </Tooltip>
      )
    }

    return typeof cellData === 'number' ? (
      <Typography sx={{ fontFamily: 'monospace' }}>
        {column.isCurrency ? formatCurrency(cellData) : cellData}
      </Typography>
    ) : (
      cellData
    )
  }

  return (
    <Fragment>
      <TableRow
        hover
        onClick={
          selection !== 'none'
            ? (event) => {
                if (onSelectionChange) onSelectionChange(row, !selected)
              }
            : undefined
        }
        role='checkbox'
        aria-checked={selected}
        tabIndex={-1}
        selected={selected}
        sx={{ cursor: selection !== 'none' && !disabled ? 'pointer' : 'default' }}
      >
        {selection !== 'none' && (
          <TableCell padding='checkbox'>
            <Checkbox color='primary' checked={selected} disabled={disabled} />
          </TableCell>
        )}
        {columnKeys.map((key, colIndex) => {
          return colIndex === 0 ? (
            <TableCell
              key={colIndex}
              align={columns[colIndex]?.align ?? 'left'}
              component='th'
              scope='row'
              padding={selection !== 'none' ? 'none' : undefined}
              sx={{ py: 0, ...columns[colIndex].cellStyle }}
            >
              {formatRowData(columns[colIndex], row, key)}
            </TableCell>
          ) : (
            <TableCell
              key={colIndex}
              align={columns[colIndex]?.align ?? 'right'}
              sx={{ py: 0, ...columns[colIndex].cellStyle }}
            >
              {formatRowData(columns[colIndex], row, key)}
            </TableCell>
          )
        })}
        {isExpandable && (
          <TableCell padding='checkbox'>
            <IconButton
              onClick={(event) => {
                event.stopPropagation()
                if (onExpandChange) onExpandChange(row, !expanded)
              }}
            >
              <ExpandMoreIcon
                sx={{
                  transition: (theme) => theme.transitions.create('transform'),
                  transform: !expanded ? 'rotate(0deg)' : 'rotate(180deg)',
                }}
              />
            </IconButton>
          </TableCell>
        )}
      </TableRow>
      {isExpandable && (
        <TableRow
          sx={{
            backgroundColor: (theme) =>
              selected
                ? `rgba(${theme.vars.palette.primary.mainChannel} / ${theme.vars.palette.action.selectedOpacity})`
                : undefined,
          }}
        >
          <TableCell
            sx={{
              py: 0,
            }}
            colSpan={totalColumns}
          >
            <Collapse in={expanded} timeout='auto' unmountOnExit>
              {children}
            </Collapse>
          </TableCell>
        </TableRow>
      )}
    </Fragment>
  )
}
