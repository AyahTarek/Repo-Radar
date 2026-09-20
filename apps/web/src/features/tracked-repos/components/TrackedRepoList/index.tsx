import Stack from '@mui/material/Stack';
import type { TrackedRepo } from '../../types';
import { TrackedRepoCard } from '../TrackedRepoCard';

export function TrackedRepoList({ repos }: { repos: readonly TrackedRepo[] }) {
  return (
    <Stack component="ul" spacing={1.5} sx={{ listStyle: 'none', p: 0, m: 0 }}>
      {repos.map((repo) => (
        <TrackedRepoCard key={repo.fullName} repo={repo} />
      ))}
    </Stack>
  );
}
