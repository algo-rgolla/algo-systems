import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { isRouteErrorResponse, Link as RouterLink, useRouteError } from 'react-router'

function Fallback({ title, message }: { title: string; message: string }) {
  return (
    <Box
      sx={{ minHeight: '60vh', display: 'grid', placeItems: 'center', textAlign: 'center', p: 3 }}
    >
      <div>
        <Typography variant="h1" sx={{ mb: 1 }}>
          {title}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
          {message}
        </Typography>
        <Button component={RouterLink} to="/" variant="outlined">
          Back to dashboard
        </Button>
      </div>
    </Box>
  )
}

export function NotFoundPage() {
  return <Fallback title="Page not found" message="That page does not exist." />
}

export function RouteErrorPage() {
  const error = useRouteError()
  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : error instanceof Error
      ? error.message
      : 'An unexpected error occurred.'

  return <Fallback title="Something went wrong" message={message} />
}
