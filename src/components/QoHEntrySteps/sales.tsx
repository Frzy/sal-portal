'use client'

import NumberInput, { type HTMLNumericElement } from '@c/NumberInput'
import SingleValueDisplay from '@c/SingleValueDisplay'
import MoneyIcon from '@mui/icons-material/AttachMoney'
import { InputAdornment, Stack, Typography } from '@mui/material'
import Grid from '@mui/material/Unstable_Grid2/Grid2'

import { formatCurrency } from '@/util/functions'

interface CreateEntrySalesStepProps {
  game: QoH.Game.Item
  sales: number
  breakdown: QoH.Game.Item['totals']
  onChange: (sales: number) => void
}
export default function CreateEntrySalesStep({
  game,
  sales,
  breakdown,
  onChange,
}: CreateEntrySalesStepProps): React.JSX.Element {
  const newJackpot = game.totals.availableFund + breakdown.availableFund
  const lastEntry = game.entries.length ? game.entries[game.entries.length - 1] : null

  function handleSalesChange(event: React.ChangeEvent<HTMLNumericElement>): void {
    const { value } = event.target

    onChange(typeof value === 'number' ? value : 0)
  }

  return (
    <Stack spacing={2}>
      <Grid container spacing={2}>
        <Grid xs={12}>
          <SingleValueDisplay
            label='Jackpot'
            value={formatCurrency(newJackpot)}
            variant='outlined'
            growth={
              !!sales && game.totals.availableFund
                ? Math.round(
                    ((newJackpot - game.totals.availableFund) / game.totals.availableFund) * 100,
                  )
                : undefined
            }
            valueProps={{
              sx: { fontSize: 48 },
            }}
            labelProps={{
              component: 'h2',
              variant: 'h5',
            }}
          />
        </Grid>
        <Grid xs={12}>
          <NumberInput
            label='Ticket Sales'
            value={sales}
            precision={0}
            onChange={handleSalesChange}
            sx={{ '& .MuiInputBase-input': { fontSize: 32 } }}
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <MoneyIcon sx={{ fontSize: 32 }} />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
      </Grid>
      <Typography component='h1' variant='h5'>
        Breakdown
      </Typography>
      <Grid container spacing={1}>
        <Grid xs={12} md={6} lg={game.createSeed ? 4 : 6}>
          <SingleValueDisplay
            label='To Jackpot'
            value={formatCurrency(breakdown.jackpot)}
            variant='outlined'
            growth={
              !!sales && lastEntry && !!lastEntry.jackpot
                ? Math.round(((breakdown.jackpot - lastEntry.jackpot) / lastEntry.jackpot) * 100)
                : undefined
            }
            valueProps={{
              sx: { fontSize: 48 },
            }}
            labelProps={{
              component: 'h2',
              variant: 'h5',
            }}
          />
        </Grid>
        <Grid xs={12} md={6} lg={game.createSeed ? 4 : 6}>
          <SingleValueDisplay
            label='To Profit'
            value={formatCurrency(breakdown.profit)}
            variant='outlined'
            growth={
              !!sales && lastEntry && !!lastEntry.profit
                ? Math.round(((breakdown.profit - lastEntry.profit) / lastEntry.profit) * 100)
                : undefined
            }
            valueProps={{
              sx: { fontSize: 48 },
            }}
            labelProps={{
              component: 'h2',
              variant: 'h5',
            }}
          />
        </Grid>
        {game.createSeed && (
          <Grid xs={12} md={6} lg={game.createSeed ? 4 : 6}>
            <SingleValueDisplay
              label='To Seed'
              value={formatCurrency(breakdown.seed)}
              variant='outlined'
              growth={
                !!sales && lastEntry && !!lastEntry.seed
                  ? Math.round(((breakdown.seed - lastEntry.seed) / lastEntry.seed) * 100)
                  : undefined
              }
              valueProps={{
                sx: { fontSize: 48 },
              }}
              labelProps={{
                component: 'h2',
                variant: 'h5',
              }}
            />
          </Grid>
        )}
      </Grid>
    </Stack>
  )
}
