import { MAX_AXIS_LABEL_LENGTH } from '../constants';

/** Axis labels have a fixed budget; the tooltip still shows the full label. */
export function truncateLabel(label: string, maxLength = MAX_AXIS_LABEL_LENGTH): string {
  return label.length <= maxLength ? label : `${label.slice(0, maxLength - 1)}…`;
}
