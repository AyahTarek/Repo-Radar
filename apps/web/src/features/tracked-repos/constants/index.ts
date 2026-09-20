/**
 * Only fields the store already holds are sortable, so sorting never has to wait
 * for a request (sorting by stars would need stats for off-page repos too).
 */
export const TRACKED_SORT_OPTIONS = [
  { value: 'recently-tracked', label: 'Recently tracked' },
  { value: 'name', label: 'Name (A-Z)' },
] as const;

export const DEFAULT_TRACKED_SORT = 'recently-tracked';

export const CHART_HEIGHT = 340;

/** Long enough to notice, short enough that it reads as a pulse, not a stuck state. */
export const HIGHLIGHT_DURATION_MS = 2000;
