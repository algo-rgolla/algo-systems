import { setupWorker } from 'msw/browser'
import { HttpNetworkFrame } from 'msw/experimental'
import { handlers } from './handlers'

const worker = setupWorker(...handlers)

export function startMockWorker() {
  return worker.start({
    // Only API calls without demo data are worth flagging; they go through to the real API.
    // Page loads, assets and Vite modules pass through silently.
    onUnhandledFrame({ frame, defaults }) {
      if (frame instanceof HttpNetworkFrame && isApiRequest(frame.data.request)) defaults.warn()
    },
  })
}

function isApiRequest(request: Request) {
  return new URL(request.url).pathname.startsWith('/api/')
}
