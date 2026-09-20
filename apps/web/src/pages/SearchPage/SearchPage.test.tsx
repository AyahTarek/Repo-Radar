import { screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PAGE_SIZE } from '@/constants/pagination';
import { useTrackedReposStore } from '@/features/tracked-repos/store/trackedReposStore';
import { renderWithProviders } from '@/test/renderWithProviders';
import { SearchPage } from '.';

function rawRepo(id: number) {
  return {
    id,
    name: `repo-${id}`,
    full_name: `owner/repo-${id}`,
    html_url: `https://github.com/owner/repo-${id}`,
    description: `Repository number ${id}`,
    language: 'TypeScript',
    stargazers_count: id * 100,
    open_issues_count: id,
    pushed_at: new Date().toISOString(),
    owner: { login: 'owner' },
  };
}

function searchResponse(): Response {
  const items = Array.from({ length: PAGE_SIZE }, (_, index) => rawRepo(index + 1));

  return new Response(
    JSON.stringify({ total_count: PAGE_SIZE, incomplete_results: false, items }),
    { status: 200, headers: { 'content-type': 'application/json' } },
  );
}

/** jsdom has no IntersectionObserver; the page renders fine without it. */
function stubIntersectionObserver(): void {
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      observe() {}
      disconnect() {}
      unobserve() {}
      takeRecords() {
        return [];
      }
      readonly root = null;
      readonly rootMargin = '';
      readonly thresholds = [];
    },
  );
}

describe('SearchPage a11y', () => {
  beforeEach(() => {
    localStorage.clear();
    useTrackedReposStore.setState({ repos: {} });
    stubIntersectionObserver();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('has no automatically detectable accessibility violations with results loaded', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(searchResponse()));

    const { container } = renderWithProviders(<SearchPage />, { route: '/?q=react' });
    await screen.findByRole('link', { name: 'owner/repo-1' });

    const results = await axe(container);
    expect(results.violations).toHaveLength(0);
  });
});
