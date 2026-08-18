import React from "react";
import { Box, MenuItem, Stack, TextField } from "@mui/material";
import type { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import ReusableDataGrid from "../../../shared/components/common/ReusableDataGrid";
import { getStaticModuleRouteUiPermissions } from "../../../shared/utils/staticModuleAccess";
import { ProjectStatusBadge } from "./components";
import {
  inquiryComments,
  scopeApprovalTimeline,
  scopeVersions,
  sharedAttachments,
  type ScopeVersionRecord,
} from "./mockData";
import { useProjectManagementGridState } from "./ui";
import {
  buildInitialScopeFormValues,
  ScopeDetailDrawer,
  ScopeFormDrawer,
  type ScopeFormValues,
} from "./workspaceDrawers";

type ScopeStatusFilter =
  | "all"
  | "Pending"
  | "In Review"
  | "Approved"
  | "Rejected"
  | "Request Changes";

const buildNextScopeVersion = (rows: ScopeVersionRecord[]) => {
  const maxVersion =
    rows.reduce((maxValue, row) => {
      const numericValue = Number(row.version.replace(/[^0-9.]/g, "").split(".")[0]);
      return Number.isFinite(numericValue) ? Math.max(maxValue, numericValue) : maxValue;
    }, 1) + 1;

  return `v${maxVersion}.0`;
};

const today = () => new Date().toISOString().slice(0, 10);

const ProjectManagementScopeDocumentsPage = () => {
  const permissions = React.useMemo(
    () => getStaticModuleRouteUiPermissions("/project-management/scope-documents"),
    [],
  );
  const gridState = useProjectManagementGridState();
  const [rows, setRows] = React.useState<ScopeVersionRecord[]>(scopeVersions);
  const [reviewerFilter, setReviewerFilter] = React.useState("all");
  const [statusFilter, setStatusFilter] = React.useState<ScopeStatusFilter>("all");
  const [selectedId, setSelectedId] = React.useState(scopeVersions[0]?.id ?? "");
  const [formDrawerOpen, setFormDrawerOpen] = React.useState(false);
  const [detailDrawerOpen, setDetailDrawerOpen] = React.useState(false);
  const [formMode, setFormMode] = React.useState<"create" | "edit">("create");
  const [editingScopeId, setEditingScopeId] = React.useState<string | null>(null);
  const [formValues, setFormValues] = React.useState<ScopeFormValues>(
    buildInitialScopeFormValues(),
  );

  const selectedVersion = React.useMemo(
    () => rows.find((item) => item.id === selectedId) ?? rows[0] ?? null,
    [rows, selectedId],
  );

  const reviewerOptions = React.useMemo(
    () => Array.from(new Set(rows.map((row) => row.reviewer))),
    [rows],
  );

  const filteredRows = React.useMemo(
    () =>
      rows.filter((row) => {
        const matchesReviewer = reviewerFilter === "all" || row.reviewer === reviewerFilter;
        const matchesStatus =
          statusFilter === "all" ||
          row.status === statusFilter ||
          row.approvalStatus === statusFilter;
        return matchesReviewer && matchesStatus;
      }),
    [reviewerFilter, rows, statusFilter],
  );

  const openCreateDrawer = React.useCallback(() => {
    setFormMode("create");
    setEditingScopeId(null);
    setFormValues({
      ...buildInitialScopeFormValues(),
      version: buildNextScopeVersion(rows),
      submittedOn: today(),
      status: "Pending",
      approvalStatus: "Pending",
    });
    setFormDrawerOpen(true);
  }, [rows]);

  const openEditDrawer = React.useCallback((scope: ScopeVersionRecord) => {
    setSelectedId(scope.id);
    setEditingScopeId(scope.id);
    setFormMode("edit");
    setFormValues(buildInitialScopeFormValues(scope));
    setFormDrawerOpen(true);
  }, []);

  const openDetailDrawer = React.useCallback((scope: ScopeVersionRecord) => {
    setSelectedId(scope.id);
    setDetailDrawerOpen(true);
  }, []);

  const closeFormDrawer = React.useCallback(() => {
    setFormDrawerOpen(false);
  }, []);

  const closeDetailDrawer = React.useCallback(() => {
    setDetailDrawerOpen(false);
  }, []);

  const handleSubmit = React.useCallback(() => {
    const nextPayload: ScopeVersionRecord = {
      id: editingScopeId ?? `scope-${Date.now()}`,
      inquiryNo: formValues.inquiryNo,
      title: formValues.title,
      version: formValues.version || buildNextScopeVersion(rows),
      reviewer: formValues.reviewer,
      status: formValues.status,
      approvalStatus: formValues.approvalStatus,
      submittedOn: formValues.submittedOn,
      commentCount: Number(formValues.commentCount) || 0,
    };

    if (formMode === "edit" && editingScopeId) {
      setRows((currentRows) =>
        currentRows.map((row) => (row.id === editingScopeId ? nextPayload : row)),
      );
      setSelectedId(editingScopeId);
      setFormDrawerOpen(false);
      return;
    }

    setRows((currentRows) => [nextPayload, ...currentRows]);
    setSelectedId(nextPayload.id);
    setFormDrawerOpen(false);
  }, [editingScopeId, formMode, formValues, rows]);

  const columns = React.useMemo<GridColDef<ScopeVersionRecord>[]>(
    () => [
      { field: "inquiryNo", headerName: "Inquiry", minWidth: 130, flex: 0.8 },
      { field: "title", headerName: "Title", minWidth: 220, flex: 1.2 },
      { field: "version", headerName: "Version", minWidth: 100, flex: 0.6 },
      {
        field: "status",
        headerName: "Status",
        minWidth: 130,
        flex: 0.7,
        renderCell: (params: GridRenderCellParams<ScopeVersionRecord>) => (
          <ProjectStatusBadge status={params.row.status} />
        ),
      },
      { field: "reviewer", headerName: "Reviewer", minWidth: 140, flex: 0.8 },
      {
        field: "approvalStatus",
        headerName: "Approval",
        minWidth: 130,
        flex: 0.7,
        renderCell: (params: GridRenderCellParams<ScopeVersionRecord>) => (
          <ProjectStatusBadge status={params.row.approvalStatus} />
        ),
      },
      { field: "submittedOn", headerName: "Submitted", minWidth: 120, flex: 0.7 },
    ],
    [],
  );

  return (
    <>
      <Box
        sx={{
          "& .MuiDataGrid-row:hover": {
            cursor: permissions.view ? "pointer" : "default",
          },
        }}
      >
        <ReusableDataGrid
          rows={filteredRows}
          columns={columns}
          totalCount={filteredRows.length}
          loading={false}
          paginationModel={gridState.paginationModel}
          setPaginationModel={gridState.setPaginationModel}
          sortModel={gridState.sortModel}
          setSortModel={gridState.setSortModel}
          filterModel={gridState.filterModel}
          setFilterModel={gridState.setFilterModel}
          title="Scope Document List"
          uniqueIdField="id"
          permissions={{
            create: permissions.create,
            edit: false,
            delete: false,
            view: false,
            download: permissions.download,
          }}
          onAdd={permissions.create ? openCreateDrawer : undefined}
          onRowClick={permissions.view ? openDetailDrawer : undefined}
          searchableFields={["inquiryNo", "title", "version", "reviewer", "status", "approvalStatus"]}
          searchControls={
            <Stack direction={{ xs: "column", md: "row" }} spacing={1} sx={{ mb: 1.25 }}>
              <TextField
                select
                size="small"
                label="Reviewer"
                value={reviewerFilter}
                onChange={(event) => setReviewerFilter(event.target.value)}
                sx={{ minWidth: 170 }}
              >
                <MenuItem value="all">All Reviewers</MenuItem>
                {reviewerOptions.map((reviewer) => (
                  <MenuItem key={reviewer} value={reviewer}>
                    {reviewer}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                size="small"
                label="Status"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as ScopeStatusFilter)}
                sx={{ minWidth: 170 }}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="In Review">In Review</MenuItem>
                <MenuItem value="Approved">Approved</MenuItem>
                <MenuItem value="Rejected">Rejected</MenuItem>
                <MenuItem value="Request Changes">Request Changes</MenuItem>
              </TextField>
            </Stack>
          }
        />
      </Box>

      <ScopeFormDrawer
        open={formDrawerOpen}
        mode={formMode}
        value={formValues}
        onChange={setFormValues}
        onClose={closeFormDrawer}
        onSubmit={handleSubmit}
      />

      <ScopeDetailDrawer
        open={detailDrawerOpen}
        scope={selectedVersion}
        onClose={closeDetailDrawer}
        onEdit={() => {
          if (!selectedVersion) {
            return;
          }
          setDetailDrawerOpen(false);
          openEditDrawer(selectedVersion);
        }}
        comments={inquiryComments}
        attachments={sharedAttachments}
        approvalTimeline={scopeApprovalTimeline}
      />
    </>
  );
};

export default ProjectManagementScopeDocumentsPage;
