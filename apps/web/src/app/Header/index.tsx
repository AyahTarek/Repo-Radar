import BookmarkIcon from "@mui/icons-material/Bookmark";
import RadarIcon from "@mui/icons-material/RadarOutlined";
import SearchIcon from "@mui/icons-material/Search";
import AppBar from "@mui/material/AppBar";
import Badge from "@mui/material/Badge";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { ThemeToggleButton } from "@repo-radar/ui";
import { NavLink } from "react-router";
import { ROUTES } from "@/app/router/routes";
import { useTrackedCount } from "@/features/tracked-repos/hooks/useTrackedRepos";

const NAV_ITEMS = [
  { to: ROUTES.search, label: "Search", icon: <SearchIcon fontSize="small" /> },
  {
    to: ROUTES.tracked,
    label: "Tracked",
    icon: <BookmarkIcon fontSize="small" />,
  },
] as const;

export function Header() {
  const trackedCount = useTrackedCount();

  return (
    <AppBar
      position="sticky"
      color="default"
      elevation={0}
      sx={{ borderBottom: 1, borderColor: "divider" }}
    >
      <Container maxWidth="lg" disableGutters>
        <Toolbar sx={{ gap: { xs: 1, sm: 2 } }}>
          <Stack
            component={NavLink}
            to={ROUTES.search}
            direction="row"
            spacing={1}
            sx={{
              alignItems: "center",
              color: "inherit",
              textDecoration: "none",
            }}
          >
            <RadarIcon color="primary" />
            <Typography
              variant="h3"
              component="span"
              sx={{ whiteSpace: "nowrap" }}
            >
              Repo Radar
            </Typography>
          </Stack>

          <Stack
            component="nav"
            direction="row"
            spacing={0.5}
            sx={{ ml: "auto" }}
          >
            {NAV_ITEMS.map((item) => {
              // Nav collapses to icon-only on xs so the wordmark never has to hide.
              const content = (
                <>
                  <Box
                    component="span"
                    sx={{ display: { xs: "inline-flex", sm: "none" } }}
                  >
                    {item.icon}
                  </Box>
                  <Box
                    component="span"
                    sx={{ display: { xs: "none", sm: "inline" } }}
                  >
                    {item.label}
                  </Box>
                </>
              );

              return (
                <Button
                  key={item.to}
                  component={NavLink}
                  to={item.to}
                  end
                  color="inherit"
                  aria-label={item.label}
                  sx={{
                    minWidth: "auto",
                    px: { xs: 1, sm: 2 },
                    "&.active": {
                      color: "primary.main",
                      bgcolor: "action.selected",
                    },
                  }}
                >
                  {item.label === "Tracked" ? (
                    <Badge
                      badgeContent={trackedCount}
                      color="primary"
                      sx={{ pr: 1.5 }}
                    >
                      {content}
                    </Badge>
                  ) : (
                    content
                  )}
                </Button>
              );
            })}
          </Stack>

          <ThemeToggleButton />
        </Toolbar>
      </Container>
    </AppBar>
  );
}
