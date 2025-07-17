'use client'

import { Fragment, useMemo, useState } from 'react'

import SingleValueDisplay from '@c/SingleValueDisplay'
import KitchenIcon from '@mui/icons-material/Countertops'
import PullTabIcon from '@mui/icons-material/LocalActivity'
import { TabContext, TabList, TabPanel } from '@mui/lab'
import { Alert, Box, Paper, Tab, Typography, useMediaQuery, useTheme } from '@mui/material'
import Grid from '@mui/material/Unstable_Grid2/Grid2'

import PlayingCardsIcon from '@/icons/PlayingCards'
import {
  formatCurrency,
  formatPercent,
  getCurrentLegionYear,
  serverToCheckoutItem,
  serverToQoHGameItem,
} from '@/util/functions'

interface DashboardViewProps {
  qohGame?: QoH.Game.ServerItem
  kitchenStats?: Kitchen.Stats
  lastService?: Kitchen.Checkout.ServerItem
  pullTabStats?: PullTab.Stats
}
export default function DashboardView({
  qohGame: serverQohGame,
  kitchenStats,
  lastService: serverLastService,
  pullTabStats,
}: DashboardViewProps): React.JSX.Element {
  const theme = useTheme()
  const legionDates = getCurrentLegionYear()
  const isSmall = useMediaQuery(theme.breakpoints.down('md'))
  const [tabValue, setTabValue] = useState('kitchen')
  const qohGame = useMemo(() => {
    return serverQohGame ? serverToQoHGameItem(serverQohGame) : undefined
  }, [serverQohGame])
  const lastService = useMemo(() => {
    return serverLastService ? serverToCheckoutItem(serverLastService) : undefined
  }, [serverLastService])

  function handleTabChange(event: React.SyntheticEvent, newValue: string): void {
    setTabValue(newValue)
  }

  return (
    <TabContext value={tabValue}>
      <Box sx={{ width: '100%', bgcolor: 'background.paper' }}>
        <TabList
          onChange={handleTabChange}
          variant={isSmall ? 'fullWidth' : 'standard'}
          centered={!isSmall}
          sx={{ mb: 1 }}
        >
          <Tab icon={<KitchenIcon />} label='Kitchen' value='kitchen' />
          <Tab icon={<PullTabIcon />} label='Pull Tabs' value='pullTabs' />
          <Tab icon={<PlayingCardsIcon />} label='Queen' value='queen' />
        </TabList>
        <Alert severity='info'>
          <Typography>
            Data calculated from data between {legionDates.startDate.format('MMMM YYYY')} to{' '}
            {legionDates.endDate.format('MMMM YYYY')}
          </Typography>
        </Alert>
        <TabPanel value='kitchen' sx={{ p: 0 }}>
          <Paper sx={{ p: 1 }}>
            <Grid container spacing={1}>
              <Grid xs={12}>
                <Typography variant='h4'>Kitchen</Typography>
              </Grid>
              {kitchenStats ? (
                <Fragment>
                  <Grid xs={12} md={6} lg={3}>
                    <SingleValueDisplay
                      variant='outlined'
                      label='Net Profit'
                      value={formatCurrency(kitchenStats.netProfit)}
                    />
                  </Grid>
                  <Grid xs={12} md={6} lg={3}>
                    <SingleValueDisplay
                      variant='outlined'
                      label='Net Profit %'
                      value={formatPercent(kitchenStats.profitPercent)}
                    />
                  </Grid>
                  <Grid xs={12} md={6} lg={3}>
                    <SingleValueDisplay
                      variant='outlined'
                      label='Net Profit Margin'
                      value={formatPercent(kitchenStats.netProfitMargin)}
                    />
                  </Grid>
                  <Grid xs={12} md={6} lg={3}>
                    <SingleValueDisplay
                      variant='outlined'
                      label='Sales'
                      value={formatCurrency(kitchenStats.totalSales)}
                    />
                  </Grid>
                  <Grid xs={12} md={6} lg={3}>
                    <SingleValueDisplay
                      variant='outlined'
                      label='Costs'
                      value={formatCurrency(kitchenStats.totalCost)}
                    />
                  </Grid>
                  <Grid xs={12} md={6} lg={3}>
                    <SingleValueDisplay
                      variant='outlined'
                      label='Avg Sales'
                      value={formatCurrency(kitchenStats.totalSales / kitchenStats.totalServices)}
                    />
                  </Grid>
                  {lastService && (
                    <Grid xs={12} md={6} lg={3}>
                      <SingleValueDisplay
                        variant='outlined'
                        label='Last Service Sales'
                        value={formatCurrency(lastService.sales)}
                        growth={Math.round(lastService.salesChange * 100)}
                      />
                    </Grid>
                  )}
                </Fragment>
              ) : (
                <Grid xs={12}>
                  <Alert severity='info'>No kitchen stats found.</Alert>
                </Grid>
              )}
            </Grid>
          </Paper>
        </TabPanel>
        <TabPanel value='pullTabs' sx={{ p: 0 }}>
          <Paper sx={{ p: 1 }}>
            <Grid container spacing={1}>
              <Grid xs={12}>
                <Typography variant='h4'>Pull Tabs</Typography>
              </Grid>
              {pullTabStats ? (
                <Fragment>
                  <Grid xs={12} md={6} lg={3}>
                    <SingleValueDisplay
                      variant='outlined'
                      label='Bag'
                      value={formatCurrency(pullTabStats.bag)}
                    />
                  </Grid>
                  <Grid xs={12} md={6} lg={3}>
                    <SingleValueDisplay
                      variant='outlined'
                      label='Profit'
                      value={formatCurrency(pullTabStats.deposit - pullTabStats.cost)}
                    />
                  </Grid>
                  <Grid xs={12} md={6} lg={3}>
                    <SingleValueDisplay
                      variant='outlined'
                      label='Machine Revenue'
                      value={formatCurrency(pullTabStats.machine)}
                    />
                  </Grid>
                  <Grid xs={12} md={6} lg={3}>
                    <SingleValueDisplay
                      variant='outlined'
                      label='Winner Payouts'
                      value={formatCurrency(Math.abs(pullTabStats.payout))}
                    />
                  </Grid>
                  <Grid xs={12} md={6} lg={3}>
                    <SingleValueDisplay
                      variant='outlined'
                      label='Costs'
                      value={formatCurrency(pullTabStats.cost)}
                    />
                  </Grid>
                  <Grid xs={12} md={6} lg={3}>
                    <SingleValueDisplay
                      variant='outlined'
                      label='Deposits'
                      value={formatCurrency(pullTabStats.deposit)}
                    />
                  </Grid>
                </Fragment>
              ) : (
                <Grid xs={12}>
                  <Alert severity='info'>No kitchen stats found.</Alert>
                </Grid>
              )}
            </Grid>
          </Paper>
        </TabPanel>
        <TabPanel value='queen' sx={{ p: 0 }}>
          <Paper sx={{ p: 1 }}>
            <Grid container spacing={1}>
              <Grid xs={12}>
                <Typography variant='h4'>Queen of Hearts</Typography>
              </Grid>
              {qohGame ? (
                <Fragment>
                  <Grid xs={12} md={6} lg={3}>
                    <SingleValueDisplay
                      variant='outlined'
                      label='Display Jackpot'
                      value={formatCurrency(qohGame.totals.availableFund)}
                    />
                  </Grid>
                  <Grid xs={12} md={6} lg={3}>
                    <SingleValueDisplay
                      variant='outlined'
                      label='Takehome Jackpot'
                      value={formatCurrency(qohGame.totals.jackpot)}
                    />
                  </Grid>
                  <Grid xs={12} md={6} lg={3}>
                    <SingleValueDisplay
                      variant='outlined'
                      label='Profit'
                      value={formatCurrency(qohGame.totals.profit)}
                    />
                  </Grid>
                  {qohGame.createSeed && (
                    <Grid xs={12} md={6} lg={3}>
                      <SingleValueDisplay
                        variant='outlined'
                        label='Seed'
                        value={formatCurrency(qohGame.totals.seed)}
                      />
                    </Grid>
                  )}
                  {!!qohGame.entries[qohGame.entries.length - 1] && (
                    <Grid xs={12} md={6} lg={3}>
                      <SingleValueDisplay
                        label='Last Drawing Revenue'
                        value={formatCurrency(
                          qohGame.entries[qohGame.entries.length - 1].ticketSales,
                        )}
                        growth={Math.round(
                          qohGame.entries[qohGame.entries.length - 1].percentChange * 100,
                        )}
                        variant='outlined'
                      />
                    </Grid>
                  )}
                  <Grid xs={12} md={6} lg={3}>
                    <SingleValueDisplay
                      label='Cards Left'
                      value={
                        54 - qohGame.entries.filter((e) => e.shuffle === qohGame.shuffle).length
                      }
                      variant='outlined'
                    />
                  </Grid>
                </Fragment>
              ) : (
                <Grid xs={12}>
                  <Alert severity='info'>No active game found.</Alert>
                </Grid>
              )}
            </Grid>
          </Paper>
        </TabPanel>
      </Box>
    </TabContext>
  )
}
