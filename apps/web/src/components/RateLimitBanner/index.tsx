import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import { RelativeDate } from '@/components/RelativeDate';
import { hasGithubToken } from '@/lib/env';
import { shouldWarnAboutRateLimit, useRateLimitStore } from '@/lib/github/rateLimit';

/**
 * Quota is invisible until it bites, which turns a rate limit into "the app is
 * broken". Showing it only when it is nearly gone keeps the UI quiet otherwise.
 */
export function RateLimitBanner() {
  const snapshot = useRateLimitStore((state) => state.snapshot);

  if (snapshot === null || !shouldWarnAboutRateLimit(snapshot)) return null;

  const exhausted = snapshot.remaining <= 0;

  return (
    <Alert severity={exhausted ? 'error' : 'warning'} variant="outlined">
      <AlertTitle>
        {exhausted
          ? 'GitHub API quota exhausted'
          : `Only ${snapshot.remaining} of ${snapshot.limit} GitHub requests left`}
      </AlertTitle>
      Quota resets <RelativeDate value={snapshot.resetAt} />
      {hasGithubToken
        ? '.'
        : '. Add a VITE_GITHUB_TOKEN to raise the limit from 60 to 5,000 requests per hour.'}
    </Alert>
  );
}
