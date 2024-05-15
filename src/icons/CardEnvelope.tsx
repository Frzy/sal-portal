import { SvgIcon, type SvgIconProps, useTheme } from '@mui/material'

interface CardBackProps extends SvgIconProps {
  value?: number
}
export default function CardEnvelope({ value, ...props }: CardBackProps): React.JSX.Element {
  const theme = useTheme()

  return (
    <SvgIcon {...props}>
      <svg version='1.1' id='Layer_1' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'>
        <g id='SVGRepo_iconCarrier'>
          <path
            style={{ fill: '#F2B556' }}
            d='M381.2,504H130.8c-14.458,0-26.179-11.721-26.179-26.179V34.179C104.621,19.721,116.342,8,130.8,8 h250.4c14.458,0,26.179,11.721,26.179,26.179v443.642C407.379,492.279,395.658,504,381.2,504z'
          />

          <g>
            {/* Card Border */}
            <path
              style={{ fill: '#2D2B29' }}
              d='M376,0H136c-22.056,0-40,17.944-40,40v432c0,22.056,17.944,40,40,40h240c22.056,0,40-17.944,40-40 V40C416,17.944,398.056,0,376,0z M400,472c0,13.233-10.766,24-24,24H136c-13.234,0-24-10.767-24-24V40c0-13.233,10.766-24,24-24 h240c13.234,0,24,10.767,24,24V472z'
            />
          </g>
        </g>
        {!!value && (
          <text
            style={{
              fontFamily: theme.typography.fontFamily,
              fontWeight: 'bold',
              fontSize: 200,
              transform: 'translate(135px, 310px)',
              fill: '#2D2B29',
            }}
          >
            {value}
          </text>
        )}
      </svg>
    </SvgIcon>
  )
}
