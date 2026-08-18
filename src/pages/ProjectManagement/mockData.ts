export type ProjectManagementStatus =
  | "New"
  | "Pending"
  | "Request Changes"
  | "In Review"
  | "Approved"
  | "Rejected"
  | "Active"
  | "Planned"
  | "On Hold"
  | "Completed"
  | "Overdue"
  | "Blocked"
  | "Paused"
  | "Open"
  | "Resolved"
  | "Sent"
  | "Paid"
  | "Partially Paid";

export type PriorityLevel = "Critical" | "High" | "Medium" | "Low";

export type CommentItem = {
  id: string;
  author: string;
  role: string;
  message: string;
  time: string;
  channel: "Internal" | "Customer";
  attachments?: string[];
  replies?: CommentItem[];
};

export type AttachmentItem = {
  id: string;
  name: string;
  kind: "PDF" | "Image" | "Video" | "Doc" | "Sheet" | "Archive";
  size: string;
  uploadedBy: string;
  uploadedAt: string;
};

export type TimelineItem = {
  id: string;
  title: string;
  subtitle: string;
  time: string;
  actor?: string;
  color?: string;
};

export type InquiryRecord = {
  id: string;
  inquiryNo: string;
  customer: string;
  title: string;
  requirement: string;
  priority: PriorityLevel;
  status: ProjectManagementStatus;
  owner: string;
  createdOn: string;
  updatedOn: string;
  attachmentCount: number;
  targetDate: string;
};

export type ScopeVersionRecord = {
  id: string;
  inquiryNo: string;
  version: string;
  title: string;
  reviewer: string;
  status: ProjectManagementStatus;
  approvalStatus: ProjectManagementStatus;
  submittedOn: string;
  commentCount: number;
};

export type ProjectRecord = {
  id: string;
  code: string;
  name: string;
  customer: string;
  leader: string;
  secondaryLeader: string;
  team: string[];
  status: ProjectManagementStatus;
  progress: number;
  startDate: string;
  dueDate: string;
  approvedScope: string;
  plannedHours: number;
  actualHours: number;
  workload: string;
};

export type ProjectPlanningPhaseRecord = {
  id: string;
  name: string;
  progress: number;
  hours: number;
  owner?: string;
  source?: string;
};

export type ProjectPlanningSubmoduleRecord = {
  id: string;
  name: string;
  phases: ProjectPlanningPhaseRecord[];
};

export type ProjectPlanningModuleRecord = {
  id: string;
  module: string;
  submodules: ProjectPlanningSubmoduleRecord[];
};

export type ProjectTeamAllocationRecord = {
  id: string;
  member: string;
  role: string;
  module: string;
  submodule: string;
  plannedHours: number;
};

export type ProjectPlanningRecord = {
  projectId: string;
  inquiryNo: string;
  implementationNotes: string;
  modules: ProjectPlanningModuleRecord[];
  teamAllocations: ProjectTeamAllocationRecord[];
};

export type BacklogRecord = {
  id: string;
  ticketNo: string;
  project: string;
  module: string;
  submodule: string;
  phase: string;
  type: "Feature" | "Bug" | "Improvement" | "Task";
  priority: PriorityLevel;
  assignee: string;
  status: ProjectManagementStatus;
  estimateHours: number;
  actualHours: number;
  dueDate: string;
  dependency: string;
};

export type SupportRecord = {
  id: string;
  ticketNo: string;
  customer: string;
  project: string;
  issue: string;
  priority: PriorityLevel;
  assignee: string;
  status: ProjectManagementStatus;
  openedAt: string;
  resolutionTime: string;
};

export type InvoiceRecord = {
  id: string;
  invoiceNo: string;
  project: string;
  customer: string;
  type: "Advance" | "Milestone" | "Support" | "Final";
  amount: number;
  dueDate: string;
  status: ProjectManagementStatus;
  paidAmount: number;
};

export type KanbanCardRecord = {
  id: string;
  title: string;
  code: string;
  project: string;
  assignee: string;
  priority: PriorityLevel;
  dueDate: string;
  estimateHours: number;
  stageEnteredAt?: string;
  stagePausedAt?: string;
  stagePausedDurationMs?: number;
  description?: string;
  module?: string;
  tags?: string[];
};

export type KanbanColumnRecord = {
  id: string;
  title: string;
  status: ProjectManagementStatus | string;
  wipLimit: number;
  cards: KanbanCardRecord[];
};

export const dashboardMetrics = [
  {
    id: "pending-inquiry",
    label: "Pending Inquiry",
    value: "18",
    helper: "Need sizing or scope review",
    color: "#D97706",
  },
  {
    id: "active-project",
    label: "Active Project",
    value: "12",
    helper: "Running against approved scope",
    color: "#2563EB",
  },
  {
    id: "support-work",
    label: "Support Work",
    value: "7",
    helper: "Customer issues open today",
    color: "#7C3AED",
  },
  {
    id: "overdue-task",
    label: "Overdue Task",
    value: "9",
    helper: "Immediate follow-up required",
    color: "#DC2626",
  },
] as const;

export const recentActivities: TimelineItem[] = [
  {
    id: "act-1",
    title: "Scope v2 shared with customer",
    subtitle: "HL-ENQ-1025 for Atlas Pumps",
    time: "10 min ago",
    actor: "Hetal Shah",
    color: "#2563EB",
  },
  {
    id: "act-2",
    title: "Support ticket moved to resolved",
    subtitle: "SUP-210 for Radial Gearbox runtime alert",
    time: "35 min ago",
    actor: "Nirav Patel",
    color: "#059669",
  },
  {
    id: "act-3",
    title: "Invoice INV-2408 sent",
    subtitle: "Milestone invoice for Nova Line Revamp",
    time: "1 hr ago",
    actor: "Finance Desk",
    color: "#7C3AED",
  },
  {
    id: "act-4",
    title: "Backlog dependency marked blocked",
    subtitle: "BL-431 waiting for PLC IO mapping",
    time: "2 hr ago",
    actor: "Project PMO",
    color: "#DC2626",
  },
];

export const inquiryRecords: InquiryRecord[] = [
  {
    id: "inq-1",
    inquiryNo: "HL-ENQ-1025",
    customer: "Atlas Pumps",
    title: "Assembly traceability portal",
    requirement: "Need QR-based traceability, audit logs and report export for three plants.",
    priority: "Critical",
    status: "In Review",
    owner: "Hetal Shah",
    createdOn: "2026-08-01",
    updatedOn: "2026-08-06",
    attachmentCount: 4,
    targetDate: "2026-08-09",
  },
  {
    id: "inq-2",
    inquiryNo: "HL-ENQ-1022",
    customer: "Nova Industries",
    title: "Production dashboard upgrade",
    requirement: "Replace current dashboard with role-based KPI board and downtime analytics.",
    priority: "High",
    status: "Approved",
    owner: "Krina Mehta",
    createdOn: "2026-07-28",
    updatedOn: "2026-08-04",
    attachmentCount: 2,
    targetDate: "2026-08-08",
  },
  {
    id: "inq-3",
    inquiryNo: "HL-ENQ-1018",
    customer: "Prime Cast",
    title: "Mobile inspection checklist",
    requirement: "Tablet-first checklist with image upload, offline mode and approval history.",
    priority: "Medium",
    status: "Pending",
    owner: "Jinal Desai",
    createdOn: "2026-07-25",
    updatedOn: "2026-08-05",
    attachmentCount: 3,
    targetDate: "2026-08-11",
  },
  {
    id: "inq-4",
    inquiryNo: "HL-ENQ-1012",
    customer: "Zenith Cables",
    title: "Dispatch documentation workflow",
    requirement: "Create dispatch document workflow with customer acknowledgment and PDF mailer.",
    priority: "Low",
    status: "Rejected",
    owner: "Maulik Rana",
    createdOn: "2026-07-18",
    updatedOn: "2026-07-30",
    attachmentCount: 1,
    targetDate: "2026-08-02",
  },
];

export const inquiryComments: CommentItem[] = [
  {
    id: "inq-comment-1",
    author: "Hetal Shah",
    role: "Pre-sales",
    message: "Customer confirmed user roles and wants plant-wise filtering in reporting.",
    time: "Today, 09:20 AM",
    channel: "Internal",
    replies: [
      {
        id: "inq-comment-1-1",
        author: "Pooja Mehta",
        role: "Solution Architect",
        message: "Included in revised requirement note. Scope impact is around 12 extra hours.",
        time: "Today, 09:42 AM",
        channel: "Internal",
      },
    ],
  },
  {
    id: "inq-comment-2",
    author: "Rakesh Atlas",
    role: "Customer",
    message: "Please keep the mobile screens simple because operators will use shared devices.",
    time: "Yesterday, 04:18 PM",
    channel: "Customer",
  },
];

export const sharedAttachments: AttachmentItem[] = [
  {
    id: "att-1",
    name: "Requirement Note v2.pdf",
    kind: "PDF",
    size: "1.4 MB",
    uploadedBy: "Hetal Shah",
    uploadedAt: "2026-08-05 17:20",
  },
  {
    id: "att-2",
    name: "Screen Reference.png",
    kind: "Image",
    size: "860 KB",
    uploadedBy: "Rakesh Atlas",
    uploadedAt: "2026-08-05 11:10",
  },
  {
    id: "att-3",
    name: "Plant Walkthrough.mp4",
    kind: "Video",
    size: "12.2 MB",
    uploadedBy: "Rakesh Atlas",
    uploadedAt: "2026-08-04 15:42",
  },
];

export const scopeVersions: ScopeVersionRecord[] = [
  {
    id: "scope-1",
    inquiryNo: "HL-ENQ-1025",
    version: "v2.0",
    title: "Assembly traceability portal",
    reviewer: "Pooja Mehta",
    status: "In Review",
    approvalStatus: "Pending",
    submittedOn: "2026-08-06",
    commentCount: 6,
  },
  {
    id: "scope-2",
    inquiryNo: "HL-ENQ-1022",
    version: "v1.1",
    title: "Production dashboard upgrade",
    reviewer: "Harshil Vyas",
    status: "Approved",
    approvalStatus: "Approved",
    submittedOn: "2026-08-04",
    commentCount: 3,
  },
  {
    id: "scope-3",
    inquiryNo: "HL-ENQ-1018",
    version: "v1.0",
    title: "Mobile inspection checklist",
    reviewer: "Daxesh Shah",
    status: "Request Changes",
    approvalStatus: "Rejected",
    submittedOn: "2026-08-03",
    commentCount: 9,
  },
] as unknown as ScopeVersionRecord[];

export const scopeApprovalTimeline: TimelineItem[] = [
  {
    id: "scope-time-1",
    title: "Review sent to architecture and customer SPOC",
    subtitle: "Reviewer group: Pooja, Harshil, Rakesh",
    time: "06 Aug 2026, 09:30 AM",
    color: "#2563EB",
  },
  {
    id: "scope-time-2",
    title: "Customer requested minor report format change",
    subtitle: "Attachment added with expected report sample",
    time: "05 Aug 2026, 04:18 PM",
    color: "#D97706",
  },
  {
    id: "scope-time-3",
    title: "Version v2.0 generated from inquiry",
    subtitle: "Previous draft v1.0 archived",
    time: "05 Aug 2026, 11:05 AM",
    color: "#7C3AED",
  },
];

export const projectRecords: ProjectRecord[] = [
  {
    id: "proj-1",
    code: "PRJ-2408",
    name: "Atlas Traceability",
    customer: "Atlas Pumps",
    leader: "Krina Mehta",
    secondaryLeader: "Maulik Rana",
    team: ["Hetal", "Nirav", "Dhruvi", "Parth"],
    status: "Active",
    progress: 64,
    startDate: "2026-08-01",
    dueDate: "2026-09-28",
    approvedScope: "HL-ENQ-1025 / v2.0",
    plannedHours: 420,
    actualHours: 233,
    workload: "Balanced",
  },
  {
    id: "proj-2",
    code: "PRJ-2406",
    name: "Nova Line Revamp",
    customer: "Nova Industries",
    leader: "Harshil Vyas",
    secondaryLeader: "Pooja Mehta",
    team: ["Devang", "Apeksha", "Sagar"],
    status: "On Hold",
    progress: 38,
    startDate: "2026-07-10",
    dueDate: "2026-09-12",
    approvedScope: "HL-ENQ-1022 / v1.1",
    plannedHours: 320,
    actualHours: 162,
    workload: "High",
  },
  {
    id: "proj-3",
    code: "PRJ-2405",
    name: "Prime Inspection Mobile",
    customer: "Prime Cast",
    leader: "Jinal Desai",
    secondaryLeader: "Hetal Shah",
    team: ["Tirth", "Deep", "Bhavya"],
    status: "Planned",
    progress: 12,
    startDate: "2026-08-12",
    dueDate: "2026-10-03",
    approvedScope: "HL-ENQ-1018 / v1.0",
    plannedHours: 280,
    actualHours: 16,
    workload: "Open Capacity",
  },
];

export const modulePlanningTree: ProjectPlanningModuleRecord[] = [
  {
    id: "mod-1",
    module: "Platform Setup",
    submodules: [
      {
        id: "sub-1",
        name: "Authentication",
        phases: [
          {
            id: "phase-1",
            name: "Analysis",
            progress: 100,
            hours: 18,
            owner: "Krina Mehta",
            source: "Requirement workshop + architecture review",
          },
          {
            id: "phase-2",
            name: "Development",
            progress: 72,
            hours: 62,
            owner: "Nirav Patel",
            source: "Summed from planned backlog development items",
          },
          {
            id: "phase-3",
            name: "UAT",
            progress: 20,
            hours: 8,
            owner: "Dhruvi Patel",
            source: "Test scripts, fixes, and sign-off cycle",
          },
        ],
      },
      {
        id: "sub-2",
        name: "Master Data",
        phases: [
          {
            id: "phase-4",
            name: "Analysis",
            progress: 100,
            hours: 12,
            owner: "Hetal Shah",
            source: "Master mapping discussion with customer",
          },
          {
            id: "phase-5",
            name: "Development",
            progress: 58,
            hours: 34,
            owner: "Parth Solanki",
            source: "CRUD scope and import validations estimate",
          },
        ],
      },
    ],
  },
  {
    id: "mod-2",
    module: "Operations",
    submodules: [
      {
        id: "sub-3",
        name: "Traceability Board",
        phases: [
          {
            id: "phase-6",
            name: "Design",
            progress: 100,
            hours: 21,
            owner: "Pooja Mehta",
            source: "UI flow, scan events, and dashboard wireframes",
          },
          {
            id: "phase-7",
            name: "Development",
            progress: 45,
            hours: 49,
            owner: "Nirav Patel",
            source: "API integration and event processing backlog sum",
          },
          {
            id: "phase-8",
            name: "Pilot",
            progress: 0,
            hours: 0,
            owner: "Maulik Rana",
            source: "Pending PM estimation after customer dry run plan",
          },
        ],
      },
    ],
  },
];

export const backlogRecords: BacklogRecord[] = [
  {
    id: "bl-1",
    ticketNo: "BL-431",
    project: "Atlas Traceability",
    module: "Operations",
    submodule: "Traceability Board",
    phase: "Development",
    type: "Feature",
    priority: "Critical",
    assignee: "Nirav Patel",
    status: "Blocked",
    estimateHours: 24,
    actualHours: 11,
    dueDate: "2026-08-08",
    dependency: "Waiting for PLC IO mapping",
  },
  {
    id: "bl-2",
    ticketNo: "BL-426",
    project: "Atlas Traceability",
    module: "Platform Setup",
    submodule: "Authentication",
    phase: "Development",
    type: "Feature",
    priority: "High",
    assignee: "Dhruvi Patel",
    status: "Active",
    estimateHours: 16,
    actualHours: 9,
    dueDate: "2026-08-09",
    dependency: "No blockers",
  },
  {
    id: "bl-3",
    ticketNo: "BL-415",
    project: "Nova Line Revamp",
    module: "Analytics",
    submodule: "Dashboard",
    phase: "UAT",
    type: "Bug",
    priority: "Medium",
    assignee: "Sagar Parmar",
    status: "Overdue",
    estimateHours: 8,
    actualHours: 10,
    dueDate: "2026-08-03",
    dependency: "Need revised downtime formula sign-off",
  },
];

export const statusHistory: TimelineItem[] = [
  {
    id: "status-1",
    title: "Blocked -> Active",
    subtitle: "Changed by Krina Mehta. Reason: mapping shared by automation team.",
    time: "04 Aug 2026, 11:20 AM",
    color: "#059669",
  },
  {
    id: "status-2",
    title: "Active -> Blocked",
    subtitle: "Changed by Nirav Patel. Reason: waiting for PLC IO mapping.",
    time: "03 Aug 2026, 06:10 PM",
    color: "#DC2626",
  },
  {
    id: "status-3",
    title: "Planned -> Active",
    subtitle: "Changed by Krina Mehta. Duration in planned state: 2 days.",
    time: "02 Aug 2026, 10:00 AM",
    color: "#2563EB",
  },
];

export const assignmentHistory: TimelineItem[] = [
  {
    id: "assign-1",
    title: "Assigned to Nirav Patel",
    subtitle: "Current owner since sprint 32 planning",
    time: "02 Aug 2026, 09:15 AM",
    color: "#2563EB",
  },
  {
    id: "assign-2",
    title: "Previously with Dhruvi Patel",
    subtitle: "Moved after backend API merge completed",
    time: "30 Jul 2026, 05:40 PM",
    color: "#7C3AED",
  },
];

export const backlogDependencies: TimelineItem[] = [
  {
    id: "dep-1",
    title: "Blocked by automation IO sheet",
    subtitle: "External dependency owned by Atlas PLC vendor",
    time: "Open dependency",
    color: "#DC2626",
  },
  {
    id: "dep-2",
    title: "Blocks UAT report verification",
    subtitle: "Pilot checklist cannot continue until scan event schema is frozen",
    time: "Downstream impact",
    color: "#D97706",
  },
];

export const kanbanColumns: KanbanColumnRecord[] = [
  {
    id: "kanban-1",
    title: "To Do",
    status: "Planned",
    wipLimit: 8,
    cards: [
      {
        id: "k-card-1",
        title: "Role mapping review",
        code: "BL-442",
        project: "Atlas Traceability",
        assignee: "Hetal Shah",
        priority: "Medium",
        dueDate: "2026-08-10",
        estimateHours: 6,
        module: "User Access",
        description: "Validate role mapping with customer approval matrix and update final permissions.",
        tags: ["RBAC", "Workshop"],
      },
      {
        id: "k-card-2",
        title: "Dispatch email template",
        code: "BL-446",
        project: "Nova Line Revamp",
        assignee: "Apeksha Shah",
        priority: "Low",
        dueDate: "2026-08-11",
        estimateHours: 5,
        module: "Mailer",
        description: "Prepare dispatch email template with customer branding and PDF attachment placeholders.",
        tags: ["Email", "Template"],
      },
    ],
  },
  {
    id: "kanban-2",
    title: "In Progress",
    status: "Active",
    wipLimit: 5,
    cards: [
      {
        id: "k-card-3",
        title: "Scan event API integration",
        code: "BL-426",
        project: "Atlas Traceability",
        assignee: "Dhruvi Patel",
        priority: "High",
        dueDate: "2026-08-09",
        estimateHours: 16,
        stageEnteredAt: "2026-08-13T09:05:00",
        stagePausedDurationMs: 0,
        module: "Integration",
        description: "Integrate scan event API, validate payload mapping, and handle retry logic.",
        tags: ["API", "Scanner"],
      },
      {
        id: "k-card-4",
        title: "Machine KPI chart polish",
        code: "BL-419",
        project: "Nova Line Revamp",
        assignee: "Sagar Parmar",
        priority: "Medium",
        dueDate: "2026-08-08",
        estimateHours: 9,
        module: "Dashboard",
        description: "Refine machine KPI charts, colors, and tooltip clarity for customer demo.",
        tags: ["UI", "Charts"],
      },
    ],
  },
  {
    id: "kanban-3",
    title: "Review",
    status: "In Review",
    wipLimit: 4,
    cards: [
      {
        id: "k-card-5",
        title: "Scope comparison sheet",
        code: "BL-438",
        project: "Atlas Traceability",
        assignee: "Krina Mehta",
        priority: "High",
        dueDate: "2026-08-07",
        estimateHours: 4,
        module: "Scope Review",
        description: "Prepare scope comparison sheet for architecture and customer review round.",
        tags: ["Scope", "Review"],
      },
    ],
  },
  {
    id: "kanban-4",
    title: "Done",
    status: "Completed",
    wipLimit: 999,
    cards: [
      {
        id: "k-card-6",
        title: "Operator permissions matrix",
        code: "BL-408",
        project: "Atlas Traceability",
        assignee: "Parth Solanki",
        priority: "Low",
        dueDate: "2026-08-05",
        estimateHours: 7,
        module: "Admin",
        description: "Finalize operator permissions matrix and publish approved access combinations.",
        tags: ["Permissions", "Release"],
      },
    ],
  },
];

export const supportRecords: SupportRecord[] = [
  {
    id: "sup-1",
    ticketNo: "SUP-210",
    customer: "Atlas Pumps",
    project: "Atlas Traceability",
    issue: "Runtime alert not clearing after operator acknowledgment.",
    priority: "Critical",
    assignee: "Nirav Patel",
    status: "Active",
    openedAt: "2026-08-06 09:05",
    resolutionTime: "01h 24m",
  },
  {
    id: "sup-2",
    ticketNo: "SUP-206",
    customer: "Nova Industries",
    project: "Nova Line Revamp",
    issue: "KPI export CSV header mismatch.",
    priority: "High",
    assignee: "Apeksha Shah",
    status: "Resolved",
    openedAt: "2026-08-05 15:18",
    resolutionTime: "03h 10m",
  },
  {
    id: "sup-3",
    ticketNo: "SUP-203",
    customer: "Prime Cast",
    project: "Prime Inspection Mobile",
    issue: "Tablet camera permission blocked on Android 14 device.",
    priority: "Medium",
    assignee: "Bhavya Trivedi",
    status: "Pending",
    openedAt: "2026-08-05 11:06",
    resolutionTime: "Pending",
  },
];

export const supportInterruptions: TimelineItem[] = [
  {
    id: "interrupt-1",
    title: "Atlas support interrupted BL-426",
    subtitle: "Pause reason: production line stopped at Plant 2",
    time: "Today, 09:07 AM",
    color: "#DC2626",
  },
  {
    id: "interrupt-2",
    title: "Resume previous work after support closure",
    subtitle: "Developer returned to authentication backlog",
    time: "Yesterday, 06:32 PM",
    color: "#059669",
  },
];

export const activeWorkCards = [
  {
    id: "work-1",
    title: "Current active work",
    primary: "BL-426 Scan event API integration",
    secondary: "Running for 01h 12m under Atlas Traceability",
    accent: "#2563EB",
  },
  {
    id: "work-2",
    title: "Paused task",
    primary: "BL-431 PLC mapping follow-up",
    secondary: "Paused 14 min ago due to support escalation",
    accent: "#D97706",
  },
];

export const invoiceRecords: InvoiceRecord[] = [
  {
    id: "inv-1",
    invoiceNo: "INV-2408",
    project: "Nova Line Revamp",
    customer: "Nova Industries",
    type: "Milestone",
    amount: 425000,
    dueDate: "2026-08-15",
    status: "Sent",
    paidAmount: 0,
  },
  {
    id: "inv-2",
    invoiceNo: "INV-2405",
    project: "Atlas Traceability",
    customer: "Atlas Pumps",
    type: "Advance",
    amount: 275000,
    dueDate: "2026-08-10",
    status: "Partially Paid",
    paidAmount: 175000,
  },
  {
    id: "inv-3",
    invoiceNo: "INV-2398",
    project: "Prime Inspection Mobile",
    customer: "Prime Cast",
    type: "Support",
    amount: 86000,
    dueDate: "2026-08-02",
    status: "Overdue",
    paidAmount: 0,
  },
];

export const paymentHistory: TimelineItem[] = [
  {
    id: "pay-1",
    title: "Received partial payment of Rs. 1,75,000",
    subtitle: "Against INV-2405 via bank transfer",
    time: "05 Aug 2026, 03:12 PM",
    color: "#059669",
  },
  {
    id: "pay-2",
    title: "Reminder mail sent for INV-2398",
    subtitle: "Customer finance SPOC copied with aging note",
    time: "04 Aug 2026, 10:00 AM",
    color: "#D97706",
  },
];

export const reportCards = [
  {
    id: "report-1",
    title: "Project Progress Report",
    value: "81%",
    helper: "Average completion across active modules",
    color: "#2563EB",
  },
  {
    id: "report-2",
    title: "Estimated vs Actual",
    value: "+46h",
    helper: "Variance across tracked delivery work",
    color: "#D97706",
  },
  {
    id: "report-3",
    title: "Support Resolution",
    value: "4.6h",
    helper: "Average time to resolve high-priority issues",
    color: "#7C3AED",
  },
  {
    id: "report-4",
    title: "Invoice Recovery",
    value: "68%",
    helper: "Paid vs invoiced this month",
    color: "#059669",
  },
] as const;

export const workloadRows = [
  { id: "wl-1", user: "Nirav Patel", activeWork: 2, assignedHours: 34, capacity: 40, status: "High" },
  { id: "wl-2", user: "Dhruvi Patel", activeWork: 3, assignedHours: 28, capacity: 40, status: "Balanced" },
  { id: "wl-3", user: "Apeksha Shah", activeWork: 2, assignedHours: 19, capacity: 40, status: "Open" },
];

export const notificationItems: TimelineItem[] = [
  {
    id: "noti-1",
    title: "Customer comment added on scope review",
    subtitle: "Atlas Pumps mentioned mobile UX concern",
    time: "Unread",
    color: "#2563EB",
  },
  {
    id: "noti-2",
    title: "Support timer running for more than 1 hour",
    subtitle: "SUP-210 needs closure note or escalation",
    time: "Unread",
    color: "#D97706",
  },
  {
    id: "noti-3",
    title: "Invoice INV-2398 became overdue",
    subtitle: "Finance follow-up needed today",
    time: "Read",
    color: "#DC2626",
  },
];
