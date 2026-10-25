import type { PaletteOptions } from '@mui/material/styles'
import type {} from '@mui/x-data-grid/themeAugmentation'

/** Pill colours: a tinted background with a matching foreground. */
export interface SignalColor {
  bg: string
  fg: string
}

declare module '@mui/material/styles' {
  interface TypeText {
    /** Stat and form labels. */
    label: string
    /** Company names under tickers, footnotes. */
    caption: string
    tableHeader: string
  }
  interface Palette {
    /** Direction colours for financial values. Use these, never success/error, for P&L. */
    market: { up: string; down: string; flat: string }
    surface: {
      chrome: string
      raised: string
      overlay: string
      input: string
      control: string
      /** Unfilled part of progress bars. */
      track: string
      /** Table row hover. */
      hover: string
    }
    /** Rules inside panels, lighter than `divider` (which outlines panels). */
    line: { strong: string; subtle: string; row: string }
    /** Selectable tiles inside panels (scan types, watchlist cards). */
    tile: {
      bg: string
      border: string
      hoverBorder: string
      iconBg: string
      /** A gradient, for the `background` property. */
      selectedBg: string
      selectedRing: string
    }
    nav: { text: string; footer: string; hover: string; active: string }
    /** Status pills (scan signals, win/loss outcomes). */
    signal: { positive: SignalColor; warn: SignalColor; negative: SignalColor }
  }
  interface PaletteOptions {
    market?: Palette['market']
    surface?: Palette['surface']
    line?: Palette['line']
    tile?: Palette['tile']
    nav?: Palette['nav']
    signal?: Palette['signal']
  }
}

/** Colour values from the design reference (Design/algo_ui_design.html). */
export const tokens = {
  bg: '#0b1020',
  surface: '#111a2b',
  surfaceRaised: '#162238',
  surfaceOverlay: '#1b2942',
  chrome: '#0d1423',
  input: '#0d1525',
  control: '#18253b',
  controlBorder: '#34435e',
  inputBorder: '#2a3850',
  border: '#293750',
  lineSubtle: '#202c40',
  lineRow: '#253149',
  track: '#283650',
  rowHover: '#ffffff05',
  textPrimary: '#edf2fb',
  textSecondary: '#94a3b8',
  textLabel: '#a3b0c4',
  textCaption: '#8999b2',
  textTableHeader: '#8fa0b9',
  primary: '#91a0ff',
  onPrimary: '#10162a',
  up: '#4cdbab',
  down: '#ff8194',
  amber: '#f3c36d',
  navText: '#aab6ca',
  navFooter: '#7788a3',
  navHover: '#17243a',
  navActive: '#28365b',
  avatar: '#273657',
  avatarText: '#dce3ff',
  panelGradient: 'linear-gradient(145deg, #151f33, #111a2a)',
  panelShadow: '0 9px 25px #00000012',
}

export const palette: PaletteOptions = {
  mode: 'dark',
  primary: { main: tokens.primary, contrastText: tokens.onPrimary },
  success: { main: tokens.up },
  error: { main: tokens.down },
  warning: { main: tokens.amber },
  background: { default: tokens.bg, paper: tokens.surface },
  divider: tokens.border,
  text: {
    primary: tokens.textPrimary,
    secondary: tokens.textSecondary,
    label: tokens.textLabel,
    caption: tokens.textCaption,
    tableHeader: tokens.textTableHeader,
  },
  market: { up: tokens.up, down: tokens.down, flat: tokens.textSecondary },
  surface: {
    chrome: tokens.chrome,
    raised: tokens.surfaceRaised,
    overlay: tokens.surfaceOverlay,
    input: tokens.input,
    control: tokens.control,
    track: tokens.track,
    hover: tokens.rowHover,
  },
  line: { strong: tokens.inputBorder, subtle: tokens.lineSubtle, row: tokens.lineRow },
  tile: {
    bg: '#121d30',
    border: '#293851',
    hoverBorder: '#596ba5',
    iconBg: '#263451',
    selectedBg: 'linear-gradient(145deg, #29365a, #151f33)',
    selectedRing: '#91a0ff35',
  },
  // Tables sit inside panels and show the panel gradient through.
  DataGrid: { bg: 'transparent', headerBg: 'transparent', pinnedBg: tokens.surface },
  nav: {
    text: tokens.navText,
    footer: tokens.navFooter,
    hover: tokens.navHover,
    active: tokens.navActive,
  },
  signal: {
    positive: { bg: '#193b37', fg: '#67e2b8' },
    warn: { bg: '#493a24', fg: tokens.amber },
    negative: { bg: '#452733', fg: '#ff9aac' },
  },
}
