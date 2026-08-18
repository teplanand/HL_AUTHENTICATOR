import { memo } from "react";
import { Box, InputAdornment, List, ListItemButton, ListItemText, TextField } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

import type { Location } from "../data";

type LocationSidebarProps = {
  locations: Location[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
};

function LocationSidebarInner({
  locations,
  selectedIndex,
  onSelect,
  searchValue,
  onSearchChange,
}: LocationSidebarProps) {
  return (
    <Box
      sx={{
        width: 260,
        minWidth: 260,
        borderRight: "1px solid",
        borderColor: "divider",
        height: "100%",
        overflow: "auto",
      }}
    >
      <Box sx={{ px: 2, pt: 2.5, pb: 1.5 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search Location..."
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: "#94A3B8", fontSize: 20 }} />
              </InputAdornment>
            ),
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 3,
              bgcolor: "#F8FAFC",
              "& fieldset": { borderColor: "rgba(15,23,42,0.12)" },
              "&:hover fieldset": { borderColor: "rgba(15,23,42,0.2)" },
              "&.Mui-focused fieldset": { borderColor: "#0D9488", borderWidth: "1.5px" },
            },
            "& .MuiInputBase-input": {
              fontSize: "0.85rem",
              fontWeight: 600,
              py: 1,
            },
          }}
        />
      </Box>

      <List disablePadding sx={{ px: 1 }}>
        {locations.map((location, index) => (
          <ListItemButton
            key={location.name}
            selected={selectedIndex === index}
            onClick={() => onSelect(index)}
            disableRipple
            sx={{
              borderRadius: 2,
              mb: 0.5,
              py: 1,
              px: 1.5,
              borderLeft: "3px solid transparent",
              transition: "background-color 0.15s ease, border-color 0.15s ease",
              "&.Mui-selected": {
                borderLeftColor: "#FF8A3D",
                "&:hover": { bgcolor: "#FFF4ED", py: 1 },
              },
              "&:hover:not(.Mui-selected)": {
                bgcolor: "rgba(0,0,0,0.03)",
                py: 1,
              },
            }}
          >
            <ListItemText
              primary={location.name}
              secondary={`${location.clientName} | ${location.machines.length} machines`}
              primaryTypographyProps={{
                fontWeight: 700,
                fontSize: "0.88rem",
              }}
              secondaryTypographyProps={{
                fontWeight: 500,
                fontSize: "0.72rem",
                color: "#64748B",
              }}
            />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );
}

export const LocationSidebar = memo(LocationSidebarInner);
