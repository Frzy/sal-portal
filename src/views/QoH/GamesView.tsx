'use client'

import { useMemo } from 'react'

import {
  Alert,
  Button,
  Card,
  CardActions,
  CardContent,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material'
import Grid from '@mui/material/Unstable_Grid2/Grid2'

import { formatCurrency, serverToQoHGameItem } from '@/util/functions'

interface QohGamesViewProps {
  games: QoH.Game.ServerItem[]
}
export default function QohGamesView({ games: initGames }: QohGamesViewProps): React.JSX.Element {
  const games = useMemo(() => initGames.map(serverToQoHGameItem).reverse(), [initGames])

  return (
    <Stack spacing={1}>
      <Paper sx={{ p: 2 }}>
        <Stack spacing={1}>
          <Typography variant='h4'>Queen of Heart Games</Typography>
          {!games.length && (
            <Alert severity='info' sx={{ maxWidth: 575, alignSelf: 'center' }}>
              <Typography gutterBottom>
                No queen of hearts games found. Use the button below to create one.
              </Typography>

              <Button
                href={`/qoh/games/create?callbackUrl=${encodeURIComponent('/qoh/games')}`}
                fullWidth
              >
                Create Game
              </Button>
            </Alert>
          )}
        </Stack>
      </Paper>
      <Grid container spacing={1}>
        {games.map((g) => (
          <Grid key={g.id}>
            <Card>
              <CardContent sx={{ pb: 0 }}>
                <Typography align='center' sx={{ fontWeight: 'fontWeightBold', fontSize: 20 }}>
                  QoH {g.name}
                </Typography>
                {g.entries.length ? (
                  <Tooltip title='Total Jackpot'>
                    <Typography align='center' sx={{ fontWeight: 'fontWeightBold', fontSize: 36 }}>
                      {formatCurrency(g.entries[g.entries.length - 1].totals.availableFund)}
                    </Typography>
                  </Tooltip>
                ) : (
                  <Typography align='center' sx={{ fontWeight: 'fontWeightBold', fontSize: 36 }}>
                    --
                  </Typography>
                )}
              </CardContent>
              <CardActions>
                <Button href={`/qoh/game/${g.id}`}>Details</Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Stack>
  )
}
