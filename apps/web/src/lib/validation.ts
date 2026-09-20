import type { ZodType } from 'zod';

/**
 * Keeps `safeParse` plumbing out of the call sites. Every untrusted boundary in
 * the app funnels through one of these two helpers.
 */
export function parseOrFallback<T>(schema: ZodType<T>, input: unknown, fallback: T): T {
  const result = schema.safeParse(input);
  return result.success ? result.data : fallback;
}

/**
 * `toError` receives the dotted path of the first failing field ('' when the
 * whole value is wrong) so each boundary can raise its own error type.
 */
export function parseOrThrow<T>(
  schema: ZodType<T>,
  input: unknown,
  toError: (issuePath: string) => Error,
): T {
  const result = schema.safeParse(input);
  if (result.success) return result.data;

  const [issue] = result.error.issues;
  throw toError(issue?.path.join('.') ?? '');
}
