import { githubRequest } from '@/lib/github/client';
import { repoSearchResponseSchema, type RawRepo } from '@/lib/github/schemas';
import type { RepoSummary } from '@/types/repo';
import { buildSearchPath } from '../helpers/buildSearchUrl';
import type { RepoSearchPage, RepoSearchParams } from '../types';

/** GitHub's snake_case shape stops here; the app only sees RepoSummary. */
export function toRepoSummary(raw: RawRepo): RepoSummary {
  return {
    id: raw.id,
    fullName: raw.full_name,
    owner: raw.owner.login,
    name: raw.name,
    htmlUrl: raw.html_url,
    description: raw.description,
    language: raw.language,
    stars: raw.stargazers_count,
  };
}

export async function searchRepos({
  query,
  sort,
  page,
  signal,
}: RepoSearchParams): Promise<RepoSearchPage> {
  const response = await githubRequest({
    path: buildSearchPath(query, sort, page),
    schema: repoSearchResponseSchema,
    signal,
  });

  return {
    items: response.items.map(toRepoSummary),
    totalCount: response.total_count,
    page,
  };
}
