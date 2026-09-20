import { z } from 'zod';
import { parseOrFallback } from './validation';

/**
 * An empty `VITE_GITHUB_TOKEN=` in .env would otherwise become an
 * `Authorization: Bearer ` header and fail every request with 401, so the empty
 * string is normalised away here rather than guarded at each call site.
 */
const envSchema = z.object({
  VITE_GITHUB_TOKEN: z
    .string()
    .trim()
    .transform((token) => (token.length === 0 ? undefined : token))
    .optional(),
});

type Env = {
  githubToken: string | undefined;
};

const parsed = parseOrFallback(envSchema, import.meta.env, {});

export const env: Env = Object.freeze({
  githubToken: parsed.VITE_GITHUB_TOKEN,
});

export const hasGithubToken = env.githubToken !== undefined;
