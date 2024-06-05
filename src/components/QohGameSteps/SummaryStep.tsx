import { Alert, Stack, Typography } from '@mui/material'
import Grid from '@mui/material/Unstable_Grid2/Grid2'

import { formatCurrency } from '@/util/functions'

interface SummaryStepProps {
  game: QoH.Game.UiPayload
  hideTopText?: boolean
}
export default function SummaryStep({ game, hideTopText }: SummaryStepProps): React.JSX.Element {
  return (
    <Stack spacing={2}>
      {!hideTopText && <Typography>Please make sure the information below is correct.</Typography>}
      <Alert severity='info'>
        Note that the seed and jackpot are calculated values off of the total sales. Adjusting games
        rules will lead to different totals.
      </Alert>
      <Grid container spacing={2}>
        <Grid xs={12} md={6} lg={4}>
          Starting date: {game.startDate.format('MMM DD, YYYY')}
        </Grid>
        <Grid xs={12} md={6} lg={4}>
          Jackpot percent: {game.jackpotPercent * 100}%
        </Grid>
        <Grid xs={12} md={6} lg={4}>
          Starting jackpot: {formatCurrency(game.initialJackpot)}
        </Grid>
        <Grid xs={12} md={6} lg={4}>
          Ticket price: {formatCurrency(game.ticketPrice)}
        </Grid>
        <Grid xs={12} md={6} lg={4}>
          Two Joker Reset: {`${game.resetOnTwoJokers}`.toUpperCase()}
        </Grid>
        {game.resetOnTwoJokers && (
          <Grid xs={12} md={6} lg={4}>
            Max # of resets: {game.maxGameReset ? game.maxGameReset : 'Unlimited'}
          </Grid>
        )}
        <Grid xs={12} md={6} lg={4}>
          Start seed for next game: {`${game.createSeed}`.toUpperCase()}
        </Grid>
        {game.createSeed && (
          <Grid xs={12} md={6} lg={4}>
            Seed percent: {game.seedPercent * 100}%
          </Grid>
        )}
        {game.createSeed && (
          <Grid xs={12} md={6} lg={4}>
            Seed total limit: {game.maxSeed ? formatCurrency(game.maxSeed) : 'Unlimited'}
          </Grid>
        )}
      </Grid>
    </Stack>
  )
}
