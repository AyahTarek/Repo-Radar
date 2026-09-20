import Stack from "@mui/material/Stack";
import type { TrackedRepo } from "../../types";
import { TrackedRepoCard } from "../TrackedRepoCard";

export type TrackedRepoListProps = {
  repos: readonly TrackedRepo[];
  highlightedFullName?: string | null | undefined;
  /** Forces the highlight effect to re-run even on a repeat click of the same repo. */
  highlightToken?: number | undefined;
  /** The repo to preview (no scroll) - either its bar is hovered, or its own card is. */
  hoveredFullName?: string | null | undefined;
  /** Called with a repo's `fullName` on card hover, and `null` on hover-out. */
  onCardHover?: ((fullName: string | null) => void) | undefined;
  /** Called with a repo's `fullName` when its card is clicked. */
  onCardActivate?: ((fullName: string) => void) | undefined;
};

export function TrackedRepoList({
  repos,
  highlightedFullName = null,
  highlightToken = 0,
  hoveredFullName = null,
  onCardHover,
  onCardActivate,
}: TrackedRepoListProps) {
  return (
    <Stack component="ul" spacing={1.5} sx={{ listStyle: "none", p: 0, m: 0 }}>
      {repos.map((repo) => (
        <TrackedRepoCard
          key={repo.fullName}
          repo={repo}
          isHighlighted={repo.fullName === highlightedFullName}
          highlightToken={highlightToken}
          isPreviewed={repo.fullName === hoveredFullName}
          onHoverChange={(hovering) =>
            onCardHover?.(hovering ? repo.fullName : null)
          }
          onActivate={() => onCardActivate?.(repo.fullName)}
        />
      ))}
    </Stack>
  );
}
