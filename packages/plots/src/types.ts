/** The only data shape this package understands - it knows nothing about GitHub. */
export type BarDatum = {
  id: string;
  label: string;
  /** Untruncated text for the tooltip, if `label` is a shortened display form. */
  fullLabel?: string | undefined;
  value: number;
};

/**
 * Optional props accept an explicit `undefined` so callers under
 * `exactOptionalPropertyTypes` can pass a conditional value directly.
 */
export type BarChartProps = {
  data: readonly BarDatum[];
  /** Axis and tooltip name for the measured quantity, e.g. "Stars". */
  valueLabel: string;
  height?: number | undefined;
  /** Omit to fill the container; set it only when the width must be fixed. */
  width?: number | undefined;
  caption?: string | undefined;
  emptyLabel?: string | undefined;
};
