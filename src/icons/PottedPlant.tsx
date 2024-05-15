import { SvgIcon } from '@mui/material'

export default function PottedPlantIcon({
  variant = 'filled',
  ...props
}: PortalIconProps): React.JSX.Element {
  return (
    <SvgIcon {...props}>
      <svg
        xmlns='http://www.w3.org/2000/svg'
        height='20px'
        viewBox='0 -960 960 960'
        width='20px'
        fill='currentColor'
      >
        {variant === 'outlined' ? (
          <path d='M366-168h228l37-168H330l36 168Zm0 72q-26 0-45.5-16T296-153l-40-183h448l-40 183q-5 25-24.8 41T593-96H366ZM216-408h528v-96H216v96Zm264-264q0-80 56-136t136-56q0 69-43.5 122.5T516-676v100h300v168q0 29.7-21.15 50.85Q773.7-336 744-336H216q-29.7 0-50.85-21.15Q144-378.3 144-408v-168h300v-100q-69-12-112.5-65.5T288-864q80 0 136 56t56 136Z' />
        ) : (
          <path d='M366-96q-26 0-45.5-16T296-153l-40-183h448l-40 183q-5 25-24.8 41T593-96H366Zm114-576q0-80 56-136t136-56q0 69-43.5 122.5T516-676v100h300v120q0 29.7-21.15 50.85Q773.7-384 744-384H216q-29.7 0-50.85-21.15Q144-426.3 144-456v-120h300v-100q-69-12-112.5-65.5T288-864q80 0 136 56t56 136Z' />
        )}
      </svg>
    </SvgIcon>
  )
}
