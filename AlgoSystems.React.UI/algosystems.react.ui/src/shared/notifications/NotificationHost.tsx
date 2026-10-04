import Alert from '@mui/material/Alert'
import Snackbar from '@mui/material/Snackbar'
import { useSyncExternalStore } from 'react'
import { notificationStore, notify } from './notify'

/** Renders the most recent notification. Mount once, near the app root. */
export function NotificationHost() {
  const notification = useSyncExternalStore(
    notificationStore.subscribe,
    notificationStore.getSnapshot,
  )

  return (
    <Snackbar
      key={notification?.id}
      open={notification !== null}
      autoHideDuration={5000}
      onClose={(_, reason) => reason !== 'clickaway' && notify.dismiss()}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    >
      {notification ? (
        <Alert severity={notification.severity} variant="filled" onClose={notify.dismiss}>
          {notification.message}
        </Alert>
      ) : undefined}
    </Snackbar>
  )
}
