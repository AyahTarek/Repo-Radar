import type { PaletteOptions } from '@mui/material/styles';
import type { ThemeMode } from './types';

/** Tokens that must look identical in both modes. */
export const SHAPE_TOKENS = {
  borderRadius: 10,
} as const;

export const SPACING_UNIT = 8;

const darkPalette: PaletteOptions = {
  mode: 'dark',
  primary: { main: '#7cc4ff', contrastText: '#04121f' },
  secondary: { main: '#f2b8ff' },
  background: { default: '#0c1116', paper: '#141b22' },
  text: { primary: '#e6edf3', secondary: '#9aa7b2' },
  divider: 'rgba(230, 237, 243, 0.12)',
  success: { main: '#3fb950' },
  warning: { main: '#d29922' },
  error: { main: '#f85149' },
};

const lightPalette: PaletteOptions = {
  mode: 'light',
  primary: { main: '#0969da', contrastText: '#ffffff' },
  secondary: { main: '#8250df' },
  background: { default: '#f6f8fa', paper: '#ffffff' },
  text: { primary: '#1f2328', secondary: '#59636e' },
  divider: 'rgba(31, 35, 40, 0.12)',
  success: { main: '#1a7f37' },
  warning: { main: '#9a6700' },
  error: { main: '#cf222e' },
};

export const PALETTES: Record<ThemeMode, PaletteOptions> = {
  dark: darkPalette,
  light: lightPalette,
};
