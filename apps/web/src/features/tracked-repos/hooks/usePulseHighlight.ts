import { useCallback, useEffect, useState } from "react";
import { HIGHLIGHT_DURATION_MS } from "../constants";

type PulseHighlight = {
  id: string | null;
  /** Bumped on every `pulse` call, including a re-pulse of the same id. */
  token: number;
  pulse: (id: string) => void;
};

/**
 * A one-shot "flash and clear" highlight: `pulse(id)` shows it, then it clears
 * itself after a beat so it reads as a pulse tying two views together, not a
 * stuck state. Shared by both halves of the chart<->card link (bar click pulses
 * a card, card click pulses a bar) so this timer/token logic lives once.
 */
export function usePulseHighlight(): PulseHighlight {
  const [id, setId] = useState<string | null>(null);
  const [token, setToken] = useState(0);

  useEffect(() => {
    if (id === null) return undefined;

    const timeout = setTimeout(() => setId(null), HIGHLIGHT_DURATION_MS);
    return () => clearTimeout(timeout);
    // `token` is in the deps so re-pulsing the already-highlighted id restarts
    // this timer too - setting `id` to its current value is otherwise a no-op
    // React state bail-out that would leave the original timer running.
  }, [id, token]);

  const pulse = useCallback((next: string) => {
    setId(next);
    setToken((current) => current + 1);
  }, []);

  return { id, token, pulse };
}
