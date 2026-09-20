const SECOND_MS = 1000;
const MINUTE_MS = 60 * SECOND_MS;

/** Repo stats change slowly; a minute of freshness avoids refetch storms. */
export const STALE_TIME_MS = MINUTE_MS;

/** Keep unmounted pages in cache long enough to make back-navigation instant. */
export const GC_TIME_MS = 10 * MINUTE_MS;

export const MAX_RETRIES = 2;

export const RETRY_BASE_DELAY_MS = 600;

export const MAX_RETRY_DELAY_MS = 5 * SECOND_MS;
