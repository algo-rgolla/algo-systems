import { alpha, createTheme } from '@mui/material/styles'

declare module '@mui/material/styles' {
  interface Palette {
    /** Direction colours for financial values. Use these, never success/error, for P&L. */
    market: { up: string; down: string; flat: string }
  }
  interface PaletteOptions {
    market?: { up: string; down: string; flat: string }
  }
}

const tokens = {
  bg: '#0b0f17',
  surface: '#111723',
  surfaceRaised: '#161d2b',
  border: '#1f2736',
  textPrimary: '#e6eaf2',
  textSecondary: '#8b95a7',
  accent: '#4c8dff',
  up: '#2ebd85',
  down: '#f6465d',
  flat: '#8b95a7',
}

const fontFamily = '"Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif'

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: tokens.accent },
    success: { main: tokens.up },
    error: { main: tokens.down },
    background: { default: tokens.bg, paper: tokens.surface },
    divider: tokens.border,
    text: { primary: tokens.textPrimary, secondary: tokens.textSecondary },
    market: { up: tokens.up, down: tokens.down, flat: tokens.flat },
  },
  shape: { borderRadius: 4 },
  typography: {
    fontFamily,
    fontSize: 13,
    h1: { fontSize: '1.375rem', fontWeight: 600, letterSpacing: '-0.01em' },
    h2: { fontSize: '1.125rem', fontWeight: 600 },
    h3: { fontSize: '0.9375rem', fontWeight: 600 },
    subtitle2: { fontWeight: 600 },
    overline: { fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.08em', lineHeight: 1.6 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          // Aligned digits in every table and figure.
          fontVariantNumeric: 'tabular-nums',
          WebkitFontSmoothing: 'antialiased',
        },
      },
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: { backgroundImage: 'none' },
        outlined: { borderColor: tokens.border },
      },
    },
    MuiAppBar: {
      defaultProps: { elevation: 0, color: 'inherit' },
      styleOverrides: {
        root: { backgroundColor: tokens.bg, borderBottom: `1px solid ${tokens.border}` },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: { backgroundColor: tokens.bg, borderColor: tokens.border },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          '&.Mui-selected': {
            backgroundColor: alpha(tokens.accent, 0.12),
            color: tokens.textPrimary,
            '&:hover': { backgroundColor: alpha(tokens.accent, 0.18) },
          },
        },
      },
    },
    MuiTab: {
      styleOverrides: { root: { minHeight: 40, fontWeight: 600 } },
    },
    MuiTabs: {
      styleOverrides: { root: { minHeight: 40 } },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: tokens.surfaceRaised,
          border: `1px solid ${tokens.border}`,
          fontSize: '0.75rem',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: { border: `1px solid ${tokens.border}`, backgroundColor: tokens.surface },
      },
    },
  },
})
