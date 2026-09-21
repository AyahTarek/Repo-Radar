import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { StarsBarChart } from "@repo-radar/plots";
import { AppCard } from "@repo-radar/ui";
import { useMemo, useState } from "react";
import {
  ALL_LANGUAGES,
  CHART_HEIGHT,
  CHART_METRIC_OPTIONS,
  DEFAULT_CHART_METRIC,
} from "../../constants";
import { useRepoChartData } from "../../hooks/useRepoChartData";
import type { ChartMetric, TrackedRepo } from "../../types";

const FILTER_FIELD_WIDTH = 200;

export type StarsChartCardProps = {
  repos: readonly TrackedRepo[];
  page: number;
  totalPages: number;
  /** Called with a repo's `fullName` when its bar is clicked. */
  onBarClick?: ((fullName: string) => void) | undefined;
  /** Called with a repo's `fullName` on hover, and `undefined` on hover-out. */
  onBarHover?: ((fullName: string | null) => void) | undefined;
  /** Externally highlights the bar for this repo, e.g. while its card is hovered. */
  highlightedFullName?: string | null | undefined;
};

export function StarsChartCard({
  repos,
  page,
  totalPages,
  onBarClick,
  onBarHover,
  highlightedFullName,
}: StarsChartCardProps) {
  const [metric, setMetric] = useState<ChartMetric>(DEFAULT_CHART_METRIC);
  const [language, setLanguage] = useState(ALL_LANGUAGES);

  // Built from the unfiltered page, not `filteredRepos`, or picking a language
  // would shrink the very list of languages there are to pick from.
  const languages = useMemo(() => {
    const distinct = new Set<string>();
    for (const repo of repos) {
      if (repo.language !== null) distinct.add(repo.language);
    }
    return Array.from(distinct).sort((a, b) => a.localeCompare(b));
  }, [repos]);

  const filteredRepos = useMemo(
    () =>
      language === ALL_LANGUAGES
        ? repos
        : repos.filter((repo) => repo.language === language),
    [repos, language],
  );

  const metricOption =
    CHART_METRIC_OPTIONS.find((option) => option.value === metric) ??
    CHART_METRIC_OPTIONS[0];
  const data = useRepoChartData(filteredRepos, metric);

  return (
    <AppCard>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2.5}
        sx={{
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <Typography
          variant="h3"
          component="h2"
          sx={{ flex: { xs: "1 1 100%", sm: "1 1 auto" }, minWidth: 0 }}
        >
          {metricOption.axisLabel} per tracked repository
        </Typography>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          sx={{
            flexWrap: "wrap",
            rowGap: 1,
            flexShrink: 0,
            width: { xs: "100%", sm: "auto" },
          }}
        >
          <TextField
            select
            size="small"
            label="Plot"
            value={metric}
            onChange={(event) => setMetric(event.target.value as ChartMetric)}
            sx={{
              width: { xs: "100%", sm: "auto" },
              minWidth: { sm: FILTER_FIELD_WIDTH },
            }}
          >
            {CHART_METRIC_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            size="small"
            label="Language"
            value={language}
            onChange={(event) => setLanguage(event.target.value)}
            disabled={languages.length === 0}
            sx={{
              width: { xs: "100%", sm: "auto" },
              minWidth: { sm: FILTER_FIELD_WIDTH },
            }}
          >
            <MenuItem value={ALL_LANGUAGES}>All languages</MenuItem>
            {languages.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      </Stack>
      <Stack sx={{ minWidth: 0 }}>
        <StarsBarChart
          data={data}
          valueLabel={metricOption.axisLabel}
          height={CHART_HEIGHT}
          caption={totalPages > 1 ? `Page ${page} of ${totalPages}` : undefined}
          emptyLabel="Waiting for repository stats."
          onBarClick={onBarClick}
          onBarHover={onBarHover}
          highlightedId={highlightedFullName}
        />
      </Stack>
    </AppCard>
  );
}
