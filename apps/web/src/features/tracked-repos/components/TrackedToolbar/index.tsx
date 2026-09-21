import RefreshIcon from "@mui/icons-material/Refresh";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import { TRACKED_SORT_OPTIONS } from "../../constants";
import type { TrackedSortOption } from "../../types";

export type TrackedToolbarProps = {
  sort: TrackedSortOption;
  onSortChange: (sort: TrackedSortOption) => void;
  onRefreshAll: () => void;
  isRefreshing: boolean;
  visibleCount: number;
};

const SORT_FIELD_WIDTH = 200;

export function TrackedToolbar({
  sort,
  onSortChange,
  onRefreshAll,
  isRefreshing,
  visibleCount,
}: TrackedToolbarProps) {
  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={1}
      sx={{
        alignItems: "flex-start",
        flexWrap: "wrap",
        rowGap: 1,
        flexShrink: { sm: 0 },
        width: { xs: "100%", sm: "auto" },
      }}
    >
      <TextField
        select
        size="small"
        value={sort}
        onChange={(event) =>
          onSortChange(event.target.value as TrackedSortOption)
        }
        label="Sort by"
        sx={{
          width: { xs: "100%", sm: "auto" },
          minWidth: { sm: SORT_FIELD_WIDTH },
        }}
      >
        {TRACKED_SORT_OPTIONS.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>

      <Button
        onClick={onRefreshAll}
        disabled={isRefreshing || visibleCount === 0}
        variant="outlined"
        startIcon={
          // size={20} matches MUI's .MuiButton-iconSizeMedium rule (20 px) so
          // the startIcon container stays the same width in both states.
          isRefreshing ? <CircularProgress size={20} /> : <RefreshIcon />
        }
        sx={{ width: { xs: "100%", sm: "auto" } }}
      >
        {/*
         * Always render the full label so the button width is stable.
         * Says "this page" because only mounted cards are refetched.
         */}
        Refresh this page ({visibleCount})
      </Button>
    </Stack>
  );
}
