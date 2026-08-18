import React, { useCallback, useMemo, useState } from "react";
import { Box, Chip } from "@mui/material";
import type { GridColDef, GridFilterModel, GridPaginationModel, GridSortModel } from "@mui/x-data-grid";

import { Page } from "../../../shared/components/common/Page";
import ReusableDataGrid from "../../../shared/components/common/ReusableDataGrid";
import { useModal } from "../../../shared/hooks/useModal";
import { openEntityFormModal } from "../Warehouse/shared/openEntityFormModal";
import {
  AddEditCategory,
  type AddEditCategoryRef,
  type CategorySubmitPayload,
} from "./addeditcategory";
import { useSopsWorkflowData } from "./useSopsWorkflowData";
import { getStaticModuleRouteUiPermissions } from "../../../shared/utils/staticModuleAccess";

const SopsCategoryPage: React.FC = () => {
  const routePermissions = useMemo(
    () => getStaticModuleRouteUiPermissions("/sops/category"),
    [],
  );
  const { openModal } = useModal();
  const { categoryRecords, createCategory, updateCategory, deleteCategory } = useSopsWorkflowData();

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 15,
  });
  const [sortModel, setSortModel] = useState<GridSortModel>([]);
  const [filterModel, setFilterModel] = useState<GridFilterModel>({
    items: [],
    quickFilterValues: [],
  });

  const handleSubmitCategory = useCallback(
    async (payload: CategorySubmitPayload) => {
      if (payload.id) {
        return updateCategory(payload.id, payload);
      }

      return createCategory(payload);
    },
    [createCategory, updateCategory],
  );

  const handleDeleteCategory = useCallback(
    async (id: string) => {
      await deleteCategory(id);
    },
    [deleteCategory],
  );

  const handleAddCategory = useCallback(() => {
    openEntityFormModal<AddEditCategoryRef>({
      openModal,
      entityLabel: "Category",
      width: 560,
      FormComponent: AddEditCategory,
      extraProps: {
        onSubmitCategory: handleSubmitCategory,
        onDeleteCategory: handleDeleteCategory,
      },
    });
  }, [handleDeleteCategory, handleSubmitCategory, openModal]);

  const handleEditCategory = useCallback(
    (row: any) => {
      openEntityFormModal<AddEditCategoryRef>({
        openModal,
        entityLabel: "Category",
        width: 560,
        FormComponent: AddEditCategory,
        defaultValues: row,
        extraProps: {
          onSubmitCategory: handleSubmitCategory,
          onDeleteCategory: handleDeleteCategory,
        },
      });
    },
    [handleDeleteCategory, handleSubmitCategory, openModal],
  );

  const rows = useMemo(
    () =>
      categoryRecords.map((record, index) => ({
        ...record,
        id: record.id ?? `category-${index + 1}`,
        contentHeadersPreview: (record.contentHeaders || []).join(", "),
      })),
    [categoryRecords],
  );

  const columns = useMemo<GridColDef[]>(
    () => [
      { field: "code", headerName: "Category Code", flex: 1, minWidth: 170 },
      { field: "name", headerName: "Category Name", flex: 1.2, minWidth: 220 },
      {
        field: "contentHeadersPreview",
        headerName: "Content Headers",
        flex: 1.6,
        minWidth: 260,
        renderCell: (params) => params.value || "-",
      },
      {
        field: "status",
        headerName: "Status",
        flex: 0.8,
        minWidth: 140,
        renderCell: (params) => {
          const isActive = params.value === "Active";

          return (
            <Chip
              label={isActive ? "Active" : "Draft"}
              size="small"
              sx={{
                fontWeight: 700,
                color: isActive ? "#166534" : "#9A3412",
                bgcolor: isActive ? "rgba(34,197,94,0.12)" : "rgba(251,146,60,0.16)",
                borderRadius: "999px",
              }}
            />
          );
        },
      },
      { field: "notes", headerName: "Notes", flex: 1.5, minWidth: 260 },
    ],
    [],
  );

  return (
    <Page module="sops">
      <Box
        className="p-0"
        sx={{
          "& .MuiDataGrid-row:hover": {
            cursor: "pointer",
          },
        }}
      >
        <ReusableDataGrid
          rows={rows}
          columns={columns}
          totalCount={rows.length}
          loading={false}
          paginationModel={paginationModel}
          setPaginationModel={setPaginationModel}
          sortModel={sortModel}
          setSortModel={setSortModel}
          filterModel={filterModel}
          setFilterModel={setFilterModel}
          height={"calc(100vh - 120px)"}
          title="Category List"
          uniqueIdField="id"
          permissions={{
            create: routePermissions.create,
            edit: routePermissions.edit,
            delete: routePermissions.delete,
            download: routePermissions.download,
            view: routePermissions.view,
          }}
          onAdd={routePermissions.create ? handleAddCategory : undefined}
          onRowClick={routePermissions.update ? handleEditCategory : undefined}
          searchableFields={["code", "name", "status", "notes", "contentHeadersPreview"]}
          noRowsMessage="No categories found"
        />
      </Box>
    </Page>
  );
};

export default SopsCategoryPage;
