import { useCallback, useEffect, useState } from 'react';
import { HIGHLIGHT_DURATION_MS } from '../constants';

type HighlightedRepo = {
  fullName: string | null;
  /** Bumped on every `highlight` call, including re-clicks of the same repo. */
  token: number;
  highlight: (fullName: string) => void;
};

/**
 * Backs the chart-bar -> tracked-card connection: clears itself after a beat so
 * the highlight reads as a pulse tying the two views together, not a stuck state.
 */
export function useHighlightedRepo(): HighlightedRepo {
  const [fullName, setFullName] = useState<string | null>(null);
  const [token, setToken] = useState(0);

  useEffect(() => {
    if (fullName === null) return undefined;

    const timeout = setTimeout(() => setFullName(null), HIGHLIGHT_DURATION_MS);
    return () => clearTimeout(timeout);
    // `token` is in the deps so re-clicking the already-highlighted repo restarts
    // this timer too - setting `fullName` to its current value is otherwise a
    // no-op React state bail-out that would leave the original timer running.
  }, [fullName, token]);

  const highlight = useCallback((next: string) => {
    setFullName(next);
    setToken((current) => current + 1);
  }, []);

  return { fullName, token, highlight };
}
