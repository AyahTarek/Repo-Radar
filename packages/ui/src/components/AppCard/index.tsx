import Card, { type CardProps } from '@mui/material/Card';

/**
 * The single card surface used across the app, so search results, tracked repos
 * and the chart panel cannot drift apart visually.
 */
export function AppCard({ children, sx, ...cardProps }: CardProps) {
  return (
    <Card
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        p: 2,
        gap: 1.5,
        ...sx,
      }}
      {...cardProps}
    >
      {children}
    </Card>
  );
}
