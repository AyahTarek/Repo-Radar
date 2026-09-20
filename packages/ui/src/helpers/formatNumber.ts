const COMPACT_NUMBER_THRESHOLD = 1000;

const compactFormatter = new Intl.NumberFormat('en', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

const plainFormatter = new Intl.NumberFormat('en');

/**
 * 12_400 -> "12.4K", 940 -> "940". Lives in the design system because how numbers
 * are displayed is a presentation decision shared by cards and chart axes alike.
 */
export function formatCompact(value: number): string {
  return value < COMPACT_NUMBER_THRESHOLD
    ? plainFormatter.format(value)
    : compactFormatter.format(value);
}
