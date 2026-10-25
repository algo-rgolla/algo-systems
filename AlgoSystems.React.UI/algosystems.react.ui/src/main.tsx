import '@fontsource-variable/inter'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from '@/app/App'

/**
 * With VITE_USE_DEMO_DATA=true, a mock service worker answers API requests from src/mocks.
 * The flag is read inline (not via shared/config's DEMO_MODE) so the build replaces it with a
 * constant and drops the mocks, and their demo data, from normal builds.
 */
async function startDemoData() {
  if (import.meta.env.VITE_USE_DEMO_DATA !== 'true') return
  const { startMockWorker } = await import('@/mocks/browser')
  await startMockWorker()
}

function render() {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

startDemoData()
  .catch((error: unknown) => console.error('Demo data is unavailable; using the API.', error))
  .then(render)
