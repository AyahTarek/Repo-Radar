export const STORAGE_KEY_PREFIX = "repo-radar";

export const STORAGE_KEYS = {
  trackedRepos: `${STORAGE_KEY_PREFIX}:tracked-repos`,
  themeMode: `${STORAGE_KEY_PREFIX}:theme-mode`,
  searchSort: `${STORAGE_KEY_PREFIX}:search-sort`,
  trackedSort: `${STORAGE_KEY_PREFIX}:tracked-sort`,
} as const;

/** Bump when a persisted shape changes, and add a migration for the old one. */
export const STORAGE_VERSION = 1;
