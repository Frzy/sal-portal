import { useMemo, useRef, useState } from 'react'

import TrendingDownIcon from '@mui/icons-material/TrendingDown'
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import {
  Box,
  FormControlLabel,
  Switch,
  TableCell,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material'
import Grid from '@mui/material/Unstable_Grid2/Grid2'

import Card from '@/icons/Card'
import { DATE_FORMAT } from '@/util/constants'
import { formatCurrency } from '@/util/functions'
import { getFromStorage, saveToStorage } from '@/util/storage'

import EnhancedList, {
  type EnhancedListProps,
  type EnhancedListRef,
} from './ListComponents/EnhancedList'
import { type ListColumn } from './ListComponents/ListHeader'

interface VibibleColumnOptions {
  details: boolean
  running: boolean
}

const BaseColumns: ListColumn<QoH.Entry.GameItem>[] = [
  {
    id: 'drawDate',
    label: 'Drawn',
    align: 'left',
    sx: { minWidth: 120 },
    cellRender(row) {
      return row.drawDate.format(DATE_FORMAT)
    },
  },
  {
    id: 'ticketSales',
    label: 'Sales',
    align: 'left',
    cellStyle: { p: 0 },
    cellRender(row) {
      const percent = Math.round(row.percentChange * 100)
      const percentText = percent === 0 ? '0' : percent > 0 ? `+${percent}` : percent.toString()
      return (
        <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
          <Typography>{formatCurrency(row.ticketSales)}</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {percent === 0 ? (
              <TrendingFlatIcon />
            ) : percent > 0 ? (
              <TrendingUpIcon color='success' />
            ) : (
              <TrendingDownIcon color='error' />
            )}
            <Typography variant='caption'>{percentText}%</Typography>
          </Box>
        </Box>
      )
    },
  },
]
const CardDrawnColumn: ListColumn<QoH.Entry.GameItem> = {
  id: 'cardDrawn',
  label: 'Card',
  align: 'center',
  cellStyle: { p: 0 },
  cellRender(row) {
    const suit = row.cardDrawn?.suit
    const value = row.cardDrawn?.value
    const label = row.cardDrawn?.label

    if (suit && value && label)
      return (
        <Tooltip title={label} sx={{ cursor: 'defualt' }} placement='right'>
          <Box sx={{ pt: 0.5 }}>
            <Card sx={{ fontSize: 48 }} suit={suit} value={value} />
          </Box>
        </Tooltip>
      )

    return '--'
  },
}
const ShuffleColumn: ListColumn<QoH.Entry.GameItem> = {
  id: 'shuffle',
  label: 'Shuffle',
  align: 'left',
  sx: { maxWidth: 75 },
}
const PayoutColumn: ListColumn<QoH.Entry.GameItem> = {
  id: 'payout',
  label: 'Payouts',
  align: 'left',
  isCurrency: true,
}
const SeedColumn: ListColumn<QoH.Entry.GameItem> = {
  id: 'seed',
  label: 'Seed',
  align: 'left',
  isCurrency: true,
}
const AvailableFundColumn: ListColumn<QoH.Entry.GameItem> = {
  id: 'availableFund',
  label: 'Funds',
  align: 'left',
  isCurrency: true,
}
const JackpotColumn: ListColumn<QoH.Entry.GameItem> = {
  id: 'jackpot',
  label: 'Jackpot',
  align: 'left',
  isCurrency: true,
  sx: { minWidth: 105 },
}
const ProfitColumn: ListColumn<QoH.Entry.GameItem> = {
  id: 'profit',
  label: 'Profit',
  align: 'left',
  isCurrency: true,
}
const OldGameFirstTotalsColumn: ListColumn<QoH.Entry.GameItem> = {
  id: 'totals.sales',
  label: 'Sales',
  align: 'right',
  isCurrency: true,
  sx: { borderLeft: '1px solid', borderLeftColor: 'divider' },
  cellStyle: { borderLeft: '1px solid', borderLeftColor: 'divider' },
}
const NewGameFirstTotalsColumn: ListColumn<QoH.Entry.GameItem> = {
  id: 'totals.sales',
  label: 'Sales',
  align: 'right',
  isCurrency: true,
  sx: { borderLeft: '1px solid', borderLeftColor: 'divider' },
  cellStyle: { borderLeft: '1px solid', borderLeftColor: 'divider' },
}
const TotalSeedColumn: ListColumn<QoH.Entry.GameItem> = {
  id: 'totals.seed',
  label: 'Seed',
  align: 'right',
  isCurrency: true,
}
const TotalPayoutColumn: ListColumn<QoH.Entry.GameItem> = {
  id: 'totals.payout',
  label: 'Payouts',
  align: 'right',
  isCurrency: true,
}
const TotalJackpotColumn: ListColumn<QoH.Entry.GameItem> = {
  id: 'totals.jackpot',
  label: 'Jackpot',
  align: 'right',
  isCurrency: true,
}
const TotalProfitColumn: ListColumn<QoH.Entry.GameItem> = {
  id: 'totals.profit',
  label: 'Profit',
  align: 'right',
  isCurrency: true,
}
const TotalAvailableFundsColumn: ListColumn<QoH.Entry.GameItem> = {
  id: 'totals.availableFund',
  label: 'Funds',
  align: 'right',
  isCurrency: true,
}

interface QohEntryListProps
  extends Omit<
    EnhancedListProps<QoH.Entry.GameItem>,
    'ref' | 'columns' | 'rows' | 'totalRows' | 'orderBy'
  > {
  game: QoH.Game.Item
  listRef?: React.MutableRefObject<EnhancedListRef | null>
  title?: string
}
export default function QohEntryList({
  game,
  listRef,
  title = 'Entries',
  ...listProps
}: QohEntryListProps): React.JSX.Element {
  const thisRef = useRef<EnhancedListRef | null>(null)
  const [visibleColumns, setVisibleColumns] = useState<VibibleColumnOptions>(
    getFromStorage<VibibleColumnOptions>('qohVisibileColumns', {
      details: false,
      running: false,
    }),
  )
  const columns = useMemo(() => {
    let lColumns = [...BaseColumns]
    const hideDetails = !visibleColumns.details
    const hideTotals = !visibleColumns.running

    if (game.hasAllCards) lColumns.push(CardDrawnColumn)
    if (game.resetOnTwoJokers) lColumns.push(ShuffleColumn)
    if (!hideDetails) {
      lColumns.push(PayoutColumn)

      if (game.createSeed) lColumns.push(SeedColumn)

      if (game.isOldGame) {
        lColumns = [...lColumns, JackpotColumn, ProfitColumn]
      } else {
        lColumns = [...lColumns, AvailableFundColumn, JackpotColumn, ProfitColumn]
      }
    }

    if (!hideTotals) {
      lColumns.push(game.isOldGame ? OldGameFirstTotalsColumn : NewGameFirstTotalsColumn)
      lColumns.push(TotalPayoutColumn)
      if (game.createSeed) lColumns.push(TotalSeedColumn)

      if (!game.isOldGame) lColumns.push(TotalAvailableFundsColumn)

      lColumns = [...lColumns, TotalJackpotColumn, TotalProfitColumn]
    }

    return lColumns
  }, [game, visibleColumns])
  const { entryColSpan, runningColSpan } = useMemo(() => {
    const hideDetails = !visibleColumns.details
    const hideTotals = !visibleColumns.running
    let entryColSpan = BaseColumns.length + 1
    let runningColSpan = 0

    if (game.hasAllCards) entryColSpan += 1
    if (game.resetOnTwoJokers) entryColSpan += 1

    if (!hideDetails) {
      entryColSpan += 3

      if (game.createSeed) entryColSpan += 1
      if (!game.isOldGame) entryColSpan += 1
    }

    if (!hideTotals) {
      runningColSpan += 4
      if (game.createSeed) runningColSpan += 1
      if (!game.isOldGame) runningColSpan += 1
    }

    return { entryColSpan, runningColSpan }
  }, [game, visibleColumns])
  const { entries } = game

  function handleColumnVisibilityChange(options: Partial<VibibleColumnOptions>): void {
    const newState = { ...visibleColumns, ...options }
    setVisibleColumns(newState)
    saveToStorage('qohVisibileColumns', newState)
  }

  return (
    <EnhancedList
      title={title}
      sortOrder='desc'
      selection='multiple'
      variant='outlined'
      rowsPerPage={10}
      {...listProps}
      orderBy={'drawDate'}
      columns={columns}
      ref={listRef ?? thisRef}
      rows={entries}
      totalRows={entries.length}
      filterComponent={
        <QohEntryListFilters
          vibibleColumnOptions={visibleColumns}
          onColumnChange={handleColumnVisibilityChange}
        />
      }
      headerGroupRow={
        visibleColumns.running && (
          <TableRow>
            <TableCell align='center' colSpan={entryColSpan}>
              Entry
            </TableCell>
            <TableCell
              align='center'
              colSpan={runningColSpan}
              sx={{ borderLeft: '1px solid', borderLeftColor: 'divider' }}
            >
              Running Totals
            </TableCell>
          </TableRow>
        )
      }
    />
  )
}

interface QohEntryListFiltersProps {
  vibibleColumnOptions: VibibleColumnOptions
  onColumnChange?: (options: Partial<VibibleColumnOptions>) => void
}
function QohEntryListFilters({
  vibibleColumnOptions,

  onColumnChange,
}: QohEntryListFiltersProps): React.JSX.Element {
  function handleVisiblityColumnChange(event: React.ChangeEvent<HTMLInputElement>): void {
    const { name, checked } = event.target
    if (onColumnChange) onColumnChange({ [name]: checked })
  }

  return (
    <Box
      sx={{
        py: 2,
        px: 1,
        backgroundColor: (theme) => theme.vars.palette.background.paper,
        borderRight: (theme) => `1px solid ${theme.vars.palette.divider}`,
        borderLeft: (theme) => `1px solid ${theme.vars.palette.divider}`,
      }}
    >
      <Grid container spacing={1}>
        <Grid xs={12} md={6}>
          <FormControlLabel
            control={
              <Switch
                checked={vibibleColumnOptions.details}
                onChange={handleVisiblityColumnChange}
                name='details'
              />
            }
            label='Show Detail Breakdown'
          />
        </Grid>
        <Grid xs={12} md={6}>
          <FormControlLabel
            control={
              <Switch
                checked={vibibleColumnOptions.running}
                onChange={handleVisiblityColumnChange}
                name='running'
              />
            }
            label='Show Running Totals'
          />
        </Grid>
      </Grid>
    </Box>
  )
}
