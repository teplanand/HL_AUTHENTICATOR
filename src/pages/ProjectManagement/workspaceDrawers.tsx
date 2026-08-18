import React from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Drawer,
  MenuItem,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import PausePresentationRoundedIcon from "@mui/icons-material/PausePresentationRounded";
import PlayCircleOutlineRoundedIcon from "@mui/icons-material/PlayCircleOutlineRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import Groups2OutlinedIcon from "@mui/icons-material/Groups2Outlined";
import RuleFolderOutlinedIcon from "@mui/icons-material/RuleFolderOutlined";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import UploadFileRoundedIcon from "@mui/icons-material/UploadFileRounded";
import type {
  AttachmentItem,
  BacklogRecord,
  CommentItem,
  InvoiceRecord,
  PriorityLevel,
  ProjectPlanningModuleRecord,
  ProjectManagementStatus,
  ProjectRecord,
  ProjectTeamAllocationRecord,
  ScopeVersionRecord,
  SupportRecord,
  TimelineItem,
} from "./mockData";
import {
  AttachmentList,
  DetailsGrid,
  PriorityBadge,
  ProgressSummary,
  ProjectCommentsPanel,
  ProjectTimelineRail,
  ProjectStatusBadge,
  TimelineList,
} from "./components";
import { projectSurfaceSx } from "./ui";

const formDrawerPaperSx = {
  "& .MuiDrawer-paper": {
    width: {
      xs: "100%",
      sm: 460,
      lg: 540,
    },
    maxWidth: "100%",
    display: "flex",
    flexDirection: "column",
  },
} as const;

const detailDrawerPaperSx = {
  "& .MuiDrawer-paper": {
    width: {
      xs: "100%",
      sm: 760,
      lg: 940,
    },
    maxWidth: "100%",
    display: "flex",
    flexDirection: "column",
  },
} as const;

const drawerActionButtonSx = {
  borderRadius: 999,
  px: 2.5,
} as const;

const peopleOptions = [
  "Hetal Shah",
  "Krina Mehta",
  "Jinal Desai",
  "Maulik Rana",
  "Harshil Vyas",
  "Pooja Mehta",
  "Nirav Patel",
  "Dhruvi Patel",
  "Apeksha Shah",
  "Bhavya Trivedi",
  "Sagar Parmar",
  "Parth Solanki",
];

const customerOptions = ["Atlas Pumps", "Nova Industries", "Prime Cast", "Zenith Cables"];

const projectStatusOptions = [
  "Active",
  "Planned",
  "On Hold",
  "Completed",
] as ProjectManagementStatus[];

const backlogStatusOptions = [
  "Planned",
  "Active",
  "Blocked",
  "In Review",
  "Completed",
  "Overdue",
] as ProjectManagementStatus[];

const supportStatusOptions = [
  "Active",
  "Pending",
  "Resolved",
  "Paused",
] as ProjectManagementStatus[];

const invoiceStatusOptions = [
  "Sent",
  "Paid",
  "Partially Paid",
  "Overdue",
] as ProjectManagementStatus[];

const scopeStatusOptions = [
  "Pending",
  "In Review",
  "Approved",
  "Rejected",
  "Request Changes",
] as ProjectManagementStatus[];

const priorityOptions = ["Critical", "High", "Medium", "Low"] as PriorityLevel[];

const workflowStateTone = {
  done: {
    accent: "#059669",
    bg: "rgba(16,185,129,0.12)",
    border: "rgba(16,185,129,0.18)",
    label: "Done",
  },
  current: {
    accent: "#2563EB",
    bg: "rgba(37,99,235,0.1)",
    border: "rgba(37,99,235,0.18)",
    label: "Current",
  },
  pending: {
    accent: "#64748B",
    bg: "rgba(148,163,184,0.12)",
    border: "rgba(148,163,184,0.18)",
    label: "Pending",
  },
  attention: {
    accent: "#D97706",
    bg: "rgba(217,119,6,0.12)",
    border: "rgba(217,119,6,0.18)",
    label: "Attention",
  },
} as const;

const DrawerShell = ({
  title,
  subtitle,
  headerActions,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  headerActions?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) => (
  <Box
    sx={{
      px: 2,
      pt: { xs: 8, sm: 9 },
      pb: footer ? 2 : 0,
      display: "flex",
      flexDirection: "column",
      minHeight: "100%",
      boxSizing: "border-box",
    }}
  >
    <Box sx={{ mt: 1, mb: subtitle ? 1 : 0.5 }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "flex-start" }}
        spacing={1.25}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
            {title}
          </Typography>
          {subtitle ? (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
              {subtitle}
            </Typography>
          ) : null}
        </Box>
        {headerActions ? (
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
            {headerActions}
          </Stack>
        ) : null}
      </Stack>
    </Box>
    <Box
      sx={{
        flex: 1,
        minHeight: 0,
        overflowY: "auto",
        pt: 1.25,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {children}
    </Box>
    {footer ? (
      <Box sx={{ pt: 2.5 }}>
        <Stack direction="row" spacing={1.25} alignItems="center" flexWrap="wrap">
          {footer}
        </Stack>
      </Box>
    ) : null}
  </Box>
);

const DrawerSectionTabs = ({
  value,
  onChange,
  tabs,
}: {
  value: string;
  onChange: (value: string) => void;
  tabs: Array<{ value: string; label: string }>;
}) => (
  <Box
    sx={{
      borderBottom: "1px solid rgba(148,163,184,0.18)",
      mb: 1,
    }}
  >
    <Tabs value={value} onChange={(_, nextValue) => onChange(nextValue)} variant="scrollable" allowScrollButtonsMobile>
      {tabs.map((tab) => (
        <Tab key={tab.value} value={tab.value} label={tab.label} />
      ))}
    </Tabs>
  </Box>
);

export type ProjectFormValues = {
  name: string;
  code: string;
  customer: string;
  leader: string;
  secondaryLeader: string;
  teamMembers: string;
  status: ProjectManagementStatus;
  startDate: string;
  dueDate: string;
  approvedScope: string;
};

export const buildInitialProjectFormValues = (
  project?: ProjectRecord | null,
): ProjectFormValues => ({
  name: project?.name ?? "",
  code: project?.code ?? "",
  customer: project?.customer ?? "",
  leader: project?.leader ?? "Krina Mehta",
  secondaryLeader: project?.secondaryLeader ?? "Maulik Rana",
  teamMembers: project?.team.join(", ") ?? "",
  status: project?.status ?? "Planned",
  startDate: project?.startDate ?? "",
  dueDate: project?.dueDate ?? "",
  approvedScope: project?.approvedScope ?? "",
});

type ProjectFormDrawerProps = {
  open: boolean;
  mode: "create" | "edit";
  value: ProjectFormValues;
  onChange: (value: ProjectFormValues) => void;
  onClose: () => void;
  onSubmit: () => void;
};

export const ProjectFormDrawer = ({
  open,
  mode,
  value,
  onChange,
  onClose,
  onSubmit,
}: ProjectFormDrawerProps) => {
  const handleChange =
    (field: keyof ProjectFormValues) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      onChange({
        ...value,
        [field]: event.target.value,
      });
    };

  return (
    <Drawer anchor="right" open={open} onClose={onClose} sx={formDrawerPaperSx}>
      <DrawerShell
        title={mode === "edit" ? "Edit Project" : "Create Project"}
        subtitle=""
        headerActions={
          <Button variant="outlined" onClick={onClose} sx={drawerActionButtonSx}>
            Close
          </Button>
        }
        footer={
          <Button variant="contained" onClick={onSubmit} sx={drawerActionButtonSx}>
            {mode === "edit" ? "Save Changes" : "Save Project"}
          </Button>
        }
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
            gap: 2,
          }}
        >
          <Box sx={{ gridColumn: "1 / -1" }}>
            <TextField label="Project Name" value={value.name} onChange={handleChange("name")} size="small" fullWidth />
          </Box>
          <TextField label="Project Code" value={value.code} onChange={handleChange("code")} size="small" fullWidth />
          <TextField select label="Customer" value={value.customer} onChange={handleChange("customer")} size="small" fullWidth>
            <MenuItem value="">Select customer</MenuItem>
            {customerOptions.map((customer) => (
              <MenuItem key={customer} value={customer}>
                {customer}
              </MenuItem>
            ))}
          </TextField>
          <TextField select label="Status" value={value.status} onChange={handleChange("status")} size="small" fullWidth>
            {projectStatusOptions.map((status) => (
              <MenuItem key={status} value={status}>
                {status}
              </MenuItem>
            ))}
          </TextField>
          <TextField select label="Primary Leader" value={value.leader} onChange={handleChange("leader")} size="small" fullWidth>
            {peopleOptions.map((person) => (
              <MenuItem key={person} value={person}>
                {person}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Secondary Leader"
            value={value.secondaryLeader}
            onChange={handleChange("secondaryLeader")}
            size="small"
            fullWidth
          >
            {peopleOptions.map((person) => (
              <MenuItem key={person} value={person}>
                {person}
              </MenuItem>
            ))}
          </TextField>
          <TextField label="Start Date" type="date" value={value.startDate} onChange={handleChange("startDate")} size="small" fullWidth InputLabelProps={{ shrink: true }} />
          <TextField label="Due Date" type="date" value={value.dueDate} onChange={handleChange("dueDate")} size="small" fullWidth InputLabelProps={{ shrink: true }} />
          <Box sx={{ gridColumn: "1 / -1" }}>
            <TextField
              label="Team Members"
              value={value.teamMembers}
              onChange={handleChange("teamMembers")}
              multiline
              minRows={3}
              fullWidth
            />
          </Box>
          <Box sx={{ gridColumn: "1 / -1" }}>
            <TextField
              label="Approved Scope Link"
              value={value.approvedScope}
              onChange={handleChange("approvedScope")}
              size="small"
              fullWidth
            />
          </Box>
        </Box>
      </DrawerShell>
    </Drawer>
  );
};

type ProjectDetailDrawerProps = {
  open: boolean;
  project: ProjectRecord | null;
  onClose: () => void;
  onEdit: () => void;
  activities: TimelineItem[];
  modulePlanningTree: ProjectPlanningModuleRecord[];
  teamAllocations: ProjectTeamAllocationRecord[];
};

export const ProjectDetailDrawer = ({
  open,
  project,
  onClose,
  onEdit,
  activities,
  modulePlanningTree,
  teamAllocations,
}: ProjectDetailDrawerProps) => {
  const [activeSection, setActiveSection] = React.useState("overview");
  const planningSummary = React.useMemo(() => {
    const phaseRows = modulePlanningTree.flatMap((module) =>
      module.submodules.flatMap((submodule) =>
        submodule.phases.map((phase) => ({
          module: module.module,
          submodule: submodule.name,
          ...phase,
        })),
      ),
    );

    const totalHours = phaseRows.reduce((sum, phase) => sum + phase.hours, 0);
    const totalWeightedHours = phaseRows.reduce(
      (sum, phase) => sum + phase.hours * (phase.progress / 100),
      0,
    );

    return {
      totalHours,
      totalDays: totalHours / 8,
      completedHours: totalWeightedHours,
      activePhases: phaseRows.filter((phase) => phase.progress > 0 && phase.progress < 100).length,
      pendingEstimateCount: phaseRows.filter((phase) => phase.hours <= 0).length,
    };
  }, [modulePlanningTree]);
  const teamSummary = React.useMemo(() => {
    const totalAssignedHours = teamAllocations.reduce(
      (sum, allocation) => sum + allocation.plannedHours,
      0,
    );
    const grouped = new Map<
      string,
      { member: string; plannedHours: number; roles: Set<string>; modules: Set<string> }
    >();

    teamAllocations.forEach((allocation) => {
      const current =
        grouped.get(allocation.member) ??
        {
          member: allocation.member,
          plannedHours: 0,
          roles: new Set<string>(),
          modules: new Set<string>(),
        };

      current.plannedHours += allocation.plannedHours;
      if (allocation.role) {
        current.roles.add(allocation.role);
      }
      if (allocation.module) {
        current.modules.add(allocation.module);
      }
      grouped.set(allocation.member, current);
    });

    return {
      totalAssignedHours,
      rows: Array.from(grouped.values()),
    };
  }, [teamAllocations]);

  React.useEffect(() => {
    if (!open) {
      setActiveSection("overview");
    }
  }, [open]);

  return (
    <Drawer anchor="right" open={open} onClose={onClose} sx={detailDrawerPaperSx}>
      <DrawerShell
        title={project?.code ? `Project Detail - ${project.code}` : "Project Detail"}
        subtitle=""
        headerActions={
          <>
            <Button variant="outlined" startIcon={<EditRoundedIcon />} onClick={onEdit} sx={drawerActionButtonSx}>
              Edit
            </Button>
            <Button variant="outlined" onClick={onClose} sx={drawerActionButtonSx}>
              Close
            </Button>
          </>
        }
      >
        <DrawerSectionTabs
          value={activeSection}
          onChange={setActiveSection}
          tabs={[
            { value: "overview", label: "Overview" },
            { value: "team", label: "Team" },
            { value: "planning", label: "Planning" },
            { value: "timeline", label: "Timeline" },
          ]}
        />
        {project ? (
          <>
            {activeSection === "overview" ? (
              <Box sx={{ ...projectSurfaceSx, p: 2 }}>
                <Stack spacing={2}>
                  <DetailsGrid
                    items={[
                      { label: "Project", value: `${project.code} - ${project.name}` },
                      { label: "Customer", value: project.customer },
                      { label: "Status", value: <ProjectStatusBadge status={project.status} /> },
                      { label: "Approved Scope", value: project.approvedScope },
                      { label: "Start Date", value: project.startDate },
                      { label: "Due Date", value: project.dueDate },
                      { label: "Planned Hours", value: project.plannedHours },
                      { label: "Actual Hours", value: project.actualHours },
                    ]}
                  />
                  <ProgressSummary
                    label="Overall Progress"
                    value={project.progress}
                    helper={`${project.actualHours}h actual against ${project.plannedHours}h planned.`}
                  />
                </Stack>
              </Box>
            ) : null}

            {activeSection === "team" ? (
              <Box sx={{ ...projectSurfaceSx, p: 2 }}>
                <Stack spacing={2}>
                  <DetailsGrid
                    items={[
                      { label: "Primary Leader", value: project.leader },
                      { label: "Secondary Leader", value: project.secondaryLeader },
                      {
                        label: "Team Count",
                        value: `${Math.max(project.team.length, teamSummary.rows.length)} members`,
                      },
                      { label: "Workload", value: project.workload },
                    ]}
                  />
                  <Stack spacing={1.5}>
                    {(teamSummary.rows.length
                      ? teamSummary.rows
                      : project.team.map((member) => ({
                          member,
                          plannedHours: Math.round(
                            project.plannedHours / Math.max(project.team.length, 1),
                          ),
                          roles: new Set<string>(["Developer"]),
                          modules: new Set<string>(["Delivery"]),
                        }))
                    ).map((memberSummary, index) => (
                      <ProgressSummary
                        key={memberSummary.member}
                        label={memberSummary.member}
                        value={
                          teamSummary.totalAssignedHours > 0
                            ? Math.round(
                                (memberSummary.plannedHours / teamSummary.totalAssignedHours) * 100,
                              )
                            : 0
                        }
                        helper={`${memberSummary.plannedHours}h assigned across ${
                          Array.from(memberSummary.modules).join(", ") || "delivery plan"
                        }. ${Array.from(memberSummary.roles).join(", ") || "Developer"}`}
                        color={index === 0 ? "#2563EB" : index === 1 ? "#7C3AED" : "#D97706"}
                      />
                    ))}
                  </Stack>
                </Stack>
              </Box>
            ) : null}

            {activeSection === "planning" ? (
              <Box sx={{ ...projectSurfaceSx, p: 2 }}>
                <Stack spacing={2}>
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", md: "repeat(4, minmax(0, 1fr))" },
                      gap: 1.25,
                    }}
                  >
                    {[
                      {
                        label: "Planned Hours",
                        value: `${planningSummary.totalHours}h`,
                        helper: "Sum of all phase estimates",
                        color: "#2563EB",
                      },
                      {
                        label: "Planned Days",
                        value: `${planningSummary.totalDays.toFixed(1)} d`,
                        helper: "Based on 8h working day",
                        color: "#7C3AED",
                      },
                      {
                        label: "Running Phases",
                        value: `${planningSummary.activePhases}`,
                        helper: "Currently in progress",
                        color: "#D97706",
                      },
                      {
                        label: "Missing Estimates",
                        value: `${planningSummary.pendingEstimateCount}`,
                        helper: "Need PM input before schedule lock",
                        color: planningSummary.pendingEstimateCount > 0 ? "#DC2626" : "#059669",
                      },
                    ].map((card) => (
                      <Box
                        key={card.label}
                        sx={{
                          borderRadius: 2.5,
                          border: "1px solid rgba(148,163,184,0.16)",
                          bgcolor: "rgba(248,250,252,0.74)",
                          p: 1.5,
                        }}
                      >
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800 }}>
                          {card.label}
                        </Typography>
                        <Typography variant="h6" sx={{ mt: 0.8, fontWeight: 900, color: card.color }}>
                          {card.value}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.6, display: "block" }}>
                          {card.helper}
                        </Typography>
                      </Box>
                    ))}
                  </Box>

                  <Alert severity="info">
                    Phase time should come from planning estimates. Best practice: Analysis and UAT by PM/lead estimate, Development from backlog sum, and Pilot/Go-live from rollout plan.
                  </Alert>

                  {modulePlanningTree.map((module) => (
                    <Box
                      key={module.id}
                      sx={{
                        border: "1px solid rgba(148,163,184,0.18)",
                        borderRadius: 2,
                        p: 1.5,
                        bgcolor: "rgba(248,250,252,0.72)",
                      }}
                    >
                      <Stack
                        direction={{ xs: "column", md: "row" }}
                        justifyContent="space-between"
                        spacing={1}
                      >
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>
                            {module.module}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.45 }}>
                            Phase-wise planning with estimate source and expected duration.
                          </Typography>
                        </Box>
                        <Chip
                          label={`${module.submodules
                            .flatMap((submodule) => submodule.phases)
                            .reduce((sum, phase) => sum + phase.hours, 0)}h module plan`}
                          sx={{ fontWeight: 800, alignSelf: "flex-start" }}
                        />
                      </Stack>
                      <Stack spacing={1.25} sx={{ mt: 1.25 }}>
                        {module.submodules.map((submodule) => (
                          <Box
                            key={submodule.id}
                            sx={{
                              borderRadius: 2,
                              border: "1px solid rgba(148,163,184,0.14)",
                              bgcolor: "rgba(255,255,255,0.82)",
                              overflow: "hidden",
                            }}
                          >
                            <Box
                              sx={{
                                px: 1.5,
                                py: 1.1,
                                borderBottom: "1px solid rgba(148,163,184,0.14)",
                                bgcolor: "rgba(248,250,252,0.9)",
                              }}
                            >
                              <Stack
                                direction={{ xs: "column", sm: "row" }}
                                justifyContent="space-between"
                                spacing={0.75}
                              >
                                <Typography variant="body2" sx={{ fontWeight: 800 }}>
                                  {submodule.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                                  {submodule.phases.reduce((sum, phase) => sum + phase.hours, 0)}h total
                                </Typography>
                              </Stack>
                            </Box>
                            <Stack spacing={1} sx={{ mt: 0.75 }}>
                              {submodule.phases.map((phase) => (
                                <Box
                                  key={phase.id}
                                  sx={{
                                    px: 1.5,
                                    pb: 1.25,
                                  }}
                                >
                                  <Box
                                    sx={{
                                      display: "grid",
                                      gridTemplateColumns: {
                                        xs: "1fr",
                                        lg: "minmax(120px, 0.9fr) minmax(90px, 0.55fr) minmax(90px, 0.55fr) minmax(120px, 0.7fr) minmax(110px, 0.55fr) minmax(220px, 1.25fr)",
                                      },
                                      gap: 1,
                                      alignItems: "start",
                                    }}
                                  >
                                    <Box>
                                      <Typography variant="body2" sx={{ fontWeight: 800 }}>
                                        {phase.name}
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary">
                                        Progress-based phase tracking
                                      </Typography>
                                    </Box>
                                    <Box>
                                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                                        Est. Hours
                                      </Typography>
                                      <Typography variant="body2" sx={{ mt: 0.35, fontWeight: 800 }}>
                                        {phase.hours}h
                                      </Typography>
                                    </Box>
                                    <Box>
                                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                                        Est. Days
                                      </Typography>
                                      <Typography variant="body2" sx={{ mt: 0.35, fontWeight: 800 }}>
                                        {(phase.hours / 8).toFixed(1)} d
                                      </Typography>
                                    </Box>
                                    <Box>
                                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                                        Owner
                                      </Typography>
                                      <Typography variant="body2" sx={{ mt: 0.35, fontWeight: 800 }}>
                                        {phase.owner ?? "Unassigned"}
                                      </Typography>
                                    </Box>
                                    <Box>
                                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                                        Status
                                      </Typography>
                                      <Box sx={{ mt: 0.45 }}>
                                        <Chip
                                          size="small"
                                          label={`${phase.progress}% done`}
                                          sx={{
                                            fontWeight: 800,
                                            bgcolor:
                                              phase.progress >= 100
                                                ? "#DCFCE7"
                                                : phase.progress > 0
                                                  ? "#DBEAFE"
                                                  : "#E2E8F0",
                                            color:
                                              phase.progress >= 100
                                                ? "#15803D"
                                                : phase.progress > 0
                                                  ? "#1D4ED8"
                                                  : "#475569",
                                          }}
                                        />
                                      </Box>
                                    </Box>
                                    <Box>
                                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                                        Estimate Source
                                      </Typography>
                                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.35, lineHeight: 1.55 }}>
                                        {phase.source ?? "Planning source not defined yet."}
                                      </Typography>
                                    </Box>
                                  </Box>
                                  <Box
                                    sx={{
                                      mt: 1,
                                      height: 8,
                                      borderRadius: 999,
                                      bgcolor: "rgba(148,163,184,0.16)",
                                      overflow: "hidden",
                                    }}
                                  >
                                    <Box
                                      sx={{
                                        width: `${phase.progress}%`,
                                        height: "100%",
                                        borderRadius: 999,
                                        bgcolor:
                                          phase.progress >= 100
                                            ? "#059669"
                                            : phase.progress >= 40
                                              ? "#2563EB"
                                              : "#D97706",
                                      }}
                                    />
                                  </Box>
                                </Box>
                              ))}
                            </Stack>
                          </Box>
                        ))}
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              </Box>
            ) : null}

            {activeSection === "timeline" ? (
              <Box sx={{ ...projectSurfaceSx, p: 2 }}>
                <ProjectTimelineRail items={activities} />
              </Box>
            ) : null}
          </>
        ) : null}
      </DrawerShell>
    </Drawer>
  );
};

export type BacklogFormValues = {
  ticketNo: string;
  project: string;
  module: string;
  submodule: string;
  phase: string;
  type: BacklogRecord["type"];
  priority: PriorityLevel;
  assignee: string;
  status: ProjectManagementStatus;
  estimateHours: string;
  actualHours: string;
  dueDate: string;
  dependency: string;
};

export const buildInitialBacklogFormValues = (
  backlog?: BacklogRecord | null,
): BacklogFormValues => ({
  ticketNo: backlog?.ticketNo ?? "",
  project: backlog?.project ?? "",
  module: backlog?.module ?? "",
  submodule: backlog?.submodule ?? "",
  phase: backlog?.phase ?? "",
  type: backlog?.type ?? "Feature",
  priority: backlog?.priority ?? "Medium",
  assignee: backlog?.assignee ?? "Nirav Patel",
  status: backlog?.status ?? "Planned",
  estimateHours: backlog?.estimateHours ? String(backlog.estimateHours) : "",
  actualHours: backlog?.actualHours ? String(backlog.actualHours) : "0",
  dueDate: backlog?.dueDate ?? "",
  dependency: backlog?.dependency ?? "",
});

type BacklogFormDrawerProps = {
  open: boolean;
  mode: "create" | "edit";
  value: BacklogFormValues;
  onChange: (value: BacklogFormValues) => void;
  onClose: () => void;
  onSubmit: () => void;
  projectOptions: string[];
};

export const BacklogFormDrawer = ({
  open,
  mode,
  value,
  onChange,
  onClose,
  onSubmit,
  projectOptions,
}: BacklogFormDrawerProps) => {
  const handleChange =
    (field: keyof BacklogFormValues) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      onChange({
        ...value,
        [field]: event.target.value,
      });
    };

  return (
    <Drawer anchor="right" open={open} onClose={onClose} sx={formDrawerPaperSx}>
      <DrawerShell
        title={mode === "edit" ? "Edit Backlog" : "Create Backlog"}
        subtitle=""
        headerActions={
          <Button variant="outlined" onClick={onClose} sx={drawerActionButtonSx}>
            Close
          </Button>
        }
        footer={
          <Button variant="contained" onClick={onSubmit} sx={drawerActionButtonSx}>
            {mode === "edit" ? "Save Changes" : "Save Backlog"}
          </Button>
        }
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
            gap: 2,
          }}
        >
          <TextField label="Backlog No" value={value.ticketNo} onChange={handleChange("ticketNo")} size="small" fullWidth />
          <TextField select label="Project" value={value.project} onChange={handleChange("project")} size="small" fullWidth>
            <MenuItem value="">Select project</MenuItem>
            {projectOptions.map((project) => (
              <MenuItem key={project} value={project}>
                {project}
              </MenuItem>
            ))}
          </TextField>
          <TextField label="Module" value={value.module} onChange={handleChange("module")} size="small" fullWidth />
          <TextField label="Submodule" value={value.submodule} onChange={handleChange("submodule")} size="small" fullWidth />
          <TextField label="Phase" value={value.phase} onChange={handleChange("phase")} size="small" fullWidth />
          <TextField select label="Type" value={value.type} onChange={handleChange("type")} size="small" fullWidth>
            {["Feature", "Bug", "Improvement", "Task"].map((type) => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </TextField>
          <TextField select label="Priority" value={value.priority} onChange={handleChange("priority")} size="small" fullWidth>
            {priorityOptions.map((priority) => (
              <MenuItem key={priority} value={priority}>
                {priority}
              </MenuItem>
            ))}
          </TextField>
          <TextField select label="Status" value={value.status} onChange={handleChange("status")} size="small" fullWidth>
            {backlogStatusOptions.map((status) => (
              <MenuItem key={status} value={status}>
                {status}
              </MenuItem>
            ))}
          </TextField>
          <TextField select label="Assignee" value={value.assignee} onChange={handleChange("assignee")} size="small" fullWidth>
            {peopleOptions.map((person) => (
              <MenuItem key={person} value={person}>
                {person}
              </MenuItem>
            ))}
          </TextField>
          <TextField label="Estimate Hours" value={value.estimateHours} onChange={handleChange("estimateHours")} size="small" fullWidth />
          <TextField label="Actual Hours" value={value.actualHours} onChange={handleChange("actualHours")} size="small" fullWidth />
          <Box sx={{ gridColumn: "1 / -1" }}>
            <TextField label="Due Date" type="date" value={value.dueDate} onChange={handleChange("dueDate")} size="small" fullWidth InputLabelProps={{ shrink: true }} />
          </Box>
          <Box sx={{ gridColumn: "1 / -1" }}>
            <TextField
              label="Dependency / Description"
              value={value.dependency}
              onChange={handleChange("dependency")}
              multiline
              minRows={4}
              fullWidth
            />
          </Box>
        </Box>
      </DrawerShell>
    </Drawer>
  );
};

type BacklogDetailDrawerProps = {
  open: boolean;
  backlog: BacklogRecord | null;
  onClose: () => void;
  onEdit: () => void;
  comments: CommentItem[];
  attachments: AttachmentItem[];
  dependencies: TimelineItem[];
  statusHistory: TimelineItem[];
  assignmentHistory: TimelineItem[];
};

export const BacklogDetailDrawer = ({
  open,
  backlog,
  onClose,
  onEdit,
  comments,
  attachments,
  dependencies,
  statusHistory,
  assignmentHistory,
}: BacklogDetailDrawerProps) => {
  const [activeSection, setActiveSection] = React.useState("overview");
  const combinedHistory = React.useMemo(() => {
    const parseTimelineDate = (value: string) => {
      const parsed = new Date(value).getTime();
      return Number.isNaN(parsed) ? 0 : parsed;
    };

    return [
      ...statusHistory.map((item) => ({
        ...item,
        subtitle: `Status Update. ${item.subtitle}`,
      })),
      ...assignmentHistory.map((item) => ({
        ...item,
        subtitle: `Assignment Update. ${item.subtitle}`,
      })),
    ].sort((first, second) => parseTimelineDate(second.time) - parseTimelineDate(first.time));
  }, [assignmentHistory, statusHistory]);

  React.useEffect(() => {
    if (!open) {
      setActiveSection("overview");
    }
  }, [open]);

  return (
    <Drawer anchor="right" open={open} onClose={onClose} sx={detailDrawerPaperSx}>
      <DrawerShell
        title={backlog?.ticketNo ? `Backlog Detail - ${backlog.ticketNo}` : "Backlog Detail"}
        subtitle=""
        headerActions={
          <>
            <Button variant="outlined" startIcon={<EditRoundedIcon />} onClick={onEdit} sx={drawerActionButtonSx}>
              Edit
            </Button>
            <Button variant="outlined" onClick={onClose} sx={drawerActionButtonSx}>
              Close
            </Button>
          </>
        }
      >
        <DrawerSectionTabs
          value={activeSection}
          onChange={setActiveSection}
          tabs={[
            { value: "overview", label: "Overview" },
            { value: "comments", label: "Comments" },
            { value: "history", label: "History" },
          ]}
        />
        {backlog ? (
          <>
            {activeSection === "overview" ? (
              <Box sx={{ ...projectSurfaceSx, p: 2 }}>
                <Stack spacing={2}>
                  <DetailsGrid
                    items={[
                      { label: "Backlog", value: backlog.ticketNo },
                      { label: "Project", value: backlog.project },
                      { label: "Module", value: `${backlog.module} / ${backlog.submodule}` },
                      { label: "Phase", value: backlog.phase },
                      { label: "Status", value: <ProjectStatusBadge status={backlog.status} /> },
                      { label: "Priority", value: <PriorityBadge priority={backlog.priority} /> },
                      { label: "Assignee", value: backlog.assignee },
                      { label: "Estimate vs Actual", value: `${backlog.estimateHours}h / ${backlog.actualHours}h` },
                    ]}
                  />
                  <TextField label="Dependency / Description" value={backlog.dependency} multiline minRows={4} fullWidth />
                  
                </Stack>
              </Box>
            ) : null}

            {activeSection === "comments" ? (
              <Box
                sx={{
                  ...projectSurfaceSx,
                  p: 0,
                  overflow: "hidden",
                  flex: 1,
                  minHeight: 0,
                  display: "flex",
                }}
              >
                <ProjectCommentsPanel
                  items={comments}
                  threadKey={backlog.id}
                  currentAuthor={backlog.assignee}
                  currentRole="Developer"
                />
              </Box>
            ) : null}

            {activeSection === "history" ? (
              <Box sx={{ ...projectSurfaceSx, p: 2 }}>
                <Stack spacing={2}>
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" },
                      gap: 1.25,
                    }}
                  >
                    {[
                      {
                        label: "Total Events",
                        value: `${combinedHistory.length}`,
                        helper: "Status and ownership changes together",
                        color: "#2563EB",
                      },
                      {
                        label: "Status Changes",
                        value: `${statusHistory.length}`,
                        helper: "Workflow movement recorded for this backlog",
                        color: "#DC2626",
                      },
                      {
                        label: "Assignment Updates",
                        value: `${assignmentHistory.length}`,
                        helper: "Ownership transitions captured in one feed",
                        color: "#7C3AED",
                      },
                    ].map((card) => (
                      <Box
                        key={card.label}
                        sx={{
                          borderRadius: 2.5,
                          border: "1px solid rgba(148,163,184,0.16)",
                          bgcolor: "rgba(248,250,252,0.74)",
                          p: 1.5,
                        }}
                      >
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800 }}>
                          {card.label}
                        </Typography>
                        <Typography variant="h6" sx={{ mt: 0.8, fontWeight: 900, color: card.color }}>
                          {card.value}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.6, display: "block" }}>
                          {card.helper}
                        </Typography>
                      </Box>
                    ))}
                  </Box>

                  <Alert severity="info">
                    Backlog ni badhi movement have ek activity history ma dekhase, etle status change ane assignee change banne ekaj jagyae mali jashe.
                  </Alert>

                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1.25 }}>
                      Activity History
                    </Typography>
                    <ProjectTimelineRail items={combinedHistory} />
                  </Box>
                </Stack>
              </Box>
            ) : null}
          </>
        ) : null}
      </DrawerShell>
    </Drawer>
  );
};

export type SupportFormValues = {
  ticketNo: string;
  customer: string;
  project: string;
  issue: string;
  priority: PriorityLevel;
  assignee: string;
  status: ProjectManagementStatus;
  openedAt: string;
  resolutionTime: string;
  attachmentNames: string[];
};

export const buildInitialSupportFormValues = (
  support?: SupportRecord | null,
): SupportFormValues => ({
  ticketNo: support?.ticketNo ?? "",
  customer: support?.customer ?? "",
  project: support?.project ?? "",
  issue: support?.issue ?? "",
  priority: support?.priority ?? "Medium",
  assignee: support?.assignee ?? "Nirav Patel",
  status: support?.status ?? "Pending",
  openedAt: support?.openedAt ?? "",
  resolutionTime: support?.resolutionTime ?? "Pending",
  attachmentNames: [],
});

type SupportFormDrawerProps = {
  open: boolean;
  mode: "create" | "edit";
  value: SupportFormValues;
  onChange: (value: SupportFormValues) => void;
  onClose: () => void;
  onSubmit: () => void;
  projectOptions: string[];
};

export const SupportFormDrawer = ({
  open,
  mode,
  value,
  onChange,
  onClose,
  onSubmit,
  projectOptions,
}: SupportFormDrawerProps) => {
  const handleChange =
    (field: keyof SupportFormValues) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      onChange({
        ...value,
        [field]: event.target.value,
      });
    };

  const handleAttachmentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);

    if (!files.length) {
      return;
    }

    onChange({
      ...value,
      attachmentNames: [...value.attachmentNames, ...files.map((file) => file.name)],
    });

    event.target.value = "";
  };

  const handleAttachmentDelete = (attachmentIndex: number) => {
    onChange({
      ...value,
      attachmentNames: value.attachmentNames.filter((_, index) => index !== attachmentIndex),
    });
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose} sx={formDrawerPaperSx}>
      <DrawerShell
        title={mode === "edit" ? "Edit Support Ticket" : "Create Support Ticket"}
        subtitle=""
        headerActions={
          <Button variant="outlined" onClick={onClose} sx={drawerActionButtonSx}>
            Close
          </Button>
        }
        footer={
          <Button variant="contained" onClick={onSubmit} sx={drawerActionButtonSx}>
            {mode === "edit" ? "Save Changes" : "Save Ticket"}
          </Button>
        }
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
            gap: 2,
          }}
        >
          <TextField label="Ticket No" value={value.ticketNo} onChange={handleChange("ticketNo")} size="small" fullWidth />
          <TextField select label="Customer" value={value.customer} onChange={handleChange("customer")} size="small" fullWidth>
            <MenuItem value="">Select customer</MenuItem>
            {customerOptions.map((customer) => (
              <MenuItem key={customer} value={customer}>
                {customer}
              </MenuItem>
            ))}
          </TextField>
          <Box sx={{ gridColumn: "1 / -1" }}>
            <TextField select label="Project" value={value.project} onChange={handleChange("project")} size="small" fullWidth>
              <MenuItem value="">Select project</MenuItem>
              {projectOptions.map((project) => (
                <MenuItem key={project} value={project}>
                  {project}
                </MenuItem>
              ))}
            </TextField>
          </Box>
          <TextField select label="Priority" value={value.priority} onChange={handleChange("priority")} size="small" fullWidth>
            {priorityOptions.map((priority) => (
              <MenuItem key={priority} value={priority}>
                {priority}
              </MenuItem>
            ))}
          </TextField>
          <TextField select label="Assignee" value={value.assignee} onChange={handleChange("assignee")} size="small" fullWidth>
            {peopleOptions.map((person) => (
              <MenuItem key={person} value={person}>
                {person}
              </MenuItem>
            ))}
          </TextField>
          <TextField select label="Status" value={value.status} onChange={handleChange("status")} size="small" fullWidth>
            {supportStatusOptions.map((status) => (
              <MenuItem key={status} value={status}>
                {status}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Opened At"
            value={value.openedAt}
            onChange={handleChange("openedAt")}
            size="small"
            fullWidth
            placeholder="2026-08-11 10:00"
          />
          <TextField
            label="Resolution Time"
            value={value.resolutionTime}
            onChange={handleChange("resolutionTime")}
            size="small"
            fullWidth
          />
          <Box sx={{ gridColumn: "1 / -1" }}>
            <TextField
              label="Issue"
              value={value.issue}
              onChange={handleChange("issue")}
              multiline
              minRows={5}
              fullWidth
            />
          </Box>
          <Box
            sx={{
              gridColumn: "1 / -1",
              border: "1px solid rgba(148,163,184,0.35)",
              borderRadius: 1,
              px: 1.5,
              py: 1.25,
            }}
          >
            <Stack spacing={1.25}>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                alignItems={{ sm: "center" }}
                justifyContent="space-between"
                spacing={1}
              >
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                    Attachments
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Upload related files for this support ticket.
                  </Typography>
                </Box>
                <Button
                  component="label"
                  variant="outlined"
                  size="small"
                  startIcon={<UploadFileRoundedIcon />}
                  sx={{ alignSelf: { xs: "flex-start", sm: "center" } }}
                >
                  Upload Files
                  <Box
                    component="input"
                    type="file"
                    multiple
                    onChange={handleAttachmentChange}
                    sx={{ display: "none" }}
                  />
                </Button>
              </Stack>

              {value.attachmentNames.length ? (
                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                  {value.attachmentNames.map((attachmentName, index) => (
                    <Chip
                      key={`${attachmentName}-${index}`}
                      label={attachmentName}
                      onDelete={() => handleAttachmentDelete(index)}
                      variant="outlined"
                    />
                  ))}
                </Stack>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No attachments selected yet.
                </Typography>
              )}
            </Stack>
          </Box>
        </Box>
      </DrawerShell>
    </Drawer>
  );
};

type SupportDetailDrawerProps = {
  open: boolean;
  support: SupportRecord | null;
  onClose: () => void;
  onEdit: () => void;
  isSupportActive: boolean;
  onToggleSupport: () => void;
  comments: CommentItem[];
  attachments: AttachmentItem[];
};

export const SupportDetailDrawer = ({
  open,
  support,
  onClose,
  onEdit,
  isSupportActive,
  onToggleSupport,
  comments,
  attachments,
}: SupportDetailDrawerProps) => {
  const [activeSection, setActiveSection] = React.useState("overview");

  React.useEffect(() => {
    if (!open) {
      setActiveSection("overview");
    }
  }, [open]);

  return (
    <Drawer anchor="right" open={open} onClose={onClose} sx={detailDrawerPaperSx}>
      <DrawerShell
        title={support?.ticketNo ? `Support Detail - ${support.ticketNo}` : "Support Detail"}
        subtitle=""
        headerActions={
          <>
            <Button variant="outlined" startIcon={<EditRoundedIcon />} onClick={onEdit} sx={drawerActionButtonSx}>
              Edit
            </Button>
            <Button variant="outlined" onClick={onClose} sx={drawerActionButtonSx}>
              Close
            </Button>
          </>
        }
      >
        <DrawerSectionTabs
          value={activeSection}
          onChange={setActiveSection}
          tabs={[
            { value: "overview", label: "Overview" },
            { value: "attachments", label: "Attachments" },
            { value: "comments", label: "Comments" },
          ]}
        />
        {support ? (
          <>
            {activeSection === "overview" ? (
              <Box sx={{ ...projectSurfaceSx, p: 2 }}>
                <Stack spacing={2}>
                  <DetailsGrid
                    items={[
                      { label: "Ticket", value: support.ticketNo },
                      { label: "Customer", value: support.customer },
                      { label: "Project", value: support.project },
                      { label: "Priority", value: <PriorityBadge priority={support.priority} /> },
                      { label: "Status", value: <ProjectStatusBadge status={support.status} /> },
                      { label: "Assignee", value: support.assignee },
                      { label: "Opened At", value: support.openedAt },
                      { label: "Resolution Time", value: support.resolutionTime },
                    ]}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {support.issue}
                  </Typography>
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                    <Button
                      variant={isSupportActive ? "outlined" : "contained"}
                      startIcon={isSupportActive ? <PausePresentationRoundedIcon /> : <PlayCircleOutlineRoundedIcon />}
                      onClick={onToggleSupport}
                    >
                      {isSupportActive ? "Stop Support" : "Start Support"}
                    </Button>
                     
                  </Stack>
                </Stack>
              </Box>
            ) : null}

            {activeSection === "attachments" ? (
              <Box sx={{ ...projectSurfaceSx, p: 0, overflow: "hidden" }}>
                <AttachmentList items={attachments} />
              </Box>
            ) : null}

            {activeSection === "comments" ? (
              <Box
                sx={{
                  ...projectSurfaceSx,
                  p: 0,
                  overflow: "hidden",
                  flex: 1,
                  minHeight: 0,
                  display: "flex",
                }}
              >
                <ProjectCommentsPanel
                  items={comments}
                  threadKey={support.id}
                  currentAuthor={support.assignee}
                  currentRole="Support Engineer"
                />
              </Box>
            ) : null}

          </>
        ) : null}
      </DrawerShell>
    </Drawer>
  );
};

export type InvoiceFormValues = {
  invoiceNo: string;
  project: string;
  customer: string;
  type: InvoiceRecord["type"];
  amount: string;
  dueDate: string;
  status: ProjectManagementStatus;
  paidAmount: string;
  lineItems: string;
};

export const buildInitialInvoiceFormValues = (
  invoice?: InvoiceRecord | null,
): InvoiceFormValues => ({
  invoiceNo: invoice?.invoiceNo ?? "",
  project: invoice?.project ?? "",
  customer: invoice?.customer ?? "",
  type: invoice?.type ?? "Milestone",
  amount: invoice?.amount ? String(invoice.amount) : "",
  dueDate: invoice?.dueDate ?? "",
  status: invoice?.status ?? "Sent",
  paidAmount: invoice?.paidAmount ? String(invoice.paidAmount) : "0",
  lineItems: "Development milestone, UAT support, deployment prep",
});

type InvoiceFormDrawerProps = {
  open: boolean;
  mode: "create" | "edit";
  value: InvoiceFormValues;
  onChange: (value: InvoiceFormValues) => void;
  onClose: () => void;
  onSubmit: () => void;
  projectOptions: string[];
};

export const InvoiceFormDrawer = ({
  open,
  mode,
  value,
  onChange,
  onClose,
  onSubmit,
  projectOptions,
}: InvoiceFormDrawerProps) => {
  const handleChange =
    (field: keyof InvoiceFormValues) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      onChange({
        ...value,
        [field]: event.target.value,
      });
    };

  return (
    <Drawer anchor="right" open={open} onClose={onClose} sx={formDrawerPaperSx}>
      <DrawerShell
        title={mode === "edit" ? "Edit Invoice" : "Create Invoice"}
        subtitle=""
        headerActions={
          <Button variant="outlined" onClick={onClose} sx={drawerActionButtonSx}>
            Close
          </Button>
        }
        footer={
          <Button variant="contained" onClick={onSubmit} sx={drawerActionButtonSx}>
            {mode === "edit" ? "Save Changes" : "Save Invoice"}
          </Button>
        }
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
            gap: 2,
          }}
        >
          <TextField label="Invoice No" value={value.invoiceNo} onChange={handleChange("invoiceNo")} size="small" fullWidth />
          <TextField select label="Project" value={value.project} onChange={handleChange("project")} size="small" fullWidth>
            <MenuItem value="">Select project</MenuItem>
            {projectOptions.map((project) => (
              <MenuItem key={project} value={project}>
                {project}
              </MenuItem>
            ))}
          </TextField>
          <TextField select label="Customer" value={value.customer} onChange={handleChange("customer")} size="small" fullWidth>
            <MenuItem value="">Select customer</MenuItem>
            {customerOptions.map((customer) => (
              <MenuItem key={customer} value={customer}>
                {customer}
              </MenuItem>
            ))}
          </TextField>
          <TextField select label="Invoice Type" value={value.type} onChange={handleChange("type")} size="small" fullWidth>
            {["Advance", "Milestone", "Support", "Final"].map((type) => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </TextField>
          <TextField label="Amount" value={value.amount} onChange={handleChange("amount")} size="small" fullWidth />
          <TextField label="Paid Amount" value={value.paidAmount} onChange={handleChange("paidAmount")} size="small" fullWidth />
          <TextField label="Due Date" type="date" value={value.dueDate} onChange={handleChange("dueDate")} size="small" fullWidth InputLabelProps={{ shrink: true }} />
          <TextField select label="Status" value={value.status} onChange={handleChange("status")} size="small" fullWidth>
            {invoiceStatusOptions.map((status) => (
              <MenuItem key={status} value={status}>
                {status}
              </MenuItem>
            ))}
          </TextField>
          <Box sx={{ gridColumn: "1 / -1" }}>
            <TextField
              label="Line Items"
              value={value.lineItems}
              onChange={handleChange("lineItems")}
              multiline
              minRows={4}
              fullWidth
            />
          </Box>
        </Box>
      </DrawerShell>
    </Drawer>
  );
};

type InvoiceDetailDrawerProps = {
  open: boolean;
  invoice: InvoiceRecord | null;
  onClose: () => void;
  onEdit: () => void;
  paymentHistory: TimelineItem[];
  formatCurrency: (amount: number) => string;
};

export const InvoiceDetailDrawer = ({
  open,
  invoice,
  onClose,
  onEdit,
  paymentHistory,
  formatCurrency,
}: InvoiceDetailDrawerProps) => {
  const [activeSection, setActiveSection] = React.useState("overview");

  React.useEffect(() => {
    if (!open) {
      setActiveSection("overview");
    }
  }, [open]);

  return (
    <Drawer anchor="right" open={open} onClose={onClose} sx={detailDrawerPaperSx}>
      <DrawerShell
        title={invoice?.invoiceNo ? `Invoice Detail - ${invoice.invoiceNo}` : "Invoice Detail"}
        subtitle="Commercial tracking and payment timeline in one drawer."
        headerActions={
          <>
            <Button variant="outlined" startIcon={<EditRoundedIcon />} onClick={onEdit} sx={drawerActionButtonSx}>
              Edit
            </Button>
            <Button variant="outlined" onClick={onClose} sx={drawerActionButtonSx}>
              Close
            </Button>
          </>
        }
        footer={
          <>
            <Button variant="contained" startIcon={<SendRoundedIcon />} sx={drawerActionButtonSx}>
              Send Invoice
            </Button>
          </>
        }
      >
        <DrawerSectionTabs
          value={activeSection}
          onChange={setActiveSection}
          tabs={[
            { value: "overview", label: "Overview" },
            { value: "payments", label: "Payments" },
          ]}
        />
        {invoice ? (
          <>
            {activeSection === "overview" ? (
              <Box sx={{ ...projectSurfaceSx, p: 2 }}>
                <DetailsGrid
                  items={[
                    { label: "Invoice", value: invoice.invoiceNo },
                    { label: "Project", value: invoice.project },
                    { label: "Customer", value: invoice.customer },
                    { label: "Type", value: invoice.type },
                    { label: "Status", value: <ProjectStatusBadge status={invoice.status} /> },
                    { label: "Amount", value: formatCurrency(invoice.amount) },
                    { label: "Paid Amount", value: formatCurrency(invoice.paidAmount) },
                    { label: "Due Date", value: invoice.dueDate },
                  ]}
                />
              </Box>
            ) : null}

            {activeSection === "payments" ? (
              <Box sx={{ ...projectSurfaceSx, p: 2 }}>
                <Stack spacing={2}>
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
                      gap: 1.5,
                    }}
                  >
                    <TextField label="Invoice No" defaultValue={invoice.invoiceNo} size="small" />
                    <TextField label="Payment Amount" defaultValue={invoice.paidAmount} size="small" />
                    <TextField select label="Payment Mode" defaultValue="Bank Transfer" size="small">
                      <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
                      <MenuItem value="Cheque">Cheque</MenuItem>
                      <MenuItem value="Cash">Cash</MenuItem>
                    </TextField>
                    <TextField label="Received On" type="date" defaultValue={invoice.dueDate} size="small" InputLabelProps={{ shrink: true }} />
                  </Box>
                  <TimelineList items={paymentHistory} />
                </Stack>
              </Box>
            ) : null}

          </>
        ) : null}
      </DrawerShell>
    </Drawer>
  );
};

export type ScopeFormValues = {
  inquiryNo: string;
  title: string;
  version: string;
  reviewer: string;
  status: ProjectManagementStatus;
  approvalStatus: ProjectManagementStatus;
  submittedOn: string;
  commentCount: string;
};

export const buildInitialScopeFormValues = (
  scope?: ScopeVersionRecord | null,
): ScopeFormValues => ({
  inquiryNo: scope?.inquiryNo ?? "",
  title: scope?.title ?? "",
  version: scope?.version ?? "",
  reviewer: scope?.reviewer ?? "Pooja Mehta",
  status: scope?.status ?? "Pending",
  approvalStatus: scope?.approvalStatus ?? "Pending",
  submittedOn: scope?.submittedOn ?? "",
  commentCount: scope?.commentCount ? String(scope.commentCount) : "0",
});

type ScopeFormDrawerProps = {
  open: boolean;
  mode: "create" | "edit";
  value: ScopeFormValues;
  onChange: (value: ScopeFormValues) => void;
  onClose: () => void;
  onSubmit: () => void;
};

export const ScopeFormDrawer = ({
  open,
  mode,
  value,
  onChange,
  onClose,
  onSubmit,
}: ScopeFormDrawerProps) => {
  const handleChange =
    (field: keyof ScopeFormValues) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      onChange({
        ...value,
        [field]: event.target.value,
      });
    };

  return (
    <Drawer anchor="right" open={open} onClose={onClose} sx={formDrawerPaperSx}>
      <DrawerShell
        title={mode === "edit" ? "Edit Scope Document" : "Create Scope Document"}
        subtitle=""
        headerActions={
          <Button variant="outlined" onClick={onClose} sx={drawerActionButtonSx}>
            Close
          </Button>
        }
        footer={
          <Button variant="contained" onClick={onSubmit} sx={drawerActionButtonSx}>
            {mode === "edit" ? "Save Changes" : "Save Scope"}
          </Button>
        }
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
            gap: 2,
          }}
        >
          <TextField label="Inquiry No" value={value.inquiryNo} onChange={handleChange("inquiryNo")} size="small" fullWidth />
          <TextField label="Version" value={value.version} onChange={handleChange("version")} size="small" fullWidth />
          <Box sx={{ gridColumn: "1 / -1" }}>
            <TextField label="Title" value={value.title} onChange={handleChange("title")} size="small" fullWidth />
          </Box>
          <TextField select label="Reviewer" value={value.reviewer} onChange={handleChange("reviewer")} size="small" fullWidth>
            {peopleOptions.map((person) => (
              <MenuItem key={person} value={person}>
                {person}
              </MenuItem>
            ))}
          </TextField>
          <TextField select label="Status" value={value.status} onChange={handleChange("status")} size="small" fullWidth>
            {scopeStatusOptions.map((status) => (
              <MenuItem key={status} value={status}>
                {status}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Approval Status"
            value={value.approvalStatus}
            onChange={handleChange("approvalStatus")}
            size="small"
            fullWidth
          >
            {scopeStatusOptions.map((status) => (
              <MenuItem key={status} value={status}>
                {status}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Submitted On"
            type="date"
            value={value.submittedOn}
            onChange={handleChange("submittedOn")}
            size="small"
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
          <Box sx={{ gridColumn: "1 / -1" }}>
            <TextField
              label="Comment Count"
              value={value.commentCount}
              onChange={handleChange("commentCount")}
              size="small"
              fullWidth
            />
          </Box>
        </Box>
      </DrawerShell>
    </Drawer>
  );
};

type ScopeDetailDrawerProps = {
  open: boolean;
  scope: ScopeVersionRecord | null;
  onClose: () => void;
  onEdit: () => void;
  comments: CommentItem[];
  attachments: AttachmentItem[];
  approvalTimeline: TimelineItem[];
};

export const ScopeDetailDrawer = ({
  open,
  scope,
  onClose,
  onEdit,
  comments,
  attachments,
  approvalTimeline,
}: ScopeDetailDrawerProps) => {
  const [activeSection, setActiveSection] = React.useState("review");
  const workflowStages = React.useMemo(() => {
    if (!scope) {
      return [];
    }

    const needsAttention =
      scope.status === "Request Changes" || scope.approvalStatus === "Rejected";
    const internalReviewState =
      scope.status === "Pending"
        ? "current"
        : scope.status === "Approved"
          ? "done"
          : scope.status === "In Review" || needsAttention
            ? "current"
            : "pending";
    const customerAlignmentState =
      scope.approvalStatus === "Approved"
        ? "done"
        : needsAttention || scope.approvalStatus === "Pending"
          ? "current"
          : "pending";
    const releaseState = scope.approvalStatus === "Approved" ? "current" : "pending";

    return [
      {
        key: "draft",
        title: "Draft Prepared",
        owner: "Pre-sales",
        helper: `${scope.version} generated from ${scope.inquiryNo}`,
        state: "done",
      },
      {
        key: "review",
        title: "Internal Review",
        owner: scope.reviewer,
        helper: "Architecture and delivery feasibility check",
        state: internalReviewState,
      },
      {
        key: "customer",
        title: "Customer Alignment",
        owner: "Customer SPOC",
        helper: needsAttention ? "Awaiting clarification or format correction" : "Customer sign-off and note closure",
        state: customerAlignmentState,
      },
      {
        key: "approve",
        title: "Baseline Approval",
        owner: "PM / Approver",
        helper: "Lock approved version for project baseline",
        state: releaseState,
      },
    ] as Array<{
      key: string;
      title: string;
      owner: string;
      helper: string;
      state: keyof typeof workflowStateTone;
    }>;
  }, [scope]);

  React.useEffect(() => {
    if (!open) {
      setActiveSection("review");
    }
  }, [open]);

  return (
    <Drawer anchor="right" open={open} onClose={onClose} sx={detailDrawerPaperSx}>
      <DrawerShell
        title={scope?.inquiryNo ? `Scope Detail - ${scope.inquiryNo}` : "Scope Detail"}
        subtitle=""
        headerActions={
          <>
            <Button variant="outlined" startIcon={<EditRoundedIcon />} onClick={onEdit} sx={drawerActionButtonSx}>
              Edit
            </Button>
            <Button variant="contained" startIcon={<CheckCircleOutlineRoundedIcon />} sx={drawerActionButtonSx}>
              Approve
            </Button>
            <Button variant="outlined" onClick={onClose} sx={drawerActionButtonSx}>
              Close
            </Button>
          </>
        }
        footer={
          <></>
        }
      >
        <DrawerSectionTabs
          value={activeSection}
          onChange={setActiveSection}
          tabs={[
            { value: "review", label: "PDF Review" },
            { value: "comments", label: "Comments" },
            { value: "workflow", label: "Workflow" },
          ]}
        />
        {scope ? (
          <>
            {activeSection === "review" ? (
              <Box sx={{ ...projectSurfaceSx, p: 2 }}>
                <Stack spacing={2}>
                  <DetailsGrid
                    items={[
                      { label: "Inquiry", value: scope.inquiryNo },
                      { label: "Title", value: scope.title },
                      { label: "Version", value: scope.version },
                      { label: "Reviewer", value: scope.reviewer },
                      { label: "Status", value: <ProjectStatusBadge status={scope.status} /> },
                      { label: "Approval", value: <ProjectStatusBadge status={scope.approvalStatus} /> },
                      { label: "Submitted On", value: scope.submittedOn },
                      { label: "Comments", value: scope.commentCount },
                    ]}
                  />
                  <Box
                    sx={{
                      minHeight: 360,
                      borderRadius: 2,
                      border: "1px dashed rgba(148,163,184,0.45)",
                      bgcolor: "#F8FAFC",
                      p: 2,
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 800 }}>
                      PDF Preview Area
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Reviewer-friendly PDF preview with in-context comments and approval actions.
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            ) : null}

            {activeSection === "comments" ? (
              <Box
                sx={{
                  ...projectSurfaceSx,
                  p: 0,
                  overflow: "hidden",
                  flex: 1,
                  minHeight: 0,
                  display: "flex",
                }}
              >
                <ProjectCommentsPanel
                  items={comments}
                  threadKey={scope.id}
                  currentAuthor={scope.reviewer}
                  currentRole="Reviewer"
                />
              </Box>
            ) : null}

            {activeSection === "workflow" ? (
              <Box sx={{ ...projectSurfaceSx, p: 2 }}>
                <Stack spacing={2.25}>
                  <Alert severity="info">
                    Internal reviewer, customer SPOC, and final approver chain can be tracked from a single workflow rail.
                  </Alert>
                  <Box
                    sx={{
                      borderRadius: 3,
                      border: "1px solid rgba(148,163,184,0.18)",
                      background:
                        "linear-gradient(180deg, rgba(248,250,252,0.92) 0%, rgba(255,255,255,1) 100%)",
                      p: { xs: 1.5, md: 2 },
                    }}
                  >
                    <Stack
                      direction={{ xs: "column", lg: "row" }}
                      justifyContent="space-between"
                      spacing={1.5}
                    >
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>
                          Scope Approval Workflow
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          Move from drafted scope to approved baseline with clear owners and handoffs.
                        </Typography>
                      </Box>
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        <Chip icon={<FactCheckOutlinedIcon />} label={scope.status} sx={{ fontWeight: 800 }} />
                        <Chip
                          icon={<ScheduleOutlinedIcon />}
                          label={`Due ${scope.submittedOn}`}
                          sx={{ fontWeight: 800 }}
                        />
                        <Chip
                          icon={<RuleFolderOutlinedIcon />}
                          label={`Version ${scope.version}`}
                          sx={{ fontWeight: 800 }}
                        />
                      </Stack>
                    </Stack>

                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", md: "repeat(4, minmax(0, 1fr))" },
                        gap: 1.25,
                        mt: 2,
                      }}
                    >
                      {[
                        {
                          label: "Current Step",
                          value: scope.status,
                          helper: "Live workflow state",
                          icon: <FactCheckOutlinedIcon fontSize="small" />,
                        },
                        {
                          label: "Review Group",
                          value: "3 reviewers",
                          helper: "Pooja, Harshil, Rakesh",
                          icon: <Groups2OutlinedIcon fontSize="small" />,
                        },
                        {
                          label: "Decision Date",
                          value: scope.submittedOn,
                          helper: "Target review checkpoint",
                          icon: <ScheduleOutlinedIcon fontSize="small" />,
                        },
                        {
                          label: "Approval State",
                          value: scope.approvalStatus,
                          helper: "Baseline release readiness",
                          icon: <CheckCircleOutlineRoundedIcon fontSize="small" />,
                        },
                      ].map((item) => (
                        <Box
                          key={item.label}
                          sx={{
                            borderRadius: 2.5,
                            border: "1px solid rgba(148,163,184,0.16)",
                            bgcolor: "rgba(255,255,255,0.82)",
                            p: 1.5,
                          }}
                        >
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Box sx={{ color: "#2563EB", display: "inline-flex" }}>{item.icon}</Box>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800 }}>
                              {item.label}
                            </Typography>
                          </Stack>
                          <Typography variant="body1" sx={{ mt: 1, fontWeight: 900 }}>
                            {item.value}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                            {item.helper}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>

                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", xl: "minmax(0, 1.35fr) minmax(320px, 0.85fr)" },
                      gap: 2,
                    }}
                  >
                    <Box
                      sx={{
                        borderRadius: 3,
                        border: "1px solid rgba(148,163,184,0.18)",
                        p: { xs: 1.5, md: 2 },
                        bgcolor: "rgba(248,250,252,0.7)",
                      }}
                    >
                      <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>
                        Workflow Rail
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        Each stage shows who owns the next move and whether the scope is ready to progress.
                      </Typography>

                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: { xs: "1fr", md: "repeat(4, minmax(0, 1fr))" },
                          gap: 1.25,
                          mt: 2,
                        }}
                      >
                        {workflowStages.map((stage, index) => {
                          const tone = workflowStateTone[stage.state];

                          return (
                            <Box
                              key={stage.key}
                              sx={{
                                position: "relative",
                                borderRadius: 2.5,
                                p: 1.5,
                                minHeight: 158,
                                border: `1px solid ${tone.border}`,
                                bgcolor: tone.bg,
                              }}
                            >
                              {index < workflowStages.length - 1 ? (
                                <Box
                                  sx={{
                                    position: "absolute",
                                    top: 22,
                                    right: -12,
                                    width: 24,
                                    height: 2,
                                    bgcolor: tone.accent,
                                    display: { xs: "none", md: "block" },
                                    opacity: 0.35,
                                  }}
                                />
                              ) : null}
                              <Stack spacing={1.2}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                  <Box
                                    sx={{
                                      width: 14,
                                      height: 14,
                                      borderRadius: "50%",
                                      bgcolor: tone.accent,
                                      boxShadow: `0 0 0 4px ${tone.bg}`,
                                    }}
                                  />
                                  <Chip
                                    label={tone.label}
                                    size="small"
                                    sx={{
                                      fontWeight: 800,
                                      bgcolor: "#FFFFFF",
                                      color: tone.accent,
                                    }}
                                  />
                                </Stack>
                                <Box>
                                  <Typography variant="body1" sx={{ fontWeight: 900 }}>
                                    {stage.title}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.6 }}>
                                    {stage.helper}
                                  </Typography>
                                </Box>
                                <Box sx={{ mt: "auto" }}>
                                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800 }}>
                                    Owner
                                  </Typography>
                                  <Typography variant="body2" sx={{ mt: 0.4, fontWeight: 700 }}>
                                    {stage.owner}
                                  </Typography>
                                </Box>
                              </Stack>
                            </Box>
                          );
                        })}
                      </Box>
                    </Box>

                    <Stack spacing={2}>
                      <Box
                        sx={{
                          borderRadius: 3,
                          border: "1px solid rgba(148,163,184,0.18)",
                          p: { xs: 1.5, md: 2 },
                          bgcolor: "rgba(255,255,255,0.88)",
                        }}
                      >
                        <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>
                          Decision Desk
                        </Typography>
                        <Stack spacing={1.4} sx={{ mt: 1.5 }}>
                          <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800 }}>
                              Current Action
                            </Typography>
                            <Box sx={{ mt: 0.7 }}>
                              <ProjectStatusBadge status={scope.status} />
                            </Box>
                          </Box>
                          <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800 }}>
                              Reviewer Group
                            </Typography>
                            <Stack direction="row" spacing={0.8} useFlexGap flexWrap="wrap" sx={{ mt: 0.8 }}>
                              {["Pooja Mehta", "Harshil Vyas", "Rakesh Atlas"].map((person) => (
                                <Chip key={person} label={person} size="small" variant="outlined" />
                              ))}
                            </Stack>
                          </Box>
                          <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800 }}>
                              Approval Note
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.7, lineHeight: 1.6 }}>
                              Waiting for final customer report format sign-off before baseline lock.
                            </Typography>
                          </Box>
                        </Stack>
                      </Box>

                      <Box
                        sx={{
                          borderRadius: 3,
                          border: "1px solid rgba(148,163,184,0.18)",
                          p: { xs: 1.5, md: 2 },
                          bgcolor: "rgba(248,250,252,0.8)",
                        }}
                      >
                        <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>
                          Activity Trail
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 1.5 }}>
                          Latest workflow events across drafting, review, and approval.
                        </Typography>
                        <TimelineList items={approvalTimeline} />
                      </Box>
                    </Stack>
                  </Box>
                </Stack>
              </Box>
            ) : null}
          </>
        ) : null}
      </DrawerShell>
    </Drawer>
  );
};
