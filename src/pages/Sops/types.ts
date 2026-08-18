export type SopLevel = "Level 2" | "Level 3";

export type SopStage =
  | "Draft"
  | "Checker Review"
  | "Approver Review"
  | "Authorizer Review"
  | "Authorized"
  | "Released"
  | "Rejected"
  | "Archived";

export type SopPriority = "Critical" | "High" | "Medium" | "Low";

export type SopAction =
  | "Created"
  | "Updated"
  | "Revision Draft Created"
  | "Submitted"
  | "Returned"
  | "Rejected"
  | "Approved"
  | "Authorized"
  | "Released to Users"
  | "Released"
  | "Viewed"
  | "Archived"
  | "Downloaded Attempt";

export type SopWorkflowButtonAction =
  | "Submit"
  | "Revise"
  | "Return"
  | "Reject"
  | "Approve"
  | "Authorize"
  | "Release"
  | "Archive";

export interface SopStructuredContentBlock {
  title: string;
  html: string;
}

export interface SopDocumentRecord {
  id: string;
  sopNumber: string;
  title: string;
  subject: string;
  level: SopLevel;
  category: string;
  division: string;
  department: string;
  owner: string;
  checker: string;
  approver: string;
  authorizer: string;
  status: SopStage;
  version: string;
  draftCode: string;
  effectiveDate: string;
  reviewDate: string;
  createdAt: string;
  updatedAt: string;
  keywords: string[];
  changeSummary: string;
  priority: SopPriority;
  pendingSinceDays: number;
  trainingRequired: boolean;
  acknowledgementsPending: number;
  viewersToday: number;
  secureViewCount: number;
  distributionCount: number;
  purpose: string;
  scope: string;
  workflowLabel: string;
  structuredContent: SopStructuredContentBlock[];
  contentSource: "editor" | "file";
  contentFileName: string | null;
  contentFileUrl: string | null;
  currentReleasedVersion: string | null;
}

export interface SopVersionRecord {
  id: string;
  sopId: string;
  version: string;
  stage: SopStage;
  revisionDate: string;
  revisedBy: string;
  changeSummary: string;
  releaseDate?: string;
  approvalTrail: string;
}

export interface SopWorkflowTask {
  id: string;
  sopId: string;
  sopNumber: string;
  title: string;
  assignedTo: string;
  role: "Creator" | "Checker" | "Approver" | "Authorizer";
  stage: SopStage;
  dueDate: string;
  ageDays: number;
  slaStatus: "On Track" | "Due Today" | "Breached";
  comments: string;
  availableActions: SopWorkflowButtonAction[];
}

export interface SopAuditRecord {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: SopAction;
  module: string;
  sopNumber: string;
  oldValue: string;
  newValue: string;
  ipAddress: string;
  device: string;
}

export interface SopReportRecord {
  id: string;
  reportName: string;
  description: string;
  frequency: string;
  owner: string;
  lastGenerated: string;
  format: "PDF" | "XLSX" | "CSV";
  status: "Ready" | "Scheduled" | "Needs Review";
}

export interface SopMasterRecord {
  id: string;
  type: "Company" | "Division" | "Department" | "Category" | "Workflow" | "Role";
  name: string;
  code: string;
  owner: string;
  status: "Active" | "Draft";
  updatedAt: string;
  notes: string;
  contentHeaders?: string[];
}

export interface SopWorkflowStageRecord {
  id: string;
  stageName: string;
  sequence: number;
  roleResponsible: string;
  dueDays: number;
  escalationAfterDays: number;
  availableActions: string[];
}

export interface SopWorkflowConfigurationRecord {
  id: string;
  scopeCompany: string;
  scopeDivision: string;
  scopeDepartment: string;
  creatorRole: string;
  checkerRole: string;
  approverRole: string;
  authorizerRole: string;
  escalationRole: string;
  activeStatus: "Active" | "Draft";
  reminderFrequency: string;
  auditRequired: boolean;
}
