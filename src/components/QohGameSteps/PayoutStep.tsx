'use client'

import { useState } from 'react'

import NumberInput, { type HTMLNumericElement } from '@c/NumberInput'
import HelpIcon from '@mui/icons-material/HelpOutline'
import PercentIcon from '@mui/icons-material/Percent'
import { Alert, Box, InputAdornment, Popover, Stack, Typography } from '@mui/material'
import Grid from '@mui/material/Unstable_Grid2/Grid2'

interface Help {
  seedPercent: string
  jackpotPercent: string
  paidJackpot: string
}
export const HelpInfo: Help = {
  seedPercent: 'The percent to take out each drawings ticket sales.',
  jackpotPercent: 'The percent to give away from the total availible games funds',
  paidJackpot: 'The dollar amount paid for winning the jackpot',
}

interface PayoutsStepProps {
  disabled?: boolean
  game: QoH.Game.UiPayload
  onChange: (partialPayload: Partial<QoH.Game.UiPayload>) => void
}
export default function PayoutsStep({
  disabled,
  game,
  onChange,
}: PayoutsStepProps): React.JSX.Element {
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

  function handleNumberChange(event: React.ChangeEvent<HTMLNumericElement>): void {
    const { value, name } = event.target

    if (name) {
      onChange({ [name]: typeof value === 'number' ? Math.min(Math.max(value, 0), 100) / 100 : 0 })
    }
  }

  return (
    <Stack spacing={2}>
      <Typography>
        Set up how the {game.createSeed ? 'seed and jackpot' : 'jackpot'} will be calculated from
        the total ticket sales.
      </Typography>

      <Grid container spacing={2}>
        {game.createSeed && (
          <Grid xs={6}>
            <NumberInput
              name='seedPercent'
              precision={0}
              value={game.seedPercent * 100}
              onChange={handleNumberChange}
              label='Seed Percent'
              disabled={disabled}
              fullWidth
              InputProps={{
                endAdornment: (
                  <InputAdornment position='end'>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <PercentIcon color={disabled ? 'disabled' : undefined} />
                      <Box
                        component='span'
                        sx={{ height: 24, cursor: 'default' }}
                        onMouseEnter={(event) => {
                          if (!disabled) handlePopoverOpen(event, 'seedPercent')
                        }}
                        onMouseLeave={handlePopoverClose}
                      >
                        <HelpIcon color={disabled ? 'disabled' : undefined} />
                      </Box>
                    </Box>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
        )}
        <Grid xs={6}>
          <NumberInput
            name='jackpotPercent'
            precision={0}
            value={game.jackpotPercent * 100}
            onChange={handleNumberChange}
            label='Jackpot Percent'
            disabled={disabled}
            fullWidth
            InputProps={{
              endAdornment: (
                <InputAdornment position='end'>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <PercentIcon color={disabled ? 'disabled' : undefined} />
                    <Box
                      component='span'
                      sx={{ height: 24, cursor: 'default' }}
                      onMouseEnter={(event) => {
                        if (!disabled) handlePopoverOpen(event, 'jackpotPercent')
                      }}
                      onMouseLeave={handlePopoverClose}
                    >
                      <HelpIcon color={disabled ? 'disabled' : undefined} />
                    </Box>
                  </Box>
                </InputAdornment>
              ),
            }}
          />
        </Grid>
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
