import Button from '@mui/material/Button';
import { StateBlock } from '@repo-radar/ui';
import { isRouteErrorResponse, useRouteError } from 'react-router';

function toMessage(error: unknown): string {
  if (isRouteErrorResponse(error)) return `${error.status} ${error.statusText}`;
  if (error instanceof Error) return error.message;
  return 'An unexpected error occurred.';
}

/**
 * React Router's data router catches render errors inside its own default UI
 * before they can reach a boundary that only wraps <RouterProvider> from the
 * outside, so this has to be wired onto each route instead.
 */
export function RouteErrorBoundary() {
  const error = useRouteError();
  console.error('Unhandled route error', error);

  return (
    <StateBlock
      variant="error"
      title="Something went wrong"
      description={toMessage(error)}
      action={
        <Button variant="outlined" onClick={() => window.location.reload()}>
          Reload
        </Button>
      }
    />
  );
}
