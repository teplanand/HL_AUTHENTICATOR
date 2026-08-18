import { memo } from "react";
import { Box, Button, Tab, Tabs } from "@mui/material";

import { Section } from "../types";

type SectionTabsProps = {
  sections: Section[];
  activeSectionIndex: number;
  onChange: (event: React.SyntheticEvent, newValue: number | string) => void;
  onAddZone: () => void;
};

function SectionTabsComponent({
  sections,
  activeSectionIndex,
  onChange,
  onAddZone,
}: SectionTabsProps) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <Tabs
        value={activeSectionIndex}
        onChange={onChange}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          minHeight: 36,
          borderBottom: "1px solid",
          borderColor: "divider",
          "& .MuiTab-root": {
            minHeight: 36,
            textTransform: "uppercase",
            fontWeight: 700,
            fontSize: "0.78rem",
            color: "#64748B",
            px: 2,
          },
          "& .MuiTabs-indicator": {
            bgcolor: "#0F172A",
            height: 2.5,
            borderRadius: 99,
          },
        }}
      >
        {sections.map((section, index) => (
          <Tab key={section.id} value={index} label={section.name} />
        ))}
      </Tabs>

      <Button
        variant="outlined"
        size="small"
        sx={{
          color: "#FF8A3D",
          fontWeight: 700,
          fontSize: "0.78rem",
          textTransform: "none",
          whiteSpace: "nowrap",
          ml: 1,
          "&:hover": { backgroundColor: "rgba(255, 138, 61, 0.08)" },
        }}
        onClick={onAddZone}
      >
        + Add Zone
      </Button>
    </Box>
  );
}

export const SectionTabs = memo(SectionTabsComponent);
