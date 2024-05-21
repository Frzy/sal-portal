'use client'

import { useMemo, useState } from 'react'

import SingleValueDisplay from '@c/SingleValueDisplay'
import { Box, Paper, Typography } from '@mui/material'
import Grid from '@mui/material/Unstable_Grid2/Grid2'

import { formatCurrency, serverToCheckoutItem, serverToCostItem } from '@/util/functions'

interface KitchenStats {
  totalDeposits: number
  totalSales: number
  totalDrinkChips: number
  totalOrders: number
  totalCost: number
  profitPercent: number
  totalServices: number
}

interface KitchenAnalyticsViewProps {
  costs: Kitchen.Cost.ServerItem[]
  checkouts: Kitchen.Checkout.ServerItem[]
}
export default function KitchenAnalyticsView({
  costs: serverCosts,
  checkouts: serverCheckouts,
}: KitchenAnalyticsViewProps): React.JSX.Element {
  const [costs] = useState(serverCosts.map(serverToCostItem))
  const [checkouts] = useState(serverCheckouts.map(serverToCheckoutItem))
  const stats = useMemo<KitchenStats>(() => {
    const checkoutStats = checkouts.reduce(
      (stats, c) => {
        return {
          ...stats,
          totalDeposits: stats.totalDeposits + c.deposit,
          totalSales: stats.totalSales + c.sales,
          totalDrinkChips: stats.totalDrinkChips + c.drinkChips,
          totalOrders: stats.totalOrders + c.totalOrders,
        }
      },
      {
        totalDeposits: 0,
        totalSales: 0,
        totalDrinkChips: 0,
        totalOrders: 0,
        totalServices: checkouts.length,
      },
    )
    const totalCost = costs.reduce((sum, c) => sum + c.amount, 0)
    return {
      ...checkoutStats,
      totalCost,
      profitPercent: Math.round(((checkoutStats.totalSales - totalCost) / totalCost) * 100),
    }
  }, [costs, checkouts])

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Paper sx={{ p: 2 }}>
        <Typography variant='h3'>Kitchen Analytics</Typography>
      </Paper>
      <Grid container spacing={2}>
        <Grid xs={12} sm={6} lg={3}>
          <SingleValueDisplay
            label='Overall Profit'
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
            label='Total Sales'
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
            label='Total Costs'
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
            label='Overall Profit %'
            value={`${stats.profitPercent}%`}
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
          <SingleValueDisplay label='Total Services' value={stats.totalServices} />
        </Grid>
        <Grid xs={12} sm={6} lg={3}>
          <SingleValueDisplay label='Total Orders' value={stats.totalOrders} />
        </Grid>
        <Grid xs={12} sm={6} lg={3}>
          <SingleValueDisplay
            label='Average Sales'
            value={formatCurrency(stats.totalSales / stats.totalServices)}
          />
        </Grid>
        <Grid xs={12} sm={6} lg={3}>
          <SingleValueDisplay
            label='Average Orders'
            value={stats.totalOrders / stats.totalServices}
          />
        </Grid>
      </Grid>
    </Box>
  )
}
