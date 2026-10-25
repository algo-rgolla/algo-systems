/** Mulberry32: a small seeded generator, so demo data is identical on every load. */
export function seededRandom(seed: number): () => number {
  let state = seed | 0
  return () => {
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** A stable 32-bit seed from a string, e.g. a stock key. */
export function seedFrom(text: string): number {
  let hash = 7
  for (const char of text) hash = (Math.imul(hash, 31) + char.charCodeAt(0)) | 0
  return hash
}
