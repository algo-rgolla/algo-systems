import type { AlertColor } from '@mui/material/Alert'

export interface Notification {
  id: number
  severity: AlertColor
  message: string
}

// A tiny module-level store so non-React code (e.g. the QueryClient's
// global error handler) can raise notifications without a context.
let current: Notification | null = null
let nextId = 1
const listeners = new Set<() => void>()

function emit(next: Notification | null) {
  current = next
  listeners.forEach((listener) => listener())
}

export const notify = {
  success: (message: string) => emit({ id: nextId++, severity: 'success', message }),
  error: (message: string) => emit({ id: nextId++, severity: 'error', message }),
  dismiss: () => emit(null),
}

export const notificationStore = {
  subscribe(listener: () => void) {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  },
  getSnapshot: () => current,
}
