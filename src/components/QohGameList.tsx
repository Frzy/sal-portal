'use client'

import React, { useMemo, useRef, useState } from 'react'

import LinkIcon from '@mui/icons-material/Link'
import {
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  IconButton,
  Link,
  Switch,
} from '@mui/material'
import Grid from '@mui/material/Unstable_Grid2/Grid2'
import { useSession } from 'next-auth/react'

import { DATE_FORMAT } from '@/util/constants'

import EnhancedList, { type EnhancedListRef } from './ListComponents/EnhancedList'
import { type ListColumn } from './ListComponents/ListHeader'

const NameColumn: ListColumn<QoH.Game.Item> = {
  id: 'name',
  label: 'Name',
  align: 'left',
  sx: { minWidth: 105 },
  cellRender(row) {
    return (
      <Link
        underline='hover'
        href={`/qoh/game/${row.id}`}
        onClick={(event) => {
          event.stopPropagation()
        }}
      >
        {row.name}
      </Link>
    )
  },
}
const LinkColumn: ListColumn<QoH.Game.Item> = {
  id: 'link',
  label: '',
  sx: { width: 40 },
  cellRender(row) {
    return (
      <IconButton
        href={`/qoh/game/${row.id}`}
        onClick={(event) => {
          event.stopPropagation()
        }}
      >
        <LinkIcon />
      </IconButton>
    )
  },
}
const PublicColumns: ListColumn<QoH.Game.Item>[] = [
  {
    id: 'totals.availableFund',
    label: 'Public Jackpot',
    isCurrency: true,
  },
  {
    id: 'totals.sales',
    label: 'Sales',
    isCurrency: true,
  },
  {
    id: 'totals.seed',
    label: 'Seed',
    isCurrency: true,
  },
  {
    id: 'totals.payout',
    label: 'Payout',
    isCurrency: true,
  },
  {
    id: 'totals.jackpot',
    label: 'Actual Jackpot',
    isCurrency: true,
  },
  {
    id: 'totals.profit',
    label: 'Profit',
    isCurrency: true,
  },
  {
    id: 'paidJackpot',
    label: 'Paid Out',
    isCurrency: true,
  },
  {
    id: 'cardsLeft',
    label: 'Remaining',
    cellRender(row) {
      return 54 - row.entries.length
    },
  },
  {
    id: 'cardsDrawn',
    label: 'Drawn',
    cellRender(row) {
      return row.entries.length
    },
  },
  {
    id: 'startDate',
    label: 'Started',
    cellRender(row) {
      return row.startDate.format(DATE_FORMAT)
    },
  },
  {
    id: 'endDate',
    label: 'Ended',
    cellRender(row) {
      return row.endDate?.format(DATE_FORMAT) ?? '--'
    },
  },
]
const AdminColumns: ListColumn<QoH.Game.Item>[] = [
  {
    id: 'createdBy',
    label: 'Created By',
    minWidth: 130,
  },
  {
    id: 'created',
    label: 'Created',
    minWidth: 130,
  },
  {
    id: 'lastModifiedBy',
    label: 'Modified By',
    minWidth: 135,
  },
  {
    id: 'modified',
    label: 'Modified',
    minWidth: 150,
  },
]

interface QohGameListFilterProps {
  columns: string[]
  onColumnChange?: (columns: string[]) => void
  isAdmin?: boolean
}
function QohGameListFilters({
  columns,
  onColumnChange,
  isAdmin,
}: QohGameListFilterProps): React.JSX.Element {
  const isAdminColumnsChecked = columns.includes('created')
  const adminColumnIds = useMemo(() => {
    return AdminColumns.map((c) => c.id)
  }, [])

  function handleChange(event: React.ChangeEvent<HTMLInputElement>, checked: boolean): void {
    const colId = event.target.name
    const newCols = [...columns]

    if (!checked) {
      newCols.splice(
        newCols.findIndex((id) => colId === id),
        1,
      )
    } else {
      newCols.push(colId)
    }

    if (onColumnChange) {
      let orderedColumns = PublicColumns.filter((col) => newCols.includes(col.id)).map((c) => c.id)
      if (isAdminColumnsChecked) orderedColumns = [...orderedColumns, ...adminColumnIds]

      onColumnChange(orderedColumns)
    }
  }

  return (
    <Box sx={{ p: 2 }}>
      <FormControl sx={{ m: 1 }} component='fieldset' variant='standard'>
        <FormLabel component='legend'>Column Visibility</FormLabel>
        <FormGroup>
          <Grid container spacing={1}>
            {PublicColumns.map((col) => (
              <Grid key={col.id} xs={6} sm={3} lg={2}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={columns.includes(col.id)}
                      onChange={handleChange}
                      name={col.id}
                    />
                  }
                  label={col.label}
                />
              </Grid>
            ))}
          </Grid>
        </FormGroup>
      </FormControl>
      {isAdmin && (
        <Box>
          <FormControlLabel
            control={
              <Switch
                checked={isAdminColumnsChecked}
                onChange={(event, checked) => {
                  let newCols = [...columns]

                  if (checked) {
                    newCols = [...columns, ...adminColumnIds]
                  } else {
                    newCols = newCols.slice(0, -4)
                  }

                  if (onColumnChange) onColumnChange(newCols)
                }}
              />
            }
            label='Show Administrator Columns'
          />
        </Box>
      )}
    </Box>
  )
}

interface QohGameListProps {
  games: QoH.Game.Item[]
  listRef?: React.MutableRefObject<EnhancedListRef | null>
  onCreate?: () => void
  onDelete?: (items: QoH.Game.Item[]) => void
  onEdit?: (item: QoH.Game.Item) => void
  onSelectionChange?: (items: QoH.Game.Item[]) => void
  title: string
}
export default function QohGameList({
  games,
  listRef,
  onCreate,
  onDelete,
  onEdit,
  onSelectionChange,
  title,
}: QohGameListProps): React.JSX.Element {
  const { data: session } = useSession()
  const thisRef = useRef<EnhancedListRef | null>(null)
  const isAdmin = useMemo(() => session?.user.isAdmin, [session])
  const [visibleColumns, setVisibleColumns] = useState([
    'totals.sales',
    'totals.seed',
    'totals.profit',
    'totals.availableFund',
    'cardsLeft',
  ])
  const columns = useMemo<ListColumn<QoH.Game.Item>[]>(() => {
    const allColumns = [...PublicColumns, ...AdminColumns]
    const cols = visibleColumns
      .map((colId) => {
        return allColumns.find((c) => c.id === colId)
      })
      .filter((c) => c != null) as ListColumn<QoH.Game.Item>[]

    return [NameColumn, ...cols, LinkColumn]
  }, [visibleColumns])

  return (
    <EnhancedList
      ref={listRef ?? thisRef}
      createText='New Game'
      title={title}
      columns={columns}
      rows={games}
      orderBy={'name'}
      sortOrder='desc'
      totalRows={games.length}
      onCreate={onCreate}
      onDelete={isAdmin ? onDelete : undefined}
      onEdit={onEdit}
      onSelectionChange={onSelectionChange}
      selection='multiple'
      filterComponent={
        <QohGameListFilters
          columns={visibleColumns}
          onColumnChange={setVisibleColumns}
          isAdmin={isAdmin}
        />
      }
    />
  )
}
