import React from "react";
import { Box, MenuItem, Stack, TextField } from "@mui/material";
import type { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import ReusableDataGrid from "../../../shared/components/common/ReusableDataGrid";
import { useToast } from "../../../shared/hooks/useToast";
import { getStaticModuleRouteUiPermissions } from "../../../shared/utils/staticModuleAccess";
import { PriorityBadge, ProjectStatusBadge } from "./components";
import {
  inquiryComments,
  projectRecords,
  sharedAttachments,
  supportRecords,
  type SupportRecord,
} from "./mockData";
import {
  loadProjectManagementSupportStates,
  pauseKanbanTimersForAssignee,
  resumeKanbanTimersForAssignee,
  saveProjectManagementSupportStates,
} from "./mockStore";
import { useProjectManagementGridState } from "./ui";
import {
  buildInitialSupportFormValues,
  SupportDetailDrawer,
  SupportFormDrawer,
  type SupportFormValues,
} from "./workspaceDrawers";

type SupportStatusFilter = "all" | "Active" | "Pending" | "Resolved" | "Paused";

const buildNextSupportNumber = (rows: SupportRecord[]) => {
  const nextNumber =
    rows.reduce((maxValue, row) => {
      const numericValue = Number(row.ticketNo.split("-").pop());
      return Number.isFinite(numericValue) ? Math.max(maxValue, numericValue) : maxValue;
    }, 200) + 1;

  return `SUP-${nextNumber}`;
};

const nowString = () => new Date().toISOString().slice(0, 16).replace("T", " ");

const ProjectManagementSupportPage = () => {
  const { showToast } = useToast();
  const permissions = React.useMemo(
    () => getStaticModuleRouteUiPermissions("/project-management/support"),
    [],
  );
  const gridState = useProjectManagementGridState();
  const [rows, setRows] = React.useState<SupportRecord[]>(supportRecords);
  const [customerFilter, setCustomerFilter] = React.useState("all");
  const [statusFilter, setStatusFilter] = React.useState<SupportStatusFilter>("all");
  const [selectedId, setSelectedId] = React.useState(supportRecords[0]?.id ?? "");
  const [formDrawerOpen, setFormDrawerOpen] = React.useState(false);
  const [detailDrawerOpen, setDetailDrawerOpen] = React.useState(false);
  const [formMode, setFormMode] = React.useState<"create" | "edit">("create");
  const [editingSupportId, setEditingSupportId] = React.useState<string | null>(null);
  const [supportStates, setSupportStates] = React.useState(() => loadProjectManagementSupportStates());
  const [formValues, setFormValues] = React.useState<SupportFormValues>(
    buildInitialSupportFormValues(),
  );

  const selectedSupport = React.useMemo(
    () => rows.find((item) => item.id === selectedId) ?? rows[0] ?? null,
    [rows, selectedId],
  );

  const filteredRows = React.useMemo(
    () =>
      rows.filter((row) => {
        const matchesCustomer = customerFilter === "all" || row.customer === customerFilter;
        const matchesStatus = statusFilter === "all" || row.status === statusFilter;
        return matchesCustomer && matchesStatus;
      }),
    [customerFilter, rows, statusFilter],
  );

  const customerOptions = React.useMemo(
    () => Array.from(new Set(rows.map((row) => row.customer))),
    [rows],
  );

  const projectOptions = React.useMemo(
    () => Array.from(new Set(projectRecords.map((project) => project.name))),
    [],
  );

  const openCreateDrawer = React.useCallback(() => {
    setFormMode("create");
    setEditingSupportId(null);
    setFormValues({
      ...buildInitialSupportFormValues(),
      ticketNo: buildNextSupportNumber(rows),
      openedAt: nowString(),
      resolutionTime: "Pending",
    });
    setFormDrawerOpen(true);
  }, [rows]);

  const openEditDrawer = React.useCallback((support: SupportRecord) => {
    setSelectedId(support.id);
    setEditingSupportId(support.id);
    setFormMode("edit");
    setFormValues(buildInitialSupportFormValues(support));
    setFormDrawerOpen(true);
  }, []);

  const openDetailDrawer = React.useCallback((support: SupportRecord) => {
    setSelectedId(support.id);
    setDetailDrawerOpen(true);
  }, []);

  const closeFormDrawer = React.useCallback(() => {
    setFormDrawerOpen(false);
  }, []);

  const closeDetailDrawer = React.useCallback(() => {
    setDetailDrawerOpen(false);
  }, []);

  const handleToggleSupportSession = React.useCallback(
    (support: SupportRecord) => {
      const existingState = supportStates[support.id];
      const nextStates = { ...supportStates };

      if (existingState?.active) {
        nextStates[support.id] = {
          ...existingState,
          active: false,
        };
        resumeKanbanTimersForAssignee(support.assignee);
        showToast(`Support stopped for ${support.assignee}. Kanban timer resumed.`, "success");
      } else {
        nextStates[support.id] = {
          supportId: support.id,
          assignee: support.assignee,
          startedAt: new Date().toISOString(),
          active: true,
        };
        pauseKanbanTimersForAssignee(support.assignee);
        showToast(`Support started for ${support.assignee}. Kanban timer paused.`, "info");
      }

      setSupportStates(nextStates);
      saveProjectManagementSupportStates(nextStates);
    },
    [showToast, supportStates],
  );

  const handleSubmit = React.useCallback(() => {
    const nextPayload: SupportRecord = {
      id: editingSupportId ?? `sup-${Date.now()}`,
      ticketNo: formValues.ticketNo || buildNextSupportNumber(rows),
      customer: formValues.customer,
      project: formValues.project,
      issue: formValues.issue,
      priority: formValues.priority,
      assignee: formValues.assignee,
      status: formValues.status,
      openedAt: formValues.openedAt,
      resolutionTime: formValues.resolutionTime,
    };

    if (formMode === "edit" && editingSupportId) {
      setRows((currentRows) =>
        currentRows.map((row) => (row.id === editingSupportId ? nextPayload : row)),
      );
      setSelectedId(editingSupportId);
      setFormDrawerOpen(false);
      return;
    }

    setRows((currentRows) => [nextPayload, ...currentRows]);
    setSelectedId(nextPayload.id);
    setFormDrawerOpen(false);
  }, [editingSupportId, formMode, formValues, rows]);

  const columns = React.useMemo<GridColDef<SupportRecord>[]>(
    () => [
      { field: "ticketNo", headerName: "Ticket No", minWidth: 120, flex: 0.8 },
      { field: "customer", headerName: "Customer", minWidth: 140, flex: 0.8 },
      { field: "project", headerName: "Project", minWidth: 180, flex: 1 },
      {
        field: "priority",
        headerName: "Priority",
        minWidth: 110,
        flex: 0.7,
        renderCell: (params: GridRenderCellParams<SupportRecord>) => (
          <PriorityBadge priority={params.row.priority} />
        ),
      },
      { field: "assignee", headerName: "Assignee", minWidth: 130, flex: 0.8 },
      {
        field: "status",
        headerName: "Status",
        minWidth: 120,
        flex: 0.7,
        renderCell: (params: GridRenderCellParams<SupportRecord>) => (
          <ProjectStatusBadge status={params.row.status} />
        ),
      },
      { field: "resolutionTime", headerName: "Resolution", minWidth: 110, flex: 0.7 },
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
          title="Support List"
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
          searchableFields={["ticketNo", "customer", "project", "issue", "assignee", "status"]}
          searchControls={
            <Stack direction={{ xs: "column", md: "row" }} spacing={1} sx={{ mb: 1.25 }}>
              <TextField
                select
                size="small"
                label="Customer"
                value={customerFilter}
                onChange={(event) => setCustomerFilter(event.target.value)}
                sx={{ minWidth: 160 }}
              >
                <MenuItem value="all">All Customers</MenuItem>
                {customerOptions.map((customer) => (
                  <MenuItem key={customer} value={customer}>
                    {customer}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                size="small"
                label="Status"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as SupportStatusFilter)}
                sx={{ minWidth: 160 }}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="Resolved">Resolved</MenuItem>
                <MenuItem value="Paused">Paused</MenuItem>
              </TextField>
            </Stack>
          }
        />
      </Box>

      <SupportFormDrawer
        open={formDrawerOpen}
        mode={formMode}
        value={formValues}
        onChange={setFormValues}
        onClose={closeFormDrawer}
        onSubmit={handleSubmit}
        projectOptions={projectOptions}
      />

      <SupportDetailDrawer
        open={detailDrawerOpen}
        support={selectedSupport}
        onClose={closeDetailDrawer}
        onEdit={() => {
          if (!selectedSupport) {
            return;
          }
          setDetailDrawerOpen(false);
          openEditDrawer(selectedSupport);
        }}
        isSupportActive={Boolean(selectedSupport && supportStates[selectedSupport.id]?.active)}
        onToggleSupport={() => {
          if (!selectedSupport) {
            return;
          }
          handleToggleSupportSession(selectedSupport);
        }}
        comments={inquiryComments}
        attachments={sharedAttachments}
      />
    </>
  );
};

export default ProjectManagementSupportPage;
