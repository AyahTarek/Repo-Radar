import { expect, test } from '@playwright/test';
import { MOCK_REPOS, repoStatsResponseBody, searchResponseBody } from './fixtures/github.js';

const PRIMARY_REPO = MOCK_REPOS[0];
if (PRIMARY_REPO === undefined) throw new Error('MOCK_REPOS must not be empty');

test.beforeEach(async ({ page }) => {
  // The GitHub API is mocked end-to-end so the smoke test is deterministic and
  // never burns real rate limit quota, while still exercising the app's own
  // fetch -> zod schema -> UI pipeline against realistic payloads.
  await page.route('https://api.github.com/search/repositories**', async (route) => {
    await route.fulfill({ json: searchResponseBody() });
  });

  await page.route('https://api.github.com/repos/**', async (route) => {
    const fullName = new URL(route.request().url()).pathname.replace('/repos/', '');
    const repo = repoStatsResponseBody(fullName);

    if (repo === null) {
      await route.fulfill({ status: 404, json: { message: 'Not Found' } });
      return;
    }

    await route.fulfill({ json: repo });
  });
});

test('search, track a repo, and see it with its chart on the tracked page', async ({ page }) => {
  await page.goto('/');

  await page.getByLabel('Search GitHub repositories').fill('react');

  const resultCard = page.getByRole('listitem').filter({ hasText: PRIMARY_REPO.full_name });
  await expect(resultCard).toBeVisible();

  await resultCard.getByRole('button', { name: `Track ${PRIMARY_REPO.full_name}` }).click();
  await expect(
    resultCard.getByRole('button', { name: `Untrack ${PRIMARY_REPO.full_name}` }),
  ).toBeVisible();

  await page.getByRole('link', { name: 'Tracked' }).click();
  await expect(page).toHaveURL(/\/tracked/);

  await expect(page.getByRole('heading', { name: 'Tracked repositories' })).toBeVisible();
  await expect(page.getByText(PRIMARY_REPO.full_name)).toBeVisible();

  // Proves the chart rendered with real data for the tracked repo, not an empty state.
  const chart = page.locator('.MuiChartsSurface-root');
  await expect(chart).toBeVisible();
  await expect(chart.getByText(PRIMARY_REPO.name)).toBeVisible();
});
