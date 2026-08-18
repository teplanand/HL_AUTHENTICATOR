import React from "react";
import { Box, MenuItem, Stack, TextField } from "@mui/material";
import type { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import ReusableDataGrid from "../../../shared/components/common/ReusableDataGrid";
import { getStaticModuleRouteUiPermissions } from "../../../shared/utils/staticModuleAccess";
import { PriorityBadge, ProjectStatusBadge } from "./components";
import {
  assignmentHistory,
  backlogDependencies,
  backlogRecords,
  inquiryComments,
  projectRecords,
  sharedAttachments,
  statusHistory,
  type BacklogRecord,
} from "./mockData";
import { useProjectManagementGridState } from "./ui";
import {
  BacklogDetailDrawer,
  BacklogFormDrawer,
  buildInitialBacklogFormValues,
  type BacklogFormValues,
} from "./workspaceDrawers";

type BacklogStatusFilter = "all" | "Planned" | "Active" | "Blocked" | "In Review" | "Completed" | "Overdue";

const buildNextBacklogNumber = (rows: BacklogRecord[]) => {
  const nextNumber =
    rows.reduce((maxValue, row) => {
      const numericValue = Number(row.ticketNo.split("-").pop());
      return Number.isFinite(numericValue) ? Math.max(maxValue, numericValue) : maxValue;
    }, 400) + 1;

  return `BL-${nextNumber}`;
};

const ProjectManagementBacklogsPage = () => {
  const permissions = React.useMemo(
    () => getStaticModuleRouteUiPermissions("/project-management/backlogs"),
    [],
  );
  const gridState = useProjectManagementGridState();
  const [rows, setRows] = React.useState<BacklogRecord[]>(backlogRecords);
  const [projectFilter, setProjectFilter] = React.useState("all");
  const [statusFilter, setStatusFilter] = React.useState<BacklogStatusFilter>("all");
  const [selectedId, setSelectedId] = React.useState(backlogRecords[0]?.id ?? "");
  const [formDrawerOpen, setFormDrawerOpen] = React.useState(false);
  const [detailDrawerOpen, setDetailDrawerOpen] = React.useState(false);
  const [formMode, setFormMode] = React.useState<"create" | "edit">("create");
  const [editingBacklogId, setEditingBacklogId] = React.useState<string | null>(null);
  const [formValues, setFormValues] = React.useState<BacklogFormValues>(
    buildInitialBacklogFormValues(),
  );

  const selectedBacklog = React.useMemo(
    () => rows.find((item) => item.id === selectedId) ?? rows[0] ?? null,
    [rows, selectedId],
  );

  const filteredRows = React.useMemo(
    () =>
      rows.filter((row) => {
        const matchesProject = projectFilter === "all" || row.project === projectFilter;
        const matchesStatus = statusFilter === "all" || row.status === statusFilter;
        return matchesProject && matchesStatus;
      }),
    [projectFilter, rows, statusFilter],
  );

  const projectOptions = React.useMemo(
    () => Array.from(new Set(projectRecords.map((project) => project.name))),
    [],
  );

  const openCreateDrawer = React.useCallback(() => {
    setFormMode("create");
    setEditingBacklogId(null);
    setFormValues({
      ...buildInitialBacklogFormValues(),
      ticketNo: buildNextBacklogNumber(rows),
      assignee: "Nirav Patel",
      status: "Planned",
    });
    setFormDrawerOpen(true);
  }, [rows]);

  const openEditDrawer = React.useCallback((backlog: BacklogRecord) => {
    setSelectedId(backlog.id);
    setEditingBacklogId(backlog.id);
    setFormMode("edit");
    setFormValues(buildInitialBacklogFormValues(backlog));
    setFormDrawerOpen(true);
  }, []);

  const openDetailDrawer = React.useCallback((backlog: BacklogRecord) => {
    setSelectedId(backlog.id);
    setDetailDrawerOpen(true);
  }, []);

  const closeFormDrawer = React.useCallback(() => {
    setFormDrawerOpen(false);
  }, []);

  const closeDetailDrawer = React.useCallback(() => {
    setDetailDrawerOpen(false);
  }, []);

  const handleSubmit = React.useCallback(() => {
    const nextPayload: BacklogRecord = {
      id: editingBacklogId ?? `bl-${Date.now()}`,
      ticketNo: formValues.ticketNo || buildNextBacklogNumber(rows),
      project: formValues.project,
      module: formValues.module,
      submodule: formValues.submodule,
      phase: formValues.phase,
      type: formValues.type,
      priority: formValues.priority,
      assignee: formValues.assignee,
      status: formValues.status,
      estimateHours: Number(formValues.estimateHours) || 0,
      actualHours: Number(formValues.actualHours) || 0,
      dueDate: formValues.dueDate,
      dependency: formValues.dependency,
    };

    if (formMode === "edit" && editingBacklogId) {
      setRows((currentRows) =>
        currentRows.map((row) => (row.id === editingBacklogId ? nextPayload : row)),
      );
      setSelectedId(editingBacklogId);
      setFormDrawerOpen(false);
      return;
    }

    setRows((currentRows) => [nextPayload, ...currentRows]);
    setSelectedId(nextPayload.id);
    setFormDrawerOpen(false);
  }, [editingBacklogId, formMode, formValues, rows]);

  const columns = React.useMemo<GridColDef<BacklogRecord>[]>(
    () => [
      { field: "ticketNo", headerName: "Backlog No", minWidth: 120, flex: 0.8 },
      { field: "project", headerName: "Project", minWidth: 170, flex: 1 },
      { field: "module", headerName: "Module", minWidth: 130, flex: 0.8 },
      { field: "phase", headerName: "Phase", minWidth: 110, flex: 0.7 },
      {
        field: "priority",
        headerName: "Priority",
        minWidth: 110,
        flex: 0.7,
        renderCell: (params: GridRenderCellParams<BacklogRecord>) => (
          <PriorityBadge priority={params.row.priority} />
        ),
      },
      { field: "assignee", headerName: "Assignee", minWidth: 130, flex: 0.8 },
      {
        field: "status",
        headerName: "Status",
        minWidth: 120,
        flex: 0.7,
        renderCell: (params: GridRenderCellParams<BacklogRecord>) => (
          <ProjectStatusBadge status={params.row.status} />
        ),
      },
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
          title="Backlog List"
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
          searchableFields={["ticketNo", "project", "module", "submodule", "phase", "assignee", "status"]}
          searchControls={
            <Stack direction={{ xs: "column", md: "row" }} spacing={1} sx={{ mb: 1.25 }}>
              <TextField
                select
                size="small"
                label="Project"
                value={projectFilter}
                onChange={(event) => setProjectFilter(event.target.value)}
                sx={{ minWidth: 180 }}
              >
                <MenuItem value="all">All Projects</MenuItem>
                {projectOptions.map((project) => (
                  <MenuItem key={project} value={project}>
                    {project}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                size="small"
                label="Status"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as BacklogStatusFilter)}
                sx={{ minWidth: 160 }}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="Planned">Planned</MenuItem>
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Blocked">Blocked</MenuItem>
                <MenuItem value="In Review">In Review</MenuItem>
                <MenuItem value="Completed">Completed</MenuItem>
                <MenuItem value="Overdue">Overdue</MenuItem>
              </TextField>
            </Stack>
          }
        />
      </Box>

      <BacklogFormDrawer
        open={formDrawerOpen}
        mode={formMode}
        value={formValues}
        onChange={setFormValues}
        onClose={closeFormDrawer}
        onSubmit={handleSubmit}
        projectOptions={projectOptions}
      />

      <BacklogDetailDrawer
        open={detailDrawerOpen}
        backlog={selectedBacklog}
        onClose={closeDetailDrawer}
        onEdit={() => {
          if (!selectedBacklog) {
            return;
          }
          setDetailDrawerOpen(false);
          openEditDrawer(selectedBacklog);
        }}
        comments={inquiryComments}
        attachments={sharedAttachments}
        dependencies={backlogDependencies}
        statusHistory={statusHistory}
        assignmentHistory={assignmentHistory}
      />
    </>
  );
};

export default ProjectManagementBacklogsPage;
