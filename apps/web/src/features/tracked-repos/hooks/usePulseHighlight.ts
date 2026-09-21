import { useCallback, useEffect, useState } from "react";
import { HIGHLIGHT_DURATION_MS } from "../constants";

type PulseHighlight = {
  id: string | null;
  /** Bumped on every `pulse` call, including a re-pulse of the same id. */
  token: number;
  pulse: (id: string) => void;
};

type HighlightState = { id: string | null; token: number };

/**
 * A one-shot "flash and clear" highlight: `pulse(id)` shows it, then it clears
 * itself after a beat so it reads as a pulse tying two views together, not a
 * stuck state. Shared by both halves of the chart<->card link (bar click pulses
 * a card, card click pulses a bar) so this timer/token logic lives once.
 *
 * `id` and `token` are combined into one state object so the effect has a single
 * dependency it genuinely reads from. Bumping `token` on a re-pulse of the same
 * id changes the object reference, which restarts the timer even though `id`
 * itself hasn't changed.
 */
export function usePulseHighlight(): PulseHighlight {
  const [highlight, setHighlight] = useState<HighlightState>({
    id: null,
    token: 0,
  });

  useEffect(() => {
    if (highlight.id === null) return undefined;

    const timeout = setTimeout(
      () => setHighlight((h) => ({ ...h, id: null })),
      HIGHLIGHT_DURATION_MS,
    );
    return () => clearTimeout(timeout);
  }, [highlight]);

  const pulse = useCallback((next: string) => {
    setHighlight((h) => ({ id: next, token: h.token + 1 }));
  }, []);

  return { id: highlight.id, token: highlight.token, pulse };
}
