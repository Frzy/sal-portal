'use client'

import { useState } from 'react'

import NumberInput, { type HTMLNumericElement } from '@c/NumberInput'
import DollarIcon from '@mui/icons-material/AttachMoney'
import HelpIcon from '@mui/icons-material/Help'
import { InputAdornment, Tooltip } from '@mui/material'
import Grid from '@mui/material/Unstable_Grid2/Grid2'

export default function CheckoutView(): React.JSX.Element {
  const [payload, setPayload] = useState<Kitchen.Checkout.Payload>({
    totalSales: 0,
    creditCardSales: 0,
    deposit: 0,
    description: '',
  })

  function handleNumberChange(event: React.ChangeEvent<HTMLNumericElement>): void {
    const { name, value } = event.target

    updatePayload({ [name as keyof Kitchen.Checkout.Payload]: value ?? 0 })
  }

  function updatePayload(partial: Partial<Kitchen.Checkout.Payload>): void {
    setPayload((prev) => ({ ...prev, ...partial }))
  }

  return (
    <Grid container spacing={2}>
      <Grid xs={12} md={4}>
        <NumberInput
          value={payload.totalSales}
          onChange={handleNumberChange}
          name='totalSales'
          label='Sales'
          InputProps={{
            startAdornment: (
              <InputAdornment position='start'>
                <DollarIcon />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position='end' sx={{ cursor: 'default' }}>
                <Tooltip title='Enter the total dollar amount for all items sold.'>
                  <HelpIcon />
                </Tooltip>
              </InputAdornment>
            ),
          }}
        />
      </Grid>
      <Grid xs={12} md={4}>
        <NumberInput
          value={payload.creditCardSales}
          onChange={handleNumberChange}
          name='creditCardSales'
          label='Credit Card Sales'
          InputProps={{
            startAdornment: (
              <InputAdornment position='start'>
                <DollarIcon />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position='end' sx={{ cursor: 'default' }}>
                <Tooltip title='Enter the total dollar amount for all credit card purchases.'>
                  <HelpIcon />
                </Tooltip>
              </InputAdornment>
            ),
          }}
        />
      </Grid>
    </Grid>
  )
}
