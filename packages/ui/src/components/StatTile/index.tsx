import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';

export type StatTileProps = {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  /** Optional long-form explanation, e.g. the absolute date behind "3 days ago". */
  tooltip?: string | undefined;
};

export function StatTile({ icon, label, value, tooltip }: StatTileProps) {
  const content = (
    <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', minWidth: 0 }}>
      <Stack
        component="span"
        aria-hidden
        sx={{ color: 'text.secondary', fontSize: 18, lineHeight: 0 }}
      >
        {icon}
      </Stack>
      <Typography variant="body2" color="text.secondary" noWrap>
        <Typography component="span" variant="body2" color="text.primary" sx={{ fontWeight: 600 }}>
          {value}
        </Typography>{' '}
        {label}
      </Typography>
    </Stack>
  );

  return tooltip === undefined ? content : <Tooltip title={tooltip}>{content}</Tooltip>;
}
