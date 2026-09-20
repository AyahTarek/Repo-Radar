import { useCallback, useEffect, useState } from 'react';
import { HIGHLIGHT_DURATION_MS } from '../constants';

type HighlightedRepo = {
  fullName: string | null;
  highlight: (fullName: string) => void;
};

/**
 * Backs the chart-bar -> tracked-card connection: clears itself after a beat so
 * the highlight reads as a pulse tying the two views together, not a stuck state.
 */
export function useHighlightedRepo(): HighlightedRepo {
  const [fullName, setFullName] = useState<string | null>(null);

  useEffect(() => {
    if (fullName === null) return undefined;

    const timeout = setTimeout(() => setFullName(null), HIGHLIGHT_DURATION_MS);
    return () => clearTimeout(timeout);
  }, [fullName]);

  const highlight = useCallback((next: string) => setFullName(next), []);

  return { fullName, highlight };
}
