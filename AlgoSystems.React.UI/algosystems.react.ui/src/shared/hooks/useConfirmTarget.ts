import { useState } from 'react'

/**
 * Holds the item a confirmation dialog is about to act on.
 * `target` is null while the dialog is closed.
 */
export function useConfirmTarget<T>() {
  const [target, setTarget] = useState<T | null>(null)

  return {
    target,
    open: target !== null,
    request: (item: T) => setTarget(item),
    close: () => setTarget(null),
  }
}
