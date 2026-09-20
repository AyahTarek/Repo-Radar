import { useMemo } from 'react';
import { DEFAULT_TRACKED_SORT } from '../constants';
import { sortTrackedRepos } from '../helpers/paginate';
import { useTrackedReposStore } from '../store/trackedReposStore';
import type { TrackableRepo, TrackedRepo, TrackedSortOption } from '../types';

/** Narrow selectors keep unrelated re-renders out: a theme change touches nothing here. */
export function useTrackedCount(): number {
  return useTrackedReposStore((state) => Object.keys(state.repos).length);
}

export function useIsTracked(fullName: string): boolean {
  return useTrackedReposStore((state) => state.repos[fullName] !== undefined);
}

export function useTrackedRepoActions(): {
  track: (repo: TrackableRepo) => void;
  untrack: (fullName: string) => void;
  toggle: (repo: TrackableRepo) => void;
} {
  const track = useTrackedReposStore((state) => state.track);
  const untrack = useTrackedReposStore((state) => state.untrack);
  const toggle = useTrackedReposStore((state) => state.toggle);

  return useMemo(() => ({ track, untrack, toggle }), [track, untrack, toggle]);
}

export function useSortedTrackedRepos(
  sort: TrackedSortOption = DEFAULT_TRACKED_SORT,
): readonly TrackedRepo[] {
  const repos = useTrackedReposStore((state) => state.repos);

  return useMemo(() => sortTrackedRepos(Object.values(repos), sort), [repos, sort]);
}
