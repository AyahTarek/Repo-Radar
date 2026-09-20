import { createTheme, type Theme } from '@mui/material/styles';
import { PALETTES, SHAPE_TOKENS, SPACING_UNIT } from './palette';
import type { ThemeMode } from './types';

/**
 * Pure function of the mode, so callers can safely memoise on `mode` alone.
 * All design decisions live here; no component hardcodes a colour.
 */
export function createAppTheme(mode: ThemeMode): Theme {
  return createTheme({
    palette: PALETTES[mode],
    spacing: SPACING_UNIT,
    shape: SHAPE_TOKENS,
    typography: {
      fontFamily:
        '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      h1: { fontSize: '1.75rem', fontWeight: 700 },
      h2: { fontSize: '1.375rem', fontWeight: 700 },
      h3: { fontSize: '1.125rem', fontWeight: 600 },
      button: { textTransform: 'none', fontWeight: 600 },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: { overflowY: 'scroll' },
        },
      },
      MuiCard: {
        defaultProps: { variant: 'outlined' },
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
      },
      MuiTooltip: {
        defaultProps: { arrow: true },
      },
      MuiLink: {
        defaultProps: { underline: 'hover' },
      },
    },
  });
}
