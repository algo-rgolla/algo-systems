import { MutationCache, QueryClient } from '@tanstack/react-query'
import { ApiError } from '@/api/client/httpClient'
import { notify } from '@/shared/notifications/notify'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data changes once per nightly batch run; avoid refetching on every focus.
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: (failureCount, error) =>
        // Client errors will not fix themselves on retry.
        !(error instanceof ApiError && error.status >= 400 && error.status < 500) &&
        failureCount < 2,
    },
  },
  mutationCache: new MutationCache({
    onError: (error) => notify.error(error.message || 'The change could not be saved.'),
  }),
})
