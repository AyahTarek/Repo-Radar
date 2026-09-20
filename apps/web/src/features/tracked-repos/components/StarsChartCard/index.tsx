import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { StarsBarChart } from '@repo-radar/plots';
import { AppCard } from '@repo-radar/ui';
import { CHART_HEIGHT } from '../../constants';
import { useStarsChartData } from '../../hooks/useStarsChartData';
import type { TrackedRepo } from '../../types';

export type StarsChartCardProps = {
  repos: readonly TrackedRepo[];
  page: number;
  totalPages: number;
  /** Called with a repo's `fullName` when its bar is clicked. */
  onBarClick?: ((fullName: string) => void) | undefined;
  /** Called with a repo's `fullName` on hover, and `undefined` on hover-out. */
  onBarHover?: ((fullName: string | null) => void) | undefined;
};

export function StarsChartCard({ repos, page, totalPages, onBarClick, onBarHover }: StarsChartCardProps) {
  const data = useStarsChartData(repos);

  return (
    <AppCard>
      <Typography variant="h3" component="h2">
        Stars per tracked repository
      </Typography>
      <Stack sx={{ minWidth: 0 }}>
        <StarsBarChart
          data={data}
          valueLabel="Stars"
          height={CHART_HEIGHT}
          caption={totalPages > 1 ? `Page ${page} of ${totalPages}` : undefined}
          emptyLabel="Waiting for repository stats."
          onBarClick={onBarClick}
          onBarHover={onBarHover}
        />
      </Stack>
    </AppCard>
  );
}
