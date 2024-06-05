import { useMemo, useState } from 'react'

import CardSelect from '@c/CardSelect'
import NumberInput, { type HTMLNumericElement } from '@c/NumberInput'
import MoneyIcon from '@mui/icons-material/AttachMoney'
import HelpIcon from '@mui/icons-material/HelpOutline'
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
  InputAdornment,
  Popover,
  Typography,
} from '@mui/material'
import Grid from '@mui/material/Unstable_Grid2/Grid2'
import {
  DatePicker,
  type DateValidationError,
  type PickerChangeHandlerContext,
} from '@mui/x-date-pickers'
import { type Dayjs } from 'dayjs'

import { DATE_FORMAT } from '@/util/constants'
import { toCardString } from '@/util/functions'
import { editQohEntry } from '@/util/requests'

interface Help {
  ticketSales: string
  payout: string
  cardPosition: string
}
export const HelpInfo: Help = {
  ticketSales: 'Total ticket sales collected for the drawing.',
  payout: 'Total payouts that were given out.',
  cardPosition: 'The envelope number picked',
}

export interface EditQohGameDialogProps extends Omit<DialogProps, 'onClose'> {
  game: QoH.Game.Item
  item: QoH.Entry.GameItem
  disabledCards?: string[]
  onEdited?: (game: QoH.Entry.Item) => void
  onClose?: () => void
}
export default function EditQohEntryDialog({
  game,
  item: initEntry,
  disabledCards,
  onEdited,
  onClose,
  ...other
}: EditQohGameDialogProps): React.JSX.Element {
  const [loading, setLoading] = useState(false)
  const [entry, setEntry] = useState<QoH.Entry.UiPayload>({
    drawDate: initEntry.drawDate,
    ticketSales: initEntry.ticketSales,
    payout: initEntry.payout,
    shuffle: initEntry.shuffle,
    cardPosition: initEntry.cardPosition ?? 0,
    cardDrawn: toCardString(initEntry.cardDrawn),
  })
  const [anchor, setAnchor] = useState<{
    element: HTMLElement
    key: keyof typeof HelpInfo
  } | null>(null)
  const [showQueenOfHeartsWarning, setShowQueenOfHeartsWarning] = useState(false)
  const [showJokerWarning, setShowJokerWarning] = useState(false)
  const [showChangeJokerWarning, setShowChangeJokerWarning] = useState(false)
  const isGameValid = useMemo(() => {
    if (!entry.drawDate) return false
    if (!entry.ticketSales) return false

    return true
  }, [entry])

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
    const editedItem = await editQohEntry(initEntry.id, entry)

    if (!editedItem) {
      const event = new CustomEvent<INotification>('notify', {
        detail: {
          message: `Failed to edit Queen of Hearts entry: ${initEntry.name}`,
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
  function handleNumberChange(event: React.ChangeEvent<HTMLNumericElement>): void {
    const { value, name } = event.target

    updateState({ [name!]: typeof value === 'number' ? value : 0 })
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
  function updateState(state: Partial<QoH.Entry.UiPayload>): void {
    setEntry((prev) => ({ ...prev, ...state }))
  }

  return (
    <Dialog onClose={onClose} {...other}>
      <DialogTitle>Update {initEntry.name}</DialogTitle>
      <DialogContent dividers>
        <Alert severity='info' sx={{ mb: 2 }}>
          Updating a Queen of Hearts entry may trigger a recalculation of future entries totals.
        </Alert>
        <Grid container spacing={2}>
          <Grid xs={12}>
            <DatePicker
              label='Drawn Date'
              value={entry.drawDate}
              onChange={handleDateChange('drawDate')}
              disabled={loading}
              sx={{ width: '100%' }}
            />
          </Grid>
          <Grid xs={12} md={6}>
            <NumberInput
              name='ticketSales'
              precision={2}
              value={entry.ticketSales}
              onChange={handleNumberChange}
              label='Ticket Sales'
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
                        if (!loading) handlePopoverOpen(event, 'ticketSales')
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
              name='payout'
              precision={2}
              value={entry.payout}
              onChange={handleNumberChange}
              label='Payouts'
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
                        if (!loading) handlePopoverOpen(event, 'payout')
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
            <CardSelect
              disabledCards={disabledCards}
              value={entry.cardDrawn}
              initialValue={initEntry.cardDrawn?.id ?? ''}
              onChange={(cardId) => {
                setShowQueenOfHeartsWarning(cardId === 'Q_hearts')
                setShowJokerWarning(cardId.includes('X') && initEntry.cardDrawn?.value !== 'X')
                setShowChangeJokerWarning(
                  initEntry.cardDrawn?.value === 'X' && !cardId.includes('X'),
                )
                updateState({ cardDrawn: cardId })
              }}
              disabled={loading}
              fullWidth
            />
          </Grid>
          <Grid xs={12} md={6}>
            <NumberInput
              name='cardPosition'
              precision={0}
              value={entry.cardPosition}
              onChange={handleNumberChange}
              label='Board Position'
              disabled={loading}
              fullWidth
              InputProps={{
                endAdornment: (
                  <InputAdornment position='end' sx={{ cursor: 'default' }}>
                    <Box
                      component='span'
                      sx={{ height: 24 }}
                      onMouseEnter={(event) => {
                        if (!loading) handlePopoverOpen(event, 'cardPosition')
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
          {(((showJokerWarning || showChangeJokerWarning) && game.resetOnTwoJokers) ||
            showQueenOfHeartsWarning) && (
            <Grid xs={12}>
              <Alert severity='warning'>
                <Typography>
                  {showQueenOfHeartsWarning
                    ? `This will end the current game and clear (if any) entries after ${entry.drawDate.format(DATE_FORMAT)}.`
                    : showJokerWarning
                      ? `This can possibly trigger a board reset, or have unintentional side effects, that will effect (if any) entries after ${entry.drawDate.format(DATE_FORMAT)}.`
                      : `This can possibly undo a board reset, or have unintentional side effects, that will effect (if any) entries after ${entry.drawDate.format(DATE_FORMAT)}.`}
                </Typography>
                <Typography fontWeight='fontWeightBold'>
                  This action can not be undone. Proceed with caution.
                </Typography>
              </Alert>
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
          color='secondary'
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
