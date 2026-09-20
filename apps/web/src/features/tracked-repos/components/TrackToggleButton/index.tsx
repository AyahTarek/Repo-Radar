import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import Button from '@mui/material/Button';
import { memo } from 'react';
import { useIsTracked, useTrackedRepoActions } from '../../hooks/useTrackedRepos';
import type { TrackableRepo } from '../../types';

export type TrackToggleButtonProps = {
  repo: TrackableRepo;
  size?: 'small' | 'medium';
};

/**
 * The single track/untrack control, used from both views. It subscribes to one
 * store key, so toggling a repo re-renders that button and nothing else.
 */
export const TrackToggleButton = memo(function TrackToggleButton({
  repo,
  size = 'small',
}: TrackToggleButtonProps) {
  const isTracked = useIsTracked(repo.fullName);
  const { toggle } = useTrackedRepoActions();

  return (
    <Button
      size={size}
      variant={isTracked ? 'contained' : 'outlined'}
      startIcon={isTracked ? <BookmarkIcon /> : <BookmarkBorderIcon />}
      onClick={() => toggle(repo)}
      aria-pressed={isTracked}
      aria-label={`${isTracked ? 'Untrack' : 'Track'} ${repo.fullName}`}
      sx={{ flexShrink: 0 }}
    >
      {isTracked ? 'Tracked' : 'Track'}
    </Button>
  );
});
