import Box from '@mui/material/Box'

export const MAIN_CONTENT_ID = 'main-content'

/** Lets keyboard users jump past the navigation. Hidden until it receives focus. */
export function SkipLink() {
  return (
    <Box
      component="a"
      href={`#${MAIN_CONTENT_ID}`}
      sx={{
        position: 'fixed',
        top: 8,
        left: 8,
        zIndex: 'tooltip',
        px: 2,
        py: 1,
        borderRadius: 1,
        bgcolor: 'primary.main',
        color: 'primary.contrastText',
        fontWeight: 700,
        textDecoration: 'none',
        transform: 'translateY(-150%)',
        '&:focus': { transform: 'none' },
      }}
    >
      Skip to content
    </Box>
  )
}
