import { formatAbsolute, formatRelative } from './formatDate';

export type RelativeDateProps = {
  value: Date | null;
  /** Shown when the timestamp is unknown, e.g. a repo never pushed to. */
  fallback?: string | undefined;
};

/**
 * Renders a real <time> element, so the machine-readable timestamp and the exact
 * date survive even though humans see "3 days ago".
 */
export function RelativeDate({
  value,
  fallback = 'unknown',
}: RelativeDateProps) {
  if (value === null) return <span>{fallback}</span>;

  return (
    <time dateTime={value.toISOString()} title={formatAbsolute(value)}>
      {formatRelative(value)}
    </time>
  );
}
