import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { ReactNode } from "react";

export type SectionHeaderProps = {
  title: string;
  subtitle?: string | undefined;
  /** Toolbar controls rendered opposite the title. */
  action?: ReactNode | undefined;
};

export function SectionHeader({ title, subtitle, action }: SectionHeaderProps) {
  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={1.5}
      sx={{
        justifyContent: "space-between",
        alignItems: "flex-start",
        width: "100%",
      }}
    >
      <Stack spacing={0.25} sx={{ flex: "1 1 auto", minWidth: 0 }}>
        <Typography variant="h2" component="h2">
          {title}
        </Typography>
        {subtitle !== undefined && (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </Stack>
      {action}
    </Stack>
  );
}
