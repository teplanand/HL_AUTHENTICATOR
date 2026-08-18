import React from "react";
import type { GridFilterModel, GridPaginationModel, GridSortModel } from "@mui/x-data-grid";

export const projectSurfaceSx = {
   
};

export const projectSectionTitleSx = {
  fontWeight: 800,
  letterSpacing: "-0.02em",
};

export const useProjectManagementGridState = () => {
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
