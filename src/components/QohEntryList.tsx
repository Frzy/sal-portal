import { useMemo } from 'react'

import TrendingDownIcon from '@mui/icons-material/TrendingDown'
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import { Box, TableCell, TableRow, Tooltip, Typography } from '@mui/material'

import Card from '@/icons/Card'
import { CARD_VALUE_MAP, DATE_FORMAT } from '@/util/constants'
import { capitalize, formatCurrency } from '@/util/functions'

import EnhancedList from './ListComponents/EnhancedList'
import { type ListColumns } from './ListComponents/ListHeader'

const BaseColumns: ListColumns<QoH.Entry.GameItem>[] = [
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

const CardDrawnColumn: ListColumns<QoH.Entry.GameItem> = {
  id: 'cardDrawn',
  label: 'Card',
  align: 'center',
  cellStyle: { p: 0 },
  cellRender(row) {
    const suit = row.cardDrawn?.suit
    const value = row.cardDrawn?.value

    if (suit && value)
      return (
        <Tooltip
          title={`${CARD_VALUE_MAP[value]} of ${capitalize(suit)}`}
          sx={{ cursor: 'defualt' }}
          placement='right'
        >
          <Box sx={{ pt: 0.5 }}>
            <Card sx={{ fontSize: 48 }} suit={suit} value={value} />
          </Box>
        </Tooltip>
      )

    return '--'
  },
}
const PayoutColumn: ListColumns<QoH.Entry.GameItem> = {
  id: 'payout',
  label: 'Payouts',
  align: 'left',
  isCurrency: true,
}
const SeedColumn: ListColumns<QoH.Entry.GameItem> = {
  id: 'seed',
  label: 'To Seed',
  align: 'left',
  isCurrency: true,
}
const AvailableFundColumn: ListColumns<QoH.Entry.GameItem> = {
  id: 'availableFund',
  label: 'To Funds',
  align: 'left',
  isCurrency: true,
}
const JackpotColumn: ListColumns<QoH.Entry.GameItem> = {
  id: 'jackpot',
  label: 'To Jackpot',
  align: 'left',
  isCurrency: true,
  sx: { minWidth: 105 },
}
const ProfitColumn: ListColumns<QoH.Entry.GameItem> = {
  id: 'profit',
  label: 'To Profit',
  align: 'left',
  isCurrency: true,
}

const OldGameFirstTotalsColumn: ListColumns<QoH.Entry.GameItem> = {
  id: 'totals.sales',
  label: 'Sales',
  align: 'right',
  isCurrency: true,
  sx: { borderLeft: '1px solid', borderLeftColor: 'divider' },
  cellStyle: { borderLeft: '1px solid', borderLeftColor: 'divider' },
}
const NewGameFirstTotalsColumn: ListColumns<QoH.Entry.GameItem> = {
  id: 'totals.sales',
  label: 'Sales',
  align: 'right',
  isCurrency: true,
  sx: { borderLeft: '1px solid', borderLeftColor: 'divider' },
  cellStyle: { borderLeft: '1px solid', borderLeftColor: 'divider' },
}
const TotalSeedColumn: ListColumns<QoH.Entry.GameItem> = {
  id: 'totals.seed',
  label: 'Seed',
  align: 'right',
  isCurrency: true,
}
const TotalPayoutColumn: ListColumns<QoH.Entry.GameItem> = {
  id: 'totals.payout',
  label: 'Payouts',
  align: 'right',
  isCurrency: true,
}
const TotalJackpotColumn: ListColumns<QoH.Entry.GameItem> = {
  id: 'totals.jackpot',
  label: 'Jackpot',
  align: 'right',
  isCurrency: true,
}
const TotalProfitColumn: ListColumns<QoH.Entry.GameItem> = {
  id: 'totals.profit',
  label: 'Profit',
  align: 'right',
  isCurrency: true,
}
const TotalAvailableFundsColumn: ListColumns<QoH.Entry.GameItem> = {
  id: 'totals.availableFund',
  label: 'Funds',
  align: 'right',
  isCurrency: true,
}

interface QohEntryListProps {
  game: QoH.Game.Item
  hideDetails?: boolean
  hideTotals?: boolean
}
export default function QohEntryList({
  game,
  hideDetails,
  hideTotals,
}: QohEntryListProps): React.JSX.Element {
  const columns = useMemo(() => {
    let listColumns = [...BaseColumns]

    if (game.hasAllCards) listColumns.push(CardDrawnColumn)

    if (!hideDetails) {
      listColumns.push(PayoutColumn)

      if (game.createSeed) listColumns.push(SeedColumn)

      if (game.isOldGame) {
        listColumns = [...listColumns, JackpotColumn, ProfitColumn]
      } else {
        listColumns = [...listColumns, AvailableFundColumn, JackpotColumn, ProfitColumn]
      }
    }

    if (!hideTotals) {
      listColumns.push(game.isOldGame ? OldGameFirstTotalsColumn : NewGameFirstTotalsColumn)
      listColumns.push(TotalPayoutColumn)
      if (game.createSeed) listColumns.push(TotalSeedColumn)

      if (!game.isOldGame) listColumns.push(TotalAvailableFundsColumn)

      listColumns = [...listColumns, TotalJackpotColumn, TotalProfitColumn]
    }

    return listColumns
  }, [game, hideDetails, hideTotals])
  const { entryColSpan, runningColSpan } = useMemo(() => {
    let entryColSpan = BaseColumns.length + (game.hasAllCards ? 1 : 0)
    let runningColSpan = 0

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
  }, [game, hideDetails, hideTotals])
  const { entries } = game

  return (
    <EnhancedList
      columns={columns}
      disableSorting
      hideToolbar
      orderBy={'drawDate'}
      rows={entries}
      selection='none'
      totalRows={entries.length}
      variant='outlined'
      rowsPerPage={10}
      headerGroupRow={
        !hideTotals && (
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
