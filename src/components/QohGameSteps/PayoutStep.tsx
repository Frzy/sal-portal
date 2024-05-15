import NumberInput, { type HTMLNumericElement } from '@c/NumberInput'
import PercentIcon from '@mui/icons-material/Percent'
import { Alert, AlertTitle, InputAdornment, Stack, Typography } from '@mui/material'
import Grid from '@mui/material/Unstable_Grid2/Grid2'

import { formatCurrency } from '@/util/functions'

interface PayoutsStepProps {
  game: QoH.Game.UiPayload
  onChange: (partialPayload: Partial<QoH.Game.UiPayload>) => void
}
export default function PayoutsStep({ game, onChange }: PayoutsStepProps): React.JSX.Element {
  function handleNumberChange(event: React.ChangeEvent<HTMLNumericElement>): void {
    const { value, name } = event.target

    if (name) {
      onChange({ [name]: typeof value === 'number' ? Math.min(Math.max(value / 100, 0), 100) : 0 })
    }
  }

  return (
    <Stack spacing={2}>
      {game.createSeed ? (
        <Typography>Set up how the jackpot will be calculated from the total revenue.</Typography>
      ) : (
        <Typography>
          Set up the seed percent as well as the how the jackpot will be calculated from the total
          revenue.
        </Typography>
      )}
      <Alert severity='info'>
        <AlertTitle>How Calculating Payouts Works</AlertTitle>

        <Typography>
          Each drawing the ticket sales minus any payouts will be the drawing&apos;s revenue.
        </Typography>
        <Typography fontFamily='monospace' gutterBottom>
          &gt; DrawingRevenue = TicketSales - payouts
        </Typography>
        <Typography>
          When generating a seed the Drawing&apos;s Revenue is multiplied by the seed percent to get
          the seed payout.
        </Typography>
        <Typography fontFamily='monospace'>
          &gt; SeedPayout = DrawingRevenue * SeedPercent
        </Typography>
        <Typography>This seed payout will be added to the total seed.</Typography>
        <Typography fontFamily='monospace'>
          &gt; TotalSeed = PreviousTotalSeed + SeedPayout
        </Typography>
        <Typography gutterBottom>
          If the total seed is above the threshold of a {formatCurrency(game.maxSeed)}. The seed
          payout will be zero.
        </Typography>
        <Typography>
          The games revenue would increase by the drawings revenue minus the seed payout.
        </Typography>
        <Typography fontFamily='monospace'>
          &gt; GamesRevenue = PrevGamesRevenue + DrawingRevenue - SeedPayout
        </Typography>
      </Alert>
      <Grid container spacing={2}>
        <Grid xs={12} md={6}>
          <NumberInput
            name='jackpotPercent'
            precision={0}
            value={game.jackpotPercent * 100}
            onChange={handleNumberChange}
            label='Jackpot Percent'
            fullWidth
            InputProps={{
              endAdornment: (
                <InputAdornment position='end'>
                  <PercentIcon />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        {game.createSeed}
        <Grid xs={12} md={6}>
          <NumberInput
            name='seedPercent'
            precision={0}
            value={game.seedPercent * 100}
            onChange={handleNumberChange}
            label='Seed Percent'
            fullWidth
            InputProps={{
              endAdornment: (
                <InputAdornment position='end'>
                  <PercentIcon />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
      </Grid>
    </Stack>
  )
}
