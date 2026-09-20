import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { HTTP_STATUS } from '@/constants/github';
import { renderWithProviders } from '@/test/renderWithProviders';
import { useTrackedReposStore } from '../../store/trackedReposStore';
import type { TrackedRepo } from '../../types';
import { TrackedRepoCard } from '.';

const repo: TrackedRepo = {
  id: 1,
  fullName: 'facebook/react',
  owner: 'facebook',
  name: 'react',
  htmlUrl: 'https://github.com/facebook/react',
  description: 'The library for web and native user interfaces.',
  language: 'JavaScript',
  trackedAt: '2026-01-01T00:00:00.000Z',
};

const statsPayload = {
  id: 1,
  name: 'react',
  full_name: 'facebook/react',
  html_url: 'https://github.com/facebook/react',
  description: null,
  language: 'JavaScript',
  stargazers_count: 231_400,
  open_issues_count: 942,
  pushed_at: new Date().toISOString(),
  owner: { login: 'facebook' },
};

function okResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
}

function errorResponse(status: number): Response {
  return new Response('{}', { status, headers: { 'content-type': 'application/json' } });
}

describe('TrackedRepoCard', () => {
  beforeEach(() => {
    localStorage.clear();
    useTrackedReposStore.setState({ repos: { [repo.fullName]: repo } });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders the repo identity before any request resolves', () => {
    vi.stubGlobal('fetch', vi.fn().mockReturnValue(new Promise(() => undefined)));

    renderWithProviders(<TrackedRepoCard repo={repo} />);

    // The persisted snapshot means a cold start is never a blank screen.
    expect(screen.getByRole('link', { name: 'facebook/react' })).toBeInTheDocument();
  });

  it('shows stars, open issues and the last commit date once loaded', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(okResponse(statsPayload)));

    renderWithProviders(<TrackedRepoCard repo={repo} />);

    expect(await screen.findByText('231.4K')).toBeInTheDocument();
    expect(screen.getByText('942')).toBeInTheDocument();
    expect(screen.getByText(/ago|now/)).toBeInTheDocument();
  });

  it('shows its own error with a retry that recovers', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(errorResponse(HTTP_STATUS.notFound))
      .mockResolvedValue(okResponse(statsPayload));
    vi.stubGlobal('fetch', fetchMock);

    renderWithProviders(<TrackedRepoCard repo={repo} />);

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/no longer exists|renamed|private/i);

    await userEvent.click(screen.getByRole('button', { name: 'Retry' }));

    expect(await screen.findByText('231.4K')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  it('refreshes on demand from its own refresh control', async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse(statsPayload));
    vi.stubGlobal('fetch', fetchMock);

    renderWithProviders(<TrackedRepoCard repo={repo} />);
    await screen.findByText('231.4K');
    expect(fetchMock).toHaveBeenCalledTimes(1);

    await userEvent.click(screen.getByRole('button', { name: 'Refresh facebook/react' }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });
  });

  it('untracks from the card, removing it from the store', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(okResponse(statsPayload)));

    renderWithProviders(<TrackedRepoCard repo={repo} />);

    await userEvent.click(screen.getByRole('button', { name: 'Untrack facebook/react' }));

    expect(useTrackedReposStore.getState().repos[repo.fullName]).toBeUndefined();
  });
});
