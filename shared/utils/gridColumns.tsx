import React from "react";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { Switch } from "@mui/material";

interface GetStatusColumnProps {
  field?: string;
  headerName?: string; // Allow customizing header name
  onToggle?: (row: any) => void;
  loadingId?: number | string | null;
  width?: number;
  disabled?: boolean;
}

/**
 * Generates a reusable Status column definition for DataGrid.
 *
 * @param props Configuration for the status column
 * @returns GridColDef
 */
export const getStatusColumn = ({
  field = "is_active",
  headerName = "Status",
  onToggle,
  loadingId = null,
  width = 120,
  disabled = false,
}: GetStatusColumnProps = {}): GridColDef => ({
  field,
  headerName,
  width,
  type: "singleSelect",
  valueOptions: [
    { value: true, label: "Active" },
    { value: false, label: "Inactive" },
  ],
  renderCell: (params: GridRenderCellParams) => (
    <Switch
      
      checked={!!params.value}
      onChange={() => onToggle && onToggle(params.row)}
      disabled={disabled || loadingId === params.row.id}
      size="small"
      // Stop propagation to prevent row click events if any
      onClick={(e) => e.stopPropagation()}
    />
  ),
  filterable: true,
//   align: "center",
//   headerAlign: "center",
});

/**
 * Generates a reusable ID/No. column definition for DataGrid.
 */
export const getIdColumn = (width = 100): GridColDef => ({
  field: "id",
  headerName: "No.",
  width,
  filterable: true,
  type: "number",
  valueFormatter: (value) => value || "",
  align: "center",
  headerAlign: "center",
});
