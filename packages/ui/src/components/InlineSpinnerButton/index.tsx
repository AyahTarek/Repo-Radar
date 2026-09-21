import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import type { ReactNode } from 'react';

export type InlineSpinnerButtonProps = {
  /** Doubles as the tooltip text and the accessible name. */
  label: string;
  icon: ReactNode;
  busy?: boolean | undefined;
  disabled?: boolean | undefined;
  onClick: () => void;
  size?: 'small' | 'medium' | undefined;
};

// Match MUI's icon font sizes (small = 20 px, medium = 24 px) so the IconButton
// doesn't resize when the spinner replaces the icon.
const SPINNER_SIZE = { small: 20, medium: 24 } as const;

/**
 * Every refresh action in the app is one of these, so a request in flight always
 * looks and behaves the same and can never be double-fired by an eager click.
 */
export function InlineSpinnerButton({
  label,
  icon,
  busy = false,
  disabled = false,
  onClick,
  size = 'medium',
}: InlineSpinnerButtonProps) {
  const isDisabled = disabled || busy;

  return (
    // MUI Tooltip cannot attach pointer events to a disabled button, so we
    // wrap it in a <span> to keep the tooltip working in both states.
    <Tooltip title={label}>
      <span>
        <IconButton
          onClick={onClick}
          disabled={isDisabled}
          aria-label={label}
          aria-busy={busy}
          size={size}
          sx={{ display: 'flex' }}
        >
          {busy ? <CircularProgress size={SPINNER_SIZE[size]} /> : icon}
        </IconButton>
      </span>
    </Tooltip>
  );
}
