import { create } from 'zustand';
import {
  RATE_LIMIT_HEADERS,
  RATE_LIMIT_WARNING_RATIO,
  RATE_LIMIT_WARNING_REQUESTS,
} from '@/constants/github';

export type RateLimitSnapshot = {
  limit: number;
  remaining: number;
  resetAt: Date;
};

type RateLimitState = {
  snapshot: RateLimitSnapshot | null;
  record: (snapshot: RateLimitSnapshot) => void;
};

/**
 * Quota is reported on every response, so the app learns it as a side effect of
 * normal traffic instead of spending a request on /rate_limit.
 */
export const useRateLimitStore = create<RateLimitState>()((set) => ({
  snapshot: null,
  record: (snapshot) => set({ snapshot }),
}));

const SECONDS_TO_MS = 1000;

/** `Number(null)` is 0, so a missing header has to be rejected before parsing -
 * otherwise a response carrying no quota headers would be recorded as a quota of
 * zero, i.e. "exhausted". */
function readNumericHeader(headers: Headers, name: string): number | null {
  const raw = headers.get(name);
  if (raw === null || raw.trim().length === 0) return null;

  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

export function readRateLimit(headers: Headers): RateLimitSnapshot | null {
  const limit = readNumericHeader(headers, RATE_LIMIT_HEADERS.limit);
  const remaining = readNumericHeader(headers, RATE_LIMIT_HEADERS.remaining);
  const reset = readNumericHeader(headers, RATE_LIMIT_HEADERS.reset);

  if (limit === null || remaining === null || reset === null) return null;

  return { limit, remaining, resetAt: new Date(reset * SECONDS_TO_MS) };
}

/** A 403 with no quota left is a rate limit; a 403 with quota left is not. */
export function isRateLimitExhausted(snapshot: RateLimitSnapshot | null): boolean {
  return snapshot !== null && snapshot.remaining <= 0;
}

/**
 * Scaled to the reported limit, because a fixed threshold would warn on the very
 * first search (the search quota is only 10/minute) and a warning that appears
 * when nothing is wrong teaches the user to ignore it.
 */
export function shouldWarnAboutRateLimit(snapshot: RateLimitSnapshot | null): boolean {
  if (snapshot === null) return false;

  const threshold = Math.min(
    RATE_LIMIT_WARNING_REQUESTS,
    Math.max(1, Math.floor(snapshot.limit * RATE_LIMIT_WARNING_RATIO)),
  );

  return snapshot.remaining <= threshold;
}
