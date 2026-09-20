import { z } from 'zod';

/**
 * Narrow on purpose: only the fields the UI consumes are validated, so an
 * unrelated change in GitHub's payload can never break the app.
 */
const repoSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  full_name: z.string(),
  html_url: z.string(),
  description: z.string().nullable().default(null),
  language: z.string().nullable().default(null),
  stargazers_count: z.number().int(),
  open_issues_count: z.number().int(),
  // Validated as a real ISO timestamp, not just a string. It is null for repos
  // that have never been pushed to, which the UI renders as "unknown".
  pushed_at: z.iso.datetime().nullable().default(null),
  owner: z.object({ login: z.string() }),
});

export const repoSearchResponseSchema = z.object({
  total_count: z.number().int(),
  incomplete_results: z.boolean().default(false),
  items: z.array(repoSchema),
});

export const repoResponseSchema = repoSchema;

export type RawRepo = z.infer<typeof repoSchema>;
export type RawRepoSearchResponse = z.infer<typeof repoSearchResponseSchema>;
