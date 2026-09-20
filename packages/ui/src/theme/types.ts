import type { ReactNode } from 'react';

export type ThemeMode = 'dark' | 'light';

export type ThemeModeContextValue = {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
};

export type ThemeModeProviderProps = {
  /** The current mode. The provider is controlled: it never owns this value. */
  mode: ThemeMode;
  /** Called with the next mode. Persisting it is the consumer's decision. */
  onModeChange: (mode: ThemeMode) => void;
  children: ReactNode;
};
