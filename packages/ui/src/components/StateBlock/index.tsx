import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';

export type StateBlockVariant = 'empty' | 'error' | 'loading';

export type StateBlockProps = {
  variant: StateBlockVariant;
  title: string;
  description?: string | undefined;
  icon?: ReactNode | undefined;
  /** Retry or call-to-action control; every error state should provide one. */
  action?: ReactNode | undefined;
};

const VARIANT_ROLE: Record<StateBlockVariant, 'status' | 'alert'> = {
  empty: 'status',
  loading: 'status',
  error: 'alert',
};

/**
 * One component for the three non-data outcomes, so every async surface in the
 * app announces itself to assistive technology the same way.
 */
export function StateBlock({ variant, title, description, icon, action }: StateBlockProps) {
  return (
    <Stack
      role={VARIANT_ROLE[variant]}
      aria-live={variant === 'error' ? 'assertive' : 'polite'}
      spacing={1.5}
      sx={{
        alignItems: 'center',
        textAlign: 'center',
        py: 6,
        px: 2,
        color: 'text.secondary',
      }}
    >
      {variant === 'loading' ? <CircularProgress size={28} /> : icon}
      <Typography variant="h3" color={variant === 'error' ? 'error.main' : 'text.primary'}>
        {title}
      </Typography>
      {description !== undefined && (
        <Typography variant="body2" sx={{ maxWidth: 460 }}>
          {description}
        </Typography>
      )}
      {action}
    </Stack>
  );
}
