import Stack from '@mui/material/Stack';
import type { TrackedRepo } from '../../types';
import { TrackedRepoCard } from '../TrackedRepoCard';

export type TrackedRepoListProps = {
  repos: readonly TrackedRepo[];
  highlightedFullName?: string | null | undefined;
  /** Forces the highlight effect to re-run even on a repeat click of the same repo. */
  highlightToken?: number | undefined;
};

export function TrackedRepoList({
  repos,
  highlightedFullName = null,
  highlightToken = 0,
}: TrackedRepoListProps) {
  return (
    <Stack component="ul" spacing={1.5} sx={{ listStyle: 'none', p: 0, m: 0 }}>
      {repos.map((repo) => (
        <TrackedRepoCard
          key={repo.fullName}
          repo={repo}
          isHighlighted={repo.fullName === highlightedFullName}
          highlightToken={highlightToken}
        />
      ))}
    </Stack>
  );
}
