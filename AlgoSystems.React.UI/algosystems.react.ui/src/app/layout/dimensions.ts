/** Shell sizes from the design reference, in px. */
export const TOP_BAR_HEIGHT = { phone: 60, desktop: 72 }

/** 205px between 701 and 1100px wide, 232px above. */
export const SIDEBAR_WIDTH = { narrow: 205, wide: 232 }

/** Phone bottom navigation: 50px items, 7px padding above and below, 1px top border. */
export const MOBILE_NAV_HEIGHT = 65

/** Bottom padding phone pages need so content clears the fixed bottom navigation. */
export const MOBILE_NAV_CLEARANCE = 94

/** The iPhone home-indicator inset, which the bottom navigation adds to its own padding. */
export const SAFE_AREA_BOTTOM = 'env(safe-area-inset-bottom)'
