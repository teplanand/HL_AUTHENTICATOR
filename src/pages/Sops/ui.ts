import React from "react";
import type { GridFilterModel, GridPaginationModel, GridSortModel } from "@mui/x-data-grid";

export const surfaceSx = {
  borderRadius: 2,
  border: "1px solid rgba(148, 163, 184, 0.18)",
  boxShadow: "0 16px 40px rgba(15, 23, 42, 0.06)",
  background:
    "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.96) 100%)",
};

export const sectionTitleSx = {
  fontWeight: 800,
  letterSpacing: "-0.02em",
};

export const useSopsGridState = () => {
  const [paginationModel, setPaginationModel] = React.useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });
  const [sortModel, setSortModel] = React.useState<GridSortModel>([]);
  const [filterModel, setFilterModel] = React.useState<GridFilterModel>({
    items: [],
    quickFilterValues: [],
  });

  return {
    paginationModel,
    setPaginationModel,
    sortModel,
    setSortModel,
    filterModel,
    setFilterModel,
  };
};
