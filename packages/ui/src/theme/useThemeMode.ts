import { useContext } from 'react';
import { ThemeModeContext } from './context';
import type { ThemeModeContextValue } from './types';

export function useThemeMode(): ThemeModeContextValue {
  const value = useContext(ThemeModeContext);

  if (value === null) {
    throw new Error('useThemeMode must be used inside a <ThemeModeProvider>.');
  }

  return value;
}
