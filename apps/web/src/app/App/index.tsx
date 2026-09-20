import { RouterProvider } from 'react-router';
import { router } from '@/app/router';
import { AppProviders } from '@/providers/AppProviders';

export function App() {
  return (
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  );
}
