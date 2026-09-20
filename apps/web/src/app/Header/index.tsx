import RadarIcon from '@mui/icons-material/RadarOutlined';
import AppBar from '@mui/material/AppBar';
import Badge from '@mui/material/Badge';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { ThemeToggleButton } from '@repo-radar/ui';
import { NavLink } from 'react-router';
import { ROUTES } from '@/app/router/routes';
import { useTrackedCount } from '@/features/tracked-repos/hooks/useTrackedRepos';

const NAV_ITEMS = [
  { to: ROUTES.search, label: 'Search' },
  { to: ROUTES.tracked, label: 'Tracked' },
] as const;

export function Header() {
  const trackedCount = useTrackedCount();

  return (
    <AppBar position="sticky" color="default" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
      <Container maxWidth="lg" disableGutters>
        <Toolbar sx={{ gap: 2 }}>
          <Stack
            component={NavLink}
            to={ROUTES.search}
            direction="row"
            spacing={1}
            sx={{ alignItems: 'center', color: 'inherit', textDecoration: 'none' }}
          >
            <RadarIcon color="primary" />
            <Typography variant="h3" component="span" sx={{ whiteSpace: 'nowrap' }}>
              Repo Radar
            </Typography>
          </Stack>

          <Stack component="nav" direction="row" spacing={0.5} sx={{ ml: 'auto' }}>
            {NAV_ITEMS.map((item) => (
              <Button
                key={item.to}
                component={NavLink}
                to={item.to}
                end
                color="inherit"
                sx={{
                  '&.active': { color: 'primary.main', bgcolor: 'action.selected' },
                }}
              >
                {item.label === 'Tracked' ? (
                  <Badge badgeContent={trackedCount} color="primary" sx={{ pr: 1.5 }}>
                    {item.label}
                  </Badge>
                ) : (
                  item.label
                )}
              </Button>
            ))}
          </Stack>

          <ThemeToggleButton />
        </Toolbar>
      </Container>
    </AppBar>
  );
}
