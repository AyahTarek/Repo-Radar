import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { HTTP_STATUS } from '@/constants/github';
import { githubRequest } from './client';
import { ApiError, isRetryableApiError } from './errors';
import { useRateLimitStore } from './rateLimit';

const schema = z.object({ id: z.number() });

function jsonResponse(body: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'content-type': 'application/json' },
    ...init,
  });
}

function request() {
  return githubRequest({ path: '/anything', schema, signal: new AbortController().signal });
}

describe('githubRequest', () => {
  beforeEach(() => {
    useRateLimitStore.setState({ snapshot: null });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns the validated payload on success', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ id: 7, extra: 'ignored' })));

    await expect(request()).resolves.toEqual({ id: 7 });
  });

  it('sends the GitHub API version and accept headers', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ id: 1 }));
    vi.stubGlobal('fetch', fetchMock);

    await request();

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(init.headers).toMatchObject({
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': expect.any(String),
    });
  });

  it('records the quota reported on every response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        jsonResponse(
          { id: 1 },
          {
            headers: {
              'x-ratelimit-limit': '60',
              'x-ratelimit-remaining': '42',
              'x-ratelimit-reset': '1800000000',
            },
          },
        ),
      ),
    );

    await request();

    expect(useRateLimitStore.getState().snapshot).toEqual({
      limit: 60,
      remaining: 42,
      resetAt: new Date(1_800_000_000_000),
    });
  });

  it('maps a 403 with no quota left to a rate limit error', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        jsonResponse({}, { status: HTTP_STATUS.forbidden, headers: { 'x-ratelimit-limit': '60', 'x-ratelimit-remaining': '0', 'x-ratelimit-reset': '1800000000' } }),
      ),
    );

    await expect(request()).rejects.toMatchObject({ kind: 'rate_limit' });
  });

  it('does not call a 403 with quota left a rate limit', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        jsonResponse({}, { status: HTTP_STATUS.forbidden, headers: { 'x-ratelimit-limit': '60', 'x-ratelimit-remaining': '30', 'x-ratelimit-reset': '1800000000' } }),
      ),
    );

    await expect(request()).rejects.toMatchObject({ kind: 'http' });
  });

  it('maps 404 to not_found and 422 to invalid_request', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({}, { status: HTTP_STATUS.notFound })));
    await expect(request()).rejects.toMatchObject({ kind: 'not_found' });

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({}, { status: HTTP_STATUS.unprocessable })));
    await expect(request()).rejects.toMatchObject({ kind: 'invalid_request' });
  });

  it('reports the failing field when the payload does not match', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ id: 'not-a-number' })));

    await expect(request()).rejects.toMatchObject({
      kind: 'parse',
      message: expect.stringContaining('id'),
    });
  });

  it('maps a transport failure to a network error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));

    await expect(request()).rejects.toMatchObject({ kind: 'network' });
  });

  it('rethrows cancellation untouched so React Query can ignore it', async () => {
    const abortError = new DOMException('The operation was aborted.', 'AbortError');
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(abortError));

    await expect(request()).rejects.toBe(abortError);
  });
});

describe('isRetryableApiError', () => {
  it.each([
    ['network', 'network', undefined, true],
    ['a 500', 'http', HTTP_STATUS.serverError, true],
    ['a 404', 'not_found', HTTP_STATUS.notFound, false],
    ['an exhausted quota', 'rate_limit', HTTP_STATUS.forbidden, false],
    ['a rejected query', 'invalid_request', HTTP_STATUS.unprocessable, false],
    ['a bad payload', 'parse', undefined, false],
  ] as const)('retries %s: %s', (_label, kind, status, expected) => {
    const error = new ApiError({
      kind,
      message: 'test',
      ...(status === undefined ? {} : { status }),
    });

    expect(isRetryableApiError(error)).toBe(expected);
  });

  it('never retries a non-API error', () => {
    expect(isRetryableApiError(new Error('boom'))).toBe(false);
  });
});
