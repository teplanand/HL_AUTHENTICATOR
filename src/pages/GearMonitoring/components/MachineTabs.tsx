import { memo } from "react";
import { Box, Chip, Tab, Tabs, Typography, Stack, TextField, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import type { Machine } from "../data";

type MachineTabsProps = {
  machines: Machine[];
  selectedTab: string; // "ALL" or machine.id
  onTabChange: (tabValue: string) => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
};

function MachineTabsInner({ 
  machines, 
  selectedTab, 
  onTabChange,
  searchValue,
  onSearchChange
}: MachineTabsProps) {
  const handleChange = (_event: React.SyntheticEvent, newValue: string) => {
    onTabChange(newValue);
  };

  return (
    <Box sx={{ mb: 2 }}>
      {/* Header row */}
      {/* Search and Count Header */}
      <Stack 
        direction="row" 
        justifyContent="space-between" 
        alignItems="flex-start" 
        spacing={2}
        sx={{ mb: 2 }}
      >
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800, }}>
            Machine Monitoring
          </Typography>
          <Typography variant="body2" sx={{ color: "#94A3B8" }}>
            First tab shows all machines. Other tabs open one machine at a time.
          </Typography>
        </Box>
        
        <Stack direction="row" alignItems="center" spacing={2}>
          <TextField
            size="small"
            placeholder="Search Machine ID..."
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "#94A3B8", fontSize: 18 }} />
                </InputAdornment>
              ),
            }}
            sx={{
              width: 240,
              "& .MuiOutlinedInput-root": {
                borderRadius: 2.5,
                bgcolor: "#F8FAFC",
                "& fieldset": { borderColor: "rgba(15,23,42,0.12)" },
                "&.Mui-focused fieldset": { borderColor: "#0D9488" },
              },
              "& .MuiInputBase-input": {
                fontSize: "0.8rem",
                fontWeight: 600,
                py: 0.8,
              },
            }}
          />
          <Chip
            label={`${machines.length} machines visible`}
            size="small"
            sx={{
              bgcolor: "#0D9488",
              color: "#FFF",
              fontWeight: 700,
              fontSize: "0.75rem",
              height: 32,
              borderRadius: 2,
              px: 1,
              boxShadow: "0 2px 8px rgba(13, 148, 136, 0.2)",
            }}
          />
        </Stack>
      </Stack>

      {/* Tab bar */}
      <Tabs
        value={selectedTab}
        onChange={handleChange}
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
        <Tab value="ALL" label="All Machines" />
        {machines.map((m) => (
          <Tab key={m.id} value={m.id} label={m.id} />
        ))}
      </Tabs>
    </Box>
  );
}

export const MachineTabs = memo(MachineTabsInner);
