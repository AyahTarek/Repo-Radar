import type { BarDatum } from "@repo-radar/plots";
import { useQueries } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { fetchRepoStats } from "../service/fetchRepoStats";
import type { ChartMetric, TrackedRepo } from "../types";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Subscribes to the same query keys the cards use, so the chart adds no requests
 * of its own and plots exactly the data already on screen. `combine` gives a
 * structurally-shared result, so the chart only re-renders when the bars change.
 *
 * A repo whose stats are still loading or failed is omitted rather than plotted
 * as zero, because a missing stat isn't a repository with no stars/last commit.
 * Likewise a repo that has never been pushed to has no "last commit" to plot.
 */
export function useRepoChartData(
  repos: readonly TrackedRepo[],
  metric: ChartMetric,
): readonly BarDatum[] {
  return useQueries({
    queries: repos.map((repo) => ({
      queryKey: queryKeys.repo(repo.fullName),
      queryFn: ({ signal }: { signal: AbortSignal }) =>
        fetchRepoStats({ fullName: repo.fullName, signal }),
    })),
    combine: (results): readonly BarDatum[] =>
      results.flatMap((result, index) => {
        const repo = repos[index];
        if (repo === undefined || result.data === undefined) return [];

        if (metric === "stars") {
          return [
            {
              id: repo.fullName,
              label: repo.name,
              fullLabel: repo.fullName,
              value: result.data.stars,
            },
          ];
        }

        if (result.data.lastCommitAt === null) return [];
        const daysSinceLastCommit = Math.round(
          (Date.now() - result.data.lastCommitAt.getTime()) / MS_PER_DAY,
        );
        return [
          {
            id: repo.fullName,
            label: repo.name,
            fullLabel: repo.fullName,
            value: daysSinceLastCommit,
          },
        ];
      }),
  });
}
