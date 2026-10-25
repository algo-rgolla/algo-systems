/**
 * True when VITE_USE_DEMO_DATA is "true": API requests are answered with simulated data from
 * src/mocks, and the UI must say so.
 */
export const DEMO_MODE = import.meta.env.VITE_USE_DEMO_DATA === 'true'
