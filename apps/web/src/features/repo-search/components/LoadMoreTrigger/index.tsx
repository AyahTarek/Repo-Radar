import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { SEARCH_RESULT_CAP } from '@/constants/pagination';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { SENTINEL_ROOT_MARGIN } from '../../constants';

export type LoadMoreTriggerProps = {
  loadedCount: number;
  totalCount: number;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
};

/**
 * Infinite scroll plus a real button. A bare sentinel is unreachable by keyboard,
 * so the button is always rendered rather than being a hidden fallback, and the
 * observer is only enabled while another page is actually loadable.
 */
export function LoadMoreTrigger({
  loadedCount,
  totalCount,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
}: LoadMoreTriggerProps) {
  const sentinelRef = useIntersectionObserver<HTMLDivElement>({
    onIntersect: onLoadMore,
    // Guarding here is what stops a fast scroll from queueing a burst of
    // requests into the search API's 10-per-minute limit.
    enabled: hasNextPage && !isFetchingNextPage,
    rootMargin: SENTINEL_ROOT_MARGIN,
  });

  return (
    <Stack spacing={1.5} sx={{ alignItems: 'center', py: 2 }}>
      <div ref={sentinelRef} aria-hidden />

      <Typography variant="body2" color="text.secondary" aria-live="polite">
        {`Showing ${loadedCount} of ${totalCount} repositories`}
      </Typography>

      {hasNextPage ? (
        <Button
          onClick={onLoadMore}
          disabled={isFetchingNextPage}
          variant="outlined"
          startIcon={isFetchingNextPage ? <CircularProgress size={16} /> : null}
        >
          {isFetchingNextPage ? 'Loading' : 'Load more'}
        </Button>
      ) : (
        loadedCount > 0 && (
          <Typography variant="caption" color="text.secondary">
            {`End of results. GitHub search returns at most ${SEARCH_RESULT_CAP.toLocaleString()} matches - narrow the query to see different repositories.`}
          </Typography>
        )
      )}
    </Stack>
  );
}
