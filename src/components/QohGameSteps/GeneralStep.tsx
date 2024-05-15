'use client'

import { useState } from 'react'

import NumberInput, { type HTMLNumericElement } from '@c/NumberInput'
import MoneyIcon from '@mui/icons-material/AttachMoney'
import HelpIcon from '@mui/icons-material/HelpOutline'
import {
  Alert,
  Box,
  FormControlLabel,
  InputAdornment,
  Popover,
  Stack,
  Switch,
  Typography,
} from '@mui/material'
import Grid from '@mui/material/Unstable_Grid2/Grid2'
import {
  DatePicker,
  type DateValidationError,
  type PickerChangeHandlerContext,
} from '@mui/x-date-pickers'
import { type Dayjs } from 'dayjs'

interface Help {
  resetOnTwoJokers: string
  maxGameReset: string
  ticketPrice: string
  createSeed: string
  initialJackpot: string
}

const HelpInfo: Help = {
  resetOnTwoJokers:
    'This setting will enable the game to be reset if and only if there are two jokers drawn before the queen of hearts is drawn.',
  maxGameReset:
    'This setting set the maximum number of times a game can be reset.  Note value of zero will allow unlimited resets.',
  ticketPrice: 'This setting depicts the price for one ticket that will be sold.',
  createSeed:
    'This setting will take part of the ticket sales and hold it for seeding the next game.',
  initialJackpot: 'This setting sets the starting jackpot for the game',
}

interface GeneralStepsProps {
  game: QoH.Game.UiPayload
  onChange: (partialPayload: Partial<QoH.Game.UiPayload>) => void
}
export default function GeneralStep({ game, onChange }: GeneralStepsProps): React.JSX.Element {
  const [anchor, setAnchor] = useState<{
    element: HTMLElement
    key: keyof typeof HelpInfo
  } | null>(null)

  function handlePopoverOpen(
    event: React.MouseEvent<HTMLElement>,
    key: keyof typeof HelpInfo,
  ): void {
    setAnchor({ element: event.currentTarget, key })
  }
  function handlePopoverClose(): void {
    setAnchor(null)
  }
  function handleDateChange(
    date: Dayjs | null,
    context: PickerChangeHandlerContext<DateValidationError>,
  ): void {
    if (!context.validationError && date !== null) {
      const startDate = date

      onChange({ startDate })
    }
  }
  function handleNumberChange(event: React.ChangeEvent<HTMLNumericElement>): void {
    const { value, name } = event.target

    if (name) {
      onChange({ [name]: typeof value === 'number' ? Math.max(value, 0) : 0 })
    }
  }
  function handleSwitchChange(event: React.ChangeEvent<HTMLInputElement>, checked: boolean): void {
    const { name } = event.target

    onChange({ [name]: checked })
  }

  return (
    <Stack spacing={2}>
      <Typography>
        Set up the general rules for the Queen of Hearts game that is being created.
      </Typography>
      <Alert severity='info'>
        <Typography component='span'>
          Use the{' '}
          <Box component='span' sx={{ position: 'relative', px: '14px' }}>
            <HelpIcon sx={{ position: 'absolute', top: -2, left: 0 }} />
          </Box>{' '}
          for more information about what the setting does.
        </Typography>
      </Alert>
      <Grid container spacing={2}>
        <Grid xs={12} md={4}>
          <DatePicker
            label='Start Date'
            value={game.startDate}
            onChange={handleDateChange}
            sx={{ width: '100%' }}
          />
        </Grid>
        <Grid xs={12} md={4}>
          <NumberInput
            name='initialJackpot'
            precision={2}
            value={game.initialJackpot}
            onChange={handleNumberChange}
            label='Starting Jackpot'
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <MoneyIcon />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position='end' sx={{ cursor: 'pointer' }}>
                  <Box
                    component='span'
                    sx={{ height: 24 }}
                    onMouseEnter={(event) => {
                      handlePopoverOpen(event, 'initialJackpot')
                    }}
                    onMouseLeave={handlePopoverClose}
                  >
                    <HelpIcon />
                  </Box>
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid xs={12} md={4}>
          <NumberInput
            name='ticketPrice'
            precision={2}
            value={game.ticketPrice}
            onChange={handleNumberChange}
            label='Ticket Price'
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <MoneyIcon />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position='end' sx={{ cursor: 'pointer' }}>
                  <Box
                    component='span'
                    sx={{ height: 24 }}
                    onMouseEnter={(event) => {
                      handlePopoverOpen(event, 'ticketPrice')
                    }}
                    onMouseLeave={handlePopoverClose}
                  >
                    <HelpIcon />
                  </Box>
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        {/* <Grid xs={12} md={6} sx={{ display: { xs: 'none', md: 'flex' } }}></Grid> */}
        <Grid xs={12} md={6} sx={{ display: 'flex', alignItems: 'center', minHeight: 72 }}>
          <FormControlLabel
            sx={{ mr: 1 }}
            control={
              <Switch
                checked={game.resetOnTwoJokers}
                onChange={handleSwitchChange}
                name='resetOnTwoJokers'
              />
            }
            label='Reset Board after 2nd joker drawn'
          />
          <Box
            sx={{ cursor: 'pointer', height: 24 }}
            component='span'
            onMouseEnter={(event) => {
              handlePopoverOpen(event, 'resetOnTwoJokers')
            }}
            onMouseLeave={handlePopoverClose}
          >
            <HelpIcon />
          </Box>
        </Grid>
        {game.resetOnTwoJokers && (
          <Grid xs={12} md={6} sx={{ minHeight: 72 }}>
            <NumberInput
              name='maxGameReset'
              precision={0}
              value={game.maxGameReset}
              onChange={handleNumberChange}
              label='Max Game Resets'
              fullWidth
              InputProps={{
                endAdornment: (
                  <InputAdornment position='end' sx={{ cursor: 'pointer' }}>
                    <Box
                      component='span'
                      sx={{ height: 24 }}
                      onMouseEnter={(event) => {
                        handlePopoverOpen(event, 'maxGameReset')
                      }}
                      onMouseLeave={handlePopoverClose}
                    >
                      <HelpIcon />
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
    </Stack>
  )
}
