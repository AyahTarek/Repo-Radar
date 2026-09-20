import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeModeProvider } from '@repo-radar/ui';
import { render } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';
import { MemoryRouter } from 'react-router';

/**
 * A fresh QueryClient per test with retries off: a test asserting an error state
 * should not wait out the production backoff.
 */
function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
}

type Options = {
  route?: string;
};

export function renderWithProviders(ui: ReactElement, { route = '/' }: Options = {}) {
  const queryClient = createTestQueryClient();

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <MemoryRouter initialEntries={[route]}>
        <ThemeModeProvider mode="dark" onModeChange={() => undefined}>
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        </ThemeModeProvider>
      </MemoryRouter>
    );
  }

  return { ...render(ui, { wrapper: Wrapper }), queryClient };
}
