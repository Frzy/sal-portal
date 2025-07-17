'use client'

import { useMemo, useState } from 'react'

import SingleValueDisplay from '@c/SingleValueDisplay'
import TimeFrame, { type TimeFrameValue } from '@c/TimeFrame'
import { Box, Paper, Stack, Typography } from '@mui/material'
import Grid from '@mui/material/Unstable_Grid2/Grid2'

import { TIME_FRAME } from '@/util/constants'
import {
  formatCurrency,
  formatPercent,
  getCurrentLegionYear,
  serverToCheckoutItem,
  serverToCostItem,
} from '@/util/functions'

interface KitchenAnalyticsViewProps {
  costs: Kitchen.Cost.ServerItem[]
  checkouts: Kitchen.Checkout.ServerItem[]
}
export default function KitchenAnalyticsView({
  costs: serverCosts,
  checkouts: serverCheckouts,
}: KitchenAnalyticsViewProps): React.JSX.Element {
  const data = useMemo(() => {
    return {
      costs: serverCosts.map(serverToCostItem),
      checkouts: serverCheckouts.map(serverToCheckoutItem),
    }
  }, [serverCosts, serverCheckouts])
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

  const checkouts = useMemo(() => {
    if (timeFrame.value === TIME_FRAME.ALL) return data.checkouts

    return data.checkouts.filter((c) => {
      return c.created.isAfter(timeFrame.startDate) && c.created.isBefore(timeFrame.endDate)
    })
  }, [data, timeFrame])

  const stats = useMemo<Kitchen.Stats>(() => {
    const checkoutStats = checkouts.reduce(
      (stats, c) => {
        return {
          ...stats,
          totalDeposits: stats.totalDeposits + c.deposit,
          totalSales: stats.totalSales + c.sales,
          totalDrinkChips: stats.totalDrinkChips + c.drinkChips,
          totalOrders: stats.totalOrders + c.totalOrders,
          totalServices: stats.totalServices + 1,
        }
      },
      {
        totalDeposits: 0,
        totalSales: 0,
        totalDrinkChips: 0,
        totalOrders: 0,
        totalServices: 0,
      },
    )
    const totalCost = costs.reduce((sum, c) => sum + c.amount, 0)
    const netProfit = checkoutStats.totalSales - totalCost
    const netProfitMargin = checkoutStats.totalSales ? netProfit / checkoutStats.totalSales : 0
    const profitPercent = totalCost ? netProfit / totalCost : 0

    return {
      ...checkoutStats,
      totalCost,
      profitPercent,
      netProfit,
      netProfitMargin,
    }
  }, [costs, checkouts])

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Paper sx={{ p: 2 }}>
        <Stack spacing={2}>
          <Typography variant='h4'>Kitchen Analytics</Typography>
          <TimeFrame
            id='kitchen-analytics-timeframe'
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
            value={formatCurrency(stats.totalSales - stats.totalCost)}
            valueProps={{
              sx: {
                color: (theme) =>
                  stats.totalSales - stats.totalCost >= 0
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
            label='Costs'
            value={formatCurrency(stats.totalCost)}
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
        <Grid xs={12} sm={6} lg={3}>
          <SingleValueDisplay label='Services' value={stats.totalServices} />
        </Grid>
        <Grid xs={12} sm={6} lg={3}>
          <SingleValueDisplay label='Orders' value={stats.totalOrders} />
        </Grid>
        <Grid xs={12}>
          <Paper sx={{ p: 1 }}>
            <Typography variant='h4'>Average Per Service</Typography>
          </Paper>
        </Grid>
        <Grid xs={12} sm={6} lg={3}>
          <SingleValueDisplay
            label='Sales'
            value={formatCurrency(stats.totalSales / stats.totalServices)}
          />
        </Grid>
        <Grid xs={12} sm={6} lg={3}>
          <SingleValueDisplay
            label='Costs'
            value={formatCurrency(stats.totalCost / stats.totalServices)}
          />
        </Grid>
        <Grid xs={12} sm={6} lg={3}>
          <SingleValueDisplay
            label='Orders'
            value={Math.round(stats.totalOrders / stats.totalServices)}
          />
        </Grid>
      </Grid>
    </Box>
  )
}
