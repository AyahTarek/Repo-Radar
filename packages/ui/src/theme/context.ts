import { createContext } from 'react';
import type { ThemeModeContextValue } from './types';

/** `null` means "no provider above me", which `useThemeMode` turns into an error. */
export const ThemeModeContext = createContext<ThemeModeContextValue | null>(null);
