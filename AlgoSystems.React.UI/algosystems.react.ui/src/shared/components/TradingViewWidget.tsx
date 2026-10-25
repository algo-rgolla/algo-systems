import Box from '@mui/material/Box'
import Skeleton from '@mui/material/Skeleton'
import { useEffect, useEffectEvent, useRef, useState } from 'react'

export type WidgetStatus = 'loading' | 'ready' | 'unavailable'

interface TradingViewWidgetProps {
  /** The widget's embed script, e.g. TradingView's embed-widget-market-quotes.js. */
  scriptSrc: string
  /** The widget's JSON settings, exactly as TradingView's embed code takes them. */
  config: Record<string, unknown>
  height: number
  /** Accessible name for the loading placeholder. */
  label: string
  onStatusChange?: (status: WidgetStatus) => void
  /** How long to wait for the widget to appear before reporting it unavailable. */
  timeoutMs?: number
}

/**
 * Mounts a TradingView embed widget. React renders an empty host element and never touches its
 * contents; the effect builds TradingView's standard embed markup inside it and removes it on
 * unmount. A failed script or a widget that never appears is reported as "unavailable" so the
 * caller can show a fallback. Remount (change the key) to retry.
 */
export function TradingViewWidget({
  scriptSrc,
  config,
  height,
  label,
  onStatusChange,
  timeoutMs = 12_000,
}: TradingViewWidgetProps) {
  const hostRef = useRef<HTMLDivElement>(null)
  const [status, setStatus] = useState<WidgetStatus>('loading')
  const configJson = JSON.stringify(config)

  const settle = useEffectEvent((next: WidgetStatus) => {
    setStatus(next)
    onStatusChange?.(next)
  })

  useEffect(() => {
    const host = hostRef.current
    if (!host) return

    let settled = false
    const finish = (next: WidgetStatus) => {
      if (settled) return
      settled = true
      settle(next)
    }

    // TradingView's embed markup: the script reads its JSON body and fills the sibling div.
    const container = document.createElement('div')
    container.className = 'tradingview-widget-container'
    container.style.height = '100%'
    const widget = document.createElement('div')
    widget.className = 'tradingview-widget-container__widget'
    widget.style.height = '100%'
    const script = document.createElement('script')
    script.src = scriptSrc
    script.async = true
    script.text = configJson
    script.onerror = () => finish('unavailable')

    const observer = new MutationObserver(() => {
      const iframe = container.querySelector('iframe')
      if (!iframe) return
      observer.disconnect()
      iframe.addEventListener('load', () => finish('ready'), { once: true })
    })
    observer.observe(container, { childList: true, subtree: true })
    const timer = window.setTimeout(() => finish('unavailable'), timeoutMs)

    container.append(widget, script)
    // Attach on the next frame: StrictMode's immediate unmount cancels it before the script
    // loads, instead of leaving a script running against a removed iframe.
    const frame = window.requestAnimationFrame(() => host.append(container))

    return () => {
      settled = true
      window.cancelAnimationFrame(frame)
      window.clearTimeout(timer)
      observer.disconnect()
      host.replaceChildren()
    }
  }, [scriptSrc, configJson, timeoutMs])

  return (
    <Box sx={{ position: 'relative', height }}>
      <Box ref={hostRef} sx={{ height: '100%' }} />
      {status === 'loading' && (
        <Skeleton
          variant="rectangular"
          aria-label={label}
          role="status"
          sx={{ position: 'absolute', inset: 0, height: '100%', borderRadius: '9px' }}
        />
      )}
    </Box>
  )
}
