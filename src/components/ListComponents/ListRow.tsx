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
import { formatCurrency } from '@/util/functions'

import { type Row } from './EnhancedList'
import { type ListColumns } from './ListHeader'

interface ListRowProps<T extends Row<T>> {
  columns: ListColumns<T>[]
  row: T
  totalColumns: number
  selection: List.SelectionMode
  onSelectionChange?: (row: T, selected: boolean) => void
  onExpandChange?: (row: T, expanded: boolean) => void
  selected?: boolean
  expanded?: boolean
  children?: React.ReactNode
}
export default function ListRow<T extends Row<T>>({
  children,
  columns,
  expanded,
  onExpandChange,
  onSelectionChange,
  row,
  selected,
  selection,
  totalColumns,
}: ListRowProps<T>): React.JSX.Element {
  const isExpandable = !!children
  const columnKeys = useMemo<(keyof T)[]>(() => columns.map((c) => c.id), [columns])

  function formatRowData(column: ListColumns<T>, row: T, key: keyof T): React.ReactNode {
    const cellData: string | number | Dayjs = row[key]

    if (column.cellRender) {
      const cell = column.cellRender(row)

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
        sx={{ cursor: selection !== 'none' ? 'pointer' : 'default' }}
      >
        {selection !== 'none' && (
          <TableCell padding='checkbox'>
            <Checkbox color='primary' checked={selected} />
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
            >
              {formatRowData(columns[colIndex], row, key)}
            </TableCell>
          ) : (
            <TableCell key={colIndex} align={columns[colIndex]?.align ?? 'right'}>
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
