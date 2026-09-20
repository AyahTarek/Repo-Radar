import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { useMemo } from 'react';
import { OPPOSITE_THEME_MODE } from '../constants';
import { ThemeModeContext } from '../context';
import { createAppTheme } from '../createAppTheme';
import type { ThemeModeProviderProps } from '../types';

/**
 * Controlled provider: the mode comes in as a prop and changes go out through
 * `onModeChange`, so the design system stays free of any storage concern while
 * still owning the whole theming mechanism.
 */
export function ThemeModeProvider({
  mode,
  onModeChange,
  children,
}: ThemeModeProviderProps) {
  const theme = useMemo(() => createAppTheme(mode), [mode]);

  const contextValue = useMemo(
    () => ({
      mode,
      setMode: onModeChange,
      toggleMode: () => onModeChange(OPPOSITE_THEME_MODE[mode]),
    }),
    [mode, onModeChange],
  );

  return (
    <ThemeModeContext.Provider value={contextValue}>
      <ThemeProvider theme={theme}>
        <CssBaseline enableColorScheme />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
}
