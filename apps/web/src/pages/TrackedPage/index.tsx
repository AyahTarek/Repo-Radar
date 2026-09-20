import BookmarksIcon from "@mui/icons-material/BookmarksOutlined";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import { SectionHeader, StateBlock } from "@repo-radar/ui";
import { useState } from "react";
import { Link as RouterLink } from "react-router";
import { ROUTES } from "@/app/router/routes";
import { StarsChartCard } from "@/features/tracked-repos/components/StarsChartCard";
import { TrackedPagination } from "@/features/tracked-repos/components/TrackedPagination";
import { TrackedRepoList } from "@/features/tracked-repos/components/TrackedRepoList";
import { TrackedToolbar } from "@/features/tracked-repos/components/TrackedToolbar";
import { useRefreshPageRepos } from "@/features/tracked-repos/hooks/useRefreshPageRepos";
import { usePulseHighlight } from "@/features/tracked-repos/hooks/usePulseHighlight";
import { useTrackedReposPage } from "@/features/tracked-repos/hooks/useTrackedReposPage";
import { useTrackedSortParam } from "@/features/tracked-repos/hooks/useTrackedSortParam";

export function TrackedPage() {
  const { sort, setSort } = useTrackedSortParam();
  const { repos, page, totalPages, totalCount, setPage } =
    useTrackedReposPage(sort);
  const { refreshAll, isRefreshing } = useRefreshPageRepos();
  // Bar click -> card pulse (scrolls the list to the matching repo).
  const {
    id: highlightedFullName,
    token: highlightToken,
    pulse: highlightCard,
  } = usePulseHighlight();
  // Card click -> bar pulse (the chart is already in view, so this only flashes it).
  const { id: pulsedBarId, pulse: highlightBar } = usePulseHighlight();
  const [hoveredFullName, setHoveredFullName] = useState<string | null>(null);
  const [listHoveredFullName, setListHoveredFullName] = useState<string | null>(
    null,
  );

  // A hovered card takes priority over a fading click-pulse so the chart always
  // reflects the most immediate signal from the list.
  const chartHighlightedFullName = listHoveredFullName ?? pulsedBarId;

  if (totalCount === 0) {
    return (
      <StateBlock
        variant="empty"
        title="No tracked repositories yet"
        description="Track a repository from the search page to start monitoring its stars, open issues and last commit."
        icon={<BookmarksIcon fontSize="large" />}
        action={
          <Button component={RouterLink} to={ROUTES.search} variant="contained">
            Find repositories
          </Button>
        }
      />
    );
  }

  return (
    <Stack spacing={2.5}>
      <SectionHeader
        title="Radar Dashboard"
        subtitle={`Monitoring ${totalCount} ${totalCount === 1 ? "repository" : "repositories"} - stats refresh on demand to stay inside the GitHub rate limit.`}
        action={
          <TrackedToolbar
            sort={sort}
            onSortChange={setSort}
            onRefreshAll={refreshAll}
            isRefreshing={isRefreshing}
            visibleCount={repos.length}
          />
        }
      />

      <StarsChartCard
        repos={repos}
        page={page}
        totalPages={totalPages}
        onBarClick={highlightCard}
        onBarHover={setHoveredFullName}
        highlightedFullName={chartHighlightedFullName}
      />

      <TrackedRepoList
        repos={repos}
        highlightedFullName={highlightedFullName}
        highlightToken={highlightToken}
        // Previews on either a bar hover or hovering the card itself.
        hoveredFullName={hoveredFullName ?? listHoveredFullName}
        onCardHover={setListHoveredFullName}
        onCardActivate={highlightBar}
      />

      <TrackedPagination
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </Stack>
  );
}
