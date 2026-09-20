import ClearIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import { REPO_SORT_OPTIONS } from "../../constants";
import type { RepoSortOption } from "../../types";

export type SearchFieldProps = {
  value: string;
  sort: RepoSortOption;
  onValueChange: (value: string) => void;
  onSortChange: (sort: RepoSortOption) => void;
};

const SORT_FIELD_WIDTH = 200;

export function SearchField({
  value,
  sort,
  onValueChange,
  onSortChange,
}: SearchFieldProps) {
  return (
    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
      <TextField
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        label="Search GitHub repositories"
        placeholder="e.g. react, owner/name, topic:cli"
        fullWidth
        type="search"
        // Suppresses the browser's own remembered-value dropdown, which duplicates
        // this field's own debounced search and URL persistence.
        autoComplete="off"
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
            endAdornment:
              value.length > 0 ? (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="Clear search"
                    size="small"
                    onClick={() => onValueChange("")}
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : null,
          },
        }}
      />

      <TextField
        select
        value={sort}
        onChange={(event) => onSortChange(event.target.value as RepoSortOption)}
        label="Sort by"
        sx={{
          width: { xs: "100%", sm: "auto" },
          minWidth: { sm: SORT_FIELD_WIDTH },
        }}
      >
        {REPO_SORT_OPTIONS.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>
    </Stack>
  );
}
