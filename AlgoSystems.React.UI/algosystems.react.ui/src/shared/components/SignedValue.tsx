import Box, { type BoxProps } from '@mui/material/Box'

type SignedValueProps = Omit<BoxProps, 'children'> & {
  value: number | null
  format: (value: number | null) => string
}

/** Renders a number coloured by direction: up green, down red, zero/missing neutral. */
export function SignedValue({ value, format, sx, ...props }: SignedValueProps) {
  const tone = value == null || value === 0 ? 'flat' : value > 0 ? 'up' : 'down'

  return (
    <Box
      component="span"
      sx={[{ color: `market.${tone}`, fontWeight: 500 }, ...(Array.isArray(sx) ? sx : [sx])]}
      {...props}
    >
      {format(value)}
    </Box>
  )
}
