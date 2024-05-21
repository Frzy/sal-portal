import { Card, CardContent, type CardProps, Typography, type TypographyProps } from '@mui/material'

interface SingleValueDisplayProps extends CardProps {
  value: string | number
  valueProps?: TypographyProps
  label: string
  labelProps?: TypographyProps
}
export default function SingleValueDisplay({
  label,
  labelProps,
  value,
  valueProps,
  ...other
}: SingleValueDisplayProps): React.JSX.Element {
  return (
    <Card {...other}>
      <CardContent>
        <Typography variant='h5' {...labelProps}>
          {label}
        </Typography>
        <Typography
          variant='h4'
          align='center'
          {...valueProps}
          sx={{
            fontWeight: 'fontWeightBold',
            ...valueProps?.sx,
          }}
        >
          {value}
        </Typography>
      </CardContent>
    </Card>
  )
}
