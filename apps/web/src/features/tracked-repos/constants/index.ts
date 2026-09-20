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
