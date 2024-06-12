'use client'

import { Fragment, useEffect, useMemo, useRef, useState } from 'react'

import { type EnhancedListRef } from '@c/ListComponents/EnhancedList'
import { QohEntryDialog } from '@c/QoHEntryDialog'
import { QohGameDialog } from '@c/QoHGameDialog'
import QohEntryList from '@c/QohEntryList'
import SummaryStep from '@c/QohGameSteps/SummaryStep'
import SingleValueDisplay from '@c/SingleValueDisplay'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import EditNoteIcon from '@mui/icons-material/EditNote'
import GavelIcon from '@mui/icons-material/Gavel'
import InfoIcon from '@mui/icons-material/InfoOutlined'
import ListIcon from '@mui/icons-material/List'
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd'
import PlaylistRemoveIcon from '@mui/icons-material/PlaylistRemove'
import { TabContext, TabList, TabPanel } from '@mui/lab'
import {
  AppBar,
  Backdrop,
  Box,
  Button,
  LinearProgress,
  Paper,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Tab,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import Grid from '@mui/material/Unstable_Grid2/Grid2'
import dayjs from 'dayjs'
import { useRouter } from 'next/navigation'

import { DATE_FORMAT, DIALOG_TYPES } from '@/util/constants'
import { formatCurrency, serverToQoHGameItem } from '@/util/functions'
import { getQohGameById } from '@/util/requests'

const FAB_ACTIONS = [
  { id: 'editGame', icon: <EditIcon />, name: 'Edit Game' },
  { id: 'deleteGame', icon: <DeleteIcon />, name: 'Delete Game' },
  { id: 'addEntry', icon: <PlaylistAddIcon />, name: 'Add Entry' },
  { id: 'editEntry', icon: <EditNoteIcon />, name: 'Edit Entry' },
  { id: 'deleteEntry', icon: <PlaylistRemoveIcon />, name: 'Delete Entry' },
  { id: 'deleteEntry', icon: <PlaylistRemoveIcon />, name: 'Delete Entries' },
]

interface QohGameDetailsProps {
  game: QoH.Game.ServerItem
  title?: string
}
export default function QohGameDetailsView({
  game: serverGame,
  title,
}: QohGameDetailsProps): React.JSX.Element {
  const theme = useTheme()
  const router = useRouter()
  const isSmall = useMediaQuery(theme.breakpoints.down('md'))
  const [revalidate, setRevalidate] = useState(false)
  const [tabIndex, setTabIndex] = useState('1')
  const listRef = useRef<EnhancedListRef | null>(null)
  const [game, setGame] = useState(serverToQoHGameItem(serverGame))
  const rules = useMemo(() => {
    const { entries, ...rules } = game

    return rules
  }, [game])
  const now = dayjs()
  const endDate = game?.endDate ?? now
  const [gameCrudAction, setGameCrudAction] = useState(DIALOG_TYPES.VIEW)
  const [fabOpen, setFabOpen] = useState(false)
  const [entryCrudAction, setEntryCrudAction] = useState<DialogProperties<QoH.Entry.GameItem>>({
    type: DIALOG_TYPES.VIEW,
  })
  const [selectedEntries, setSelectedEntries] = useState<QoH.Entry.GameItem[]>([])
  const fabActions = useMemo(() => {
    const actions = []

    if (!selectedEntries.length && game.isActive) actions.push(FAB_ACTIONS[2])
    if (selectedEntries.length === 1) actions.push(FAB_ACTIONS[3], FAB_ACTIONS[4])
    if (selectedEntries.length >= 2) actions.push(FAB_ACTIONS[5])

    return [...actions, ...FAB_ACTIONS.slice(0, 2)]
  }, [selectedEntries, game])

  function handleOpen(): void {
    setFabOpen(true)
  }
  function handleClose(): void {
    setFabOpen(false)
  }
  function handleFabActionClick(type: string): () => void {
    return () => {
      handleClose()
      switch (type) {
        case 'editGame':
          handleGameEdit()
          break
        case 'deleteGame':
          handleGameDelete()
          break
        case 'addEntry':
          break
        case 'editEntry':
          setEntryCrudAction({ type: DIALOG_TYPES.EDIT, items: selectedEntries })
          break
        case 'deleteEntry':
          setEntryCrudAction({ type: DIALOG_TYPES.DELETE, items: selectedEntries })
          break
      }
    }
  }

  function handleGameEdit(): void {
    setGameCrudAction(DIALOG_TYPES.EDIT)
  }
  function handleGameDelete(): void {
    setGameCrudAction(DIALOG_TYPES.DELETE)
  }

  function handleDeleted(): void {
    router.push('/qoh/games')
  }
  function handleEdited(editedItem: QoH.Game.Item): void {
    setGame(editedItem)
  }
  function handleDialogClose(): void {
    setGameCrudAction(DIALOG_TYPES.VIEW)
  }

  function handleChange(event: React.SyntheticEvent, newValue: string): void {
    setTabIndex(newValue)
  }

  async function updateGame(): Promise<void> {
    setRevalidate(true)
    listRef.current?.clearSelection()
    const newGame = await getQohGameById(game.id)
    if (newGame) setGame(newGame)
    setRevalidate(false)
  }
  function handleDialogEntryClose(): void {
    setEntryCrudAction({ type: DIALOG_TYPES.VIEW, items: [] })
  }

  useEffect(() => {
    router.prefetch('/qoh/game/current/add-entry')
  }, [router])

  return (
    <Fragment>
      <AppBar position='relative' component='div'>
        <Toolbar
          sx={{
            backgroundColor: (theme) => `rgba(${theme.vars.palette.primary.mainChannel} / 0.50)`,
          }}
        >
          <Typography variant='h3'>{title ?? game.name}</Typography>
          {!isSmall && !revalidate && (
            <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button color='secondary' startIcon={<EditIcon />} onClick={handleGameEdit}>
                Edit
              </Button>
              <Button color='secondary' startIcon={<DeleteIcon />} onClick={handleGameDelete}>
                Delete
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>
      <Paper sx={{ p: 1, mb: '64px' }}>
        <Grid container spacing={1}>
          {revalidate && (
            <Grid xs={12}>
              <LinearProgress />
            </Grid>
          )}
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
              value={54 - game.entries.filter((e) => e.shuffle === game.shuffle).length}
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
              <Tab icon={<InfoIcon />} label='Detials' value='1' disabled={revalidate} />
              <Tab icon={<ListIcon />} label='Entries' value='2' disabled={revalidate} />
              <Tab icon={<GavelIcon />} label='Rules' value='3' disabled={revalidate} />
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
                {game.resetOnTwoJokers && (
                  <Grid xs={12} md={4}>
                    <SingleValueDisplay
                      label='Board Resets'
                      value={
                        game.maxGameReset
                          ? `${game.shuffle - 1} of ${game.maxGameReset}`
                          : game.shuffle - 1
                      }
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
              <Box>
                <QohEntryList
                  game={game}
                  hideFab
                  onCreate={
                    game.isActive && !isSmall
                      ? () => {
                          router.push('/qoh/game/current/add-entry')
                        }
                      : undefined
                  }
                  onDelete={
                    !isSmall
                      ? (items) => {
                          setEntryCrudAction({ type: DIALOG_TYPES.DELETE, items })
                        }
                      : undefined
                  }
                  onEdit={
                    !isSmall
                      ? (item) => {
                          setEntryCrudAction({ type: DIALOG_TYPES.EDIT, items: [item] })
                        }
                      : undefined
                  }
                  onSelectionChange={(entries) => {
                    setSelectedEntries(entries)
                  }}
                  disabled={revalidate}
                  listRef={listRef}
                />
                <QohEntryDialog
                  open={entryCrudAction.type !== DIALOG_TYPES.VIEW}
                  qohGame={game}
                  items={entryCrudAction.items}
                  type={entryCrudAction.type}
                  onDeleted={updateGame}
                  onEdited={updateGame}
                  onClose={handleDialogEntryClose}
                />
              </Box>
            </TabPanel>
            <TabPanel value='3' sx={{ p: 0 }}>
              <SummaryStep game={rules} hideTopText />
            </TabPanel>
          </Fragment>
        </TabContext>
        {isSmall && (
          <Fragment>
            <Backdrop open={fabOpen} />
            <SpeedDial
              ariaLabel='SpeedDial tooltip example'
              sx={{ position: 'fixed', bottom: 8, right: 16 }}
              icon={<SpeedDialIcon icon={<AddIcon />} />}
              onClose={handleClose}
              onOpen={handleOpen}
              open={fabOpen}
            >
              {fabActions.map((action) => (
                <SpeedDialAction
                  sx={{ '& .MuiSpeedDialAction-staticTooltipLabel': { whiteSpace: 'nowrap' } }}
                  key={action.name}
                  icon={action.icon}
                  tooltipTitle={action.name}
                  tooltipOpen
                  onClick={handleFabActionClick(action.id)}
                />
              ))}
            </SpeedDial>
          </Fragment>
        )}
      </Paper>
      <QohGameDialog
        open={gameCrudAction !== DIALOG_TYPES.VIEW}
        onDeleted={handleDeleted}
        onEdited={handleEdited}
        onClose={handleDialogClose}
        items={[game]}
        type={gameCrudAction}
      />
    </Fragment>
  )
}
