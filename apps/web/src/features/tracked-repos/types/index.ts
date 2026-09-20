import type { RepoIdentity } from "@/types/repo";
import type { CHART_METRIC_OPTIONS, TRACKED_SORT_OPTIONS } from "../constants";

/**
 * The persisted snapshot. It holds everything needed to render a tracked repo
 * before any request completes, and nothing that goes stale on the server.
 */
export type TrackedRepo = RepoIdentity & {
  description: string | null;
  language: string | null;
  /** ISO timestamp - JSON-safe, and sorts correctly as a plain string. */
  trackedAt: string;
};

/**
 * Everything the store needs to track a repo. Both a search result and an
 * already-tracked repo satisfy it, which is what lets one toggle button serve
 * both views without either feature knowing about the other's types.
 */
export type TrackableRepo = Omit<TrackedRepo, "trackedAt">;

export type TrackedSortOption = (typeof TRACKED_SORT_OPTIONS)[number]["value"];

export type ChartMetric = (typeof CHART_METRIC_OPTIONS)[number]["value"];
