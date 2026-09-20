import type { TrackableRepo, TrackedRepo } from '../types';

/** Server data is deliberately dropped here: stars belong to React Query, not localStorage. */
export function toTrackedRepo(repo: TrackableRepo, trackedAt: Date = new Date()): TrackedRepo {
  return {
    id: repo.id,
    fullName: repo.fullName,
    owner: repo.owner,
    name: repo.name,
    htmlUrl: repo.htmlUrl,
    description: repo.description,
    language: repo.language,
    trackedAt: trackedAt.toISOString(),
  };
}
