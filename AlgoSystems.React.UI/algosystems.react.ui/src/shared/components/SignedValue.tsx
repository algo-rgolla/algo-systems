import Box, { type BoxProps } from '@mui/material/Box'
import { directionOf } from '@/shared/formatting/direction'

type SignedValueProps = Omit<BoxProps, 'children'> & {
  value: number | null
  format: (value: number | null) => string
}

/** Renders a number coloured by direction: up green, down red, zero/missing neutral. */
export function SignedValue({ value, format, sx, ...props }: SignedValueProps) {
  return (
    <Box
      component="span"
      sx={[{ color: `market.${directionOf(value)}` }, ...(Array.isArray(sx) ? sx : [sx])]}
      {...props}
    >
      {format(value)}
    </Box>
  )
}
