import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { formatCompact } from "@repo-radar/ui";
import { BarChart } from "@mui/x-charts/BarChart";
import type {
  AxisItemIdentifier,
  BarItemIdentifier,
  ChartsActivationEvent,
  ChartsAxisData,
} from "@mui/x-charts/models";
import { useMemo } from "react";
import { CHART_MARGIN, DEFAULT_CHART_HEIGHT } from "../constants";
import { resolveClickedBarId } from "../helpers/resolveClickedBarId";
import { truncateLabel } from "../helpers/truncateLabel";
import type { BarChartProps } from "../types";

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
  emptyLabel = "No data to plot yet.",
  onBarClick,
  onBarHover,
}: BarChartProps) {
  // The band scale's domain must be unique per bar; two tracked repos can share
  // a short name (e.g. "owner-a/react" and "owner-b/react"), which would collapse
  // onto one axis slot if the domain were built from the display label instead.
  const ids = useMemo(() => data.map((datum) => datum.id), [data]);
  const axisLabels = useMemo(
    () => data.map((datum) => truncateLabel(datum.label)),
    [data],
  );
  const values = useMemo(() => data.map((datum) => datum.value), [data]);
  const fullLabels = useMemo(
    () => data.map((datum) => datum.fullLabel ?? datum.label),
    [data],
  );

  const handleItemClick = (_event: unknown, item: BarItemIdentifier) => {
    if (onBarClick === undefined) return;
    const id = resolveClickedBarId(ids, item.dataIndex);
    if (id !== undefined) onBarClick(id);
  };

  // A zero (or near-zero) value renders a bar with no real height, so there's
  // nothing for `onItemClick`'s rect-based hit testing to catch. `onAxisClick`
  // fires for the whole column regardless of the bar's rendered height, so it
  // covers that gap; `onItemClick` above still gives normal bars their precise
  // hit target and the `cursor: pointer` affordance, which is tied to it alone.
  const handleAxisClick = (
    _event: ChartsActivationEvent,
    axisData: ChartsAxisData | null,
  ) => {
    if (onBarClick === undefined || axisData === null) return;
    const id = resolveClickedBarId(ids, axisData.dataIndex);
    if (id !== undefined) onBarClick(id);
  };

  // Bar-item hover state (`onHighlightChange`) is driven by pointer events on the
  // rendered bar rect itself, so it has the same blind spot as `onItemClick` for a
  // zero-height bar. `onHighlightedAxisChange` instead follows the same column-wide
  // pointer tracking as `onAxisClick`, so the preview works for zero-value bars too.
  const handleHighlightedAxisChange = (axisItems: readonly AxisItemIdentifier[]) => {
    if (onBarHover === undefined) return;
    const [axisItem] = axisItems;
    if (axisItem === undefined) {
      onBarHover(null);
      return;
    }
    const id = resolveClickedBarId(ids, axisItem.dataIndex);
    onBarHover(id ?? null);
  };

  if (data.length === 0) {
    return (
      <Stack
        component="output"
        sx={{ height, alignItems: "center", justifyContent: "center" }}
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
        {...(onBarClick === undefined
          ? {}
          : { onItemClick: handleItemClick, onAxisClick: handleAxisClick })}
        {...(onBarHover === undefined
          ? {}
          : { onHighlightedAxisChange: handleHighlightedAxisChange })}
        xAxis={[
          {
            scaleType: "band",
            data: ids,
            // The axis's own height (not the chart margin) is what shortenLabels
            // uses to fit rotated text; too little and it truncates labels to nothing.
            height: 60,
            tickLabelStyle: { angle: -35, textAnchor: "end", fontSize: 12 },
            valueFormatter: (id: string, context) => {
              const index = ids.indexOf(id);
              return context.location === "tooltip"
                ? (fullLabels[index] ?? id)
                : (axisLabels[index] ?? id);
            },
          },
        ]}
        yAxis={[{ valueFormatter: formatCompact }]}
        series={[
          {
            data: values,
            label: valueLabel,
            valueFormatter: (value: number | null) =>
              value === null ? "" : formatCompact(value),
          },
        ]}
      />
      {caption !== undefined && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ textAlign: "center" }}
        >
          {caption}
        </Typography>
      )}
    </Stack>
  );
}
