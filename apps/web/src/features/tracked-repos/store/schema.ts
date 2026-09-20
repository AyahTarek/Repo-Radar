import { z } from 'zod';
import type { TrackedRepo } from '../types';

const trackedRepoSchema = z.object({
  id: z.number().int(),
  fullName: z.string().min(1),
  owner: z.string().min(1),
  name: z.string().min(1),
  htmlUrl: z.string(),
  description: z.string().nullable().default(null),
  language: z.string().nullable().default(null),
  trackedAt: z.iso.datetime(),
}) satisfies z.ZodType<TrackedRepo>;

const persistedShapeSchema = z.object({
  repos: z.record(z.string(), z.unknown()),
});

/**
 * localStorage is user-writable, so a single malformed entry must not take the
 * whole watchlist down: valid entries are kept, broken ones are dropped, and an
 * unrecognisable blob falls back to an empty watchlist.
 */
export function parsePersistedRepos(persisted: unknown): Record<string, TrackedRepo> {
  const outer = persistedShapeSchema.safeParse(persisted);
  if (!outer.success) return {};

  const repos: Record<string, TrackedRepo> = {};

  for (const [key, value] of Object.entries(outer.data.repos)) {
    const entry = trackedRepoSchema.safeParse(value);
    // A key that disagrees with its payload would break O(1) lookups by fullName.
    if (entry.success && entry.data.fullName === key) {
      repos[key] = entry.data;
    }
  }

  return repos;
}
