import type { ReactNode } from 'react';
import { AppErrorBoundary } from '@/components/AppErrorBoundary';
import { AppThemeProvider } from './AppThemeProvider';
import { QueryProvider } from './QueryProvider';

/**
 * Composition root. Theme sits outside the boundary so the fallback UI is still
 * themed when a render error occurs.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AppThemeProvider>
      <AppErrorBoundary>
        <QueryProvider>{children}</QueryProvider>
      </AppErrorBoundary>
    </AppThemeProvider>
  );
}
