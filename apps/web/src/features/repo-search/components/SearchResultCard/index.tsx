import StarIcon from "@mui/icons-material/StarBorder";
import Chip from "@mui/material/Chip";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { AppCard, formatCompact, StatTile } from "@repo-radar/ui";
import { memo } from "react";
import { TrackToggleButton } from "@/features/tracked-repos/components/TrackToggleButton";
import type { RepoSummary } from "@/types/repo";

/**
 * Memoised: tracking one repo must not re-render the rest of an infinite list.
 * `repo` objects come straight from the query cache, so their identity is stable
 * between renders.
 */
export const SearchResultCard = memo(function SearchResultCard({
  repo,
}: {
  repo: RepoSummary;
}) {
  return (
    <AppCard component="li">
      <Stack
        direction="row"
        spacing={1.5}
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
        <TrackToggleButton repo={repo} />
      </Stack>

      <Stack
        direction="row"
        spacing={2}
        sx={{ alignItems: "center", flexWrap: "wrap", rowGap: 1, mt: "auto" }}
      >
        <StatTile
          icon={<StarIcon fontSize="inherit" />}
          label="stars"
          value={formatCompact(repo.stars)}
        />
        {repo.language !== null && (
          <Chip label={repo.language} size="small" variant="outlined" />
        )}
      </Stack>
    </AppCard>
  );
});
