import type { ThemeMode } from './types';

export const THEME_MODES = ['dark', 'light'] as const satisfies readonly ThemeMode[];

export const DEFAULT_THEME_MODE: ThemeMode = 'dark';

export const OPPOSITE_THEME_MODE: Record<ThemeMode, ThemeMode> = {
  dark: 'light',
  light: 'dark',
};
