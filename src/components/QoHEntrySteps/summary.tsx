import { useMemo, useState } from 'react'

import NumberInput from '@c/NumberInput'
import SingleValueDisplay from '@c/SingleValueDisplay'
import CloseIcon from '@mui/icons-material/Close'
import PercentIcon from '@mui/icons-material/Percent'
import {
  Alert,
  AlertTitle,
  Box,
  Divider,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  Paper,
  Stack,
  Typography,
} from '@mui/material'
import Grid from '@mui/material/Unstable_Grid2/Grid2'

import { formatCurrency } from '@/util/functions'

interface CreateEntrySummaryStepProps {
  game: QoH.Game.Item
  payload: QoH.Entry.UiPayload
  breakdown: QoH.Game.Item['totals']
  disabled?: boolean
}
export default function CreateEntrySummaryStep({
  game,
  payload,
  breakdown,
  disabled,
}: CreateEntrySummaryStepProps): React.JSX.Element {
  const lastEntry = game.entries.length ? game.entries[game.entries.length - 1] : null
  const newJackpot = game.totals.availableFund + breakdown.availableFund
  const [jackpotPayoutPercent, setJackpotPayoutPercent] = useState(100)
  const resetBoard = useMemo(() => {
    if (game.resetOnTwoJokers && payload.cardDrawn.includes('X')) {
      return game.entries.some((e) => e.shuffle === game.shuffle && e.cardDrawn?.value === 'X')
    }

    return false
  }, [game, payload])
  const queenFound = payload.cardDrawn === 'Q_hearts'

  return (
    <Stack spacing={2}>
      <Grid container spacing={2}>
        <Grid xs={12} md={6}>
          <SingleValueDisplay
            label='Public Jackpot'
            value={formatCurrency(newJackpot)}
            variant='outlined'
            growth={
              game.totals.availableFund
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
        <Grid xs={12} md={6}>
          <SingleValueDisplay
            variant='outlined'
            label='Take-home Jackpot'
            value={formatCurrency(
              Math.ceil((game.totals.jackpot + breakdown.jackpot) * (jackpotPayoutPercent / 100)),
            )}
            valueProps={{
              sx: { fontSize: 48 },
            }}
            labelProps={{
              component: 'h2',
              variant: 'h5',
            }}
          />
        </Grid>
        {resetBoard && (
          <Grid xs={12}>
            <Alert severity='info'>
              <AlertTitle>Board Reset</AlertTitle>
              <Typography>
                Based on the game rules and jokers drawn this shuffle, the board will reset for the
                next drawing.
              </Typography>
            </Alert>
          </Grid>
        )}
        {queenFound && (
          <Grid xs={12}>
            <Alert severity='info'>
              <AlertTitle>Queen of Hearts Found</AlertTitle>
              <Typography gutterBottom>
                The Queen of Hearts has been found. The game has a takehome jackpot of{' '}
                <Typography component='span' fontWeight='fontWeightBold'>
                  {formatCurrency(game.totals.jackpot + breakdown.jackpot)}
                </Typography>
                .
              </Typography>
              <Typography gutterBottom>
                In certain circumstances, based on the rules, the winner is entitled to only a
                certain percentage of the takehome jackpot.
              </Typography>
              <Typography>
                Please indicate below to the percent of the takehome jackpot the contestant won.
              </Typography>
            </Alert>
          </Grid>
        )}
        {queenFound && (
          <Grid xs={12}>
            <NumberInput
              disabled={disabled}
              value={jackpotPayoutPercent}
              onChange={(event) => {
                const { value } = event.target

                setJackpotPayoutPercent(
                  typeof value === 'number' ? Math.min(Math.max(0, value), 100) : 0,
                )
              }}
              label='Jackpot Payout Percent'
              precision={0}
              fullWidth
              InputProps={{
                endAdornment: (
                  <InputAdornment position='end'>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                      <PercentIcon color={disabled ? 'disabled' : undefined} />
                      <IconButton
                        disabled={disabled}
                        onClick={() => {
                          setJackpotPayoutPercent(0)
                        }}
                      >
                        <CloseIcon />
                      </IconButton>
                    </Box>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
        )}
      </Grid>
      <Typography component='h1' variant='h5' sx={{ px: 1 }}>
        Sales Breadown
      </Typography>
      <Box sx={{ px: 1 }}>
        <Paper variant='outlined'>
          <List disablePadding>
            <ListItem sx={{ pl: 0 }}>
              <Typography
                component='span'
                sx={{ flexGrow: 1, fontSize: '1.2rem', pl: { xs: '48px', sm: '64px' } }}
              >
                Ticket Sales
              </Typography>
              <Typography
                component='span'
                sx={{
                  fontFamily: 'monospace',
                  textAlign: 'right',
                  minWidth: 70,
                  color: 'text.secondary',
                  fontSize: '1.2rem',
                  fontWeight: 'fontWeightBold',
                }}
              >
                {formatCurrency(payload.ticketSales)}
              </Typography>
            </ListItem>
            <ListItem sx={{ pl: 0 }}>
              <Typography
                component='span'
                sx={{ flexGrow: 1, fontSize: '1.2rem', pl: { xs: '48px', sm: '64px' } }}
              >
                Payouts
              </Typography>
              <Typography
                component='span'
                color='error.main'
                sx={{
                  fontFamily: 'monospace',
                  textAlign: 'right',
                  minWidth: 70,
                  fontSize: '1.2rem',
                  fontWeight: 'fontWeightBold',
                }}
              >
                {formatCurrency(-1 * payload.payout)}
              </Typography>
            </ListItem>
            {game.createSeed && !!breakdown.seed && (
              <ListItem sx={{ pl: 0 }}>
                <Typography
                  component='span'
                  sx={{ flexGrow: 1, fontSize: '1.2rem', pl: { xs: '48px', sm: '64px' } }}
                >
                  Seed @ {Math.round(game.seedPercent * 100)}%
                </Typography>
                <Typography
                  component='span'
                  color='error.main'
                  sx={{
                    fontFamily: 'monospace',
                    textAlign: 'right',
                    minWidth: 70,
                    fontSize: '1.2rem',
                    fontWeight: 'fontWeightBold',
                  }}
                >
                  {formatCurrency(-1 * breakdown.seed)}
                </Typography>
              </ListItem>
            )}
            <Divider />
            <ListItem sx={{ pl: 0 }}>
              <Typography
                component='span'
                sx={{ flexGrow: 1, fontSize: '1.2rem', pl: { xs: '48px', sm: '64px' } }}
              >
                Available Funds
              </Typography>
              <Typography
                component='span'
                sx={{
                  fontFamily: 'monospace',
                  textAlign: 'right',
                  minWidth: 70,
                  fontSize: '1.2rem',
                  fontWeight: 'fontWeightBold',
                }}
              >
                {formatCurrency(breakdown.availableFund)}
              </Typography>
            </ListItem>
            <Divider />
            <ListItem sx={{ pl: 0 }}>
              <Typography
                component='span'
                sx={{ flexGrow: 1, fontSize: '1.2rem', pl: { xs: '48px', sm: '64px' } }}
              >
                Jackpot @ {Math.round(game.jackpotPercent * 100)}%
              </Typography>
              <Typography
                component='span'
                color='success.main'
                sx={{
                  fontFamily: 'monospace',
                  textAlign: 'right',
                  minWidth: 70,
                  fontSize: '1.2rem',
                  fontWeight: 'fontWeightBold',
                }}
              >
                {formatCurrency(breakdown.jackpot)}
              </Typography>
            </ListItem>
            <ListItem sx={{ pl: 0 }}>
              <Typography
                component='span'
                sx={{ flexGrow: 1, fontSize: '1.2rem', pl: { xs: '48px', sm: '64px' } }}
              >
                Profit @ {Math.round((1 - game.jackpotPercent) * 100)}%
              </Typography>
              <Typography
                component='span'
                color='success.main'
                sx={{
                  fontFamily: 'monospace',
                  textAlign: 'right',
                  minWidth: 70,
                  fontSize: '1.2rem',
                  fontWeight: 'fontWeightBold',
                }}
              >
                {formatCurrency(breakdown.profit)}
              </Typography>
            </ListItem>
          </List>
        </Paper>
      </Box>
      <Typography component='h1' variant='h5' sx={{ px: 1 }}>
        Breakdown
      </Typography>
      <Grid container spacing={1} sx={{ px: 0.5 }}>
        <Grid xs={12} md={6} lg={game.createSeed ? 3 : 4}>
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
        <Grid xs={12} md={6} lg={game.createSeed ? 3 : 4}>
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
          <Grid xs={12} md={6} lg={game.createSeed ? 3 : 4}>
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
        {game.createSeed && (
          <Grid xs={12} md={6} lg={game.createSeed ? 3 : 4}>
            <SingleValueDisplay
              label='Payouts'
              value={formatCurrency(breakdown.payout)}
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
        )}
        {queenFound && (
          <Grid xs={12}>
            <Alert severity='warning'>This will end the current game ({game.name})</Alert>
          </Grid>
        )}
      </Grid>
    </Stack>
  )
}
