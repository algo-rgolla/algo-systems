import { createTheme } from '@mui/material/styles'
import type {} from '@mui/x-data-grid/themeAugmentation'
import { MOBILE_NAV_HEIGHT, SAFE_AREA_BOTTOM } from '@/app/layout/dimensions'
import { palette, tokens } from './palette'

declare module '@mui/material/Paper' {
  interface PaperPropsVariantOverrides {
    /** The design's gradient card: panels, stat strips and watchlist cards. */
    panel: true
  }
}

const rem = (px: number) => `${px / 16}rem`

const fontFamily = '"Inter Variable", Inter, Roboto, "Segoe UI", Arial, sans-serif'

const base = createTheme({
  // The design's breakpoints are max-widths of 380, 700 and 1100px, so `down('md')` is the
  // phone layout (bottom navigation) and `down('lg')` the narrow sidebar.
  breakpoints: { values: { xs: 0, sm: 381, md: 701, lg: 1101, xl: 1600 } },
  palette,
  shape: { borderRadius: 9 },
  typography: {
    fontFamily,
    fontSize: 14,
    h1: { fontSize: rem(20), fontWeight: 750, letterSpacing: '-0.3px', lineHeight: 1.3 },
    h2: { fontSize: rem(16), fontWeight: 750, lineHeight: 1.35 },
    h3: { fontSize: rem(14), fontWeight: 750, lineHeight: 1.4 },
    subtitle2: { fontWeight: 700 },
    body1: { fontSize: rem(14) },
    body2: { fontSize: rem(13) },
    caption: { fontSize: rem(11) },
    overline: { fontSize: rem(10), fontWeight: 700, letterSpacing: '0.6px', lineHeight: 1.6 },
    button: { textTransform: 'none', fontWeight: 600, fontSize: rem(12) },
  },
})

const phone = base.breakpoints.down('md')

/** Keyboard focus ring. Shown only for keyboard focus (`:focus-visible`), never on click. */
const focusRing = { outline: `2px solid ${tokens.primary}`, outlineOffset: 2 }

export const theme = createTheme(base, {
  typography: {
    h1: { [phone]: { fontSize: rem(18) } },
    h3: { [phone]: { fontSize: rem(13) } },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          // Aligned digits in every table and figure.
          fontVariantNumeric: 'tabular-nums',
          WebkitFontSmoothing: 'antialiased',
          [phone]: { fontSize: rem(13) },
        },
        ':focus-visible': focusRing,
      },
    },
    MuiButtonBase: {
      styleOverrides: { root: { '&.Mui-focusVisible': focusRing } },
    },
    MuiLink: {
      defaultProps: { underline: 'hover' },
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          variants: [
            {
              props: { variant: 'panel' },
              style: {
                minWidth: 0,
                background: tokens.panelGradient,
                border: `1px solid ${tokens.border}`,
                borderRadius: 15,
                boxShadow: tokens.panelShadow,
                [phone]: { borderRadius: 13 },
              },
            },
          ],
        },
        outlined: { borderColor: tokens.border },
      },
    },
    MuiAppBar: {
      defaultProps: { elevation: 0, color: 'inherit' },
      styleOverrides: {
        root: { backgroundColor: tokens.chrome, borderBottom: `1px solid ${tokens.border}` },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          width: 34,
          height: 34,
          fontSize: rem(14),
          fontWeight: 700,
          backgroundColor: tokens.avatar,
          color: tokens.avatarText,
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          padding: '10px 13px',
          lineHeight: 1.2,
          whiteSpace: 'nowrap',
          '&:hover': { filter: 'brightness(1.12)' },
          [base.breakpoints.down('sm')]: { padding: '9px 10px' },
          variants: [
            {
              props: { variant: 'contained', color: 'primary' },
              style: { fontWeight: 750, '&:hover': { backgroundColor: tokens.primary } },
            },
            {
              props: { variant: 'outlined' },
              style: {
                backgroundColor: tokens.control,
                borderColor: tokens.controlBorder,
                color: tokens.textPrimary,
                '&:hover': { backgroundColor: tokens.control, borderColor: tokens.controlBorder },
              },
            },
          ],
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: tokens.input,
          '& .MuiOutlinedInput-notchedOutline': { borderColor: tokens.inputBorder },
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          variants: [
            {
              // Allocation and outcome bars. The indeterminate variant stays the thin top-bar loader.
              props: { variant: 'determinate' },
              style: {
                height: 6,
                borderRadius: 8,
                backgroundColor: tokens.track,
                '& .MuiLinearProgress-bar': { borderRadius: 8 },
              },
            },
          ],
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: { borderRadius: 12, fontSize: rem(13), alignItems: 'center' },
        outlined: { backgroundColor: tokens.surface },
      },
    },
    MuiSkeleton: {
      styleOverrides: { root: { backgroundColor: tokens.surfaceOverlay } },
    },
    MuiDataGrid: {
      styleOverrides: {
        root: {
          border: 0,
          fontSize: rem(12),
          '--DataGrid-rowBorderColor': tokens.lineSubtle,
          '--DataGrid-t-color-interactive-hover': tokens.rowHover,
          [phone]: { fontSize: rem(11) },
        },
        columnHeaders: { borderBottom: `1px solid ${tokens.inputBorder}` },
        columnHeader: {
          padding: '0 10px',
          '&:focus, &:focus-within': { outline: 'none' },
          '&:focus-visible': { outline: `2px solid ${tokens.primary}`, outlineOffset: -2 },
          [phone]: { padding: '0 9px' },
        },
        columnHeaderTitle: {
          fontSize: rem(10),
          fontWeight: 700,
          letterSpacing: '0.6px',
          textTransform: 'uppercase',
          color: tokens.textTableHeader,
          [phone]: { fontSize: rem(9) },
        },
        columnSeparator: { display: 'none' },
        row: { '&:hover': { backgroundColor: tokens.rowHover } },
        cell: {
          padding: '0 10px',
          // Cells take focus on click; only keyboard focus gets a ring.
          '&:focus, &:focus-within': { outline: 'none' },
          '&:focus-visible': { outline: `2px solid ${tokens.primary}`, outlineOffset: -2 },
          [phone]: { padding: '0 9px' },
        },
        footerContainer: { borderTop: `1px solid ${tokens.lineSubtle}` },
        overlay: { backgroundColor: 'transparent' },
      },
    },
    MuiSnackbar: {
      styleOverrides: {
        // Toasts sit above the phone bottom navigation instead of behind it.
        root: { [phone]: { bottom: `calc(${MOBILE_NAV_HEIGHT + 8}px + ${SAFE_AREA_BOTTOM})` } },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: tokens.surfaceOverlay,
          border: `1px solid ${tokens.border}`,
          fontSize: rem(12),
        },
      },
    },
    MuiPopover: {
      styleOverrides: {
        paper: { backgroundColor: tokens.surfaceRaised, border: `1px solid ${tokens.border}` },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: tokens.surface,
          border: `1px solid ${tokens.border}`,
          borderRadius: 15,
        },
      },
    },
  },
})
