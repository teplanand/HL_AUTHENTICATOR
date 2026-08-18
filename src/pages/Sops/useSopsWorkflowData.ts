import React from "react";
import { useToast } from "../../../shared/hooks/useToast";
import { sopAuditRecords, sopDocuments, sopMasterRecords, sopVersions } from "./mockData";
import { hydrateDocumentsWithUploadedPdfs, syncUploadedPdfStore } from "./uploadedPdfStore";
import type {
  SopAction,
  SopAuditRecord,
  SopDocumentRecord,
  SopMasterRecord,
  SopStage,
  SopStructuredContentBlock,
  SopVersionRecord,
  SopWorkflowButtonAction,
  SopWorkflowTask,
} from "./types";

const STORAGE_KEY = "sops-workflow-live-state-v2";
const SYNC_EVENT = "sops-workflow-sync";

type StoredWorkflowState = {
  documents: SopDocumentRecord[];
  versions: SopVersionRecord[];
  audits: SopAuditRecord[];
  masterRecords: SopMasterRecord[];
};

type WorkflowSyncEventDetail = {
  state?: StoredWorkflowState;
};

type SopDocumentUpdateInput = Pick<
  SopDocumentRecord,
  | "sopNumber"
  | "title"
  | "subject"
  | "level"
  | "category"
  | "division"
  | "department"
  | "owner"
  | "checker"
  | "approver"
  | "authorizer"
  | "effectiveDate"
  | "reviewDate"
  | "keywords"
  | "changeSummary"
  | "priority"
  | "purpose"
  | "scope"
  | "contentSource"
  | "contentFileName"
  | "contentFileUrl"
> & {
  structuredContent: SopStructuredContentBlock[];
};

type SopDocumentCreateInput = Pick<
  SopDocumentRecord,
  | "title"
  | "subject"
  | "level"
  | "category"
  | "division"
  | "department"
  | "owner"
  | "checker"
  | "approver"
  | "authorizer"
  | "effectiveDate"
  | "reviewDate"
  | "keywords"
  | "changeSummary"
  | "priority"
  | "purpose"
  | "scope"
  | "contentSource"
  | "contentFileName"
  | "contentFileUrl"
> & {
  structuredContent: SopStructuredContentBlock[];
};

type SopUpdateActor = {
  name: string;
  role: string;
};

const getDefaultState = (): StoredWorkflowState => ({
  documents: sopDocuments,
  versions: sopVersions,
  audits: sopAuditRecords,
  masterRecords: sopMasterRecords,
});

const getPersistableDocuments = (documents: SopDocumentRecord[]) =>
  documents.map((document) => {
    if (document.contentSource !== "file" || !document.contentFileUrl?.startsWith("data:")) {
      return document;
    }

    return {
      ...document,
      // Uploaded PDFs can exceed localStorage quota. Keep them in memory for the live session only.
      contentFileUrl: null,
    };
  });

const getPersistableState = (state: StoredWorkflowState): StoredWorkflowState => ({
  ...state,
  documents: getPersistableDocuments(state.documents),
});

const persistUploadedPdfs = (documents: SopDocumentRecord[]) => {
  void syncUploadedPdfStore(documents).catch((error) => {
    console.warn("Unable to sync uploaded SOP PDFs.", error);
  });
};

const readStoredState = (): StoredWorkflowState => {
  if (typeof window === "undefined") {
    return getDefaultState();
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return getDefaultState();
  }

  try {
    const parsed = JSON.parse(raw) as Partial<StoredWorkflowState>;
    const defaults = getDefaultState();

    return {
      documents: Array.isArray(parsed.documents) ? parsed.documents : defaults.documents,
      versions: Array.isArray(parsed.versions) ? parsed.versions : defaults.versions,
      audits: Array.isArray(parsed.audits) ? parsed.audits : defaults.audits,
      masterRecords: Array.isArray(parsed.masterRecords)
        ? parsed.masterRecords
        : defaults.masterRecords,
    };
  } catch {
    return getDefaultState();
  }
};

const saveStoredState = (state: StoredWorkflowState) => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const persistableState = getPersistableState(state);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(persistableState));
  } catch (error) {
    console.warn("Unable to persist SOPS workflow state to localStorage.", error);
  }

  window.dispatchEvent(
    new CustomEvent<WorkflowSyncEventDetail>(SYNC_EVENT, {
      detail: { state },
    }),
  );
};

const formatTimestamp = () =>
  new Date().toLocaleString("en-IN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

const toRevisionDate = () => new Date().toISOString().slice(0, 10);
const toShortDate = () => new Date().toISOString().slice(0, 10);
const normalizeContentHeaders = (headers: string[] = []) =>
  headers.map((item) => item.trim()).filter(Boolean);
const buildDepartmentCode = (department: string) => {
  const words = department
    .trim()
    .split(/\s+/)
    .map((word) => word.replace(/[^A-Za-z]/g, ""))
    .filter(Boolean);

  if (words.length >= 2) {
    return words.map((word) => word[0]).join("").toUpperCase().slice(0, 3);
  }

  return (words[0] || "SOP").toUpperCase().slice(0, 3);
};

const buildNextSopNumber = (
  department: string,
  level: SopDocumentRecord["level"],
  documents: SopDocumentRecord[],
) => {
  const departmentCode = buildDepartmentCode(department);
  const levelCode = level === "Level 3" ? "L3" : "L2";
  const nextSequence = String(documents.length + 1).padStart(3, "0");
  return `${departmentCode}-${levelCode}-${nextSequence}`;
};

export const calculateNextReleasedVersion = (
  currentReleasedVersion: string | null,
) => {
  if (!currentReleasedVersion) {
    return "R1";
  }

  const match = currentReleasedVersion.match(/R(\d+)/i);
  const currentRevisionNumber = match ? Number(match[1]) : 0;

  return `R${currentRevisionNumber + 1}`;
};

const inferRole = (document: SopDocumentRecord, stage: SopStage): SopWorkflowTask["role"] => {
  if (stage === "Checker Review") return "Checker";
  if (stage === "Approver Review") return "Approver";
  if (stage === "Authorizer Review" || stage === "Authorized") return "Authorizer";
  return "Creator";
};

const inferAssignee = (document: SopDocumentRecord, stage: SopStage) => {
  if (stage === "Checker Review") return document.checker;
  if (stage === "Approver Review") return document.approver;
  if (stage === "Authorizer Review" || stage === "Authorized") return document.authorizer;
  return document.owner;
};

const inferAvailableActions = (stage: SopStage): SopWorkflowButtonAction[] => {
  switch (stage) {
    case "Draft":
    case "Rejected":
      return ["Submit", "Archive"];
    case "Released":
      return ["Revise", "Archive"];
    case "Checker Review":
    case "Approver Review":
      return ["Return", "Approve"];
    case "Authorizer Review":
      return ["Return", "Authorize"];
    case "Authorized":
      return ["Return", "Release", "Archive"];
    default:
      return [];
  }
};

const inferTaskComment = (document: SopDocumentRecord) => {
  switch (document.status) {
    case "Draft":
      return "Draft is ready for creator submission.";
    case "Rejected":
      return "Rejected document can be revised and resubmitted.";
    case "Checker Review":
      return `Awaiting checker review from ${document.checker}.`;
    case "Approver Review":
      return `Pending approval with ${document.approver}.`;
    case "Authorizer Review":
      return `Final authorization pending with ${document.authorizer}.`;
    case "Authorized":
      return "Document is authorized and ready for controlled release.";
    case "Released":
      return "Released SOP is live for department users and can start a controlled revision.";
    default:
      return "Archived record retained for historical traceability.";
  }
};

const inferDueDays = (stage: SopStage) => {
  switch (stage) {
    case "Checker Review":
    case "Approver Review":
      return 2;
    case "Authorizer Review":
      return 1;
    case "Authorized":
      return 1;
    case "Draft":
    case "Rejected":
      return 3;
    default:
      return 0;
  }
};

const nextStageByAction = (
  currentStage: SopStage,
  action: SopWorkflowButtonAction,
): SopStage => {
  switch (action) {
    case "Submit":
      return "Checker Review";
    case "Revise":
      return "Draft";
    case "Return":
      return "Draft";
    case "Reject":
      return "Rejected";
    case "Approve":
      return currentStage === "Checker Review" ? "Approver Review" : "Authorizer Review";
    case "Authorize":
      return "Authorized";
    case "Release":
      return "Released";
    case "Archive":
      return "Archived";
    default:
      return currentStage;
  }
};

const actionToAuditName = (action: SopWorkflowButtonAction): SopAction => {
  switch (action) {
    case "Submit":
      return "Submitted";
    case "Revise":
      return "Revision Draft Created";
    case "Return":
      return "Returned";
    case "Reject":
      return "Rejected";
    case "Approve":
      return "Approved";
    case "Authorize":
      return "Authorized";
    case "Release":
      return "Released to Users";
    case "Archive":
      return "Archived";
    default:
      return "Created";
  }
};

const getChangedFieldLabels = (
  currentDocument: SopDocumentRecord,
  nextValues: SopDocumentUpdateInput,
) => {
  const changedFields: string[] = [];

  if (currentDocument.sopNumber !== nextValues.sopNumber) changedFields.push("Reference Number");
  if (currentDocument.department !== nextValues.department) changedFields.push("Department");
  if (currentDocument.title !== nextValues.title) changedFields.push("Title");
  if (currentDocument.subject !== nextValues.subject) changedFields.push("Subject");
  if (currentDocument.level !== nextValues.level) changedFields.push("Level");
  if (currentDocument.category !== nextValues.category) changedFields.push("Category");
  if (currentDocument.division !== nextValues.division) changedFields.push("Division");
  if (currentDocument.owner !== nextValues.owner) changedFields.push("Creator");
  if (currentDocument.checker !== nextValues.checker) changedFields.push("Checker");
  if (currentDocument.approver !== nextValues.approver) changedFields.push("Approver");
  if (currentDocument.authorizer !== nextValues.authorizer) changedFields.push("Authorizer");
  if (currentDocument.effectiveDate !== nextValues.effectiveDate) changedFields.push("Effective Date");
  if (currentDocument.reviewDate !== nextValues.reviewDate) changedFields.push("Review Date");
  if (currentDocument.priority !== nextValues.priority) changedFields.push("Priority");
  if (currentDocument.purpose !== nextValues.purpose) changedFields.push("Purpose");
  if (currentDocument.scope !== nextValues.scope) changedFields.push("Scope");
  if (currentDocument.contentSource !== nextValues.contentSource) changedFields.push("Content Source");
  if (
    currentDocument.contentFileName !== nextValues.contentFileName ||
    currentDocument.contentFileUrl !== nextValues.contentFileUrl
  ) {
    changedFields.push("Content File");
  }
  if (JSON.stringify(currentDocument.keywords) !== JSON.stringify(nextValues.keywords)) {
    changedFields.push("Keywords");
  }
  if (currentDocument.changeSummary !== nextValues.changeSummary) {
    changedFields.push("Change Summary");
  }
  if (
    JSON.stringify(currentDocument.structuredContent) !== JSON.stringify(nextValues.structuredContent)
  ) {
    changedFields.push("Content");
  }

  return changedFields;
};

const buildApprovalTrail = (stage: SopStage) => {
  switch (stage) {
    case "Checker Review":
      return "Submitted to checker. Verification pending.";
    case "Approver Review":
      return "Checker approved. Awaiting approver decision.";
    case "Authorizer Review":
      return "Approver approved. Awaiting final authorization.";
    case "Authorized":
      return "Authorization completed. Pending controlled release.";
    case "Released":
      return "Released for department access after final authorization.";
    case "Draft":
      return "Draft retained with creator.";
    case "Rejected":
      return "Workflow rejected. Creator revision required.";
    case "Archived":
      return "Document archived and retained for historical traceability.";
    default:
      return "Draft retained with creator.";
  }
};

const getWorkflowTasks = (documents: SopDocumentRecord[]): SopWorkflowTask[] =>
  documents
    .filter((document) => document.status !== "Archived")
    .map((document) => {
      const dueDays = inferDueDays(document.status);
      const ageDays = document.pendingSinceDays;
      const slaStatus =
        ageDays > dueDays && dueDays > 0
          ? "Breached"
          : ageDays === dueDays && dueDays > 0
            ? "Due Today"
            : "On Track";

      const dueDate =
        dueDays > 0
          ? new Date(Date.now() + dueDays * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
          : document.updatedAt.slice(0, 10);

      return {
        id: `task-${document.id}`,
        sopId: document.id,
        sopNumber: document.sopNumber,
        title: document.title,
        assignedTo: inferAssignee(document, document.status),
        role: inferRole(document, document.status),
        stage: document.status,
        dueDate,
        ageDays,
        slaStatus,
        comments: inferTaskComment(document),
        availableActions: inferAvailableActions(document.status),
      };
    });

const getDepartmentAdoption = (documents: SopDocumentRecord[]) =>
  Array.from(new Set(documents.map((document) => document.department))).map((department) => {
    const departmentDocs = documents.filter((document) => document.department === department);
    return {
      department,
      released: departmentDocs.filter((document) => document.status === "Released").length,
      pending: departmentDocs.filter(
        (document) => document.status !== "Released" && document.status !== "Archived",
      ).length,
    };
  });

const getStageCounts = (documents: SopDocumentRecord[]) => {
  const stages: Array<{ key: SopStage; label: string; color: string }> = [
    { key: "Draft", label: "Draft", color: "#64748B" },
    { key: "Checker Review", label: "Checker Review", color: "#2563EB" },
    { key: "Approver Review", label: "Approver Review", color: "#D97706" },
    { key: "Authorizer Review", label: "Authorizer Review", color: "#8B5CF6" },
    { key: "Authorized", label: "Authorized", color: "#4F46E5" },
    { key: "Released", label: "Released", color: "#059669" },
    { key: "Rejected", label: "Rejected", color: "#DC2626" },
    { key: "Archived", label: "Archived", color: "#475569" },
  ];

  return stages.map((stage) => ({
    ...stage,
    value: documents.filter((document) => document.status === stage.key).length,
  }));
};

export const useSopsWorkflowData = () => {
  const { showToast } = useToast();
  const [state, setState] = React.useState<StoredWorkflowState>(() => readStoredState());
  const categoryRecords = React.useMemo(
    () => state.masterRecords.filter((item) => item.type === "Category"),
    [state.masterRecords],
  );

  React.useEffect(() => {
    const syncState = (event: Event) => {
      const syncedState = (event as CustomEvent<WorkflowSyncEventDetail>).detail?.state;
      setState(syncedState ?? readStoredState());
    };

    window.addEventListener(SYNC_EVENT, syncState);
    return () => window.removeEventListener(SYNC_EVENT, syncState);
  }, []);

  React.useEffect(() => {
    let active = true;

    const hydrateUploadedFiles = async () => {
      const hydratedDocuments = await hydrateDocumentsWithUploadedPdfs(state.documents);

      if (!active || hydratedDocuments === state.documents) {
        return;
      }

      setState((currentState) => {
        if (currentState.documents !== state.documents) {
          return currentState;
        }

        return {
          ...currentState,
          documents: hydratedDocuments,
        };
      });
    };

    void hydrateUploadedFiles();

    return () => {
      active = false;
    };
  }, [state.documents]);

  const applyAction = React.useCallback(
    (documentId: string, action: SopWorkflowButtonAction, remarks?: string) => {
      setState((currentState) => {
        const document = currentState.documents.find((item) => item.id === documentId);
        if (!document) {
          return currentState;
        }

        const nextStage = nextStageByAction(document.status, action);
        const currentTimestamp = formatTimestamp();
        const revisionDate = toRevisionDate();
        const actorName = inferAssignee(document, document.status);
        const actorRole = inferRole(document, document.status);
        const revisedDraftVersion =
          action === "Revise"
            ? calculateNextReleasedVersion(document.currentReleasedVersion)
            : document.version;
        const nextReleasedVersion =
          action === "Release"
            ? calculateNextReleasedVersion(document.currentReleasedVersion)
            : document.version;
        const revisionDraftSummary =
          remarks?.trim() ||
          `Revision draft created from released version ${document.currentReleasedVersion ?? document.version}.`;
        const updatedDocument: SopDocumentRecord = {
          ...document,
          status: nextStage,
          updatedAt: new Date().toISOString(),
          pendingSinceDays: 0,
          workflowLabel: buildApprovalTrail(nextStage),
          changeSummary:
            action === "Revise"
              ? revisionDraftSummary
              : remarks
                ? `${action} action completed from ${document.status} to ${nextStage}. Remark: ${remarks}`
                : `${action} action completed from ${document.status} to ${nextStage}.`,
          version:
            action === "Revise"
              ? revisedDraftVersion
              : action === "Release"
                ? nextReleasedVersion
                : document.version,
          draftCode:
            nextStage === "Draft" || nextStage === "Rejected"
              ? `D${Math.min(Number((document.draftCode || "D1").replace("D", "")) + 1, 9)}`
              : action === "Release"
                ? "D0"
                : document.draftCode,
          currentReleasedVersion:
            action === "Release" ? nextReleasedVersion : document.currentReleasedVersion,
        };

        const updatedDocuments = currentState.documents.map((item) =>
          item.id === documentId ? updatedDocument : item,
        );

        const newVersionEntry: SopVersionRecord = {
          id: `v-${Date.now()}`,
          sopId: document.id,
          version: updatedDocument.version,
          stage: nextStage,
          revisionDate,
          revisedBy: actorName,
          changeSummary:
            action === "Revise"
              ? revisionDraftSummary
              : remarks
                ? `${action} action moved document to ${nextStage}. Remark: ${remarks}`
                : `${action} action moved document to ${nextStage}.`,
          releaseDate: nextStage === "Released" ? revisionDate : undefined,
          approvalTrail: buildApprovalTrail(nextStage),
        };

        const newAuditEntry: SopAuditRecord = {
          id: `audit-${Date.now()}`,
          timestamp: currentTimestamp,
          user: actorName,
          role: actorRole,
          action: actionToAuditName(action),
          module: "SOP Workflow",
          sopNumber: document.sopNumber,
          oldValue: `Stage: ${document.status}`,
          newValue:
            action === "Revise"
              ? `Stage: ${nextStage} | Draft: ${updatedDocument.draftCode} | Version: ${document.version} -> ${updatedDocument.version} | Based on release ${document.currentReleasedVersion ?? document.version}`
              : remarks
                ? `Stage: ${nextStage} | Version: ${document.version} -> ${updatedDocument.version} | Remark: ${remarks}`
                : `Stage: ${nextStage} | Version: ${document.version} -> ${updatedDocument.version}`,
          ipAddress: "10.10.8.21",
          device: "SOPS-UI-MOCK",
        };

        const nextState: StoredWorkflowState = {
          documents: updatedDocuments,
          versions: [newVersionEntry, ...currentState.versions],
          audits: [newAuditEntry, ...currentState.audits],
          masterRecords: currentState.masterRecords,
        };

        persistUploadedPdfs(nextState.documents);
        saveStoredState(nextState);
        showToast(
          action === "Revise"
            ? `${document.sopNumber} revision draft created from released version ${document.currentReleasedVersion ?? document.version}`
            : remarks
              ? `${document.sopNumber} moved to ${nextStage} with reviewer remark`
              : `${document.sopNumber} moved to ${nextStage}`,
          "success",
        );
        return nextState;
      });
    },
    [showToast],
  );

  const resetState = React.useCallback(() => {
    const nextState = getDefaultState();
    setState(nextState);
    saveStoredState(nextState);
    showToast("SOPS workflow mock data reset successfully", "info");
  }, [showToast]);

  const updateDocumentDetails = React.useCallback(
    (documentId: string, updates: SopDocumentUpdateInput, actor: SopUpdateActor) => {
      setState((currentState) => {
        const document = currentState.documents.find((item) => item.id === documentId);
        if (!document) {
          return currentState;
        }

        const changedFields = getChangedFieldLabels(document, updates);
        if (!changedFields.length) {
          showToast("No SOP changes detected to save", "info");
          return currentState;
        }

        const currentTimestamp = formatTimestamp();
        const revisionDate = toRevisionDate();
        const updatedDocument: SopDocumentRecord = {
          ...document,
          ...updates,
          updatedAt: new Date().toISOString(),
        };

        const updatedDocuments = currentState.documents.map((item) =>
          item.id === documentId ? updatedDocument : item,
        );

        const newVersionEntry: SopVersionRecord = {
          id: `v-${Date.now()}`,
          sopId: document.id,
          version: document.version,
          stage: document.status,
          revisionDate,
          revisedBy: actor.name,
          changeSummary:
            updates.changeSummary?.trim() ||
            `SOP details updated for ${changedFields.join(", ")}.`,
          approvalTrail: buildApprovalTrail(document.status),
        };

        const newAuditEntry: SopAuditRecord = {
          id: `audit-${Date.now()}`,
          timestamp: currentTimestamp,
          user: actor.name,
          role: actor.role,
          action: "Updated",
          module: "SOP Register",
          sopNumber: document.sopNumber,
          oldValue: `Fields: ${changedFields.join(", ")} | Previous title: ${document.title}`,
          newValue: `Fields: ${changedFields.join(", ")} | Updated title: ${updatedDocument.title}`,
          ipAddress: "10.10.8.21",
          device: "SOPS-UI-MOCK",
        };

        const nextState: StoredWorkflowState = {
          documents: updatedDocuments,
          versions: [newVersionEntry, ...currentState.versions],
          audits: [newAuditEntry, ...currentState.audits],
          masterRecords: currentState.masterRecords,
        };

        persistUploadedPdfs(nextState.documents);
        saveStoredState(nextState);
        showToast(
          `${document.sopNumber} updated successfully (${changedFields.join(", ")})`,
          "success",
        );
        return nextState;
      });
    },
    [showToast],
  );

  const createSopDocument = React.useCallback(
    (input: SopDocumentCreateInput, mode: "draft" | "submit" = "draft") => {
      const trimmedTitle = input.title.trim();
      const trimmedDepartment = input.department.trim();
      const trimmedCategory = input.category.trim();

      if (!trimmedTitle || !trimmedDepartment || !trimmedCategory) {
        showToast("Title, department, and category are required to create an SOP", "warning");
        return false;
      }

      let created = false;

      setState((currentState) => {
        const timestamp = new Date().toISOString();
        const revisionDate = toRevisionDate();
        const currentTimestamp = formatTimestamp();
        const nextStatus: SopStage = mode === "submit" ? "Checker Review" : "Draft";
        const newDocumentId = `sop-${Date.now()}`;
        const nextVersion = "R0";
        const nextSopNumber = buildNextSopNumber(trimmedDepartment, input.level, currentState.documents);

        const newDocument: SopDocumentRecord = {
          id: newDocumentId,
          sopNumber: nextSopNumber,
          title: trimmedTitle,
          subject: input.subject.trim(),
          level: input.level,
          category: trimmedCategory,
          division: input.division.trim(),
          department: trimmedDepartment,
          owner: input.owner.trim(),
          checker: input.checker.trim(),
          approver: input.approver.trim(),
          authorizer: input.authorizer.trim(),
          status: nextStatus,
          version: nextVersion,
          draftCode: "D1",
          effectiveDate: input.effectiveDate,
          reviewDate: input.reviewDate,
          createdAt: timestamp,
          updatedAt: timestamp,
          keywords: input.keywords,
          changeSummary:
            input.changeSummary.trim() ||
            (mode === "submit"
              ? "New SOP submitted for checker review."
              : "New SOP draft created."),
          priority: input.priority,
          pendingSinceDays: 0,
          trainingRequired: false,
          acknowledgementsPending: 0,
          viewersToday: 0,
          secureViewCount: 0,
          distributionCount: 0,
          purpose: input.purpose.trim(),
          scope: input.scope.trim(),
          workflowLabel: buildApprovalTrail(nextStatus),
          structuredContent: input.structuredContent,
          contentSource: input.contentSource,
          contentFileName: input.contentFileName,
          contentFileUrl: input.contentFileUrl,
          currentReleasedVersion: null,
        };

        const newVersionEntry: SopVersionRecord = {
          id: `v-${Date.now()}`,
          sopId: newDocumentId,
          version: nextVersion,
          stage: nextStatus,
          revisionDate,
          revisedBy: newDocument.owner,
          changeSummary: newDocument.changeSummary,
          approvalTrail: buildApprovalTrail(nextStatus),
        };

        const newAuditEntry: SopAuditRecord = {
          id: `audit-${Date.now()}`,
          timestamp: currentTimestamp,
          user: newDocument.owner || "Current User",
          role: "Creator",
          action: mode === "submit" ? "Submitted" : "Created",
          module: "SOP Authoring",
          sopNumber: nextSopNumber,
          oldValue: "New SOP",
          newValue:
            mode === "submit"
              ? `Created and moved to Checker Review | Version ${nextVersion}`
              : `Draft created | Version ${nextVersion}`,
          ipAddress: "10.10.8.21",
          device: "SOPS-UI-MOCK",
        };

        const nextState: StoredWorkflowState = {
          ...currentState,
          documents: [newDocument, ...currentState.documents],
          versions: [newVersionEntry, ...currentState.versions],
          audits: [newAuditEntry, ...currentState.audits],
        };

        persistUploadedPdfs(nextState.documents);
        saveStoredState(nextState);
        created = true;
        return nextState;
      });

      if (created) {
        showToast(
          mode === "submit"
            ? `${trimmedTitle} created and submitted for review`
            : `${trimmedTitle} draft created successfully`,
          "success",
        );
      }

      return created;
    },
    [showToast],
  );

  const createCategory = React.useCallback(
    (input: Pick<SopMasterRecord, "name" | "code" | "status" | "notes" | "contentHeaders">) => {
      const trimmedName = input.name.trim();
      const trimmedCode = input.code.trim().toUpperCase();
      const contentHeaders = normalizeContentHeaders(input.contentHeaders);

      if (!trimmedName || !trimmedCode) {
        showToast("Name and code are required for category creation", "warning");
        return false;
      }

      let created = false;

      setState((currentState) => {
        const categoryRecords = currentState.masterRecords.filter((item) => item.type === "Category");
        const duplicate = categoryRecords.some(
          (item) =>
            item.name.trim().toLowerCase() === trimmedName.toLowerCase() ||
            item.code.trim().toLowerCase() === trimmedCode.toLowerCase(),
        );

        if (duplicate) {
          showToast("Category name or code already exists", "warning");
          return currentState;
        }

        const newCategory: SopMasterRecord = {
          id: `master-category-${Date.now()}`,
          type: "Category",
          name: trimmedName,
          code: trimmedCode,
          owner: "",
          status: input.status,
          updatedAt: toShortDate(),
          contentHeaders,
          notes: input.notes.trim(),
        };

        const nextState: StoredWorkflowState = {
          ...currentState,
          masterRecords: [newCategory, ...currentState.masterRecords],
        };

        saveStoredState(nextState);
        created = true;
        return nextState;
      });

      if (created) {
        showToast(`${trimmedName} category created successfully`, "success");
      }

      return created;
    },
    [showToast],
  );

  const updateCategory = React.useCallback(
    (categoryId: string, input: Pick<SopMasterRecord, "name" | "code" | "status" | "notes" | "contentHeaders">) => {
      const trimmedName = input.name.trim();
      const trimmedCode = input.code.trim().toUpperCase();
      const contentHeaders = normalizeContentHeaders(input.contentHeaders);

      if (!trimmedName || !trimmedCode) {
        showToast("Name and code are required for category update", "warning");
        return false;
      }

      let updated = false;

      setState((currentState) => {
        const target = currentState.masterRecords.find(
          (item) => item.id === categoryId && item.type === "Category",
        );

        if (!target) {
          showToast("Selected category was not found", "error");
          return currentState;
        }

        const duplicate = currentState.masterRecords.some(
          (item) =>
            item.type === "Category" &&
            item.id !== categoryId &&
            (item.name.trim().toLowerCase() === trimmedName.toLowerCase() ||
              item.code.trim().toLowerCase() === trimmedCode.toLowerCase()),
        );

        if (duplicate) {
          showToast("Another category already uses the same name or code", "warning");
          return currentState;
        }

        const nextState = {
          ...currentState,
          masterRecords: currentState.masterRecords.map((item) =>
            item.id === categoryId
                ? {
                    ...item,
                    name: trimmedName,
                    code: trimmedCode,
                    owner: "",
                    status: input.status,
                    contentHeaders,
                    notes: input.notes.trim(),
                    updatedAt: toShortDate(),
                }
              : item,
          ),
        };

        saveStoredState(nextState);
        updated = true;
        return nextState;
      });

      if (updated) {
        showToast(`${trimmedName} category updated successfully`, "success");
      }

      return updated;
    },
    [showToast],
  );

  const deleteCategory = React.useCallback(
    (categoryId: string) => {
      let deletedName = "";

      setState((currentState) => {
        const target = currentState.masterRecords.find(
          (item) => item.id === categoryId && item.type === "Category",
        );

        if (!target) {
          showToast("Selected category was not found", "error");
          return currentState;
        }

        deletedName = target.name;
        const nextState = {
          ...currentState,
          masterRecords: currentState.masterRecords.filter((item) => item.id !== categoryId),
        };

        saveStoredState(nextState);
        return nextState;
      });

      if (deletedName) {
        showToast(`${deletedName} category deleted successfully`, "success");
        return true;
      }

      return false;
    },
    [showToast],
  );

  return {
    documents: state.documents,
    versions: state.versions,
    audits: state.audits,
    masterRecords: state.masterRecords,
    categoryRecords,
    workflowTasks: React.useMemo(() => getWorkflowTasks(state.documents), [state.documents]),
    stageCounts: React.useMemo(() => getStageCounts(state.documents), [state.documents]),
    departmentAdoption: React.useMemo(
      () => getDepartmentAdoption(state.documents),
      [state.documents],
    ),
    calculateNextReleasedVersion,
    applyAction,
    updateDocumentDetails,
    createSopDocument,
    createCategory,
    updateCategory,
    deleteCategory,
    resetState,
  };
};
