import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { STORAGE_KEYS, STORAGE_VERSION } from '@/constants/storage';
import { toTrackedRepo } from '../helpers/toTrackedRepo';
import type { TrackableRepo, TrackedRepo } from '../types';
import { parsePersistedRepos } from './schema';

type TrackedReposState = {
  /** Keyed by fullName: O(1) `isTracked`, and duplicates are impossible. */
  repos: Record<string, TrackedRepo>;
  track: (repo: TrackableRepo) => void;
  untrack: (fullName: string) => void;
  toggle: (repo: TrackableRepo) => void;
};

export const useTrackedReposStore = create<TrackedReposState>()(
  persist(
    (set, get) => ({
      repos: {},

      track: (repo) =>
        set((state) =>
          // Tracking an already-tracked repo must not reset its trackedAt.
          state.repos[repo.fullName] === undefined
            ? { repos: { ...state.repos, [repo.fullName]: toTrackedRepo(repo) } }
            : state,
        ),

      untrack: (fullName) =>
        set((state) => {
          if (state.repos[fullName] === undefined) return state;

          const { [fullName]: _removed, ...rest } = state.repos;
          return { repos: rest };
        }),

      toggle: (repo) => {
        const isTracked = get().repos[repo.fullName] !== undefined;
        if (isTracked) {
          get().untrack(repo.fullName);
        } else {
          get().track(repo);
        }
      },
    }),
    {
      name: STORAGE_KEYS.trackedRepos,
      version: STORAGE_VERSION,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ repos: state.repos }),
      merge: (persisted, current) => ({
        ...current,
        repos: parsePersistedRepos(persisted),
      }),
    },
  ),
);
