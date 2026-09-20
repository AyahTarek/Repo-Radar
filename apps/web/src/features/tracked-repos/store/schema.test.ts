import { describe, expect, it } from 'vitest';
import { parsePersistedRepos } from './schema';

const validEntry = {
  id: 1,
  fullName: 'owner/name',
  owner: 'owner',
  name: 'name',
  htmlUrl: 'https://github.com/owner/name',
  description: null,
  language: null,
  trackedAt: '2026-01-01T00:00:00.000Z',
};

describe('parsePersistedRepos', () => {
  it('keeps valid entries', () => {
    const repos = parsePersistedRepos({ repos: { 'owner/name': validEntry } });

    expect(Object.keys(repos)).toEqual(['owner/name']);
  });

  it('drops only the broken entry and keeps the rest', () => {
    const repos = parsePersistedRepos({
      repos: {
        'owner/name': validEntry,
        'owner/broken': { ...validEntry, fullName: 'owner/broken', trackedAt: 'not-a-date' },
      },
    });

    expect(Object.keys(repos)).toEqual(['owner/name']);
  });

  it('drops an entry whose key disagrees with its payload', () => {
    // A mismatch would silently break O(1) lookups by full name.
    const repos = parsePersistedRepos({ repos: { 'someone/else': validEntry } });

    expect(repos).toEqual({});
  });

  it.each([
    ['null', null],
    ['a string', 'nonsense'],
    ['a foreign object', { unrelated: true }],
    ['the wrong repos type', { repos: [] }],
  ])('falls back to an empty watchlist for %s', (_label, input) => {
    expect(parsePersistedRepos(input)).toEqual({});
  });
});
