import {
  inquiryRecords,
  kanbanColumns,
  modulePlanningTree,
  projectRecords,
  type InquiryRecord,
  type KanbanColumnRecord,
  type ProjectPlanningModuleRecord,
  type ProjectPlanningRecord,
  type ProjectRecord,
  type ProjectTeamAllocationRecord,
} from "./mockData";

const PROJECT_MANAGEMENT_INQUIRIES_KEY = "hl-project-management-inquiries";
const PROJECT_MANAGEMENT_PROJECTS_KEY = "hl-project-management-projects";
const PROJECT_MANAGEMENT_PLANNING_KEY = "hl-project-management-planning";
const PROJECT_MANAGEMENT_KANBAN_KEY = "hl-project-management-kanban";
const PROJECT_MANAGEMENT_SUPPORT_STATE_KEY = "hl-project-management-support-state";

const cloneValue = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

const readStorage = <T,>(key: string, fallback: T): T => {
  if (typeof window === "undefined") {
    return cloneValue(fallback);
  }

  const rawValue = window.localStorage.getItem(key);

  if (!rawValue) {
    return cloneValue(fallback);
  }

  try {
    return JSON.parse(rawValue) as T;
  } catch (error) {
    console.error(`Failed to parse local storage key: ${key}`, error);
    window.localStorage.removeItem(key);
    return cloneValue(fallback);
  }
};

const writeStorage = <T,>(key: string, value: T) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
};

export const loadProjectManagementInquiries = () =>
  readStorage<InquiryRecord[]>(PROJECT_MANAGEMENT_INQUIRIES_KEY, inquiryRecords);

export const saveProjectManagementInquiries = (rows: InquiryRecord[]) => {
  writeStorage(PROJECT_MANAGEMENT_INQUIRIES_KEY, rows);
};

export const loadProjectManagementProjects = () =>
  readStorage<ProjectRecord[]>(PROJECT_MANAGEMENT_PROJECTS_KEY, projectRecords);

export const saveProjectManagementProjects = (rows: ProjectRecord[]) => {
  writeStorage(PROJECT_MANAGEMENT_PROJECTS_KEY, rows);
};

export const loadProjectPlanningLookup = () =>
  readStorage<Record<string, ProjectPlanningRecord>>(PROJECT_MANAGEMENT_PLANNING_KEY, {});

export const saveProjectPlanningLookup = (lookup: Record<string, ProjectPlanningRecord>) => {
  writeStorage(PROJECT_MANAGEMENT_PLANNING_KEY, lookup);
};

export const loadProjectManagementKanban = () =>
  readStorage<KanbanColumnRecord[]>(PROJECT_MANAGEMENT_KANBAN_KEY, kanbanColumns);

export const saveProjectManagementKanban = (columns: KanbanColumnRecord[]) => {
  writeStorage(PROJECT_MANAGEMENT_KANBAN_KEY, columns);
};

export type ProjectManagementSupportState = {
  supportId: string;
  assignee: string;
  startedAt: string;
  active: boolean;
};

export const loadProjectManagementSupportStates = () =>
  readStorage<Record<string, ProjectManagementSupportState>>(
    PROJECT_MANAGEMENT_SUPPORT_STATE_KEY,
    {},
  );

export const saveProjectManagementSupportStates = (
  state: Record<string, ProjectManagementSupportState>,
) => {
  writeStorage(PROJECT_MANAGEMENT_SUPPORT_STATE_KEY, state);
};

const isKanbanActiveStage = (column: Pick<KanbanColumnRecord, "title" | "status">) => {
  const matchValue = `${column.status} ${column.title}`.toLowerCase();
  return (
    matchValue.includes("progress") ||
    matchValue.includes("active") ||
    matchValue.includes("working")
  );
};

export const pauseKanbanTimersForAssignee = (
  assignee: string,
  pausedAt = new Date().toISOString(),
) => {
  const columns = loadProjectManagementKanban();
  const nextColumns = columns.map((column) => ({
    ...column,
    cards: column.cards.map((card) => {
      if (!isKanbanActiveStage(column) || card.assignee !== assignee || !card.stageEnteredAt) {
        return card;
      }

      if (card.stagePausedAt) {
        return card;
      }

      return {
        ...card,
        stagePausedAt: pausedAt,
      };
    }),
  }));

  saveProjectManagementKanban(nextColumns);
  return nextColumns;
};

export const resumeKanbanTimersForAssignee = (
  assignee: string,
  resumedAt = new Date().toISOString(),
) => {
  const resumeMs = new Date(resumedAt).getTime();
  const columns = loadProjectManagementKanban();
  const nextColumns = columns.map((column) => ({
    ...column,
    cards: column.cards.map((card) => {
      if (!isKanbanActiveStage(column) || card.assignee !== assignee || !card.stagePausedAt) {
        return card;
      }

      const pausedMs = new Date(card.stagePausedAt).getTime();
      const pauseWindow =
        Number.isNaN(pausedMs) || Number.isNaN(resumeMs) ? 0 : Math.max(0, resumeMs - pausedMs);

      return {
        ...card,
        stagePausedAt: undefined,
        stagePausedDurationMs: (card.stagePausedDurationMs ?? 0) + pauseWindow,
      };
    }),
  }));

  saveProjectManagementKanban(nextColumns);
  return nextColumns;
};

const buildFallbackTeamAllocations = (project: ProjectRecord): ProjectTeamAllocationRecord[] =>
  project.team.map((member, index) => ({
    id: `alloc-fallback-${project.id}-${index + 1}`,
    member,
    role: index === 0 ? "Lead" : "Developer",
    module: index % 2 === 0 ? "Platform Setup" : "Operations",
    submodule: index % 2 === 0 ? "Authentication" : "Traceability Board",
    plannedHours: Math.max(12, Math.round(project.plannedHours / Math.max(project.team.length, 1))),
  }));

const buildFallbackModules = (project: ProjectRecord): ProjectPlanningModuleRecord[] => {
  const factor = project.plannedHours > 0 ? project.plannedHours / 204 : 1;

  return cloneValue(modulePlanningTree).map((module, moduleIndex) => ({
    ...module,
    submodules: module.submodules.map((submodule, submoduleIndex) => ({
      ...submodule,
      phases: submodule.phases.map((phase, phaseIndex) => ({
        ...phase,
        owner:
          project.team[(moduleIndex + submoduleIndex + phaseIndex) % Math.max(project.team.length, 1)] ??
          project.leader,
        hours: Math.max(4, Math.round(phase.hours * factor)),
        progress: project.status === "Planned" ? 0 : phase.progress,
      })),
    })),
  }));
};

export const buildFallbackPlanningRecord = (
  project: ProjectRecord | null,
): ProjectPlanningRecord => {
  if (!project) {
    return {
      projectId: "",
      inquiryNo: "",
      implementationNotes: "",
      modules: [],
      teamAllocations: [],
    };
  }

  return {
    projectId: project.id,
    inquiryNo: project.approvedScope.split(" / ").shift() ?? "",
    implementationNotes: `${project.name} delivery plan derived from mock baseline and team allocation.`,
    modules: buildFallbackModules(project),
    teamAllocations: buildFallbackTeamAllocations(project),
  };
};

export const getPlanningForProject = (
  project: ProjectRecord | null,
  lookup: Record<string, ProjectPlanningRecord>,
) => {
  if (!project) {
    return buildFallbackPlanningRecord(null);
  }

  return lookup[project.id] ?? buildFallbackPlanningRecord(project);
};
