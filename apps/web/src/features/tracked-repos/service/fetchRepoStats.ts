import { githubRequest } from '@/lib/github/client';
import { repoResponseSchema } from '@/lib/github/schemas';
import type { RepoStats } from '@/types/repo';

type FetchRepoStatsParams = {
  fullName: string;
  signal: AbortSignal;
};

/**
 * One request per repo covers all three required stats, which is why `pushed_at`
 * stands in for the last commit date instead of a second call to /commits.
 */
export async function fetchRepoStats({
  fullName,
  signal,
}: FetchRepoStatsParams): Promise<RepoStats> {
  const raw = await githubRequest({
    path: `/repos/${fullName}`,
    schema: repoResponseSchema,
    signal,
  });

  return {
    fullName: raw.full_name,
    stars: raw.stargazers_count,
    openIssues: raw.open_issues_count,
    lastCommitAt: raw.pushed_at === null ? null : new Date(raw.pushed_at),
  };
}
