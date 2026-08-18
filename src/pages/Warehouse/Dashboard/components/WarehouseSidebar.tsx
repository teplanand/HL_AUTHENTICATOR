import { memo } from "react";
import {
  Box,
  InputAdornment,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  TextField,
} from "@mui/material";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import SearchIcon from "@mui/icons-material/Search";

import IconActionButton from "../../../../../shared/components/common/IconActionButton";
import type { Warehouse } from "../types";

type WarehouseSidebarProps = {
  warehouses: Warehouse[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onAddWarehouse: () => void;
};

function WarehouseSidebarInner({
  warehouses,
  selectedIndex,
  onSelect,
  searchValue,
  onSearchChange,
  onAddWarehouse,
}: WarehouseSidebarProps) {
  return (
    <Box
      sx={{
        width: 260,
        minWidth: 260,
        borderRight: "1px solid",
        borderColor: "divider",
        height: "100%",
        overflow: "auto",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box sx={{ px: 2, pt: 2.5, pb: 1.25 }}>
        <Stack direction="row" spacing={0.75} alignItems="center">
          <TextField
            fullWidth
            size="small"
            placeholder="Search Warehouse..."
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "#94A3B8", fontSize: 18 }} />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2.5,
                bgcolor: "#F8FAFC",
                "& fieldset": { borderColor: "rgba(15,23,42,0.12)" },
                "&:hover fieldset": { borderColor: "rgba(15,23,42,0.2)" },
                "&.Mui-focused fieldset": { borderColor: "#FF8A3D", borderWidth: "1.5px" },
              },
              "& .MuiInputBase-input": {
                fontSize: "0.8rem",
                fontWeight: 600,
                py: 0.9,
              },
            }}
          />
          <IconActionButton
            ariaLabel="Add warehouse"
            tooltip="Add Warehouse"
            onClick={onAddWarehouse}
            sx={{
              color: "#FF8A3D",
              border: "1px solid rgba(255,138,61,0.22)",
              backgroundColor: "rgba(255,138,61,0.08)",
              "&:hover": {
                color: "#E67A2E",
                backgroundColor: "rgba(255,138,61,0.16)",
              },
            }}
          >
            <AddOutlinedIcon fontSize="small" />
          </IconActionButton>
        </Stack>
      </Box>

      <List disablePadding sx={{ px: 1, flex: 1 }}>
        {warehouses.map((warehouse, index) => {
          const rackCount = warehouse.sections.reduce(
            (sum, section) => sum + section.racks.length,
            0
          );
          const isSelected = selectedIndex === index;

          return (
            <ListItemButton
              key={warehouse.id}
              selected={isSelected}
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
                primary={warehouse.name}
                secondary={`${warehouse.address} | ${warehouse.sections.length} zones · ${rackCount} racks`}
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
          );
        })}
      </List>
    </Box>
  );
}

export const WarehouseSidebar = memo(WarehouseSidebarInner);
