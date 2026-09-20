/**
 * Canned GitHub API payloads for the E2E smoke test. Kept in the same raw
 * snake_case shape the real API returns so the app's own schemas validate them.
 */
export type MockRepo = {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  open_issues_count: number;
  pushed_at: string | null;
  owner: { login: string };
};

export const MOCK_REPOS: readonly MockRepo[] = [
  {
    id: 1,
    name: 'react',
    full_name: 'facebook/react',
    html_url: 'https://github.com/facebook/react',
    description: 'The library for web and native user interfaces.',
    language: 'JavaScript',
    stargazers_count: 231_000,
    open_issues_count: 1_200,
    pushed_at: '2026-09-01T12:00:00Z',
    owner: { login: 'facebook' },
  },
  {
    id: 2,
    name: 'vue',
    full_name: 'vuejs/vue',
    html_url: 'https://github.com/vuejs/vue',
    description: 'An approachable, performant and versatile framework.',
    language: 'JavaScript',
    stargazers_count: 207_000,
    open_issues_count: 300,
    pushed_at: '2026-08-15T09:00:00Z',
    owner: { login: 'vuejs' },
  },
];

export function searchResponseBody(): unknown {
  return {
    total_count: MOCK_REPOS.length,
    incomplete_results: false,
    items: MOCK_REPOS,
  };
}

/** Looks up a repo by its `owner/name` path, as requested by `GET /repos/:fullName`. */
export function repoStatsResponseBody(fullName: string): MockRepo | null {
  return MOCK_REPOS.find((repo) => repo.full_name === fullName) ?? null;
}
