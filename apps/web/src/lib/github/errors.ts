import { HTTP_STATUS } from '@/constants/github';

export type ApiErrorKind =
  /** Request never produced a response (offline, DNS, CORS). */
  | 'network'
  /** Quota exhausted - retrying immediately only makes it worse. */
  | 'rate_limit'
  /** The repository is gone, renamed, or private. Never worth retrying. */
  | 'not_found'
  /** Rejected query, e.g. paging past GitHub's 1,000-result search ceiling. */
  | 'invalid_request'
  /** Any other non-2xx response. */
  | 'http'
  /** Transport succeeded but the payload did not match the schema. */
  | 'parse';

type ApiErrorInit = {
  kind: ApiErrorKind;
  message: string;
  status?: number;
};

export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status: number | undefined;

  constructor({ kind, message, status }: ApiErrorInit) {
    super(message);
    this.name = 'ApiError';
    this.kind = kind;
    this.status = status;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError';
}

/** Retrying only helps transient failures; everything else just burns quota. */
export function isRetryableApiError(error: unknown): boolean {
  if (!isApiError(error)) return false;
  if (error.kind === 'network') return true;

  return (
    error.kind === 'http' &&
    error.status !== undefined &&
    error.status >= HTTP_STATUS.serverError
  );
}

export function apiErrorFromStatus(status: number, isRateLimited: boolean): ApiError {
  if (isRateLimited) {
    return new ApiError({
      kind: 'rate_limit',
      status,
      message:
        'GitHub API rate limit reached. Wait for the quota to reset, or add a token to raise the limit.',
    });
  }

  if (status === HTTP_STATUS.notFound) {
    return new ApiError({
      kind: 'not_found',
      status,
      message: 'This repository no longer exists, was renamed, or is private.',
    });
  }

  if (status === HTTP_STATUS.unprocessable) {
    return new ApiError({
      kind: 'invalid_request',
      status,
      message: 'GitHub rejected this query. Try narrowing the search.',
    });
  }

  return new ApiError({
    kind: 'http',
    status,
    message: `GitHub request failed with status ${status}.`,
  });
}

export function parseError(issuePath: string): ApiError {
  return new ApiError({
    kind: 'parse',
    message:
      issuePath.length > 0
        ? `Unexpected response shape at "${issuePath}".`
        : 'The GitHub response did not match the expected shape.',
  });
}

export function networkError(): ApiError {
  return new ApiError({
    kind: 'network',
    message: 'Could not reach GitHub. Check your connection and try again.',
  });
}
