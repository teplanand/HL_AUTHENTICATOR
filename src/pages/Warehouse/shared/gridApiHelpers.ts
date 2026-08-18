import type { GridFilterItem, GridFilterModel, GridPaginationModel, GridSortModel } from "@mui/x-data-grid";

export const extractApiRows = (response: any) => {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.data?.data)) {
    return response.data.data;
  }

  if (Array.isArray(response?.rows)) {
    return response.rows;
  }

  if (Array.isArray(response?.data?.rows)) {
    return response.data.rows;
  }

  return [];
};

export const extractApiTotalCount = (response: any, fallbackCount: number) =>
  response?.total ??
  response?.data?.total ??
  response?.count ??
  response?.data?.count ??
  fallbackCount;

export const buildGridApiParams = ({
  paginationModel,
  sortModel,
  filterModel,
}: {
  paginationModel: GridPaginationModel;
  sortModel: GridSortModel;
  filterModel: GridFilterModel;
}) => {
  const params: Record<string, string | number | boolean> = {
    skip: paginationModel.page * paginationModel.pageSize,
    limit: paginationModel.pageSize,
    sort_by: sortModel.length > 0 ? String(sortModel[0].field) : "id",
    sort_order: sortModel.length > 0 ? sortModel[0].sort || "desc" : "desc",
  };

  if (filterModel.quickFilterValues && filterModel.quickFilterValues.length > 0) {
    params.search = filterModel.quickFilterValues.join(" ");
  }

  filterModel.items.forEach((item: GridFilterItem) => {
    if (item.value === undefined || item.value === null || item.value === "") {
      return;
    }

    params[item.field] = item.value as string | number | boolean;
  });

  return params;
};
