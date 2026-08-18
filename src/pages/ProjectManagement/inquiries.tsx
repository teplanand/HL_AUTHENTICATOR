import React from "react";
import {
  Box,
  MenuItem,
  Stack,
  TextField,
} from "@mui/material";
import type { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { useNavigate } from "react-router";
import ReusableDataGrid from "../../../shared/components/common/ReusableDataGrid";
import { useToast } from "../../../shared/hooks/useToast";
import { getStaticModuleRouteUiPermissions } from "../../../shared/utils/staticModuleAccess";
import {
  PriorityBadge,
  ProjectStatusBadge,
} from "./components";
import {
  inquiryComments,
  recentActivities,
  sharedAttachments,
  type InquiryRecord,
  type ProjectPlanningModuleRecord,
  type ProjectPlanningPhaseRecord,
  type ProjectPlanningRecord,
} from "./mockData";
import {
  loadProjectManagementInquiries,
  loadProjectManagementProjects,
  loadProjectPlanningLookup,
  saveProjectManagementInquiries,
  saveProjectManagementProjects,
  saveProjectPlanningLookup,
} from "./mockStore";
import {
  buildInitialInquiryConvertFormValues,
  buildInitialInquiryFormValues,
  InquiryConvertDrawer,
  InquiryDetailDrawer,
  InquiryFormDrawer,
  type InquiryConvertFormValues,
  type InquiryFormValues,
} from "./inquiryDrawers";
import { useProjectManagementGridState } from "./ui";

type InquiryFilter = "all" | "pending" | "review" | "approved" | "rejected";
type PriorityFilter = "all" | "critical" | "high" | "medium" | "low";

const today = () => new Date().toISOString().slice(0, 10);

const buildAttachmentCount = (attachmentNames: string[]) => attachmentNames.length;

const buildNextInquiryNumber = (rows: InquiryRecord[]) => {
  const nextNumber =
    rows.reduce((maxValue, row) => {
      const numericValue = Number(row.inquiryNo.split("-").pop());
      return Number.isFinite(numericValue) ? Math.max(maxValue, numericValue) : maxValue;
    }, 1000) + 1;

  return `HL-ENQ-${nextNumber}`;
};

const buildNextProjectCode = (rows: Array<{ code: string }>) => {
  const nextCode =
    rows.reduce((maxValue, row) => {
      const numericValue = Number(row.code.split("-").pop());
      return Number.isFinite(numericValue) ? Math.max(maxValue, numericValue) : maxValue;
    }, 2400) + 1;

  return `PRJ-${nextCode}`;
};

const buildPlanningModulesFromConvertRows = (
  rows: InquiryConvertFormValues["moduleRows"],
): ProjectPlanningModuleRecord[] => {
  const moduleMap = rows.reduce<
    Record<
      string,
      {
        id: string;
        module: string;
        submodules: Record<
          string,
          {
            id: string;
            name: string;
            phases: ProjectPlanningPhaseRecord[];
          }
        >;
      }
    >
  >((acc, row, index) => {
    const moduleName = row.module.trim() || `Module ${index + 1}`;
    const submoduleName = row.submodule.trim() || "General";
    const moduleEntry =
      acc[moduleName] ??
      {
        id: `mod-${index + 1}`,
        module: moduleName,
        submodules: {},
      };

    const submoduleEntry =
      moduleEntry.submodules[submoduleName] ??
      {
        id: `sub-${index + 1}`,
        name: submoduleName,
        phases: [],
      };

    submoduleEntry.phases.push({
      id: `phase-${index + 1}`,
      name: row.phase.trim() || "Development",
      hours: Number(row.hours) || 0,
      progress: Math.max(0, Math.min(100, Number(row.progress) || 0)),
      owner: row.owner.trim(),
      source: row.source.trim(),
    });

    moduleEntry.submodules[submoduleName] = submoduleEntry;
    acc[moduleName] = moduleEntry;
    return acc;
  }, {});

  return Object.values(moduleMap).map((module) => ({
    id: module.id,
    module: module.module,
    submodules: Object.values(module.submodules),
  }));
};

const ProjectManagementInquiriesPage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const permissions = React.useMemo(
    () => getStaticModuleRouteUiPermissions("/project-management/inquiries"),
    [],
  );
  const gridState = useProjectManagementGridState();
  const [rows, setRows] = React.useState<InquiryRecord[]>(() => loadProjectManagementInquiries());
  const [statusFilter, setStatusFilter] = React.useState<InquiryFilter>("all");
  const [priorityFilter, setPriorityFilter] = React.useState<PriorityFilter>("all");
  const [selectedInquiryId, setSelectedInquiryId] = React.useState(
    () => loadProjectManagementInquiries()[0]?.id ?? "",
  );
  const [formDrawerOpen, setFormDrawerOpen] = React.useState(false);
  const [detailDrawerOpen, setDetailDrawerOpen] = React.useState(false);
  const [convertDrawerOpen, setConvertDrawerOpen] = React.useState(false);
  const [formMode, setFormMode] = React.useState<"create" | "edit">("create");
  const [editingInquiryId, setEditingInquiryId] = React.useState<string | null>(null);
  const [formValues, setFormValues] = React.useState<InquiryFormValues>(
    buildInitialInquiryFormValues(),
  );
  const [convertValues, setConvertValues] = React.useState<InquiryConvertFormValues>(
    buildInitialInquiryConvertFormValues(),
  );

  const selectedInquiry = React.useMemo(
    () => rows.find((item) => item.id === selectedInquiryId) ?? rows[0] ?? null,
    [rows, selectedInquiryId],
  );

  const filteredRows = React.useMemo(
    () =>
      rows.filter((row) => {
        const matchesStatus =
          statusFilter === "all" ||
          row.status.toLowerCase() ===
            (statusFilter === "review" ? "in review" : statusFilter);
        const matchesPriority =
          priorityFilter === "all" || row.priority.toLowerCase() === priorityFilter;

        return matchesStatus && matchesPriority;
      }),
    [priorityFilter, rows, statusFilter],
  );

  const openCreateDrawer = React.useCallback(() => {
    setFormMode("create");
    setEditingInquiryId(null);
    setFormValues(buildInitialInquiryFormValues());
    setFormDrawerOpen(true);
  }, []);

  const openEditDrawer = React.useCallback(
    (inquiry: InquiryRecord) => {
      setSelectedInquiryId(inquiry.id);
      setEditingInquiryId(inquiry.id);
      setFormMode("edit");
      setFormValues(buildInitialInquiryFormValues(inquiry));
      setFormDrawerOpen(true);
    },
    [],
  );

  const openDetailDrawer = React.useCallback((inquiry: InquiryRecord) => {
    setSelectedInquiryId(inquiry.id);
    setDetailDrawerOpen(true);
  }, []);

  const closeFormDrawer = React.useCallback(() => {
    setFormDrawerOpen(false);
  }, []);

  const closeDetailDrawer = React.useCallback(() => {
    setDetailDrawerOpen(false);
  }, []);

  const openConvertDrawer = React.useCallback((inquiry: InquiryRecord) => {
    const projectRows = loadProjectManagementProjects();
    setSelectedInquiryId(inquiry.id);
    setConvertValues(
      buildInitialInquiryConvertFormValues(
        inquiry,
        `PRJ-${(
          projectRows.reduce((maxValue, row) => {
            const numericValue = Number(row.code.split("-").pop());
            return Number.isFinite(numericValue) ? Math.max(maxValue, numericValue) : maxValue;
          }, 2400) + 1
        ).toString()}`,
      ),
    );
    setConvertDrawerOpen(true);
  }, []);

  const closeConvertDrawer = React.useCallback(() => {
    setConvertDrawerOpen(false);
  }, []);

  const handleSubmitInquiry = React.useCallback(() => {
    const attachmentCount = buildAttachmentCount(formValues.attachmentNames);

    if (formMode === "edit" && editingInquiryId) {
      const nextRows = rows.map((row) =>
          row.id === editingInquiryId
            ? {
                ...row,
                customer: formValues.customer,
                title: formValues.title,
                requirement: formValues.requirement,
                priority: formValues.priority,
                status: formValues.status,
                owner: formValues.owner,
                targetDate: formValues.targetDate,
                updatedOn: today(),
                attachmentCount,
              }
            : row,
      );
      setRows(nextRows);
      saveProjectManagementInquiries(nextRows);
      setSelectedInquiryId(editingInquiryId);
      setFormDrawerOpen(false);
      showToast("Inquiry updated in mock workspace.", "success");
      return;
    }

    const nextInquiry: InquiryRecord = {
      id: `inq-${Date.now()}`,
      inquiryNo: buildNextInquiryNumber(rows),
      customer: formValues.customer,
      title: formValues.title,
      requirement: formValues.requirement,
      priority: formValues.priority,
      status: formValues.status,
      owner: formValues.owner,
      createdOn: today(),
      updatedOn: today(),
      attachmentCount,
      targetDate: formValues.targetDate,
    };

    const nextRows = [nextInquiry, ...rows];
    setRows(nextRows);
    saveProjectManagementInquiries(nextRows);
    setSelectedInquiryId(nextInquiry.id);
    setFormDrawerOpen(false);
    showToast("Inquiry created in mock workspace.", "success");
  }, [editingInquiryId, formMode, formValues, rows, showToast]);

  const handleConvertInquiry = React.useCallback(() => {
    if (!selectedInquiry) {
      return;
    }

    const projectRows = loadProjectManagementProjects();
    const planningLookup = loadProjectPlanningLookup();
    const parsedModuleHours = convertValues.moduleRows.reduce(
      (sum, row) => sum + (Number.isFinite(Number(row.hours)) ? Number(row.hours) : 0),
      0,
    );
    const parsedTeamHours = convertValues.teamRows.reduce(
      (sum, row) => sum + (Number.isFinite(Number(row.plannedHours)) ? Number(row.plannedHours) : 0),
      0,
    );
    const teamMembers = Array.from(
      new Set(
        convertValues.teamRows
          .map((row) => row.member.trim())
          .filter(Boolean),
      ),
    );

    const nextProjectId = `proj-${Date.now()}`;
    const nextProject = {
      id: nextProjectId,
      code: convertValues.projectCode.trim() || buildNextProjectCode(projectRows),
      name: convertValues.projectName.trim() || `${selectedInquiry.customer} ${selectedInquiry.title}`,
      customer: convertValues.customer || selectedInquiry.customer,
      leader: convertValues.leader,
      secondaryLeader: convertValues.secondaryLeader,
      team: teamMembers.length ? teamMembers : [convertValues.leader],
      status: convertValues.status,
      progress: 0,
      startDate: convertValues.startDate,
      dueDate: convertValues.dueDate,
      approvedScope: convertValues.approvedScope,
      plannedHours: parsedModuleHours,
      actualHours: 0,
      workload:
        parsedTeamHours >= parsedModuleHours
          ? "Balanced"
          : parsedTeamHours === 0
            ? "Unassigned"
            : "Needs Allocation",
    };

    const nextProjectRows = [nextProject, ...projectRows];
    const nextPlanningRecord: ProjectPlanningRecord = {
      projectId: nextProjectId,
      inquiryNo: selectedInquiry.inquiryNo,
      implementationNotes: convertValues.implementationNotes,
      modules: buildPlanningModulesFromConvertRows(convertValues.moduleRows),
      teamAllocations: convertValues.teamRows.map((row, index) => ({
        id: row.id || `alloc-${index + 1}`,
        member: row.member.trim(),
        role: row.role.trim(),
        module: row.module.trim(),
        submodule: row.submodule.trim(),
        plannedHours: Number(row.plannedHours) || 0,
      })),
    };
    const nextPlanningLookup = {
      ...planningLookup,
      [nextProjectId]: nextPlanningRecord,
    };

    const nextInquiryRows: InquiryRecord[] = rows.map((row) =>
      row.id === selectedInquiry.id
        ? {
            ...row,
            status: "Approved" as const,
            updatedOn: today(),
          }
        : row,
    );

    setRows(nextInquiryRows);
    saveProjectManagementInquiries(nextInquiryRows);
    saveProjectManagementProjects(nextProjectRows);
    saveProjectPlanningLookup(nextPlanningLookup);
    setConvertDrawerOpen(false);
    showToast(`Project ${nextProject.code} created with planning input.`, "success");
    navigate("/project-management/projects");
  }, [convertValues, navigate, rows, selectedInquiry, showToast]);

  const columns = React.useMemo<GridColDef<InquiryRecord>[]>(
    () => [
      { field: "inquiryNo", headerName: "Inquiry No", minWidth: 130, flex: 0.8 },
      { field: "customer", headerName: "Customer", minWidth: 150, flex: 0.9 },
      { field: "title", headerName: "Title", minWidth: 220, flex: 1.3 },
      {
        field: "priority",
        headerName: "Priority",
        minWidth: 110,
        flex: 0.7,
        renderCell: (params: GridRenderCellParams<InquiryRecord>) => (
          <PriorityBadge priority={params.row.priority} />
        ),
      },
      {
        field: "status",
        headerName: "Status",
        minWidth: 130,
        flex: 0.7,
        renderCell: (params: GridRenderCellParams<InquiryRecord>) => (
          <ProjectStatusBadge status={params.row.status} />
        ),
      },
      { field: "owner", headerName: "Owner", minWidth: 140, flex: 0.8 },
      { field: "targetDate", headerName: "Target Date", minWidth: 120, flex: 0.7 },
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
          title="Inquiry List"
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
          searchableFields={["inquiryNo", "customer", "title", "owner", "status", "priority"]}
          searchControls={
            <Stack direction={{ xs: "column", md: "row" }} spacing={1} sx={{ mb: 1.25 }}>
              <TextField
                select
                size="small"
                label="Status"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as InquiryFilter)}
                sx={{ minWidth: 160 }}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="review">In Review</MenuItem>
                <MenuItem value="approved">Approved</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
              </TextField>
              <TextField
                select
                size="small"
                label="Priority"
                value={priorityFilter}
                onChange={(event) => setPriorityFilter(event.target.value as PriorityFilter)}
                sx={{ minWidth: 160 }}
              >
                <MenuItem value="all">All Priority</MenuItem>
                <MenuItem value="critical">Critical</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="low">Low</MenuItem>
              </TextField>
            </Stack>
          }
        />
      </Box>

      <InquiryFormDrawer
        open={formDrawerOpen}
        mode={formMode}
        value={formValues}
        onChange={setFormValues}
        onClose={closeFormDrawer}
        onSubmit={handleSubmitInquiry}
      />

      <InquiryDetailDrawer
        open={detailDrawerOpen}
        inquiry={selectedInquiry}
        onClose={closeDetailDrawer}
        onEdit={() => {
          if (!selectedInquiry) {
            return;
          }
          setDetailDrawerOpen(false);
          openEditDrawer(selectedInquiry);
        }}
        onConvert={() => {
          if (!selectedInquiry) {
            return;
          }
          setDetailDrawerOpen(false);
          openConvertDrawer(selectedInquiry);
        }}
        comments={inquiryComments}
        attachments={sharedAttachments}
        activities={recentActivities.slice(0, 3)}
      />

      <InquiryConvertDrawer
        open={convertDrawerOpen}
        inquiry={selectedInquiry}
        onClose={closeConvertDrawer}
        onEdit={() => {
          if (!selectedInquiry) {
            return;
          }
          setConvertDrawerOpen(false);
          openEditDrawer(selectedInquiry);
        }}
        value={convertValues}
        onChange={setConvertValues}
        onSubmit={handleConvertInquiry}
      />
    </>
  );
};

export default ProjectManagementInquiriesPage;
