import NumberInput, { type HTMLNumericElement } from '@c/NumberInput'
import DollarIcon from '@mui/icons-material/AttachMoney'
import { Box, InputAdornment, Typography } from '@mui/material'

interface CreditCardStepProps {
  value?: number
  onChange?: (event: React.ChangeEvent<HTMLNumericElement>) => void
  onSubmit?: () => void
}
export default function CreditCardStep({
  value = 0,
  onChange,
  onSubmit,
}: CreditCardStepProps): React.JSX.Element {
  return (
    <Box>
      <Typography sx={{ pb: 2 }}>Please enter the total credit card sales.</Typography>
      <NumberInput
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
        onKeyUp={(event) => {
          if (onSubmit && event.key === 'Enter') onSubmit()
        }}
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
