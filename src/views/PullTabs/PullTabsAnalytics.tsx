'use client'

import { useMemo, useState } from 'react'

import SingleValueDisplay from '@c/SingleValueDisplay'
import TimeFrame, { type TimeFrameValue } from '@c/TimeFrame'
import { Box, Paper, Stack, Typography } from '@mui/material'
import Grid from '@mui/material/Unstable_Grid2/Grid2'
import dayjs from 'dayjs'

import { TIME_FRAME } from '@/util/constants'
import {
  formatCurrency,
  formatPercent,
  getCurrentLegionYear,
  getPullTabStats,
  serverToPullTabCostItem,
  serverToPullTabTransactionItem,
} from '@/util/functions'

interface PullTabAnalyticsViewProps {
  costs: PullTab.Cost.ServerItem[]
  transactions: PullTab.Transaction.ServerItem[]
}
export default function PullTabAnalyticsView({
  costs: serverCosts,
  transactions: serverTransactions,
}: PullTabAnalyticsViewProps): React.JSX.Element {
  const data = useMemo(() => {
    return {
      costs: serverCosts.map(serverToPullTabCostItem),
      transactions: serverTransactions.map(serverToPullTabTransactionItem),
    }
  }, [serverCosts, serverTransactions])
  const [timeFrame, setTimeframe] = useState<TimeFrameValue>({
    value: TIME_FRAME.LEGION_YEAR,
    ...getCurrentLegionYear(),
  })
  const costs = useMemo(() => {
    if (timeFrame.value === TIME_FRAME.ALL) return data.costs

    return data.costs.filter((c) => {
      return c.created.isAfter(timeFrame.startDate) && c.created.isBefore(timeFrame.endDate)
    })
  }, [data, timeFrame])
  const transactions = useMemo(() => {
    if (timeFrame.value === TIME_FRAME.ALL) return data.transactions

    return data.transactions.filter((c) => {
      return c.created.isAfter(timeFrame.startDate) && c.created.isBefore(timeFrame.endDate)
    })
  }, [data, timeFrame])
  const time = useMemo(() => {
    const today = dayjs()
    const endDate = timeFrame.endDate.isAfter(today) ? today : timeFrame.endDate
    const startDate = timeFrame.startDate.isBefore(data.transactions[0].created)
      ? data.transactions[0].created
      : timeFrame.startDate

    return {
      months: endDate.diff(startDate, 'months'),
      weeks: endDate.diff(startDate, 'weeks'),
      days: endDate.diff(startDate, 'days'),
    }
  }, [timeFrame, data.transactions])
  const stats = useMemo<PullTab.Stats>(() => {
    return getPullTabStats(costs, transactions)
  }, [costs, transactions])

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Paper sx={{ p: 2 }}>
        <Stack spacing={2}>
          <Typography variant='h4'>Pulltab Analytics</Typography>
          <TimeFrame
            id='pulltab-analytics-timeframe'
            value={timeFrame.value}
            onChange={(timeFrame) => {
              setTimeframe(timeFrame)
            }}
          />
        </Stack>
      </Paper>
      <Grid container spacing={2}>
        <Grid xs={12} sm={6} lg={3}>
          <SingleValueDisplay
            label='Net Profit'
            value={formatCurrency(stats.totalSales - stats.totalCosts)}
            valueProps={{
              sx: {
                color: (theme) =>
                  stats.totalSales - stats.totalCosts >= 0
                    ? theme.vars.palette.success.main
                    : theme.vars.palette.error.main,
              },
            }}
          />
        </Grid>
        <Grid xs={12} sm={6} lg={3}>
          <SingleValueDisplay
            label='Sales'
            value={formatCurrency(stats.totalSales)}
            valueProps={{
              sx: {
                color: (theme) => theme.vars.palette.success.main,
              },
            }}
          />
        </Grid>
        <Grid xs={12} sm={6} lg={3}>
          <SingleValueDisplay
            label='Deposits'
            value={formatCurrency(stats.totalDeposits)}
            valueProps={{
              sx: {
                color: (theme) => theme.vars.palette.success.main,
              },
            }}
          />
        </Grid>
        <Grid xs={12} sm={6} lg={3}>
          <SingleValueDisplay
            label='Payouts'
            value={formatCurrency(stats.totalPayouts)}
            valueProps={{
              sx: {
                color: (theme) => theme.vars.palette.error.main,
              },
            }}
          />
        </Grid>
        <Grid xs={12} sm={6} lg={3}>
          <SingleValueDisplay
            label='Box Costs'
            value={formatCurrency(stats.totalTabCosts)}
            valueProps={{
              sx: {
                color: (theme) => theme.vars.palette.error.main,
              },
            }}
          />
        </Grid>
        <Grid xs={12} sm={6} lg={3}>
          <SingleValueDisplay
            label='Net Profit %'
            value={formatPercent(stats.profitPercent)}
            valueProps={{
              sx: {
                color: (theme) =>
                  stats.profitPercent >= 0
                    ? theme.vars.palette.success.main
                    : theme.vars.palette.error.main,
              },
            }}
          />
        </Grid>
        <Grid xs={12} sm={6} lg={3}>
          <SingleValueDisplay
            label='Net Profit Margin'
            value={formatPercent(stats.netProfitMargin)}
          />
        </Grid>
        {time.months >= 2 && (
          <>
            <Grid xs={12}>
              <Paper sx={{ p: 1 }}>
                <Typography variant='h4'>Averages Per Month</Typography>
              </Paper>
            </Grid>
            <Grid xs={12} sm={6} lg={3}>
              <SingleValueDisplay
                label='Net Profit'
                value={formatCurrency((stats.totalSales - stats.totalCosts) / time.months)}
                valueProps={{
                  sx: {
                    color: (theme) =>
                      stats.totalSales - stats.totalCosts >= 0
                        ? theme.vars.palette.success.main
                        : theme.vars.palette.error.main,
                  },
                }}
              />
            </Grid>
            <Grid xs={12} sm={6} lg={3}>
              <SingleValueDisplay
                label='Sales'
                value={formatCurrency(stats.totalSales / time.months)}
                valueProps={{
                  sx: {
                    color: (theme) => theme.vars.palette.success.main,
                  },
                }}
              />
            </Grid>
            <Grid xs={12} sm={6} lg={3}>
              <SingleValueDisplay
                label='Deposits'
                value={formatCurrency(stats.totalDeposits / time.months)}
                valueProps={{
                  sx: {
                    color: (theme) => theme.vars.palette.success.main,
                  },
                }}
              />
            </Grid>
            <Grid xs={12} sm={6} lg={3}>
              <SingleValueDisplay
                label='Payouts'
                value={formatCurrency(stats.totalPayouts / time.months)}
                valueProps={{
                  sx: {
                    color: (theme) => theme.vars.palette.error.main,
                  },
                }}
              />
            </Grid>
            <Grid xs={12} sm={6} lg={3}>
              <SingleValueDisplay
                label='Box Costs'
                value={formatCurrency(stats.totalTabCosts / time.months)}
                valueProps={{
                  sx: {
                    color: (theme) => theme.vars.palette.error.main,
                  },
                }}
              />
            </Grid>
          </>
        )}
        {time.weeks >= 2 && (
          <>
            <Grid xs={12}>
              <Paper sx={{ p: 1 }}>
                <Typography variant='h4'>Averages Per Week</Typography>
              </Paper>
            </Grid>
            <Grid xs={12} sm={6} lg={3}>
              <SingleValueDisplay
                label='Net Profit'
                value={formatCurrency((stats.totalSales - stats.totalCosts) / time.weeks)}
                valueProps={{
                  sx: {
                    color: (theme) =>
                      stats.totalSales - stats.totalCosts >= 0
                        ? theme.vars.palette.success.main
                        : theme.vars.palette.error.main,
                  },
                }}
              />
            </Grid>
            <Grid xs={12} sm={6} lg={3}>
              <SingleValueDisplay
                label='Sales'
                value={formatCurrency(stats.totalSales / time.weeks)}
                valueProps={{
                  sx: {
                    color: (theme) => theme.vars.palette.success.main,
                  },
                }}
              />
            </Grid>
            <Grid xs={12} sm={6} lg={3}>
              <SingleValueDisplay
                label='Deposits'
                value={formatCurrency(stats.totalDeposits / time.weeks)}
                valueProps={{
                  sx: {
                    color: (theme) => theme.vars.palette.success.main,
                  },
                }}
              />
            </Grid>
            <Grid xs={12} sm={6} lg={3}>
              <SingleValueDisplay
                label='Payouts'
                value={formatCurrency(stats.totalPayouts / time.weeks)}
                valueProps={{
                  sx: {
                    color: (theme) => theme.vars.palette.error.main,
                  },
                }}
              />
            </Grid>
            <Grid xs={12} sm={6} lg={3}>
              <SingleValueDisplay
                label='Box Costs'
                value={formatCurrency(stats.totalTabCosts / time.weeks)}
                valueProps={{
                  sx: {
                    color: (theme) => theme.vars.palette.error.main,
                  },
                }}
              />
            </Grid>
          </>
        )}
        <Grid xs={12}>
          <Paper sx={{ p: 1 }}>
            <Typography variant='h4'>Averages Per Day</Typography>
          </Paper>
        </Grid>
        <Grid xs={12} sm={6} lg={4}>
          <SingleValueDisplay
            label='Net Profit'
            value={formatCurrency((stats.totalSales - stats.totalCosts) / time.days)}
            valueProps={{
              sx: {
                color: (theme) =>
                  stats.totalSales - stats.totalCosts >= 0
                    ? theme.vars.palette.success.main
                    : theme.vars.palette.error.main,
              },
            }}
          />
        </Grid>
        <Grid xs={12} sm={6} lg={4}>
          <SingleValueDisplay
            label='Sales'
            value={formatCurrency(stats.totalSales / time.days)}
            valueProps={{
              sx: {
                color: (theme) => theme.vars.palette.success.main,
              },
            }}
          />
        </Grid>
        <Grid xs={12} sm={6} lg={4}>
          <SingleValueDisplay
            label='Payouts'
            value={formatCurrency(stats.totalPayouts / time.days)}
            valueProps={{
              sx: {
                color: (theme) => theme.vars.palette.error.main,
              },
            }}
          />
        </Grid>
      </Grid>
    </Box>
  )
}
