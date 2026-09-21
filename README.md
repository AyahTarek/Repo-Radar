# Repo Radar

A GitHub repository dashboard: search repositories, track the ones you care about, and monitor their
stars, open issues and last commit date with per-repo and bulk refresh.

- Debounced search with infinite scroll (and a keyboard-accessible `Load more`)
- Track / untrack, persisted in `localStorage` and restored on reload
- Independent loading, error and retry state per tracked repository
- Bar chart of stars across the tracked repositories on the current page - click a bar to scroll to
  and pulse-highlight its card, hover for a lighter preview (see [Hover vs. click](#hover-vs-click))
- Dark and light themes, dark by default, persisted
- Visible GitHub rate-limit status instead of silent failures

## Requirements coverage

Required tech - **React 19 + TypeScript, Zustand, MUI, the GitHub REST API, deployed on Vercel** - all
in use; see `package.json` and `vercel.json`.

Core requirements, each with where it lives:

| Requirement                               | Where                                                                                              |
| ----------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Debounced GitHub repository search        | `useDebouncedValue`, `features/repo-search`                                                        |
| Track / untrack repositories              | `features/tracked-repos/store` (Zustand)                                                           |
| Tracked Repos view                        | `/tracked`, `pages/TrackedPage`                                                                    |
| Stars, open issues, last commit date      | `TrackedRepoCard` (`pushed_at` stands in for last commit date - see [Assumptions](#assumptions))   |
| Refresh individual and/or all repos       | per-card `refetch`, `refreshAll` via `invalidateQueries`                                           |
| Independent loading/error state per repo  | one React Query key per repo - see [§2](#2-independent-per-repo-state-falls-out-of-the-data-model) |
| Persist tracked repos in `localStorage`   | Zustand `persist` middleware, with schema-validated rehydration                                    |
| Proper TypeScript types                   | Zod schemas + `z.infer` at every boundary - see [§4](#4-validation-at-every-untrusted-boundary)    |
| Bar chart of stars per tracked repository | `StarsBarChart`, `packages/plots`                                                                  |

### Beyond the brief

Suggested-but-optional additions named in the brief, all included:

- **Monorepo** with `packages/ui` and `packages/plots` split out from the app.
- **Storybook** - 7 stories across both shared packages (see [Take-home scope vs. production](#take-home-scope-vs-production)
  for what it doesn't cover).
- **Theme switching** - dark/light, persisted, no flash on load.

Other enhancements added beyond what was asked:

- Click-to-highlight (scroll + pulse) and hover-preview linking between the chart and its matching
  card - see [Hover vs. click](#hover-vs-click).
- GitHub rate-limit visibility - a banner plus a typed, kind-aware retry policy, instead of raw
  fetch failures.
- URL-persisted search query and sort, so a link is shareable and a reload doesn't lose your place.
- **Responsive UI** - every screen from mobile (≈375 px) upward is a first-class target. Rows and toolbars stack vertically on small screens, buttons stretch to full width, the chart and
  card list reflow, and nothing clips or overflows horizontally - verified in Playwright on a
  Pixel-5 viewport.
- 107 vitest tests, a Playwright e2e suite, and `vitest-axe` accessibility assertions - see
  [§8](#8-testing).
- GitHub Actions CI (lint/typecheck/test/build/e2e) gating `main` - see
  [Continuous Integration](#continuous-integration).
- A Husky + lint-staged pre-commit hook - see [Pre-commit hook](#pre-commit-hook).

## Getting started

Requires **Node >= 20.19** and **pnpm 11** (`corepack enable` will pick up the pinned version).

```bash
pnpm install
pnpm dev            # http://localhost:9000
```

Other scripts, all runnable from the repository root:

```bash
pnpm build          # typecheck + production build of apps/web
pnpm preview        # serve the production build on :9100
pnpm lint           # oxlint across the whole workspace
pnpm typecheck      # tsc in every package
pnpm test           # vitest in every package
pnpm verify         # lint + typecheck + test + build
pnpm storybook      # component playground for packages/ui and packages/plots, on :6006

# from apps/web, or `pnpm --filter web <script>` from the root:
pnpm test:e2e:install  # one-time Playwright browser install
pnpm test:e2e          # Playwright end-to-end smoke tests
```

### Pre-commit hook

Husky + lint-staged run on every commit: oxlint on staged `.js/.jsx/.ts/.tsx` files, plus a full
`pnpm -w typecheck` whenever a staged file is `.ts`/`.tsx`. The typecheck runs on the whole workspace
rather than just the staged files because `tsc`'s project references need the whole program - a
partial file list can't be checked in isolation. In practice this adds well under 2 seconds to a
commit (three small projects), so it stays in the hook rather than CI-only; reassess if the repo grows
enough for that to change. Skip it for an emergency commit with `git commit --no-verify`.

### Optional GitHub token

The app works with no configuration, using GitHub's unauthenticated limits of **60 requests/hour**
and **10 searches/minute**. A token raises that to 5,000 requests/hour:

```bash
cp apps/web/.env.example apps/web/.env
# then set VITE_GITHUB_TOKEN=github_pat_...
```

Anything prefixed `VITE_` is inlined into the client bundle and is therefore **public**. Use a
fine-grained token with no scopes and no repository access, or leave it unset. The correct production
fix is a small server-side proxy holding the token; that is out of scope here and listed under
[Limitations](#limitations).

## Architecture

```
repo-radar/
├─ packages/ui/            @repo-radar/ui    - theme, theming mechanism, presentational primitives
├─ packages/plots/         @repo-radar/plots - charts, no GitHub knowledge
└─ apps/web/               the application
```

pnpm workspaces with a **catalog** in `pnpm-workspace.yaml`, so every third-party version is declared
once and two packages cannot drift onto different React or MUI versions. Both packages are consumed as
TypeScript source through their `exports` field, which keeps the toolchain to one step: no build,
watch or link dance between packages. No Turborepo or Nx - three packages do not justify a task
orchestrator.

Inside `apps/web`:

```
src/
├─ app/          App, RootLayout, Header, router
├─ pages/        thin route entry points (composition only)
├─ providers/    composition root: theme, query client, error boundary
├─ components/   app-level shared components
├─ features/
│  ├─ repo-search/     service, hooks, components, helpers, constants, types
│  ├─ tracked-repos/   service, store, hooks, components, helpers, constants, types
│  └─ theme/           the persisted theme-mode store
├─ hooks/        useDebouncedValue, useIntersectionObserver, usePageParam
├─ constants/    tunables shared by more than one feature
├─ lib/          env, validation, queryKeys, github/ (client, schemas, errors, rate limit)
└─ types/        shared domain model
```

### Design for growth

The architecture is structured so that common changes are additive rather than modifications to
existing code:

- **New feature**: add a folder under `features/` with its own service, hooks, store, components,
  helpers, constants and types. No feature imports from another feature's internals, so adding one
  cannot break another.
- **New chart metric**: add an entry to `CHART_METRIC_OPTIONS` in `features/tracked-repos/constants`
  and a case to `useRepoChartData`. `StarsChartCard` picks it up automatically — the metric picker
  is driven by that constant.
- **New data provider**: `lib/github/client.ts` is the only file that calls `fetch`. Replacing or
  augmenting the GitHub backend touches one file; no component ever sees a raw API payload.
- **Version alignment across packages**: the pnpm catalog in `pnpm-workspace.yaml` is the single
  source of version truth. It is structurally impossible for `apps/web` and `packages/plots` to
  silently drift onto different React or MUI versions.
- **Shared packages stay presentational**: `packages/ui` has no dependency on Zustand or
  `localStorage`. The controlled `ThemeModeProvider` (`mode` + `onModeChange`) means any storage
  mechanism — a Zustand store today, a user account tomorrow — can drive the theme without touching
  the package. The dependency arrow stays `app → ui` and never inverts.
- **Persistence extends safely**: adding a persisted field means updating the Zod schema in
  `store/schema.ts` and bumping `STORAGE_VERSION`. Valid entries are kept, individually malformed
  ones are dropped, and an unrecognisable blob falls back to an empty watchlist — no all-or-nothing
  wipe.

### 1. Two kinds of state, one rule each

**React Query owns everything that comes from GitHub. Zustand owns everything the user decides.** No
server data is copied into Zustand and no user choice is stored in the query cache, which removes the
whole class of stale-duplicate-state bugs and keeps what is persisted tiny.

| Concern                 | Owner                                   | Where                          |
| ----------------------- | --------------------------------------- | ------------------------------ |
| Search results          | React Query (`useInfiniteQuery`)        | `features/repo-search`         |
| Repo stats              | React Query, one query per repo         | `features/tracked-repos`       |
| Which repos are tracked | Zustand + `persist`                     | `features/tracked-repos/store` |
| Theme mode              | Zustand + `persist`                     | `features/theme/store`         |
| Rate-limit quota        | Zustand (derived from response headers) | `lib/github/rateLimit.ts`      |

A tracked repo is stored as a **snapshot of identity only** (id, full name, owner, name, URL,
description, language, tracked-at) keyed by `owner/name`. Keying by full name gives O(1) `isTracked`
lookups and makes duplicates impossible; storing no stars or issue counts means nothing persisted can
ever be stale.

### 2. Independent per-repo state falls out of the data model

Each `TrackedRepoCard` mounts its own `useRepoStatsQuery(fullName)`. React Query tracks status per key,
so a repo that 404s cannot affect its neighbours and there is no `Record<id, status>` map to maintain.

- **Refresh one repo**: the card calls `refetch()` on its own query.
- **Refresh the page**: `invalidateQueries({ queryKey: ['repo'], refetchType: 'active' })`.
- **Busy state**: derived via `useIsFetching`, never stored, so it cannot go stale.
- Cards render immediately from the persisted snapshot while stats load, so a cold start is never a
  blank screen.

### 3. One API boundary

`lib/github/client.ts` is the only place `fetch` is called. It attaches the GitHub headers (and the
token only if present), forwards React Query's `AbortSignal`, records the rate-limit headers from every
response, validates the payload with a narrow Zod schema, and maps failures to a typed `ApiError` with
a `kind` of `network | rate_limit | not_found | invalid_request | http | parse`.

Consequences: components never see snake_case payloads, and the retry policy is a pure function of the
error kind - never retry a 404 or an exhausted quota, retry network and 5xx with capped exponential
backoff. `refetchOnWindowFocus` is off for the same reason: alt-tabbing should not spend quota.

### 4. Validation at every untrusted boundary

Types are derived from schemas with `z.infer`, so the runtime check and the compile-time type cannot
drift. Four boundaries, each with a colocated schema:

- **API responses** (`lib/github/schemas.ts`) - only the fields actually consumed are validated, so an
  unrelated change in GitHub's payload cannot break the app. Timestamps are validated as ISO strings
  and converted to `Date` at the boundary, so no component handles a date string.
- **Environment** (`lib/env.ts`) - an empty `VITE_GITHUB_TOKEN=` is normalised to `undefined` instead
  of producing an `Authorization: Bearer ` header that would fail every request with 401.
- **Persisted state** (`store/schema.ts`) - `localStorage` is user-writable, so rehydration keeps valid
  entries, drops individually malformed ones, and falls back to an empty watchlist for an
  unrecognisable blob.
- **URL parameters** - `?q=` is trimmed and truncated, `?sort=` falls back to the default, `?page=` is
  coerced and clamped to the real page count.

### 5. Pagination: two mechanisms, one page size

`PAGE_SIZE` is 15 for both views, from `constants/pagination.ts`.

**Search uses infinite scroll.** `getNextPageParam` ends the stream on the first of three conditions:
GitHub's hard **1,000-result search ceiling**, the reported total, or a short page. Deriving pages from
`total_count` alone would offer page 400 of a 6,000-match query and every request past 1,000 results
would return HTTP 422. The sentinel only fires when `hasNextPage && !isFetchingNextPage`, which keeps a
fast scroll from bursting into the 10-searches-per-minute limit, and pages are deduplicated by id
because GitHub can repeat an item across pages when ranking shifts between requests.

Because a scroll sentinel is unreachable by keyboard, `LoadMoreTrigger` always renders a real
`Load more` button next to it, with an `aria-live` region announcing `Showing 45 of 312 repositories`.

**The tracked view uses numbered pages** bound to `?page=`, sliced client-side from the store. The
important consequence is that only the 15 cards on the current page are mounted, so `refreshAll` with
`refetchType: 'active'` refetches 15 repos rather than the whole watchlist - which is what stops a
60-repo watchlist from spending an entire hourly quota on one click. Untracking the last item on the
last page clamps the page down instead of showing an empty grid.

### 6. Theme: mechanism in the package, policy in the app

`packages/ui` owns `createAppTheme`, `ThemeModeProvider`, `useThemeMode` and `ThemeToggleButton` - a
design system that exports a theme but no way to switch it is an incomplete abstraction. The provider
is **controlled** (`mode` + `onModeChange`, like an MUI input) and `apps/web` supplies the persisted
Zustand store.

This keeps `packages/ui` free of any dependency on `zustand` or `localStorage`, so it stays
presentational and can be tested by wrapping it in a `useState` with no storage to mock. The dependency
arrow stays app -> ui and never inverts, and moving the mode to a user account later would touch one
file. Dark is the default, and because `persist` reads `localStorage` synchronously at module init the
first paint is already in the right mode - no flash.

### 7. Performance

Search is the hot path, defended in five layers: a 400 ms debounce, a minimum query length of 2, a
60-second `staleTime` (so backspacing to an earlier query is an instant cache hit), `AbortSignal`
cancellation of superseded requests, and the guarded sentinel above.

> **Cancelled requests in DevTools are intentional.** Every keystroke starts a 400 ms debounce
> timer; if the next key arrives before the timer fires, the in-flight request (if any) is aborted
> via `AbortSignal` before the new one is sent. This means only the most recent query ever
> completes — stale responses from earlier keystrokes are discarded rather than landing out of order
> and replacing a fresher result. The `net::ERR_ABORTED` entries visible in the Network panel are
> evidence the race-condition prevention is working, not a bug.

Rendering: result and tracked cards are `memo`'d so tracking one repo re-renders one card; Zustand is
read through narrow selectors so a theme change does not re-render the list; and the chart reads the
same query keys as the cards via `useQueries({ combine })`, adding no requests and re-rendering only
when the bars actually change.

Bundling: the `/tracked` route and the chart library are lazy-loaded, and MUI and React are split into
their own vendor chunks for cache reuse.

```
first paint    index 146 kB  +  mui 307 kB  +  react-vendor 300 kB   (~237 kB gzipped)
/tracked only  TrackedPage 295 kB (the chart library)                 (~93 kB gzipped)
```

List virtualisation is deliberately absent: the tracked view holds at most 15 cards, and an infinite
list would only justify a virtualiser after several hundred rows.

### 8. Testing

107 vitest tests across the three packages plus a Playwright end-to-end suite, aimed at logic and
behaviour rather than markup.

```bash
pnpm test                    # vitest, all packages - runs in CI on every push
pnpm --filter web test:e2e   # Playwright - runs in CI, needs a browser install locally first
```

- `lib/github/client` - a stubbed `fetch` covers success, quota recording, the 403-with-quota vs
  403-without-quota distinction, 404, 422, malformed payloads, transport failure, and that
  cancellation is rethrown untouched; plus a table test for the retry predicate.
- Store and schema - track/untrack/toggle idempotence, the persisted shape, and recovery from a
  corrupt or partially malformed `localStorage`.
- Pagination helpers - `getNextPageParam` including the 1,000-result ceiling, and slice/clamp/sort.
- URL parsing - unknown sort falls back, oversized queries are truncated rather than dropped.
- `useDebouncedValue` - fake timers prove a burst of keystrokes collapses into one settled value.
- Components - `SearchResults` (one request per settled query, appending a page, tracking from the
  list, error with retry) and `TrackedRepoCard` (snapshot first, then stats, error to retry to
  success, on-demand refresh, untrack).
- Chart-to-card highlight - the click handler resolves the right datum by id (not array index), a
  repeat click on the same bar restarts the highlight timer instead of silently doing nothing, and a
  zero-value bar's whole axis column is clickable, not just its (invisible) rendered rect.
- `packages/ui` - `useThemeMode` throws outside its provider and the toggle reports the opposite mode,
  with no storage mocking needed.
- **Accessibility** - `SearchPage` and `TrackedPage` are each rendered fully and checked with
  `vitest-axe`'s `axe()` for violations, catching issues real users of assistive tech would hit that
  unit tests of individual components would miss (e.g. duplicate landmarks, missing accessible names
  that only appear once pieces are composed together).
- **End-to-end** (`apps/web/e2e`, Playwright, mocked GitHub API so it's deterministic and free) -
  search -> track -> see the repo and its chart on the tracked page; and clicking a chart bar
  highlights only its matching card, proving the dataIndex -> id mapping end to end rather than at
  the unit level.

**Why Playwright over Cypress**: `page.route()` intercepts `fetch` cleanly without the edge cases
Cypress historically had with non-XHR requests; parallelism (`fullyParallel: true`) is free without
a paid cloud plan; WebKit is supported alongside Chromium and Firefox with no extra cost; there is no
Electron binary bundled into the install (~300 MB avoided in CI); and the trace viewer (`trace.zip`
uploaded on every CI run as an artifact) gives step-by-step failure replay - scroll, click, network,
DOM snapshot - without having to reproduce the failure locally.

## Continuous Integration

GitHub Actions (`.github/workflows/ci.yml`) runs on every push to `main` and every pull request:

```
lint -> typecheck -> test -> build -> install Playwright browsers -> e2e
```

Same commands as local (`pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`), plus the Playwright
suite - CI can't reuse a developer machine's already-installed browser, so that step is explicit and
cached separately by `actions/setup-node`'s pnpm cache. A new push to the same branch or PR cancels
the run already in progress for it, so pushing twice in a row doesn't burn double the CI minutes. The
Playwright HTML report is uploaded as an artifact on every run, including failures, so a red CI run is
debuggable without reproducing it locally first.

## Hover vs. click

I'd keep click. Hover has real downsides here:

- **Touch/mobile**: there's no hover state at all, so the feature would silently disappear on touch
  devices.
- **Accessibility**: hover-triggered UI changes are a WCAG concern (2.5 SC 1.4.13-adjacent issues)
  since keyboard/screen-reader users can't "hover."
- **Noise**: a chart with several bars would flicker every card highlight as the mouse passes over on
  its way elsewhere, rather than reflecting deliberate intent.
- Click also matches what we already tested end-to-end and is the more common convention for
  chart-to-list linking (e.g. dashboards).

What's shipped reflects that: click is the only way to _trigger_ the highlight (scroll + a 2s pulse),
and hover is a secondary, purely decorative preview layered on top (a background tint on the matching
card, no scroll, no pulse). None of the downsides above apply to that preview, because it never carries
functionality click doesn't already provide - a touch or keyboard user loses nothing by never seeing
it, and a plain, motionless tint can't read as flicker the way a scroll-and-pulse would.

## Deployment

`vercel.json` builds the workspace and serves the SPA:

```json
{
  "installCommand": "pnpm install --frozen-lockfile",
  "buildCommand": "pnpm --filter web build",
  "outputDirectory": "apps/web/dist",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

Import the repository into Vercel, keep the root directory as the repository root, and optionally set
`VITE_GITHUB_TOKEN` in the project's environment variables (see the warning above).

## Assumptions

- **`pushed_at` stands in for "last commit date."** It is the last push to any branch and comes free
  with the repo request; the true last commit would need a second call to
  `/repos/{owner}/{repo}/commits` for every repo, doubling quota use for a value that differs only in
  edge cases. Repos that have never been pushed to show `unknown` rather than a fabricated date.
- **The repo endpoint is the source of truth for stats.** Search results carry a star count too, but it
  is less fresh, so tracked cards always fetch their own.
- Only fields the store already holds are sortable in the tracked view (recently tracked, name), so
  sorting never has to wait on a request for off-page repos. "Name (A-Z)" sorts by the full
  `owner/name` (what the list displays), not by the short name the chart shows on its x-axis - the
  chart label is a display-only shorthand and carries no identity or ordering of its own.
- English locale formatting throughout (`Intl.NumberFormat`, `Intl.RelativeTimeFormat`); no i18n layer.
- **The quota shown is whichever GitHub reported last.** Search and the repo endpoint have separate
  budgets (10/minute vs 60/hour unauthenticated), so the banner's numbers change depending on which
  endpoint answered most recently. The warning threshold is therefore scaled to the reported limit -
  the smaller of 10 requests or 20% of the limit - so a healthy search quota of 9-of-10 does not raise
  an alarm.

## Limitations

- **Search reaches at most 1,000 results** - GitHub's cap, not ours. The stream ends there with a note
  suggesting a narrower query rather than an error.
- **Infinite scroll trades deep-linking for flow.** A shared link restores the query and sort but
  always reopens at the first page.
- **Refresh refetches the current page**, not the entire watchlist, to stay inside the rate limit. The
  button says so explicitly.
- **The stars chart covers the current page** for the same reason: only visible repos have their stats
  fetched. Repos still loading or failed are omitted from the bars rather than plotted as zero.
- **A client-side token is inherently public.** A server-side proxy is the real fix.
- No i18n, no authentication, and no offline support beyond what the query cache and persisted
  watchlist provide.

## Take-home scope vs. production

Decisions below make sense for a timed assessment and would be revisited at a larger scale or for a
real deployment:

- **Client-side GitHub token.** Fine for review; production needs the server-side proxy noted above so
  the token - and any higher-scoped one - never reaches the browser.
- **Full-workspace typecheck in the pre-commit hook.** Cheap at three small packages (well under 2s,
  see [Pre-commit hook](#pre-commit-hook)); a larger monorepo would move it to CI-only or scope it with
  change-aware tooling (Nx/Turborepo affected-graph) and keep the hook itself lint-only.
- **Storybook covers the two shared packages, not the app.** `pnpm storybook` has stories for every
  `packages/ui` primitive and `StarsBarChart` in `packages/plots` (7 stories total), but nothing under
  `apps/web` - page-level composition is exercised by its own component/e2e tests instead, since a
  story for a data-fetching page would need the same mocking either way.
- **Test depth targets confidence, not a coverage percentage.** 107 vitest tests plus a Playwright
  suite cover the logic that's actually tricky - the retry policy, pagination edges, persisted-state
  recovery, the chart-to-card highlight timing bug fixed mid-project - rather than every component in
  isolation. There's no visual regression or load testing.
- **No error tracking, analytics or performance monitoring** (Sentry, Web Vitals reporting, etc.).
  Errors are surfaced to the user in the moment but nothing is recorded once they navigate away -
  unacceptable for production, unnecessary for a local review.
- **CI gates `main`, it doesn't gate the deploy.** `ci.yml` runs lint/typecheck/test/build/e2e; Vercel
  deploys on its own trigger, independently. Production would make the deploy depend on that pipeline
  (or at minimum a required-status-check branch rule), and run the e2e suite against the actual preview
  URL rather than a local dev server.
- **Rate-limit handling is best-effort, not eliminated.** The banner and typed retry policy make the
  unauthenticated limits usable for review; a production service would front GitHub with its own
  caching layer so user-facing requests never touch GitHub's quota directly.
- **Inline comments are more explicit than production norms.** Several comments call out the
  _why_ behind a decision (query-key prefix matching, the debounce abort strategy, the token-bump
  pattern, pagination edge cases). In a production codebase those decisions would live in a PR
  description, an ADR, or team conventions, and the code itself would carry only the comments
  needed to understand _what_ is non-obvious at a glance. They are left here deliberately to make
  the reasoning legible to reviewer.
- **Single locale, single anonymous user, by design for this scope.** Both i18n and
  authentication/multi-user support are additive rather than architectural changes given the
  validation-at-every-boundary and store patterns already in place - see [Assumptions](#assumptions).

  **Adding i18n**: the app already uses `Intl.NumberFormat` and `Intl.RelativeTimeFormat` for all
  locale-aware formatting, so numbers and dates are handled correctly without a library. The remaining
  work is UI strings, which are currently co-located with their components. The migration path is:
  extract those strings into a messages file (e.g. `en.json`), wrap call sites with a library such as
  `react-i18next` or `FormatJS`, and add a locale provider to `AppProviders`. No architectural change
  is needed — the feature-slice structure means each feature's strings are already implicitly grouped,
  and the single API boundary means no translated text ever reaches `lib/github/`.
