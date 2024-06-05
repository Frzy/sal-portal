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

interface Help {
  createSeed: string
  maxSeed: string
}
export const HelpInfo: Help = {
  createSeed:
    'This setting will take part of the ticket sales and hold it for seeding the next game.',
  maxSeed:
    'Once the seed passes this threshold, the game will stop adding funds to the next games seed. Setting this to zero means the seed will never stop.',
}
interface SeedStepProps {
  disabled?: boolean
  game: QoH.Game.UiPayload
  onChange: (partialPayload: Partial<QoH.Game.UiPayload>) => void
}
export default function SeedStep({ disabled, game, onChange }: SeedStepProps): React.JSX.Element {
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
        Set up the if the game will be generating a seed for the following game.
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
        <Grid xs={12} md={6} sx={{ display: 'flex', alignItems: 'center', minHeight: 72 }}>
          <FormControlLabel
            sx={{ mr: 1 }}
            disabled={disabled}
            control={
              <Switch checked={game.createSeed} onChange={handleSwitchChange} name='createSeed' />
            }
            label='Generate seed for next game'
          />
          <Box
            sx={{ cursor: 'default', height: 24 }}
            onMouseEnter={(event) => {
              if (!disabled) handlePopoverOpen(event, 'createSeed')
            }}
            onMouseLeave={handlePopoverClose}
          >
            <HelpIcon color={disabled ? 'disabled' : undefined} />
          </Box>
        </Grid>
        {game.createSeed && (
          <Grid xs={12} md={6}>
            <NumberInput
              name='maxSeed'
              precision={0}
              value={game.maxSeed}
              onChange={handleNumberChange}
              label='Max Seed'
              disabled={disabled}
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <MoneyIcon color={disabled ? 'disabled' : undefined} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position='end' sx={{ cursor: 'default' }}>
                    <Box
                      component='span'
                      sx={{ height: 24 }}
                      onMouseEnter={(event) => {
                        if (!disabled) handlePopoverOpen(event, 'maxSeed')
                      }}
                      onMouseLeave={handlePopoverClose}
                    >
                      <HelpIcon color={disabled ? 'disabled' : undefined} />
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
