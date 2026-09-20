import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PAGE_SIZE } from '@/constants/pagination';
import { DEFAULT_REPO_SORT, MIN_QUERY_LENGTH } from '@/features/repo-search/constants';
import { renderWithProviders } from '@/test/renderWithProviders';
import { useTrackedReposStore } from '@/features/tracked-repos/store/trackedReposStore';
import { SearchResults } from '.';

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

function searchResponse(page: number, totalCount: number): Response {
  const items = Array.from({ length: PAGE_SIZE }, (_, index) => rawRepo(page * PAGE_SIZE + index));

  return new Response(JSON.stringify({ total_count: totalCount, incomplete_results: false, items }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
}

/** jsdom has no IntersectionObserver, so the sentinel never fires here - which is
 * exactly the keyboard-only path the visible "Load more" button exists for. */
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

describe('SearchResults', () => {
  beforeEach(() => {
    localStorage.clear();
    useTrackedReposStore.setState({ repos: {} });
    stubIntersectionObserver();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('does not request anything below the minimum query length', () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    renderWithProviders(<SearchResults query={'x'.repeat(MIN_QUERY_LENGTH - 1)} sort={DEFAULT_REPO_SORT} />);

    expect(fetchMock).not.toHaveBeenCalled();
    expect(screen.getByText('Search GitHub repositories')).toBeInTheDocument();
  });

  it('fires exactly one request for a settled query and lists the results', async () => {
    const fetchMock = vi.fn().mockResolvedValue(searchResponse(1, PAGE_SIZE * 3));
    vi.stubGlobal('fetch', fetchMock);

    renderWithProviders(<SearchResults query="react" sort={DEFAULT_REPO_SORT} />);

    expect(await screen.findByRole('link', { name: 'owner/repo-15' })).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(screen.getAllByRole('listitem')).toHaveLength(PAGE_SIZE);
  });

  it('appends the next page from the keyboard-accessible button', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(searchResponse(1, PAGE_SIZE * 3))
      .mockResolvedValueOnce(searchResponse(2, PAGE_SIZE * 3));
    vi.stubGlobal('fetch', fetchMock);

    renderWithProviders(<SearchResults query="react" sort={DEFAULT_REPO_SORT} />);

    await screen.findByRole('link', { name: 'owner/repo-15' });
    expect(screen.getByText(`Showing ${PAGE_SIZE} of ${PAGE_SIZE * 3} repositories`)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Load more' }));

    await waitFor(() => {
      expect(screen.getAllByRole('listitem')).toHaveLength(PAGE_SIZE * 2);
    });
    expect(screen.getByText(`Showing ${PAGE_SIZE * 2} of ${PAGE_SIZE * 3} repositories`)).toBeInTheDocument();
  });

  it('hides the load-more control once the results run out', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(searchResponse(1, PAGE_SIZE)));

    renderWithProviders(<SearchResults query="react" sort={DEFAULT_REPO_SORT} />);

    await screen.findByRole('link', { name: 'owner/repo-15' });
    expect(screen.queryByRole('button', { name: 'Load more' })).not.toBeInTheDocument();
  });

  it('tracks a result straight from the list', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(searchResponse(1, PAGE_SIZE)));

    renderWithProviders(<SearchResults query="react" sort={DEFAULT_REPO_SORT} />);
    await screen.findByRole('link', { name: 'owner/repo-15' });

    await userEvent.click(screen.getByRole('button', { name: 'Track owner/repo-15' }));

    expect(useTrackedReposStore.getState().repos['owner/repo-15']).toBeDefined();
  });

  it('surfaces a failure with a retry instead of an empty list', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));

    renderWithProviders(<SearchResults query="react" sort={DEFAULT_REPO_SORT} />);

    expect(await screen.findByRole('alert')).toHaveTextContent(/could not reach github/i);
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument();
  });
});
