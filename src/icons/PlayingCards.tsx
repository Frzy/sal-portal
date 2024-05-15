import { SvgIcon } from '@mui/material'

export default function PlayingCardsIcon({
  variant = 'filled',
  ...props
}: PortalIconProps): React.JSX.Element {
  return (
    <SvgIcon {...props}>
      <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 -960 960 960' fill='currentColor'>
        {variant === 'outlined' ? (
          <path d='m608-368 46-166-142-98-46 166 142 98ZM160-207l-33-16q-31-13-42-44.5t3-62.5l72-156v279Zm160 87q-33 0-56.5-24T240-201v-239l107 294q3 7 5 13.5t7 12.5h-39Zm206-5q-31 11-62-3t-42-45L245-662q-11-31 3-61.5t45-41.5l301-110q31-11 61.5 3t41.5 45l178 489q11 31-3 61.5T827-235L526-125Zm-28-75 302-110-179-490-301 110 178 490Zm62-300Z' />
        ) : (
          <path d='m605-380 45-157-135-91-46 157 136 91ZM168-222l-30-15q-28-13-38-40t3-55l65-140v250Zm148 78q-31 0-53.5-20.5T240-216v-288l134 360h-58Zm206-4q-31 11-56-1t-36-43L259-660q-11-31 .5-56.5T302-753l294-107q31-11 56 .5t36 42.5l172 472q11 31-.5 56T817-253L522-148Z' />
        )}
      </svg>
    </SvgIcon>
  )
}
