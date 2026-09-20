/** Maps a MUI x-charts bar click's `dataIndex` back to the datum it represents. */
export function resolveClickedBarId(
  ids: readonly string[],
  dataIndex: number,
): string | undefined {
  return ids[dataIndex];
}
