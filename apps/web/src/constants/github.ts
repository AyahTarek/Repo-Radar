export const GITHUB_API_BASE_URL = 'https://api.github.com';

export const GITHUB_API_VERSION = '2022-11-28';

export const GITHUB_ACCEPT_HEADER = 'application/vnd.github+json';

export const GITHUB_WEB_BASE_URL = 'https://github.com';

/** Response headers that carry quota information on every single request. */
export const RATE_LIMIT_HEADERS = {
  limit: 'x-ratelimit-limit',
  remaining: 'x-ratelimit-remaining',
  reset: 'x-ratelimit-reset',
} as const;

/**
 * GitHub reports several different quotas (60/hour core, 10/minute search,
 * 5,000/hour authenticated), so the warning point has to be relative to the limit
 * that was actually reported. The smaller of these two rules wins: a fixed number
 * of requests, or a fraction of the limit.
 */
export const RATE_LIMIT_WARNING_REQUESTS = 10;
export const RATE_LIMIT_WARNING_RATIO = 0.2;

export const HTTP_STATUS = {
  forbidden: 403,
  notFound: 404,
  unprocessable: 422,
  tooManyRequests: 429,
  serverError: 500,
} as const;
