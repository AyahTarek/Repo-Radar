import type { ZodType } from 'zod';
import {
  GITHUB_ACCEPT_HEADER,
  GITHUB_API_BASE_URL,
  GITHUB_API_VERSION,
  HTTP_STATUS,
} from '@/constants/github';
import { env } from '@/lib/env';
import { parseOrThrow } from '@/lib/validation';
import {
  apiErrorFromStatus,
  isAbortError,
  networkError,
  parseError,
} from './errors';
import { isRateLimitExhausted, readRateLimit, useRateLimitStore } from './rateLimit';

type RequestOptions<T> = {
  /** Path plus query string, e.g. "/search/repositories?q=react". */
  path: string;
  schema: ZodType<T>;
  signal: AbortSignal;
};

function buildHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    Accept: GITHUB_ACCEPT_HEADER,
    'X-GitHub-Api-Version': GITHUB_API_VERSION,
  };

  if (env.githubToken !== undefined) {
    headers.Authorization = `Bearer ${env.githubToken}`;
  }

  return headers;
}

/**
 * The only place `fetch` is called. Everything inward of this function works with
 * validated domain data and typed ApiErrors.
 */
export async function githubRequest<T>({ path, schema, signal }: RequestOptions<T>): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${GITHUB_API_BASE_URL}${path}`, {
      signal,
      headers: buildHeaders(),
    });
  } catch (error) {
    // Cancellation is a normal part of the query lifecycle, not a failure.
    if (isAbortError(error)) throw error;
    throw networkError();
  }

  const snapshot = readRateLimit(response.headers);
  if (snapshot !== null) {
    useRateLimitStore.getState().record(snapshot);
  }

  if (!response.ok) {
    const rateLimited =
      (response.status === HTTP_STATUS.forbidden ||
        response.status === HTTP_STATUS.tooManyRequests) &&
      isRateLimitExhausted(snapshot);

    throw apiErrorFromStatus(response.status, rateLimited);
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw parseError('');
  }

  return parseOrThrow(schema, payload, parseError);
}
