import type { ReactNode } from "react";
import { Box, Collapse, Paper, Stack } from "@mui/material";

type CompactAccordionProps = {
  expanded: boolean;
  onToggle: () => void;
  header: ReactNode;
  children: ReactNode;
};

export default function CompactAccordion({
  expanded,
  onToggle,
  header,
  children,
}: CompactAccordionProps) {
  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: 2,
        borderColor: "rgba(15,23,42,0.08)",
        boxShadow: "none",
        overflow: "hidden",
      }}
    >
      <Box
        onClick={onToggle}
        sx={{
          px: 1,
          py: 0.875,
          cursor: "pointer",
        }}
      >
        {header}
      </Box>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Stack spacing={1} sx={{ px: 1, pb: 1 }}>
          {children}
        </Stack>
      </Collapse>
    </Paper>
  );
}
