import NumberInput, { type HTMLNumericElement } from '@c/NumberInput'
import DollarIcon from '@mui/icons-material/AttachMoney'
import { Box, InputAdornment, Typography } from '@mui/material'

interface CreditCardStepProps {
  value?: number
  onChange?: (event: React.ChangeEvent<HTMLNumericElement>) => void
}
export default function CreditCardStep({
  value = 0,
  onChange,
}: CreditCardStepProps): React.JSX.Element {
  return (
    <Box>
      <Typography sx={{ pb: 2 }}>Please enter the total credit card sales.</Typography>
      <NumberInput
        autoFocus
        fullWidth
        label='Credit Card Sales'
        sx={{
          '& input': {
            fontSize: '2rem',
            fontFamily: 'monospace',
          },
        }}
        value={value}
        onChange={onChange}
        InputProps={{
          startAdornment: (
            <InputAdornment position='start'>
              <DollarIcon />
            </InputAdornment>
          ),
        }}
      />
    </Box>
  )
}
