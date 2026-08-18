import React from "react";
import { Box, MenuItem, Stack, TextField, Typography } from "@mui/material";
import type { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import ReusableDataGrid from "../../../shared/components/common/ReusableDataGrid";
import { useToast } from "../../../shared/hooks/useToast";
import { getStaticModuleRouteUiPermissions } from "../../../shared/utils/staticModuleAccess";
import { ProjectStatusBadge } from "./components";
import {
  recentActivities,
  type ProjectRecord,
} from "./mockData";
import {
  getPlanningForProject,
  loadProjectManagementProjects,
  loadProjectPlanningLookup,
  saveProjectManagementProjects,
} from "./mockStore";
import { useProjectManagementGridState } from "./ui";
import {
  buildInitialProjectFormValues,
  ProjectDetailDrawer,
  ProjectFormDrawer,
  type ProjectFormValues,
} from "./workspaceDrawers";

type ProjectStatusFilter = "all" | "Active" | "On Hold" | "Planned" | "Completed";

const buildNextProjectCode = (rows: ProjectRecord[]) => {
  const nextCode =
    rows.reduce((maxValue, row) => {
      const numericValue = Number(row.code.split("-").pop());
      return Number.isFinite(numericValue) ? Math.max(maxValue, numericValue) : maxValue;
    }, 2400) + 1;

  return `PRJ-${nextCode}`;
};

const ProjectManagementProjectsPage = () => {
  const { showToast } = useToast();
  const permissions = React.useMemo(
    () => getStaticModuleRouteUiPermissions("/project-management/projects"),
    [],
  );
  const gridState = useProjectManagementGridState();
  const [rows, setRows] = React.useState<ProjectRecord[]>(() => loadProjectManagementProjects());
  const [planningLookup] = React.useState(() => loadProjectPlanningLookup());
  const [leaderFilter, setLeaderFilter] = React.useState("all");
  const [statusFilter, setStatusFilter] = React.useState<ProjectStatusFilter>("all");
  const [selectedId, setSelectedId] = React.useState(() => loadProjectManagementProjects()[0]?.id ?? "");
  const [formDrawerOpen, setFormDrawerOpen] = React.useState(false);
  const [detailDrawerOpen, setDetailDrawerOpen] = React.useState(false);
  const [formMode, setFormMode] = React.useState<"create" | "edit">("create");
  const [editingProjectId, setEditingProjectId] = React.useState<string | null>(null);
  const [formValues, setFormValues] = React.useState<ProjectFormValues>(
    buildInitialProjectFormValues(),
  );

  const selectedProject = React.useMemo(
    () => rows.find((item) => item.id === selectedId) ?? rows[0] ?? null,
    [rows, selectedId],
  );

  const filteredRows = React.useMemo(
    () =>
      rows.filter((row) => {
        const matchesLeader = leaderFilter === "all" || row.leader === leaderFilter;
        const matchesStatus = statusFilter === "all" || row.status === statusFilter;
        return matchesLeader && matchesStatus;
      }),
    [leaderFilter, rows, statusFilter],
  );

  const leaderOptions = React.useMemo(
    () => Array.from(new Set(rows.map((row) => row.leader))),
    [rows],
  );

  const openCreateDrawer = React.useCallback(() => {
    setFormMode("create");
    setEditingProjectId(null);
    setFormValues(
      buildInitialProjectFormValues({
        ...(rows[0] ?? {
          id: "",
          code: "",
          name: "",
          customer: "",
          leader: "Krina Mehta",
          secondaryLeader: "Maulik Rana",
          team: [],
          status: "Planned",
          progress: 0,
          startDate: "",
          dueDate: "",
          approvedScope: "",
          plannedHours: 0,
          actualHours: 0,
          workload: "Open Capacity",
        }),
        id: "",
        code: buildNextProjectCode(rows),
        name: "",
      }),
    );
    setFormDrawerOpen(true);
  }, [rows]);

  const openEditDrawer = React.useCallback((project: ProjectRecord) => {
    setSelectedId(project.id);
    setEditingProjectId(project.id);
    setFormMode("edit");
    setFormValues(buildInitialProjectFormValues(project));
    setFormDrawerOpen(true);
  }, []);

  const openDetailDrawer = React.useCallback((project: ProjectRecord) => {
    setSelectedId(project.id);
    setDetailDrawerOpen(true);
  }, []);

  const closeFormDrawer = React.useCallback(() => {
    setFormDrawerOpen(false);
  }, []);

  const closeDetailDrawer = React.useCallback(() => {
    setDetailDrawerOpen(false);
  }, []);

  const handleSubmit = React.useCallback(() => {
    const team = formValues.teamMembers
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    if (formMode === "edit" && editingProjectId) {
      const nextRows = rows.map((row) =>
          row.id === editingProjectId
            ? {
                ...row,
                name: formValues.name,
                code: formValues.code,
                customer: formValues.customer,
                leader: formValues.leader,
                secondaryLeader: formValues.secondaryLeader,
                team,
                status: formValues.status,
                startDate: formValues.startDate,
                dueDate: formValues.dueDate,
                approvedScope: formValues.approvedScope,
              }
            : row,
      );
      setRows(nextRows);
      saveProjectManagementProjects(nextRows);
      setSelectedId(editingProjectId);
      setFormDrawerOpen(false);
      showToast("Project updated in mock planning workspace.", "success");
      return;
    }

    const nextProject: ProjectRecord = {
      id: `proj-${Date.now()}`,
      code: formValues.code || buildNextProjectCode(rows),
      name: formValues.name,
      customer: formValues.customer,
      leader: formValues.leader,
      secondaryLeader: formValues.secondaryLeader,
      team,
      status: formValues.status,
      progress: 0,
      startDate: formValues.startDate,
      dueDate: formValues.dueDate,
      approvedScope: formValues.approvedScope,
      plannedHours: 0,
      actualHours: 0,
      workload: "Open Capacity",
    };

    const nextRows = [nextProject, ...rows];
    setRows(nextRows);
    saveProjectManagementProjects(nextRows);
    setSelectedId(nextProject.id);
    setFormDrawerOpen(false);
    showToast("Project saved in mock planning workspace.", "success");
  }, [editingProjectId, formMode, formValues, rows, showToast]);

  const columns = React.useMemo<GridColDef<ProjectRecord>[]>(
    () => [
      { field: "code", headerName: "Project Code", minWidth: 120, flex: 0.8 },
      { field: "name", headerName: "Project", minWidth: 200, flex: 1.2 },
      { field: "customer", headerName: "Customer", minWidth: 160, flex: 0.9 },
      { field: "leader", headerName: "Leader", minWidth: 140, flex: 0.8 },
      {
        field: "progress",
        headerName: "Progress",
        minWidth: 110,
        flex: 0.7,
        renderCell: (params: GridRenderCellParams<ProjectRecord>) => (
          <Typography variant="body2" sx={{ fontWeight: 800 }}>
            {params.row.progress}%
          </Typography>
        ),
      },
      {
        field: "status",
        headerName: "Status",
        minWidth: 120,
        flex: 0.7,
        renderCell: (params: GridRenderCellParams<ProjectRecord>) => (
          <ProjectStatusBadge status={params.row.status} />
        ),
      },
      { field: "dueDate", headerName: "Due Date", minWidth: 120, flex: 0.7 },
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
          title="Project List"
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
          searchableFields={["code", "name", "customer", "leader", "status"]}
          searchControls={
            <Stack direction={{ xs: "column", md: "row" }} spacing={1} sx={{ mb: 1.25 }}>
              <TextField
                select
                size="small"
                label="Leader"
                value={leaderFilter}
                onChange={(event) => setLeaderFilter(event.target.value)}
                sx={{ minWidth: 160 }}
              >
                <MenuItem value="all">All Leaders</MenuItem>
                {leaderOptions.map((leader) => (
                  <MenuItem key={leader} value={leader}>
                    {leader}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                size="small"
                label="Status"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as ProjectStatusFilter)}
                sx={{ minWidth: 160 }}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="On Hold">On Hold</MenuItem>
                <MenuItem value="Planned">Planned</MenuItem>
                <MenuItem value="Completed">Completed</MenuItem>
              </TextField>
            </Stack>
          }
        />
      </Box>

      <ProjectFormDrawer
        open={formDrawerOpen}
        mode={formMode}
        value={formValues}
        onChange={setFormValues}
        onClose={closeFormDrawer}
        onSubmit={handleSubmit}
      />

      <ProjectDetailDrawer
        open={detailDrawerOpen}
        project={selectedProject}
        onClose={closeDetailDrawer}
        onEdit={() => {
          if (!selectedProject) {
            return;
          }
          setDetailDrawerOpen(false);
          openEditDrawer(selectedProject);
        }}
        activities={recentActivities}
        modulePlanningTree={getPlanningForProject(selectedProject, planningLookup).modules}
        teamAllocations={getPlanningForProject(selectedProject, planningLookup).teamAllocations}
      />
    </>
  );
};

export default ProjectManagementProjectsPage;
