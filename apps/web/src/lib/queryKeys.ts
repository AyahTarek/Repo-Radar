/**
 * Every cache key in the app is built here, so invalidation never depends on a
 * string literal typed twice. `sort` is kept as a plain string so this module
 * stays below the feature layer and does not import from it.
 */
export const queryKeys = {
  /** Root of all per-repo stat queries - used by refresh-all invalidation. */
  repos: () => ['repo'] as const,
  repo: (fullName: string) => ['repo', fullName] as const,
  repoSearch: (query: string, sort: string) => ['repo-search', query, sort] as const,
} as const;
