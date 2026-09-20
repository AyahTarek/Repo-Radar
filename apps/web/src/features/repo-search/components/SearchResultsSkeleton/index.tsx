import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import { AppCard } from '@repo-radar/ui';

const SKELETON_CARD_COUNT = 5;
const CARD_KEYS = Array.from({ length: SKELETON_CARD_COUNT }, (_, index) => `skeleton-${index}`);

export function SearchResultsSkeleton() {
  return (
    <Stack component="ul" spacing={1.5} sx={{ listStyle: 'none', p: 0, m: 0 }} aria-hidden>
      {CARD_KEYS.map((key) => (
        <AppCard key={key} component="li">
          <Skeleton variant="text" width="40%" height={28} />
          <Skeleton variant="text" width="80%" />
          <Skeleton variant="text" width="25%" />
        </AppCard>
      ))}
    </Stack>
  );
}
