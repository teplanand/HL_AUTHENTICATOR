import { memo } from "react";
import { Box, Button, Tab, Tabs } from "@mui/material";

import { Warehouse } from "../types";
import { useModal } from "../../../../../shared/hooks/useModal";
import { AddEditWarehouse, AddEditWarehouseRef } from "../../Warehouselist/addeditwarehouse";
import { openEntityFormModal } from "../../shared/openEntityFormModal";

type WarehouseTabsProps = {
  warehouses: Warehouse[];
  activeWarehouseIndex: number;
  itemSearchText: string;
  onChange: (event: React.SyntheticEvent, newValue: number) => void;
  onItemSearchChange: (value: string) => void;
  onPrevious: () => void;
  onNext: () => void;
};

function WarehouseTabsComponent({
  warehouses,
  activeWarehouseIndex,
  itemSearchText,
  onChange,
  onItemSearchChange,
  onPrevious,
  onNext,
}: WarehouseTabsProps) {
  const { openModal } = useModal();

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: { xs: "stretch", md: "center" },
        justifyContent: "space-between",
        mb: 1,
        flexDirection: { xs: "column", md: "row" },
      }}
    >
      <Tabs
        value={activeWarehouseIndex}
        onChange={onChange}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          minHeight: 48,
          "& .MuiTabs-flexContainer": {
            gap: 1,
          },
          "& .MuiTabs-indicator": {
            backgroundColor: "#FF8A3D",
            height: 3,
            borderRadius: "3px 3px 0 0",
            boxShadow: "0px -2px 10px rgba(255, 138, 61, 0.5)",
          },
        }}
      >
        {warehouses.map((warehouse, index) => (
          <Tab
            key={warehouse.id}
            label={warehouse.name}
            sx={{
              textTransform: "none",
              fontWeight: activeWarehouseIndex === index ? 700 : 500,
              fontSize: "0.95rem",
              color: activeWarehouseIndex === index ? "#FF8A3D" : "text.secondary",
              minWidth: "auto",
              px: 3,
              transition: "all 0.3s ease",
              "&:hover": {
                color: "#FF8A3D",
                opacity: 0.8,
              },
              "&.Mui-selected": {
                color: "#FF8A3D",
              },
            }}
          />
        ))}
      </Tabs>

      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 2,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <Box sx={{ position: "relative" }}>
          <input
            type="text"
            value={itemSearchText}
            onChange={(event) => onItemSearchChange(event.target.value)}
            placeholder="Search racks or items..."
            style={{
              minWidth: 260,
              border: "1px solid #E2E8F0",
              borderRadius: "3px",
              padding: "8px 10px",
              fontSize: "0.875rem",
              outline: "none",
              backgroundColor: "#FFF",
              transition: "all 0.2s ease",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#FF8A3D";
              e.target.style.boxShadow = "0 0 0 3px rgba(255, 138, 61, 0.1)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#E2E8F0";
              e.target.style.boxShadow = "none";
            }}
          />
        </Box>

        <Button
          variant="contained"
          sx={{
            backgroundColor: "#FF8A3D",
            color: "#FFF",
            textTransform: "none",
            fontWeight: 600,
            borderRadius: "10px",
            px: 3,
            boxShadow: "0 4px 12px rgba(255, 138, 61, 0.2)",
            "&:hover": {
              backgroundColor: "#E67A2E",
              boxShadow: "0 6px 16px rgba(255, 138, 61, 0.3)",
            },
          }}
          onClick={() => {
            openEntityFormModal<AddEditWarehouseRef>({
              openModal,
              entityLabel: "Warehouse",
              width: 500,
              FormComponent: AddEditWarehouse,
            });
          }}
        >
          + Add Warehouse
        </Button>
      </Box>
    </Box>
  );
}

export const WarehouseTabs = memo(WarehouseTabsComponent);
