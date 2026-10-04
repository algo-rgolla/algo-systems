import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'

interface ErrorStateProps {
  error: unknown
  title?: string
  onRetry?: () => void
}

function describe(error: unknown) {
  if (error instanceof TypeError) return 'Could not reach the API. Check that it is running.'
  if (error instanceof Error) return error.message
  return 'Something went wrong.'
}

export function ErrorState({ error, title = 'Failed to load data', onRetry }: ErrorStateProps) {
  return (
    <Alert
      severity="error"
      variant="outlined"
      action={
        onRetry && (
          <Button color="inherit" size="small" onClick={onRetry}>
            Retry
          </Button>
        )
      }
    >
      <strong>{title}.</strong> {describe(error)}
    </Alert>
  )
}
