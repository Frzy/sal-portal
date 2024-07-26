'use client'

import { useMemo } from 'react'

import CardSelect from '@c/CardSelect'
import NumberInput, { type HTMLNumericElement } from '@c/NumberInput'
import SingleValueDisplay from '@c/SingleValueDisplay'
import MoneyIcon from '@mui/icons-material/AttachMoney'
import { InputAdornment, Stack, Typography } from '@mui/material'
import Grid from '@mui/material/Unstable_Grid2/Grid2'

import { formatCurrency, getGamesDisabledCards } from '@/util/functions'

interface CreateEntryDrawingStepProps {
  game: QoH.Game.Item
  payload: QoH.Entry.UiPayload
  breakdown: QoH.Game.Item['totals']
  onChange: (payout: Partial<QoH.Entry.UiPayload>) => void
}
export default function CreateEntryDrawingStep({
  game,
  payload,
  breakdown,
  onChange,
}: CreateEntryDrawingStepProps): React.JSX.Element {
  const disabledCards = useMemo(() => {
    return getGamesDisabledCards(game).map((c) => c.id)
  }, [game])
  const newJackpot = game.totals.availableFund + breakdown.availableFund
  const lastEntry = game.entries.length ? game.entries[game.entries.length - 1] : null
  const positionError = payload.cardPosition
    ? payload.cardPosition > 54 ||
      game.entries.some(
        (e) => e.cardPosition === payload.cardPosition && e.shuffle === payload.shuffle,
      )
    : false

  function handleNumericChange(event: React.ChangeEvent<HTMLNumericElement>): void {
    const name = event.target.name
    const value = event.target.value

    if (name) onChange({ [name]: typeof value === 'number' ? value : 0 })
  }
  function handleCardDrawnChange(cardId: string): void {
    onChange({ cardDrawn: cardId })
  }

  return (
    <Stack spacing={2}>
      <Grid container spacing={2}>
        <Grid xs={12}>
          <SingleValueDisplay
            label='Jackpot'
            value={formatCurrency(newJackpot)}
            growth={
              game.totals.availableFund
                ? Math.round(
                    ((newJackpot - game.totals.availableFund) / game.totals.availableFund) * 100,
                  )
                : undefined
            }
            variant='outlined'
            valueProps={{
              sx: { fontSize: 48 },
            }}
            labelProps={{
              component: 'h2',
              variant: 'h5',
            }}
          />
        </Grid>
        <Grid xs={12} sm={6}>
          <CardSelect
            label='Drawn Card'
            disabledCards={disabledCards}
            onChange={handleCardDrawnChange}
            value={payload.cardDrawn}
            sx={{
              '& .MuiInputLabel-root:not(.MuiInputLabel-shrink)': {
                transform: 'translate(14px, 20px) scale(1.5)',
              },
            }}
            selectProps={{
              sx: {
                minHeight: 79,
              },
            }}
            cardSize={48}
            fontSize={32}
            fullWidth
          />
        </Grid>
        <Grid xs={12} sm={6}>
          <NumberInput
            label='Card Position'
            value={payload.cardPosition === 0 ? '' : payload.cardPosition}
            name='cardPosition'
            error={positionError}
            helperText={
              positionError && payload.cardPosition > 54
                ? 'Can not be greater than 54'
                : positionError
                  ? `Position ${payload.cardPosition} has already been taken.`
                  : undefined
            }
            precision={0}
            onChange={handleNumericChange}
            sx={{
              '& .MuiInputLabel-root:not(.MuiInputLabel-shrink)': {
                transform: 'translate(14px, 20px) scale(1.5)',
              },
              '& .MuiInputBase-input': { fontSize: 32 },
            }}
            fullWidth
          />
        </Grid>
        <Grid xs={12}>
          <NumberInput
            label='Payouts'
            value={payload.payout}
            name='payout'
            precision={0}
            onChange={handleNumericChange}
            sx={{ '& .MuiInputBase-input': { fontSize: 32 } }}
            fullWidth
            helperText='This is includes any additional payouts given out besides for the card drawn (do not include the jackpot)'
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
              lastEntry && !!lastEntry.jackpot
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
              lastEntry && !!lastEntry.profit
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
                lastEntry && !!lastEntry.seed
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
