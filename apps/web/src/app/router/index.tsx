import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router';
import { RootLayout } from '@/app/RootLayout';
import { RouteErrorBoundary } from '@/app/router/RouteErrorBoundary';
import { RouteFallback } from '@/app/router/RouteFallback';
import { SearchPage } from '@/pages/SearchPage';
import { ROUTES } from './routes';

// The chart library is the heaviest dependency in the app and only the tracked
// page needs it, so it stays out of the initial bundle.
const TrackedPage = lazy(async () => ({
  default: (await import('@/pages/TrackedPage')).TrackedPage,
}));

export const router = createBrowserRouter([
  {
    path: ROUTES.search,
    Component: RootLayout,
    ErrorBoundary: RouteErrorBoundary,
    children: [
      { index: true, Component: SearchPage, ErrorBoundary: RouteErrorBoundary },
      {
        path: ROUTES.tracked,
        ErrorBoundary: RouteErrorBoundary,
        element: (
          <Suspense fallback={<RouteFallback />}>
            <TrackedPage />
          </Suspense>
        ),
      },
      { path: '*', element: <Navigate to={ROUTES.search} replace /> },
    ],
  },
]);
