import UnauthorizedAlert from '@c/UnauthorizedAlert'
import { Alert, AlertTitle, Box, Button, Stack, Typography } from '@mui/material'

import { findQohGame } from '@/lib/qohGames'
import { getServerAuthSession } from '@/util/auth'
import QohGameDetailsView from '@/views/QoH/GameDetails'

export default async function QohDetailPage(): Promise<React.JSX.Element> {
  const session = await getServerAuthSession()

  if (!session?.user) return <UnauthorizedAlert />

  const game = await findQohGame((g) => !g.endDate)

  if (!game)
    return (
      <Box sx={{ maxWidth: 750, mx: 'auto' }}>
        <Alert severity='warning'>
          <AlertTitle>No Game Found</AlertTitle>
          <Stack spacing={2}>
            <Typography>
              No Active Queen of Heart game found. Click the button below to create one.
            </Typography>
            <Button href='/qoh/game/create'>Create QoH Game</Button>
          </Stack>
        </Alert>
      </Box>
    )

  return <QohGameDetailsView title={'Current Game'} game={game} />
}
