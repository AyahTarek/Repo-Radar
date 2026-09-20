import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { formatCompact } from '@repo-radar/ui';
import { BarChart } from '@mui/x-charts/BarChart';
import { useMemo } from 'react';
import { CHART_MARGIN, DEFAULT_CHART_HEIGHT } from '../constants';
import { truncateLabel } from '../helpers/truncateLabel';
import type { BarChartProps } from '../types';

/**
 * A generic labelled bar chart. It receives BarDatum[] and never knows what the
 * values mean, so the same component serves any future metric.
 */
export function StarsBarChart({
  data,
  valueLabel,
  height = DEFAULT_CHART_HEIGHT,
  width,
  caption,
  emptyLabel = 'No data to plot yet.',
}: BarChartProps) {
  const axisLabels = useMemo(() => data.map((datum) => truncateLabel(datum.label)), [data]);
  const values = useMemo(() => data.map((datum) => datum.value), [data]);
  const fullLabels = useMemo(() => data.map((datum) => datum.label), [data]);

  if (data.length === 0) {
    return (
      <Stack
        component="output"
        sx={{ height, alignItems: 'center', justifyContent: 'center' }}
      >
        <Typography variant="body2" color="text.secondary">
          {emptyLabel}
        </Typography>
      </Stack>
    );
  }

  return (
    <Stack spacing={0.5}>
      <BarChart
        height={height}
        {...(width === undefined ? {} : { width })}
        margin={CHART_MARGIN}
        hideLegend
        xAxis={[
          {
            scaleType: 'band',
            data: axisLabels,
            tickLabelStyle: { angle: -35, textAnchor: 'end', fontSize: 12 },
            valueFormatter: (label: string, context) =>
              context.location === 'tooltip'
                ? (fullLabels[axisLabels.indexOf(label)] ?? label)
                : label,
          },
        ]}
        yAxis={[{ valueFormatter: formatCompact }]}
        series={[
          {
            data: values,
            label: valueLabel,
            valueFormatter: (value: number | null) =>
              value === null ? '' : formatCompact(value),
          },
        ]}
      />
      {caption !== undefined && (
        <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>
          {caption}
        </Typography>
      )}
    </Stack>
  );
}
