import { SvgIcon, type SvgIconProps, useTheme } from '@mui/material'

interface CardProps extends SvgIconProps, Card.Item {}
export default function Card({ suit, value, ...props }: CardProps): React.JSX.Element {
  const theme = useTheme()

  return (
    <SvgIcon {...props}>
      <svg version='1.1' id='Layer_1' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'>
        <g id='SVGRepo_iconCarrier'>
          <path
            style={{ fill: '#EFF2FA' }}
            d='M381.2,504H130.8c-14.458,0-26.179-11.721-26.179-26.179V34.179C104.621,19.721,116.342,8,130.8,8 h250.4c14.458,0,26.179,11.721,26.179,26.179v443.642C407.379,492.279,395.658,504,381.2,504z'
          />

          {value === 'X' && (suit === 'red' || suit === 'black') && (
            <g
              fill={suit === 'black' ? '#2D2B29' : '#FF6464'}
              style={{ transform: 'scale(7) translate(22px, 21px)' }}
            >
              <path d='M13.234,23.983c-1.004,1.002-2.752,1.001-3.752,0c-0.391-0.392-1.023-0.392-1.414,0c-0.391,0.391-0.391,1.022,0,1.414 c0.878,0.879,2.047,1.362,3.29,1.362c1.242,0,2.411-0.483,3.29-1.362c0.391-0.391,0.391-1.022,0-1.414 C14.257,23.593,13.626,23.593,13.234,23.983z' />
              <path d='M27.617,11.667c-0.444-0.119-0.896-0.012-1.236,0.245c-1.172-1.439-3.911-4.037-7.371-2.239c0,0-1.779-4.643,0.968-7.309 c0.187,0.228,0.439,0.403,0.746,0.485c0.772,0.207,1.563-0.252,1.771-1.026c0.206-0.772-0.254-1.567-1.024-1.773 c-0.773-0.207-1.569,0.252-1.775,1.025c-0.042,0.157-0.05,0.312-0.04,0.466c-2.2,0.232-6.156,1.213-7.78,5.226 c0,0-2.07-5.078-7.6-3.616C4.136,2.685,3.77,2.298,3.265,2.165C2.494,1.959,1.697,2.419,1.492,3.192 C1.286,3.966,1.745,4.76,2.518,4.966C3.291,5.173,4.084,4.713,4.289,3.94C4.301,3.896,4.303,3.852,4.31,3.808 C8.768,5.861,6.787,15.359,6.789,15.39c-2.12,1.458-3.515,3.899-3.515,6.662c0,4.457,3.626,8.083,8.084,8.083 c4.457,0,8.083-3.626,8.083-8.083c0-1.244-0.291-2.419-0.796-3.473c0.022-0.03,1.709-5.432,7.188-5.81 c-0.157,0.748,0.289,1.499,1.038,1.698c0.773,0.207,1.567-0.253,1.772-1.026C28.851,12.667,28.391,11.874,27.617,11.667z M11.359,28.135c-3.354,0-6.084-2.729-6.084-6.083c0-0.824,0.166-1.607,0.464-2.326l1.208,1.179 C7,20.956,7.023,21.029,7.011,21.101l-0.316,1.842c-0.015,0.084,0.021,0.168,0.089,0.219c0.068,0.05,0.159,0.056,0.234,0.017 l1.654-0.87c0.064-0.033,0.143-0.033,0.207,0l1.654,0.87c0.075,0.039,0.166,0.033,0.234-0.017 c0.068-0.051,0.104-0.135,0.089-0.219l-0.315-1.842c-0.012-0.072,0.012-0.146,0.064-0.196l1.338-1.306 c0.061-0.059,0.083-0.146,0.057-0.228c-0.026-0.081-0.097-0.141-0.181-0.152L9.971,18.95c-0.073-0.012-0.136-0.058-0.168-0.122 l-0.827-1.677c-0.038-0.075-0.115-0.124-0.2-0.124s-0.162,0.049-0.2,0.124l-0.827,1.677c-0.032,0.064-0.095,0.109-0.168,0.122 l-1.583,0.229c0.565-1.052,1.432-1.919,2.483-2.485c1.008,0.479,2.388,0.978,3.944,1.394c1.547,0.413,2.982,0.668,4.093,0.757 c0.582,0.934,0.924,2.03,0.924,3.208C17.44,25.406,14.713,28.135,11.359,28.135z M7.763,20.426c0-0.559,0.454-1.012,1.011-1.012 c0.56,0,1.013,0.453,1.013,1.012c0,0.56-0.453,1.012-1.013,1.012C8.218,21.438,7.763,20.984,7.763,20.426z' />
              <circle cx='13.941' cy='20.426' r='1.346'></circle>
            </g>
          )}

          {/* Spade */}
          {suit === 'spades' && (
            <g fill='#2D2B29' style={{ transform: 'scale(12) translate(13.5px, 13px)' }}>
              <path d='M7.184 11.246A3.5 3.5 0 0 1 1 9c0-1.602 1.14-2.633 2.66-4.008C4.986 3.792 6.602 2.33 8 0c1.398 2.33 3.014 3.792 4.34 4.992C13.86 6.367 15 7.398 15 9a3.5 3.5 0 0 1-6.184 2.246 19.92 19.92 0 0 0 1.582 2.907c.231.35-.02.847-.438.847H6.04c-.419 0-.67-.497-.438-.847a19.919 19.919 0 0 0 1.582-2.907z' />
            </g>
          )}
          {/* Club */}
          {suit === 'clubs' && (
            <path
              style={{
                transform: 'translate(160px, 160px) scale(0.75)',
                fill: '#2D2B29',
                opacity: 1,
              }}
              d='M232,148a52.00505,52.00505,0,0,1-80.459,43.52539l10.6538,34.08789A7.99984,7.99984,0,0,1,154.55908,236H101.44092a7.99954,7.99954,0,0,1-7.63526-10.38672L104.45459,191.542a51.7046,51.7046,0,0,1-29.9624,8.43653c-27.72657-.78516-50.377-24.00489-50.4917-51.75977A51.99976,51.99976,0,0,1,76,96q2.02881,0,4.04883.15625a52.00294,52.00294,0,1,1,95.89648,0,53.33621,53.33621,0,0,1,5.46387-.1377A51.70261,51.70261,0,0,1,232,148Z'
            />
          )}
          {/* Diamond */}
          {suit === 'diamonds' && (
            <g
              fill='#2D2B29'
              stroke='#2D2B29'
              strokeWidth={35}
              style={{ transform: 'scale(0.45) translate(310px, 317px)' }}
            >
              <path
                style={{
                  fill: '#FF6464',
                }}
                d='M431.684,252.936c-40.578-32.779-150.62-185.32-171.561-247.398C258.899,1.913,257.845,0,255.988,0 c-1.832,0-2.894,1.913-4.11,5.538C230.92,67.616,120.894,220.157,80.308,252.936c-1.053,0.843-1.946,2.44-1.946,3.064 c0,0.624,0.893,2.222,1.946,3.057c40.586,32.778,150.612,185.319,171.57,247.406c1.216,3.624,2.278,5.537,4.11,5.537 c1.857,0,2.911-1.913,4.135-5.537c20.941-62.087,130.983-214.628,171.561-247.406c1.046-0.835,1.954-2.432,1.954-3.057 C433.638,255.376,432.73,253.778,431.684,252.936z'
              />
            </g>
          )}
          {/* Heart */}
          {suit === 'hearts' && (
            <path
              style={{ fill: '#FF6464' }}
              d='M183.667,238.229c0-21.161,17.759-38.315,39.666-38.315c10.858,0,20.689,4.221,27.848,11.05 c2.655,2.532,6.981,2.532,9.636,0c7.16-6.83,16.991-11.05,27.849-11.05c21.907,0,39.666,17.154,39.666,38.315l0,0 c0,39.572-53.059,75.572-68.29,85.09c-2.462,1.539-5.623,1.539-8.085,0C236.727,313.8,183.667,277.801,183.667,238.229'
            />
          )}
          <g>
            {/* Heart Outline */}
            {suit === 'hearts' && (
              <path
                style={{ fill: '#2D2B29' }}
                d='M256,204.893c-8.717-8.216-20.304-12.921-32.495-12.921c-26.168,0-47.458,21.341-47.458,47.572 c0,51.788,72.907,93.661,76.011,95.418c1.223,0.692,2.582,1.038,3.941,1.038c1.359,0,2.719-0.346,3.941-1.038 c3.104-1.757,76.011-43.63,76.011-95.418c0-26.231-21.29-47.572-47.458-47.572C276.304,191.972,264.717,196.677,256,204.893z M319.952,239.544c0,36.435-49.466,70.049-63.956,79.111c-14.499-9.051-63.948-42.603-63.948-79.111 c0-17.409,14.112-31.572,31.458-31.572c10.331,0,20.013,5.113,25.902,13.679c1.492,2.171,3.958,3.468,6.592,3.468 c2.634,0,5.1-1.297,6.592-3.468c5.889-8.565,15.572-13.679,25.902-13.679C305.84,207.972,319.952,222.135,319.952,239.544z'
              />
            )}
            {/* Card Border */}
            <path
              style={{ fill: '#2D2B29' }}
              d='M376,0H136c-22.056,0-40,17.944-40,40v432c0,22.056,17.944,40,40,40h240c22.056,0,40-17.944,40-40 V40C416,17.944,398.056,0,376,0z M400,472c0,13.233-10.766,24-24,24H136c-13.234,0-24-10.767-24-24V40c0-13.233,10.766-24,24-24 h240c13.234,0,24,10.767,24,24V472z'
            />
            {/* Inner Bottom Left outline  */}
            <path
              style={{ fill: '#2D2B29' }}
              d='M312,456H152V136c0-4.418-3.582-8-8-8s-8,3.582-8,8v328c0,4.418,3.582,8,8,8h168 c4.418,0,8-3.582,8-8S316.418,456,312,456z'
            />
            {/* Inner Top Right outline  */}
            <path
              style={{ fill: '#2D2B29' }}
              d='M200,56h160v320c0,4.418,3.582,8,8,8s8-3.582,8-8V48c0-4.418-3.582-8-8-8H200c-4.418,0-8,3.582-8,8 S195.582,56,200,56z'
            />
          </g>
        </g>
        <text
          style={{
            fontFamily: theme.typography.fontFamily,
            fontWeight: 'bold',
            fontSize: value === '10' ? 95 : 100,
            transform: value === '10' ? 'translate(110px, 110px)' : 'translate(125px, 110px)',
            letterSpacing: value === '10' ? '-20px' : undefined,
            fill: '#2D2B29',
          }}
        >
          {value === 'X' ? 'J' : value}
        </text>
        <text
          style={{
            fontFamily: theme.typography.fontFamily,
            fontWeight: 'bold',
            fontSize: value === '10' ? 95 : 100,
            transform:
              value === '10'
                ? 'translate(397px, 395px) rotate(180deg)'
                : 'translate(390px, 400px) rotate(180deg)',
            letterSpacing: value === '10' ? '-20px' : undefined,
            fill: '#2D2B29',
          }}
        >
          {value === 'X' ? 'J' : value}
        </text>
      </svg>
    </SvgIcon>
  )
}
