import { useMemo, useState } from 'react'

import NumberInput, { type HTMLNumericElement } from '@c/NumberInput'
import { HelpInfo as GeneralHelp } from '@c/QohGameSteps/GeneralStep'
import { HelpInfo as PayoutHelp } from '@c/QohGameSteps/PayoutStep'
import { HelpInfo as SeedHelp } from '@c/QohGameSteps/SeedStep'
import MoneyIcon from '@mui/icons-material/AttachMoney'
import HelpIcon from '@mui/icons-material/HelpOutline'
import PercentIcon from '@mui/icons-material/Percent'
import { LoadingButton } from '@mui/lab'
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  type DialogProps,
  DialogTitle,
  FormControlLabel,
  InputAdornment,
  Popover,
  Switch,
  TextField,
  Typography,
} from '@mui/material'
import Grid from '@mui/material/Unstable_Grid2/Grid2'
import {
  DatePicker,
  type DateValidationError,
  type PickerChangeHandlerContext,
} from '@mui/x-date-pickers'
import { type Dayjs } from 'dayjs'

import { editQohGame } from '@/util/requests'

const HelpInfo = { ...GeneralHelp, ...SeedHelp, ...PayoutHelp }

export interface EditQohGameDialogProps extends Omit<DialogProps, 'onClose'> {
  item: QoH.Game.Item
  onEdited?: (game: QoH.Game.Item) => void
  onClose?: () => void
}
export default function EditQohGameDialog({
  item: initGame,
  onEdited,
  onClose,
  ...other
}: EditQohGameDialogProps): React.JSX.Element {
  const [loading, setLoading] = useState(false)
  const [game, setGame] = useState<QoH.Game.UiPayload>({
    createSeed: initGame.createSeed,
    endDate: initGame.endDate,
    initialJackpot: initGame.initialJackpot,
    jackpotPercent: initGame.jackpotPercent,
    lastResetDate: initGame.lastResetDate,
    maxGameReset: initGame.maxGameReset,
    maxSeed: initGame.maxSeed,
    name: initGame.name,
    shuffle: initGame.shuffle,
    resetOnTwoJokers: initGame.resetOnTwoJokers,
    seedPercent: initGame.seedPercent,
    startDate: initGame.startDate,
    ticketPrice: initGame.ticketPrice,
    paidJackpot: initGame.paidJackpot,
  })
  const [anchor, setAnchor] = useState<{
    element: HTMLElement
    key: keyof typeof HelpInfo
  } | null>(null)
  const isGameValid = useMemo(() => {
    if (!initGame.isActive && !game.endDate) return false
    if (game.ticketPrice <= 0) return false
    if (!game.startDate) return false

    return true
  }, [initGame, game])

  function handlePopoverOpen(
    event: React.MouseEvent<HTMLElement>,
    key: keyof typeof HelpInfo,
  ): void {
    setAnchor({ element: event.currentTarget, key })
  }
  function handlePopoverClose(): void {
    setAnchor(null)
  }

  async function handleEditItem(): Promise<void> {
    setLoading(true)
    const editedItem = await editQohGame(initGame.id, game)

    if (!editedItem) {
      const event = new CustomEvent<INotification>('notify', {
        detail: {
          message: `Failed to edit Queen of Hearts game: ${initGame.name}`,
          severity: 'error',
        },
      })

      window.dispatchEvent(event)
    } else {
      const event = new CustomEvent<INotification>('notify', {
        detail: { message: `Successfully updated.`, severity: 'success' },
      })

      window.dispatchEvent(event)
      if (onEdited) onEdited(editedItem)
    }

    setLoading(false)
    if (editedItem && onClose) onClose()
  }

  function handleTextChange(event: React.ChangeEvent<HTMLInputElement>): void {
    const { name, value } = event.target

    updateState({ [name]: value })
  }
  function handleNumberChange(event: React.ChangeEvent<HTMLNumericElement>): void {
    const { value, name } = event.target

    updateState({ [name!]: typeof value === 'number' ? value : 0 })
  }
  function handleSwitchChange(event: React.ChangeEvent<HTMLInputElement>, checked: boolean): void {
    const { name } = event.target

    updateState({ [name]: checked })
  }
  function handleDateChange(
    name: string,
  ): (date: Dayjs | null, context: PickerChangeHandlerContext<DateValidationError>) => void {
    return (date, context): void => {
      if (!context.validationError && date !== null) {
        updateState({ [name]: date })
      }
    }
  }
  function updateState(state: Partial<QoH.Game.UiPayload>): void {
    setGame((prev) => ({ ...prev, ...state }))
  }

  return (
    <Dialog onClose={onClose} {...other}>
      <DialogTitle>Update {initGame.name}</DialogTitle>
      <DialogContent dividers>
        {initGame.entries.length > 0 && (
          <Alert severity='warning' sx={{ mb: 2 }}>
            Changing the rules of a Queen of Hearts game may trigger a recalculation of the games
            totals along with the {initGame.entries.length}{' '}
            {initGame.entries.length > 1 ? 'drawings.' : 'drawing.'}
          </Alert>
        )}
        <Grid container spacing={2}>
          <Grid xs={12} md={initGame.isActive ? 6 : undefined}>
            <TextField
              label='Name'
              name='name'
              value={game.name}
              onChange={handleTextChange}
              disabled={loading}
              fullWidth
            />
          </Grid>
          <Grid xs={12} md={6}>
            <DatePicker
              label='Start Date'
              value={game.startDate}
              onChange={handleDateChange('startDate')}
              disabled={loading}
              sx={{ width: '100%' }}
            />
          </Grid>
          {!initGame.isActive && (
            <Grid xs={12} md={6}>
              <DatePicker
                label='End Date'
                value={game.endDate}
                onChange={handleDateChange('endDate')}
                disabled={loading}
                sx={{ width: '100%' }}
              />
            </Grid>
          )}
          <Grid xs={12} md={6}>
            <NumberInput
              name='initialJackpot'
              precision={2}
              value={game.initialJackpot}
              onChange={handleNumberChange}
              label='Starting Jackpot'
              disabled={loading}
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <MoneyIcon color={loading ? 'disabled' : undefined} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position='end' sx={{ cursor: 'default' }}>
                    <Box
                      component='span'
                      sx={{ height: 24 }}
                      onMouseEnter={(event) => {
                        if (!loading) handlePopoverOpen(event, 'initialJackpot')
                      }}
                      onMouseLeave={handlePopoverClose}
                    >
                      <HelpIcon color={loading ? 'disabled' : undefined} />
                    </Box>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid xs={12} md={6}>
            <NumberInput
              name='ticketPrice'
              precision={2}
              value={game.ticketPrice}
              onChange={handleNumberChange}
              label='Ticket Price'
              disabled={loading}
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <MoneyIcon color={loading ? 'disabled' : undefined} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position='end' sx={{ cursor: 'default' }}>
                    <Box
                      component='span'
                      sx={{ height: 24 }}
                      onMouseEnter={(event) => {
                        if (!loading) handlePopoverOpen(event, 'ticketPrice')
                      }}
                      onMouseLeave={handlePopoverClose}
                    >
                      <HelpIcon color={loading ? 'disabled' : undefined} />
                    </Box>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid xs={12} md={6} sx={{ display: 'flex', alignItems: 'center', minHeight: 72 }}>
            <FormControlLabel
              sx={{ flexGrow: 1 }}
              disabled={loading}
              control={
                <Switch
                  checked={game.resetOnTwoJokers}
                  onChange={handleSwitchChange}
                  name='resetOnTwoJokers'
                />
              }
              label='Two Joker Reset'
            />
            <Box
              sx={{ cursor: 'default', height: 24, pr: 1.75 }}
              component='span'
              onMouseEnter={(event) => {
                if (!loading) handlePopoverOpen(event, 'resetOnTwoJokers')
              }}
              onMouseLeave={handlePopoverClose}
            >
              <HelpIcon color={loading ? 'disabled' : undefined} />
            </Box>
          </Grid>
          <Grid xs={12} md={6} sx={{ minHeight: 72 }}>
            <NumberInput
              name='maxGameReset'
              precision={0}
              value={game.resetOnTwoJokers ? game.maxGameReset : 0}
              onChange={handleNumberChange}
              label='Max Game Resets'
              disabled={loading || !game.resetOnTwoJokers}
              fullWidth
              InputProps={{
                endAdornment: (
                  <InputAdornment position='end' sx={{ cursor: 'default' }}>
                    <Box
                      component='span'
                      sx={{ height: 24 }}
                      onMouseEnter={(event) => {
                        if (!loading || !game.resetOnTwoJokers)
                          handlePopoverOpen(event, 'maxGameReset')
                      }}
                      onMouseLeave={handlePopoverClose}
                    >
                      <HelpIcon
                        color={loading || !game.resetOnTwoJokers ? 'disabled' : undefined}
                      />
                    </Box>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid xs={12} md={6} sx={{ display: 'flex', alignItems: 'center', minHeight: 72 }}>
            <FormControlLabel
              sx={{ flexGrow: 1 }}
              disabled={loading}
              control={
                <Switch checked={game.createSeed} onChange={handleSwitchChange} name='createSeed' />
              }
              label='Generate seed'
            />
            <Box
              sx={{ cursor: 'default', height: 24, pr: 1.75 }}
              onMouseEnter={(event) => {
                if (!loading) handlePopoverOpen(event, 'createSeed')
              }}
              onMouseLeave={handlePopoverClose}
            >
              <HelpIcon color={loading ? 'disabled' : undefined} />
            </Box>
          </Grid>
          <Grid xs={12} md={6}>
            <NumberInput
              name='maxSeed'
              precision={0}
              value={game.createSeed ? game.maxSeed : 0}
              onChange={handleNumberChange}
              label='Max Seed'
              disabled={loading || !game.createSeed}
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <MoneyIcon color={loading || !game.createSeed ? 'disabled' : undefined} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position='end' sx={{ cursor: 'default' }}>
                    <Box
                      component='span'
                      sx={{ height: 24 }}
                      onMouseEnter={(event) => {
                        if (!loading || !game.createSeed) handlePopoverOpen(event, 'maxSeed')
                      }}
                      onMouseLeave={handlePopoverClose}
                    >
                      <HelpIcon color={loading || !game.createSeed ? 'disabled' : undefined} />
                    </Box>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid xs={12} md={6}>
            <NumberInput
              name='jackpotPercent'
              precision={0}
              value={game.jackpotPercent * 100}
              onChange={handleNumberChange}
              label='Jackpot Percent'
              disabled={loading}
              fullWidth
              InputProps={{
                endAdornment: (
                  <InputAdornment position='end'>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <PercentIcon color={loading ? 'disabled' : undefined} />
                      <Box
                        component='span'
                        sx={{ height: 24, cursor: 'default' }}
                        onMouseEnter={(event) => {
                          if (!loading) handlePopoverOpen(event, 'jackpotPercent')
                        }}
                        onMouseLeave={handlePopoverClose}
                      >
                        <HelpIcon color={loading ? 'disabled' : undefined} />
                      </Box>
                    </Box>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid xs={12} md={6}>
            <NumberInput
              name='seedPercent'
              precision={0}
              value={game.createSeed ? game.seedPercent * 100 : 0}
              onChange={handleNumberChange}
              label='Seed Percent'
              disabled={loading || !game.createSeed}
              fullWidth
              InputProps={{
                endAdornment: (
                  <InputAdornment position='end'>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <PercentIcon color={loading || !game.createSeed ? 'disabled' : undefined} />
                      <Box
                        component='span'
                        sx={{ height: 24, cursor: 'default' }}
                        onMouseEnter={(event) => {
                          if (!loading || !game.createSeed) handlePopoverOpen(event, 'seedPercent')
                        }}
                        onMouseLeave={handlePopoverClose}
                      >
                        <HelpIcon color={loading || !game.createSeed ? 'disabled' : undefined} />
                      </Box>
                    </Box>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          {!initGame.isActive && (
            <Grid xs={12}>
              <NumberInput
                name='paidJackpot'
                precision={0}
                value={game.paidJackpot}
                onChange={handleNumberChange}
                label='Jackpot Payout'
                disabled={loading}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <MoneyIcon color={loading ? 'disabled' : undefined} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position='end' sx={{ cursor: 'default' }}>
                      <Box
                        component='span'
                        sx={{ height: 24 }}
                        onMouseEnter={(event) => {
                          if (!loading) handlePopoverOpen(event, 'paidJackpot')
                        }}
                        onMouseLeave={handlePopoverClose}
                      >
                        <HelpIcon color={loading ? 'disabled' : undefined} />
                      </Box>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          )}
        </Grid>
        <Popover
          sx={{
            pointerEvents: 'none',
          }}
          open={!!anchor}
          anchorEl={anchor?.element}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          onClose={handlePopoverClose}
          disableRestoreFocus
        >
          <Alert severity='info'>
            <Typography>{anchor?.key && HelpInfo[anchor.key]}</Typography>
          </Alert>
        </Popover>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color='inherit' disabled={loading}>
          Cancel
        </Button>
        <LoadingButton
          color='error'
          loading={loading}
          onClick={handleEditItem}
          disabled={!isGameValid}
        >
          Update
        </LoadingButton>
      </DialogActions>
    </Dialog>
  )
}
