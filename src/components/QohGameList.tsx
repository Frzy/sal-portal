'use client'

import React, { useMemo, useState } from 'react'

import LinkIcon from '@mui/icons-material/Link'
import {
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  IconButton,
} from '@mui/material'
import Grid from '@mui/material/Unstable_Grid2/Grid2'

import { DATE_FORMAT } from '@/util/constants'

import EnhancedList from './ListComponents/EnhancedList'
import { type ListColumn } from './ListComponents/ListHeader'

const NameColumn: ListColumn<QoH.Game.Item> = {
  id: 'name',
  label: 'Name',
  align: 'left',
  sx: { minWidth: 105 },
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
const AllColumns: ListColumn<QoH.Game.Item>[] = [
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
    id: 'totals.profit',
    label: 'Profit',
    isCurrency: true,
  },
  {
    id: 'totals.jackpot',
    label: 'Actual Jackpot',
    isCurrency: true,
  },
  {
    id: 'paidJackpot',
    label: 'Paid Out',
    isCurrency: true,
  },
  {
    id: 'totals.availableFund',
    label: 'Public Jackpot',
    isCurrency: true,
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
]

interface QohGameListFilterProps {
  columns: string[]
  onColumnChange?: (columns: string[]) => void
}
function QohGameListFilters({
  columns,
  onColumnChange,
}: QohGameListFilterProps): React.JSX.Element {
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

    if (onColumnChange)
      onColumnChange(AllColumns.filter((col) => newCols.includes(col.id)).map((c) => c.id))
  }

  return (
    <Box>
      <FormControl sx={{ m: 1 }} component='fieldset' variant='standard'>
        <FormLabel component='legend'>Column Visibility</FormLabel>
        <FormGroup>
          <Grid container spacing={1}>
            {AllColumns.map((col) => (
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
    </Box>
  )
}

interface QohGameListProps {
  games: QoH.Game.Item[]
}
export default function QohGameList({ games }: QohGameListProps): React.JSX.Element {
  const [visibleColumns, setVisibleColumns] = useState(['totals.availableFund', 'totals.sales'])
  const columns = useMemo<ListColumn<QoH.Game.Item>[]>(() => {
    const cols = visibleColumns
      .map((colId) => {
        return AllColumns.find((c) => c.id === colId)
      })
      .filter((c) => c != null) as ListColumn<QoH.Game.Item>[]

    return [LinkColumn, NameColumn, ...cols]
  }, [visibleColumns])

  return (
    <EnhancedList
      title='Queen of Heart Games'
      columns={columns}
      rows={games}
      orderBy={'name'}
      sortOrder='desc'
      totalRows={games.length}
      filterComponent={
        <QohGameListFilters columns={visibleColumns} onColumnChange={setVisibleColumns} />
      }
    />
  )
}
