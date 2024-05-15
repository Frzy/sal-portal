'use client'

import { useMemo, useState } from 'react'

import { Box, Card, CardContent, Paper, Typography } from '@mui/material'
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
          <Card>
            <CardContent>
              <Typography variant='h5'>Overall Profit</Typography>
              <Typography
                variant='h4'
                align='center'
                sx={{
                  fontWeight: 'fontWeightBold',
                  color: (theme) =>
                    stats.totalSales - stats.totalCost >= 0
                      ? theme.vars.palette.success.main
                      : theme.vars.palette.error.main,
                }}
              >
                {formatCurrency(stats.totalSales - stats.totalCost)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid xs={12} sm={6} lg={3}>
          <Card>
            <CardContent>
              <Typography variant='h5'>Total Sales</Typography>
              <Typography
                variant='h4'
                align='center'
                sx={{
                  fontWeight: 'fontWeightBold',
                  color: (theme) => theme.vars.palette.success.main,
                }}
              >
                {formatCurrency(stats.totalSales)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid xs={12} sm={6} lg={3}>
          <Card>
            <CardContent>
              <Typography variant='h5'>Total Costs</Typography>
              <Typography
                variant='h4'
                align='center'
                sx={{
                  fontWeight: 'fontWeightBold',
                  color: (theme) => theme.vars.palette.error.main,
                }}
              >
                {formatCurrency(stats.totalCost)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid xs={12} sm={6} lg={3}>
          <Card>
            <CardContent>
              <Typography variant='h5'>Overall Profit %</Typography>
              <Typography
                variant='h4'
                align='center'
                sx={{
                  fontWeight: 'fontWeightBold',
                  color: (theme) =>
                    stats.profitPercent >= 0
                      ? theme.vars.palette.success.main
                      : theme.vars.palette.error.main,
                }}
              >
                {stats.profitPercent}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid xs={12} sm={6} lg={3}>
          <Card>
            <CardContent>
              <Typography variant='h5'>Total Services</Typography>
              <Typography variant='h4' align='center' sx={{ fontWeight: 'fontWeightBold' }}>
                {stats.totalServices}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid xs={12} sm={6} lg={3}>
          <Card>
            <CardContent>
              <Typography variant='h5'>Total Orders</Typography>
              <Typography variant='h4' align='center' sx={{ fontWeight: 'fontWeightBold' }}>
                {stats.totalOrders}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid xs={12} sm={6} lg={3}>
          <Card>
            <CardContent>
              <Typography variant='h5'>Average Sales</Typography>
              <Typography variant='h4' align='center' sx={{ fontWeight: 'fontWeightBold' }}>
                {formatCurrency(stats.totalSales / stats.totalServices)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid xs={12} sm={6} lg={3}>
          <Card>
            <CardContent>
              <Typography variant='h5'>Average Orders</Typography>
              <Typography variant='h4' align='center' sx={{ fontWeight: 'fontWeightBold' }}>
                {stats.totalOrders / stats.totalServices}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
