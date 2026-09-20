const relativeFormatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

const absoluteFormatter = new Intl.DateTimeFormat('en', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

const MS_PER_SECOND = 1000;
const SECONDS_PER_MINUTE = 60;
const MINUTES_PER_HOUR = 60;
const HOURS_PER_DAY = 24;
const DAYS_PER_MONTH = 30;
const MONTHS_PER_YEAR = 12;

/** Ordered coarsest-last so the first match is the most natural unit. */
const DIVISIONS = [
  { unit: 'second', amount: SECONDS_PER_MINUTE },
  { unit: 'minute', amount: MINUTES_PER_HOUR },
  { unit: 'hour', amount: HOURS_PER_DAY },
  { unit: 'day', amount: DAYS_PER_MONTH },
  { unit: 'month', amount: MONTHS_PER_YEAR },
  { unit: 'year', amount: Number.POSITIVE_INFINITY },
] as const satisfies readonly { unit: Intl.RelativeTimeFormatUnit; amount: number }[];

/**
 * `Intl.RelativeTimeFormat` instead of a date library: same output for this use
 * case, zero bytes shipped.
 */
export function formatRelative(value: Date, now: Date = new Date()): string {
  let delta = (value.getTime() - now.getTime()) / MS_PER_SECOND;

  for (const { unit, amount } of DIVISIONS) {
    if (Math.abs(delta) < amount) {
      return relativeFormatter.format(Math.round(delta), unit);
    }
    delta /= amount;
  }

  return absoluteFormatter.format(value);
}

export function formatAbsolute(value: Date): string {
  return absoluteFormatter.format(value);
}
