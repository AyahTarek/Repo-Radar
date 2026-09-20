/** Stable per-repo DOM id a chart bar click scrolls the matching card into view. */
export function trackedRepoCardId(fullName: string): string {
  return `tracked-repo-card-${fullName}`;
}
