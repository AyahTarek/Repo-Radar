export const STORAGE_KEY_PREFIX = 'repo-radar';

export const STORAGE_KEYS = {
  trackedRepos: `${STORAGE_KEY_PREFIX}:tracked-repos`,
  themeMode: `${STORAGE_KEY_PREFIX}:theme-mode`,
} as const;

/** Bump when a persisted shape changes, and add a migration for the old one. */
export const STORAGE_VERSION = 1;
