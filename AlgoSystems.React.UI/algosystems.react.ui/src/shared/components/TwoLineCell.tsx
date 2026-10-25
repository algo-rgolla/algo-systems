import Box from '@mui/material/Box'

interface TwoLineCellProps {
  primary: string
  secondary?: string | null
}

/** A bold value over a small caption, e.g. ticker over company name. */
export function TwoLineCell({ primary, secondary }: TwoLineCellProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        height: '100%',
        minWidth: 0,
      }}
    >
      <Box component="span" sx={{ fontWeight: 780, letterSpacing: '0.15px', lineHeight: 1.25 }}>
        {primary}
      </Box>
      {secondary && (
        <Box
          component="span"
          sx={{
            mt: '4px',
            color: 'text.caption',
            fontSize: '0.625rem',
            lineHeight: 1.2,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {secondary}
        </Box>
      )}
    </Box>
  )
}
