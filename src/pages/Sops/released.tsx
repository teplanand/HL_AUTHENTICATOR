import React from "react";
import { Box,  Chip, Stack } from "@mui/material";
import type { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { Page } from "../../../shared/components/common/Page";
 import ReusableDataGrid from "../../../shared/components/common/ReusableDataGrid";
import { StageChip } from "./components";
import SopPdfPreviewPanel from "./SopPdfPreviewPanel";
import {  useSopsGridState } from "./ui";
import { useSopsWorkflowData } from "./useSopsWorkflowData";
import { useModal } from "../../../shared/hooks/useModal";
import type { SopDocumentRecord } from "./types";
import { getStaticModuleRouteUiPermissions } from "../../../shared/utils/staticModuleAccess";

const SopsReleasedPage = () => {
  const grid = useSopsGridState();
  const routePermissions = React.useMemo(
    () => getStaticModuleRouteUiPermissions("/sops/released"),
    [],
  );
  const { documents } = useSopsWorkflowData();
  const { openModal } = useModal();

  const releasedDocuments = React.useMemo(
    () => documents.filter((item) => item.status === "Released"),
    [documents],
  );

  const columns = React.useMemo<GridColDef<SopDocumentRecord>[]>(
    () => [
      { field: "sopNumber", headerName: "SOP Number", minWidth: 140, flex: 0.9 },
      { field: "title", headerName: "Title", minWidth: 220, flex: 1.5 },
      { field: "department", headerName: "Department", minWidth: 150, flex: 1 },
      { field: "category", headerName: "Category", minWidth: 140, flex: 0.9 },
      {
        field: "status",
        headerName: "Status",
        minWidth: 120,
        flex: 0.8,
        sortable: false,
        renderCell: (params: GridRenderCellParams<SopDocumentRecord>) => (
          <StageChip stage={params.row.status} />
        ),
      },
      { field: "version", headerName: "Version", minWidth: 100, flex: 0.7 },
      { field: "effectiveDate", headerName: "Effective Date", minWidth: 130, flex: 0.9 },
      { field: "owner", headerName: "Owner", minWidth: 140, flex: 0.9 },
      {
        field: "contentSource",
        headerName: "Source",
        minWidth: 150,
        flex: 0.9,
        sortable: false,
        renderCell: (params: GridRenderCellParams<SopDocumentRecord>) => (
          <Chip
            label={
              params.row.contentSource === "file" ? "Uploaded PDF" : "Generated PDF"
            }
            size="small"
            variant="outlined"
          />
        ),
      },
    ],
    [],
  );

  const handleOpenPreview = React.useCallback(
    (document: SopDocumentRecord) => {
      openModal({
        title: `${document.sopNumber} PDF Preview`,
        width: "96vw",
        showCloseButton: true,
        askDataChangeConfirm: false,
        hideFooter: true,
        dialogContentProps: {
          sx: {
            px: { xs: 1.5, md: 2.5 },
            py: { xs: 1.5, md: 2 },
          },
        },
        component: () => (
          <Box sx={{ width: "100%" }}>
            <SopPdfPreviewPanel
              document={document}
              minHeight={760}
              title={document.title}
              subtitle="Protected PDF preview for the selected released SOP."
            />
          </Box>
        ),
      });
    },
    [openModal],
  );

  return (
    <Page module="sops">
      <Stack spacing={3}>
       

      <ReusableDataGrid
        rows={releasedDocuments}
        columns={columns}
        totalCount={releasedDocuments.length}
        loading={false}
        paginationModel={grid.paginationModel}
        setPaginationModel={grid.setPaginationModel}
        sortModel={grid.sortModel}
        setSortModel={grid.setSortModel}
        filterModel={grid.filterModel}
        setFilterModel={grid.setFilterModel}
        title="Released SOP List"
        uniqueIdField="id"
        permissions={{
          create: false,
          edit: false,
          delete: false,
          view: routePermissions.view,
          download: routePermissions.download,
        }}
        height={580}
        searchableFields={[
          "sopNumber",
          "title",
          "department",
          "category",
          "owner",
          "version",
          "effectiveDate",
        ]}
        noRowsMessage="No released SOPs available."
        onRowClick={handleOpenPreview}
      />
    </Stack>
    </Page>
  );
};

export default SopsReleasedPage;
