import { z } from 'zod';
import { parseOrFallback } from '@/lib/validation';
import { DEFAULT_REPO_SORT, MAX_QUERY_LENGTH, REPO_SORT_OPTIONS } from '../constants';
import type { RepoSortOption } from '../types';

const SORT_VALUES = REPO_SORT_OPTIONS.map((option) => option.value);

// Truncating, not rejecting: `.max()` would fail an over-long query and the
// fallback would silently wipe the user's search instead of shortening it.
const querySchema = z
  .string()
  .trim()
  .transform((query) => query.slice(0, MAX_QUERY_LENGTH))
  .catch('');

const sortSchema = z.enum(SORT_VALUES as [RepoSortOption, ...RepoSortOption[]]);

/**
 * The URL is user- and attacker-editable and feeds a query key, so both values
 * are normalised here instead of being trusted anywhere downstream.
 */
export function parseQueryParam(raw: string | null): string {
  return parseOrFallback(querySchema, raw ?? '', '');
}

export function parseSortParam(raw: string | null): RepoSortOption {
  return parseOrFallback(sortSchema, raw, DEFAULT_REPO_SORT);
}
