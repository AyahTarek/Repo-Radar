import { describe, expect, it } from 'vitest';
import { isRateLimitExhausted, readRateLimit, shouldWarnAboutRateLimit } from './rateLimit';

function snapshot(limit: number, remaining: number) {
  return { limit, remaining, resetAt: new Date(0) };
}

describe('readRateLimit', () => {
  it('reads the quota headers and converts the reset to a Date', () => {
    const headers = new Headers({
      'x-ratelimit-limit': '60',
      'x-ratelimit-remaining': '58',
      'x-ratelimit-reset': '1800000000',
    });

    expect(readRateLimit(headers)).toEqual({
      limit: 60,
      remaining: 58,
      resetAt: new Date(1_800_000_000_000),
    });
  });

  it('returns null when the headers are absent or unparseable', () => {
    expect(readRateLimit(new Headers())).toBeNull();
    expect(readRateLimit(new Headers({ 'x-ratelimit-limit': 'lots' }))).toBeNull();
  });
});

describe('shouldWarnAboutRateLimit', () => {
  it('stays quiet on a healthy search quota, which is only 10 per minute', () => {
    // The regression this guards: a fixed threshold of 10 warned on the very
    // first search, when 9 of 10 requests were still available.
    expect(shouldWarnAboutRateLimit(snapshot(10, 9))).toBe(false);
    expect(shouldWarnAboutRateLimit(snapshot(10, 3))).toBe(false);
  });

  it('warns when a small quota really is nearly gone', () => {
    expect(shouldWarnAboutRateLimit(snapshot(10, 2))).toBe(true);
    expect(shouldWarnAboutRateLimit(snapshot(10, 0))).toBe(true);
  });

  it('warns near the end of the unauthenticated hourly quota', () => {
    expect(shouldWarnAboutRateLimit(snapshot(60, 30))).toBe(false);
    expect(shouldWarnAboutRateLimit(snapshot(60, 10))).toBe(true);
  });

  it('does not warn early just because an authenticated quota is large', () => {
    expect(shouldWarnAboutRateLimit(snapshot(5000, 900))).toBe(false);
    expect(shouldWarnAboutRateLimit(snapshot(5000, 10))).toBe(true);
  });

  it('says nothing before any response has been seen', () => {
    expect(shouldWarnAboutRateLimit(null)).toBe(false);
  });
});

describe('isRateLimitExhausted', () => {
  it('separates a 403 with quota left from a genuine rate limit', () => {
    expect(isRateLimitExhausted(snapshot(60, 30))).toBe(false);
    expect(isRateLimitExhausted(snapshot(60, 0))).toBe(true);
    expect(isRateLimitExhausted(null)).toBe(false);
  });
});
