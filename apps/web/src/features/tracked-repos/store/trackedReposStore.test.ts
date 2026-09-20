import { beforeEach, describe, expect, it } from 'vitest';
import { STORAGE_KEYS } from '@/constants/storage';
import type { RepoSummary } from '@/types/repo';
import { useTrackedReposStore } from './trackedReposStore';

const repo: RepoSummary = {
  id: 10270250,
  fullName: 'facebook/react',
  owner: 'facebook',
  name: 'react',
  htmlUrl: 'https://github.com/facebook/react',
  description: 'The library for web and native user interfaces.',
  language: 'JavaScript',
  stars: 231_000,
};

function readPersisted(): unknown {
  const raw = localStorage.getItem(STORAGE_KEYS.trackedRepos);
  return raw === null ? null : JSON.parse(raw);
}

describe('trackedReposStore', () => {
  beforeEach(() => {
    localStorage.clear();
    useTrackedReposStore.setState({ repos: {} });
  });

  it('tracks a repo under its full name', () => {
    useTrackedReposStore.getState().track(repo);

    expect(useTrackedReposStore.getState().repos['facebook/react']?.name).toBe('react');
  });

  it('does not store server data that would go stale', () => {
    useTrackedReposStore.getState().track(repo);
    const stored = useTrackedReposStore.getState().repos['facebook/react'];

    expect(stored).not.toHaveProperty('stars');
    expect(stored?.trackedAt).toEqual(expect.any(String));
  });

  it('is idempotent: re-tracking keeps the original trackedAt', () => {
    useTrackedReposStore.getState().track(repo);
    const first = useTrackedReposStore.getState().repos['facebook/react']?.trackedAt;

    useTrackedReposStore.getState().track(repo);

    expect(useTrackedReposStore.getState().repos['facebook/react']?.trackedAt).toBe(first);
    expect(Object.keys(useTrackedReposStore.getState().repos)).toHaveLength(1);
  });

  it('untracks, and ignores an unknown repo', () => {
    useTrackedReposStore.getState().track(repo);
    useTrackedReposStore.getState().untrack('facebook/react');
    useTrackedReposStore.getState().untrack('nobody/nothing');

    expect(useTrackedReposStore.getState().repos).toEqual({});
  });

  it('toggles both ways', () => {
    useTrackedReposStore.getState().toggle(repo);
    expect(useTrackedReposStore.getState().repos['facebook/react']).toBeDefined();

    useTrackedReposStore.getState().toggle(repo);
    expect(useTrackedReposStore.getState().repos['facebook/react']).toBeUndefined();
  });

  it('persists a versioned snapshot to localStorage', () => {
    useTrackedReposStore.getState().track(repo);

    expect(readPersisted()).toEqual({
      version: expect.any(Number),
      state: { repos: { 'facebook/react': expect.objectContaining({ name: 'react' }) } },
    });
  });
});
