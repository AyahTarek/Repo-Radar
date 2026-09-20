import SearchOffIcon from '@mui/icons-material/SearchOff';
import TravelExploreIcon from '@mui/icons-material/TravelExplore';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { StateBlock } from '@repo-radar/ui';
import { MIN_QUERY_LENGTH } from '../../constants';
import { useRepoSearch } from '../../hooks/useRepoSearch';
import type { RepoSortOption } from '../../types';
import { LoadMoreTrigger } from '../LoadMoreTrigger';
import { SearchResultCard } from '../SearchResultCard';
import { SearchResultsSkeleton } from '../SearchResultsSkeleton';

export type SearchResultsProps = {
  query: string;
  sort: RepoSortOption;
};

/**
 * Owns the branching between the five possible outcomes so the page component
 * stays a layout file and the card component stays presentational.
 */
export function SearchResults({ query, sort }: SearchResultsProps) {
  const {
    repos,
    totalCount,
    isIdle,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    error,
    fetchNextPage,
    retry,
  } = useRepoSearch(query, sort);

  if (isIdle) {
    return (
      <StateBlock
        variant="empty"
        title="Search GitHub repositories"
        description={`Type at least ${MIN_QUERY_LENGTH} characters to start searching. Track the ones you want to monitor.`}
        icon={<TravelExploreIcon fontSize="large" />}
      />
    );
  }

  if (isLoading) return <SearchResultsSkeleton />;

  if (error !== null) {
    return (
      <StateBlock
        variant="error"
        title="Search failed"
        description={error.message}
        action={
          <Button variant="outlined" onClick={retry}>
            Try again
          </Button>
        }
      />
    );
  }

  if (repos.length === 0) {
    return (
      <StateBlock
        variant="empty"
        title="No repositories found"
        description={`Nothing matched "${query}". Try a different spelling or a broader term.`}
        icon={<SearchOffIcon fontSize="large" />}
      />
    );
  }

  return (
    <Stack spacing={1.5}>
      <Stack component="ul" spacing={1.5} sx={{ listStyle: 'none', p: 0, m: 0 }}>
        {repos.map((repo) => (
          <SearchResultCard key={repo.id} repo={repo} />
        ))}
      </Stack>

      <LoadMoreTrigger
        loadedCount={repos.length}
        totalCount={totalCount}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        onLoadMore={fetchNextPage}
      />
    </Stack>
  );
}
