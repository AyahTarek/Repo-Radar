# Repo Radar

A GitHub repository dashboard: search repositories, track the ones you care about, and monitor their
stars, open issues and last commit date with per-repo and bulk refresh.

- Debounced search with infinite scroll (and a keyboard-accessible `Load more`)
- Track / untrack, persisted in `localStorage` and restored on reload
- Independent loading, error and retry state per tracked repository
- Bar chart of stars across the tracked repositories on the current page
- Dark and light themes, dark by default, persisted
- Visible GitHub rate-limit status instead of silent failures

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
```

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
siemens-task/
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

### 1. Two kinds of state, one rule each

**React Query owns everything that comes from GitHub. Zustand owns everything the user decides.** No
server data is copied into Zustand and no user choice is stored in the query cache, which removes the
whole class of stale-duplicate-state bugs and keeps what is persisted tiny.

| Concern | Owner | Where |
| --- | --- | --- |
| Search results | React Query (`useInfiniteQuery`) | `features/repo-search` |
| Repo stats | React Query, one query per repo | `features/tracked-repos` |
| Which repos are tracked | Zustand + `persist` | `features/tracked-repos/store` |
| Theme mode | Zustand + `persist` | `features/theme/store` |
| Rate-limit quota | Zustand (derived from response headers) | `lib/github/rateLimit.ts` |

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

87 tests across the three packages, aimed at logic and behaviour rather than markup.

```bash
pnpm test
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
- `packages/ui` - `useThemeMode` throws outside its provider and the toggle reports the opposite mode,
  with no storage mocking needed.

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
  sorting never has to wait on a request for off-page repos.
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
