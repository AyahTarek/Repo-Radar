import BugReportIcon from "@mui/icons-material/BugReportOutlined";
import CommitIcon from "@mui/icons-material/CommitOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";
import StarIcon from "@mui/icons-material/StarBorder";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import {
  AppCard,
  formatCompact,
  InlineSpinnerButton,
  StatTile,
} from "@repo-radar/ui";
import { memo, useEffect } from "react";
import { RelativeDate } from "@/components/RelativeDate";
import { trackedRepoCardId } from "../../helpers/trackedRepoCardId";
import { useRepoStatsQuery } from "../../hooks/useRepoStatsQuery";
import type { TrackedRepo } from "../../types";
import { TrackToggleButton } from "../TrackToggleButton";

const STAT_SKELETON_WIDTH = 72;

/**
 * Each card owns its own query, so its loading, error and retry states are fully
 * independent of every other card on the page.
 */
export const TrackedRepoCard = memo(function TrackedRepoCard({
  repo,
  isHighlighted = false,
  highlightToken = 0,
  isPreviewed = false,
  onHoverChange,
  onActivate,
}: {
  repo: TrackedRepo;
  isHighlighted?: boolean;
  highlightToken?: number;
  /** A lighter-weight hover cue tying a chart bar to its card - no scroll, no pulse. */
  isPreviewed?: boolean;
  /** Reports this card's own hover state outward, for the reverse (card -> chart) link. */
  onHoverChange?: ((hovering: boolean) => void) | undefined;
  /** Reports a click anywhere on the card outward, for the reverse (card -> chart) link. */
  onActivate?: (() => void) | undefined;
}) {
  const { stats, isLoading, isRefreshing, error, refresh } = useRepoStatsQuery(
    repo.fullName,
  );

  // `scrollKey` is null while this card is not highlighted, and equals the
  // current token when it is. The effect reads it directly, so the lint rule
  // is satisfied. Changing the token while still highlighted (re-pulse of the
  // same card) produces a new non-null value, which re-runs the effect and
  // re-scrolls — without needing `highlightToken` as a separate dep.
  const scrollKey = isHighlighted ? highlightToken : null;
  useEffect(() => {
    if (scrollKey === null) return;
    document
      .getElementById(trackedRepoCardId(repo.fullName))
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [scrollKey, repo.fullName]);

  return (
    <AppCard
      component="li"
      id={trackedRepoCardId(repo.fullName)}
      onMouseEnter={() => onHoverChange?.(true)}
      onMouseLeave={() => onHoverChange?.(false)}
      onClick={onActivate}
      sx={{
        transition: "outline-color 300ms ease, background-color 150ms ease",
        outline: "2px solid",
        outlineOffset: 2,
        outlineColor: isHighlighted ? "primary.main" : "transparent",
        backgroundColor: isPreviewed ? "action.hover" : undefined,
      }}
    >
      <Stack
        direction="row"
        spacing={1}
        sx={{ justifyContent: "space-between", alignItems: "flex-start" }}
      >
        <Stack spacing={0.5} sx={{ flex: "1 1 auto", minWidth: 0 }}>
          <Link
            href={repo.htmlUrl}
            target="_blank"
            rel="noopener noreferrer"
            variant="h3"
            sx={{ wordBreak: "break-word" }}
          >
            {repo.fullName}
          </Link>
          {repo.description !== null && (
            <Typography variant="body2" color="text.secondary">
              {repo.description}
            </Typography>
          )}
        </Stack>

        <Stack
          direction="row"
          spacing={0.5}
          sx={{ alignItems: "flex-start", flexShrink: 0 }}
        >
          <InlineSpinnerButton
            label={`Refresh ${repo.fullName}`}
            icon={<RefreshIcon fontSize="small" />}
            busy={isLoading || isRefreshing}
            onClick={refresh}
            size="small"
          />
          <TrackToggleButton repo={repo} />
        </Stack>
      </Stack>

      {error !== null ? (
        <Stack
          direction="row"
          spacing={1}
          role="alert"
          sx={{ alignItems: "center", flexWrap: "wrap", mt: "auto" }}
        >
          <Typography variant="body2" color="error.main">
            {error.message}
          </Typography>
          <Button size="small" variant="text" onClick={refresh}>
            Retry
          </Button>
        </Stack>
      ) : (
        <Stack
          direction="row"
          spacing={2}
          sx={{ flexWrap: "wrap", rowGap: 0.5, mt: "auto" }}
        >
          {isLoading || stats === undefined ? (
            <Skeleton variant="text" width={STAT_SKELETON_WIDTH * 3} />
          ) : (
            <>
              <StatTile
                icon={<StarIcon fontSize="inherit" />}
                label="stars"
                value={formatCompact(stats.stars)}
              />
              <StatTile
                icon={<BugReportIcon fontSize="inherit" />}
                label="open issues"
                value={formatCompact(stats.openIssues)}
              />
              <StatTile
                icon={<CommitIcon fontSize="inherit" />}
                label="last commit"
                value={<RelativeDate value={stats.lastCommitAt} />}
              />
            </>
          )}
        </Stack>
      )}
    </AppCard>
  );
});
