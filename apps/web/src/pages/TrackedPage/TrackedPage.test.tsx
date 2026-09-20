import { screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useTrackedReposStore } from '@/features/tracked-repos/store/trackedReposStore';
import type { TrackedRepo } from '@/features/tracked-repos/types';
import { renderWithProviders } from '@/test/renderWithProviders';
import { TrackedPage } from '.';

const repos: TrackedRepo[] = [
  {
    id: 1,
    fullName: 'facebook/react',
    owner: 'facebook',
    name: 'react',
    htmlUrl: 'https://github.com/facebook/react',
    description: 'The library for web and native user interfaces.',
    language: 'JavaScript',
    trackedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 2,
    fullName: 'vuejs/vue',
    owner: 'vuejs',
    name: 'vue',
    htmlUrl: 'https://github.com/vuejs/vue',
    description: 'An approachable, performant and versatile framework.',
    language: 'JavaScript',
    trackedAt: '2026-01-02T00:00:00.000Z',
  },
];

function statsResponse(fullName: string): Response {
  const repo = repos.find((tracked) => tracked.fullName === fullName);
  if (repo === undefined) throw new Error(`no fixture for ${fullName}`);

  return new Response(
    JSON.stringify({
      id: repo.id,
      name: repo.name,
      full_name: repo.fullName,
      html_url: repo.htmlUrl,
      description: repo.description,
      language: repo.language,
      stargazers_count: 1000,
      open_issues_count: 5,
      pushed_at: new Date().toISOString(),
      owner: { login: repo.owner },
    }),
    { status: 200, headers: { 'content-type': 'application/json' } },
  );
}

describe('TrackedPage a11y', () => {
  beforeEach(() => {
    localStorage.clear();
    useTrackedReposStore.setState({
      repos: Object.fromEntries(repos.map((repo) => [repo.fullName, repo])),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('has no automatically detectable accessibility violations with stats loaded', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation((url: string) => {
        const fullName = new URL(url).pathname.replace('/repos/', '');
        return Promise.resolve(statsResponse(fullName));
      }),
    );

    const { container } = renderWithProviders(<TrackedPage />, { route: '/tracked' });
    await screen.findAllByText('1K');

    const results = await axe(container);
    expect(results.violations).toHaveLength(0);
  });
});
