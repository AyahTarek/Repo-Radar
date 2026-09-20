/**
 * Only fields the store already holds are sortable, so sorting never has to wait
 * for a request (sorting by stars would need stats for off-page repos too).
 */
export const TRACKED_SORT_OPTIONS = [
  { value: "recently-tracked", label: "Recently tracked" },
  { value: "name", label: "Name (A-Z)" },
] as const;

export const DEFAULT_TRACKED_SORT = "recently-tracked";

export const CHART_HEIGHT = 340;

/**
 * What the chart's y-axis plots. `axisLabel` is the longer, axis/tooltip-facing
 * form; `label` is the short form used in the metric picker itself.
 */
export const CHART_METRIC_OPTIONS = [
  { value: "stars", label: "Stars", axisLabel: "Stars" },
  {
    value: "lastCommit",
    label: "Last commit",
    axisLabel: "Days since last commit",
  },
] as const;

export const DEFAULT_CHART_METRIC = "stars";

/** Sentinel `language` filter value meaning "don't filter". */
export const ALL_LANGUAGES = "";

/** Long enough to notice, short enough that it reads as a pulse, not a stuck state. */
export const HIGHLIGHT_DURATION_MS = 2000;
