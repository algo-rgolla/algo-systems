import { marketHandlers } from './market'
import { portfolioHandlers } from './portfolio'
import { scanHandlers } from './scans'

/** Every demo-data handler. Each feature adds its own module here. */
export const handlers = [...scanHandlers, ...marketHandlers, ...portfolioHandlers]
