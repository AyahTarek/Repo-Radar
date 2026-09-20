import BugReportIcon from '@mui/icons-material/BugReportOutlined';
import CommitIcon from '@mui/icons-material/CommitOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';
import StarIcon from '@mui/icons-material/StarBorder';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { AppCard, formatCompact, InlineSpinnerButton, StatTile } from '@repo-radar/ui';
import { memo } from 'react';
import { RelativeDate } from '@/components/RelativeDate';
import { useRepoStatsQuery } from '../../hooks/useRepoStatsQuery';
import type { TrackedRepo } from '../../types';
import { TrackToggleButton } from '../TrackToggleButton';

const STAT_SKELETON_WIDTH = 72;

/**
 * Each card owns its own query, so its loading, error and retry states are fully
 * independent of every other card on the page.
 */
export const TrackedRepoCard = memo(function TrackedRepoCard({ repo }: { repo: TrackedRepo }) {
  const { stats, isLoading, isRefreshing, error, refresh } = useRepoStatsQuery(repo.fullName);

  return (
    <AppCard component="li">
      <Stack direction="row" spacing={1} sx={{ justifyContent: 'space-between' }}>
        <Stack spacing={0.5} sx={{ minWidth: 0 }}>
          <Link
            href={repo.htmlUrl}
            target="_blank"
            rel="noopener noreferrer"
            variant="h3"
            sx={{ wordBreak: 'break-word' }}
          >
            {repo.fullName}
          </Link>
          {repo.description !== null && (
            <Typography variant="body2" color="text.secondary">
              {repo.description}
            </Typography>
          )}
        </Stack>

        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'flex-start' }}>
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
          sx={{ alignItems: 'center', flexWrap: 'wrap', mt: 'auto' }}
        >
          <Typography variant="body2" color="error.main">
            {error.message}
          </Typography>
          <Button size="small" variant="text" onClick={refresh}>
            Retry
          </Button>
        </Stack>
      ) : (
        <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', rowGap: 0.5, mt: 'auto' }}>
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
