'use client'

import { Fragment, useMemo, useState } from 'react'

import QohEntryList from '@c/QohEntryList'
import SingleValueDisplay from '@c/SingleValueDisplay'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import EditNoteIcon from '@mui/icons-material/EditNote'
import InfoIcon from '@mui/icons-material/InfoOutlined'
import ListIcon from '@mui/icons-material/List'
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd'
import PlaylistRemoveIcon from '@mui/icons-material/PlaylistRemove'
import SettingsIcon from '@mui/icons-material/Settings'
import { TabContext, TabList, TabPanel } from '@mui/lab'
import {
  Alert,
  Backdrop,
  Box,
  Button,
  Divider,
  FormControlLabel,
  Paper,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Switch,
  Tab,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import Grid from '@mui/material/Unstable_Grid2/Grid2'
import dayjs from 'dayjs'

import { DATE_FORMAT } from '@/util/constants'
import { formatCurrency, serverToQoHGameItem } from '@/util/functions'

const actions = [
  { icon: <EditIcon />, name: 'Edit Game' },
  { icon: <DeleteIcon />, name: 'Delete Game' },
  { icon: <PlaylistAddIcon />, name: 'Add Entry' },
  { icon: <EditNoteIcon />, name: 'Edit Entry' },
  { icon: <PlaylistRemoveIcon />, name: 'Delete Entry' },
]

interface QohGameDetailsProps {
  game: QoH.Game.ServerItem
}
export default function QohGameDetailsView({
  game: serverGame,
}: QohGameDetailsProps): React.JSX.Element {
  const theme = useTheme()
  const isSmall = useMediaQuery(theme.breakpoints.down('md'))
  const [showDetails, setShowDetails] = useState(false)
  const [showTotals, setShowTotals] = useState(false)
  const [tabIndex, setTabIndex] = useState('1')
  const game = useMemo(() => serverToQoHGameItem(serverGame), [serverGame])
  const now = dayjs()
  const endDate = game?.endDate ?? now
  const [fabOpen, setFabOpen] = useState(false)
  function handleOpen(): void {
    setFabOpen(true)
  }
  function handleClose(): void {
    setFabOpen(false)
  }

  function handleChange(event: React.SyntheticEvent, newValue: string): void {
    setTabIndex(newValue)
  }

  return (
    <Paper sx={{ p: 1, mb: '64px' }}>
      <Box sx={{ display: 'flex' }}>
        <Typography variant='h3' sx={{ flexGrow: 1 }}>
          {game.name}
        </Typography>
        <Button>Edit</Button>
      </Box>
      <Divider sx={{ my: 1 }} />
      <Grid container spacing={1}>
        <Grid xs={12} md={4}>
          <SingleValueDisplay
            label='Display Jackpot'
            value={
              game.isOldGame
                ? formatCurrency(game.totals.jackpot)
                : formatCurrency(game.totals.availableFund)
            }
            variant='outlined'
          />
        </Grid>
        <Grid xs={12} md={4}>
          <SingleValueDisplay
            label='Cards Left'
            value={54 - game.entries.length}
            variant='outlined'
          />
        </Grid>
        <Grid xs={12} md={4}>
          <SingleValueDisplay
            label='Duration'
            value={`${endDate.diff(game.startDate, 'weeks') + 1} weeks`}
            variant='outlined'
          />
        </Grid>
      </Grid>

      <TabContext value={tabIndex}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 1 }}>
          <TabList
            onChange={handleChange}
            variant={isSmall ? 'fullWidth' : 'standard'}
            centered={!isSmall}
            aria-label='queen of hearts details'
          >
            <Tab icon={<InfoIcon />} label='Detials' value='1' />
            <Tab icon={<ListIcon />} label='Entries' value='2' />
          </TabList>
        </Box>

        <Fragment>
          <TabPanel value='1' sx={{ p: 0 }}>
            <Grid container spacing={1}>
              <Grid xs={12} md={4}>
                <SingleValueDisplay
                  label='Started'
                  value={game.startDate.format(DATE_FORMAT)}
                  variant='outlined'
                  valueProps={{
                    variant: 'h5',
                  }}
                  labelProps={{
                    variant: 'body1',
                  }}
                />
              </Grid>
              {game.endDate && (
                <Grid xs={12} md={4}>
                  <SingleValueDisplay
                    label='Ended'
                    value={game.endDate.format(DATE_FORMAT)}
                    variant='outlined'
                    valueProps={{
                      variant: 'h5',
                    }}
                    labelProps={{
                      variant: 'body1',
                    }}
                  />
                </Grid>
              )}
              <Grid xs={12} md={4}>
                <SingleValueDisplay
                  label='Sales'
                  value={formatCurrency(game.totals.sales)}
                  variant='outlined'
                  valueProps={{
                    variant: 'h5',
                  }}
                  labelProps={{
                    variant: 'body1',
                  }}
                />
              </Grid>
              <Grid xs={12} md={4}>
                <SingleValueDisplay
                  label='Avg Sales'
                  value={formatCurrency(Math.round(game.totals.sales / game.entries.length))}
                  variant='outlined'
                  valueProps={{
                    variant: 'h5',
                  }}
                  labelProps={{
                    variant: 'body1',
                  }}
                />
              </Grid>
              {game.isOldGame ? (
                <Grid xs={12} md={4}>
                  <SingleValueDisplay
                    label='Jackpot'
                    value={formatCurrency(game.totals.jackpot)}
                    variant='outlined'
                    valueProps={{
                      variant: 'h5',
                    }}
                    labelProps={{
                      variant: 'body1',
                    }}
                  />
                </Grid>
              ) : (
                <Fragment>
                  <Grid xs={12} md={4}>
                    <SingleValueDisplay
                      label='Displayed Jackpot'
                      value={formatCurrency(game.totals.availableFund)}
                      variant='outlined'
                      valueProps={{
                        variant: 'h5',
                      }}
                      labelProps={{
                        variant: 'body1',
                      }}
                    />
                  </Grid>
                  <Grid xs={12} md={4}>
                    <SingleValueDisplay
                      label={`Takehome Jackpot`}
                      value={formatCurrency(game.totals.jackpot)}
                      variant='outlined'
                      valueProps={{
                        variant: 'h5',
                      }}
                      labelProps={{
                        variant: 'body1',
                      }}
                    />
                  </Grid>
                </Fragment>
              )}
              <Grid xs={12} md={4}>
                <SingleValueDisplay
                  label='Profit'
                  value={formatCurrency(game.totals.profit)}
                  variant='outlined'
                  valueProps={{
                    variant: 'h5',
                  }}
                  labelProps={{
                    variant: 'body1',
                  }}
                />
              </Grid>
              {game.createSeed && (
                <Grid xs={12} md={4}>
                  <SingleValueDisplay
                    label='Seed'
                    value={formatCurrency(game.totals.seed)}
                    variant='outlined'
                    valueProps={{
                      variant: 'h5',
                    }}
                    labelProps={{
                      variant: 'body1',
                    }}
                  />
                </Grid>
              )}
              <Grid xs={12} md={4}>
                <SingleValueDisplay
                  label='Payouts'
                  value={formatCurrency(game.totals.payout)}
                  variant='outlined'
                  valueProps={{
                    variant: 'h5',
                  }}
                  labelProps={{
                    variant: 'body1',
                  }}
                />
              </Grid>
            </Grid>
          </TabPanel>
          <TabPanel value='2' sx={{ p: 0 }}>
            {game.entries.length ? (
              <Box>
                <QohEntryList game={game} hideDetails={!showDetails} hideTotals={!showTotals} />
                <Box>
                  <FormControlLabel
                    control={<Switch checked={showDetails} />}
                    label='Show Payout Details'
                    onChange={(event, checked) => {
                      setShowDetails(checked)
                    }}
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={showTotals}
                        onChange={(event, checked) => {
                          setShowTotals(checked)
                        }}
                      />
                    }
                    label='Show Running Totals'
                  />
                </Box>
              </Box>
            ) : (
              // <h1>hello</h1>
              <Alert>
                <Typography>No Entries have been created for this game</Typography>
              </Alert>
            )}
          </TabPanel>
        </Fragment>
      </TabContext>
      <Backdrop open={fabOpen} />
      <SpeedDial
        ariaLabel='SpeedDial tooltip example'
        sx={{ position: 'fixed', bottom: 8, right: 16 }}
        icon={<SpeedDialIcon icon={<SettingsIcon />} />}
        onClose={handleClose}
        onOpen={handleOpen}
        open={fabOpen}
      >
        {actions.map((action) => (
          <SpeedDialAction
            sx={{ '& .MuiSpeedDialAction-staticTooltipLabel': { whiteSpace: 'nowrap' } }}
            key={action.name}
            icon={action.icon}
            tooltipTitle={action.name}
            tooltipOpen
            onClick={handleClose}
          />
        ))}
      </SpeedDial>
    </Paper>
  )
}
