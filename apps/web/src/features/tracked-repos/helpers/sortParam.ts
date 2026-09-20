import { z } from 'zod';
import { parseOrFallback } from '@/lib/validation';
import { DEFAULT_TRACKED_SORT, TRACKED_SORT_OPTIONS } from '../constants';
import type { TrackedSortOption } from '../types';

const SORT_VALUES = TRACKED_SORT_OPTIONS.map((option) => option.value);
const sortSchema = z.enum(SORT_VALUES as [TrackedSortOption, ...TrackedSortOption[]]);

/** `?sort=` is user- and attacker-editable, so an unrecognised value falls back silently. */
export function parseTrackedSortParam(raw: string | null): TrackedSortOption {
  return parseOrFallback(sortSchema, raw, DEFAULT_TRACKED_SORT);
}
