import TrendingDownIcon from '@mui/icons-material/TrendingDown'
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import {
  Box,
  Card,
  CardContent,
  type CardProps,
  Typography,
  type TypographyProps,
} from '@mui/material'

interface SingleValueDisplayProps extends CardProps {
  value: string | number
  growth?: number
  valueProps?: TypographyProps
  label: string
  labelProps?: TypographyProps
  trendingIconSize?: number
  trendingFontSize?: number
}
export default function SingleValueDisplay({
  growth,
  label,
  labelProps,
  value,
  valueProps,
  trendingIconSize = 24,
  trendingFontSize = 16,
  sx,
  ...other
}: SingleValueDisplayProps): React.JSX.Element {
  return (
    <Card {...other} sx={{ minHeight: 125, ...sx }}>
      <CardContent sx={{ '&:last-child': { pb: growth ? 2 : 3 } }}>
        <Typography
          variant='h5'
          {...labelProps}
          sx={{ ...labelProps?.sx, ...{ pb: growth ? 0.25 : 1 } }}
        >
          {label}
        </Typography>
        <Box
          sx={{
            display: 'flex',
            gap: 1,
            alignItems: 'center',
            justifyContent: 'center',
            flexGrow: 1,
          }}
        >
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
          {growth != null && (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {growth === 0 ? (
                <TrendingFlatIcon sx={{ fontSize: trendingIconSize }} />
              ) : growth > 0 ? (
                <TrendingUpIcon sx={{ fontSize: trendingIconSize }} color='success' />
              ) : (
                <TrendingDownIcon sx={{ fontSize: trendingIconSize }} color='error' />
              )}
              <Typography sx={{ fontSize: trendingFontSize }} variant='caption'>
                {growth}%
              </Typography>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  )
}
