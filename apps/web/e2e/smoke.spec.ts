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

test('clicking a chart bar highlights the matching tracked repo card', async ({ page }) => {
  const SECONDARY_REPO = MOCK_REPOS[1];
  if (SECONDARY_REPO === undefined) throw new Error('MOCK_REPOS needs a second repo');

  await page.goto('/');
  await page.getByLabel('Search GitHub repositories').fill('react');

  for (const repo of [PRIMARY_REPO, SECONDARY_REPO]) {
    const resultCard = page.getByRole('listitem').filter({ hasText: repo.full_name });
    await resultCard.getByRole('button', { name: `Track ${repo.full_name}` }).click();
    await expect(resultCard.getByRole('button', { name: `Untrack ${repo.full_name}` })).toBeVisible();
  }

  await page.getByRole('link', { name: 'Tracked' }).click();
  await expect(page).toHaveURL(/\/tracked/);

  const primaryCard = page.getByRole('listitem').filter({ hasText: PRIMARY_REPO.full_name });
  const secondaryCard = page.getByRole('listitem').filter({ hasText: SECONDARY_REPO.full_name });
  await expect(primaryCard).toBeVisible();
  await expect(secondaryCard).toBeVisible();

  // A bare `rgba(0, 0, 0, 0)` outline means "not highlighted" - proves the click
  // actually reached the right card, not just that some styling exists.
  const outlineColor = (locator: typeof primaryCard) =>
    locator.evaluate((el) => getComputedStyle(el).outlineColor);

  await expect(await outlineColor(primaryCard)).toBe('rgba(0, 0, 0, 0)');
  await expect(await outlineColor(secondaryCard)).toBe('rgba(0, 0, 0, 0)');

  const bars = page.locator('.MuiBarChart-element');
  await expect(bars).toHaveCount(2);
  // Tracked-page default sort is "recently tracked, newest first", so the
  // second-tracked repo's bar is index 0.
  await bars.nth(0).click();

  // Only the clicked bar's repo highlights - proves the dataIndex -> id mapping is correct.
  await expect(secondaryCard).toBeInViewport();
  await expect
    .poll(() => outlineColor(secondaryCard))
    .not.toBe('rgba(0, 0, 0, 0)');
  await expect(await outlineColor(primaryCard)).toBe('rgba(0, 0, 0, 0)');
});
