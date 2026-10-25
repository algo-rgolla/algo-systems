/** Areas of demo data, for simulating a failure in one of them. */
export type DemoArea = 'scans' | 'market' | 'portfolio' | 'stocks' | 'history' | 'watchlist'

const LATENCY_MS = 250

function wait(ms: number, signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal?.aborted) return reject(signal.reason)
    const timer = setTimeout(resolve, ms)
    signal?.addEventListener(
      'abort',
      () => {
        clearTimeout(timer)
        reject(signal.reason)
      },
      { once: true },
    )
  })
}

/** `?demoFail=scans` (or `all`) in the page URL makes that area's demo requests fail. */
function shouldFail(area: DemoArea) {
  if (typeof window === 'undefined') return false
  const value = new URLSearchParams(window.location.search).get('demoFail')
  return value === area || value === 'all'
}

interface DemoRequestOptions {
  signal?: AbortSignal
  latencyMs?: number
}

/**
 * Runs a demo-data operation the way a request would run: asynchronously, after a short delay,
 * cancellable, and returning a copy so callers can't change the demo store by accident.
 */
export async function demoRequest<T>(
  area: DemoArea,
  operation: () => T,
  { signal, latencyMs = LATENCY_MS }: DemoRequestOptions = {},
): Promise<T> {
  await wait(latencyMs, signal)
  if (shouldFail(area)) {
    throw new Error(`The demo ${area} data could not be loaded (simulated failure).`)
  }
  return structuredClone(operation())
}
