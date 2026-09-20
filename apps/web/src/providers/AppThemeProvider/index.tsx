import { ThemeModeProvider } from '@repo-radar/ui';
import type { ReactNode } from 'react';
import { useThemeStore } from '@/features/theme/store/themeStore';

/**
 * The only wiring between the persisted mode and the design system's controlled
 * provider. Swapping localStorage for a user account would only change this file.
 */
export function AppThemeProvider({ children }: { children: ReactNode }) {
  const mode = useThemeStore((state) => state.mode);
  const setMode = useThemeStore((state) => state.setMode);

  return (
    <ThemeModeProvider mode={mode} onModeChange={setMode}>
      {children}
    </ThemeModeProvider>
  );
}
