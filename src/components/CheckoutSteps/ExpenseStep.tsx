import NumberInput, { type HTMLNumericElement } from '@c/NumberInput'
import DollarIcon from '@mui/icons-material/AttachMoney'
import { Alert, Box, InputAdornment, Typography } from '@mui/material'

interface ExpenseStepProps {
  value?: number
  onChange?: (event: React.ChangeEvent<HTMLNumericElement>) => void
}
export default function ExpenseStep({ value = 0, onChange }: ExpenseStepProps): React.JSX.Element {
  return (
    <Box>
      <Typography sx={{ pb: 2 }}>
        Please enter the total of all exenses, not going to the bar, that are coming out of the
        deposit.
      </Typography>
      <Alert severity='info' sx={{ mb: 2 }}>
        These are usally small purchases made right before service that are paid out of deposit.
      </Alert>
      <NumberInput
        autoFocus
        fullWidth
        label='Additional Expenses'
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
