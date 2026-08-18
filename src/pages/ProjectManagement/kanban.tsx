import React from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Drawer,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import DragIndicatorRoundedIcon from "@mui/icons-material/DragIndicatorRounded";
import { useToast } from "../../../shared/hooks/useToast";
import { PriorityBadge, ProjectStatusBadge } from "./components";
import type { KanbanCardRecord, KanbanColumnRecord, PriorityLevel } from "./mockData";
import {
  loadProjectManagementKanban,
  loadProjectManagementProjects,
  loadProjectManagementSupportStates,
  saveProjectManagementKanban,
} from "./mockStore";

const controlSurfaceSx = {
  borderRadius: 3,
  border: "1px solid rgba(148,163,184,0.18)",
  background:
    "linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(248,250,252,0.98) 100%)",
  boxShadow: "0px 10px 30px rgba(15,23,42,0.06)",
} as const;

const boardSurfaceSx = {
  borderRadius: 3,
  border: "1px solid rgba(148,163,184,0.18)",
  background:
    "linear-gradient(180deg, rgba(248,250,252,0.88) 0%, rgba(241,245,249,0.92) 100%)",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.7)",
} as const;

const drawerPaperSx = {
  "& .MuiDrawer-paper": {
    width: {
      xs: "100%",
      sm: 520,
      lg: 600,
    },
    maxWidth: "100%",
    display: "flex",
    flexDirection: "column",
  },
} as const;

const laneTonePresets = [
  {
    accent: "#64748B",
    bg: "linear-gradient(180deg, rgba(241,245,249,0.96) 0%, rgba(248,250,252,0.98) 100%)",
  },
  {
    accent: "#2563EB",
    bg: "linear-gradient(180deg, rgba(219,234,254,0.55) 0%, rgba(248,250,252,0.98) 100%)",
  },
  {
    accent: "#7C3AED",
    bg: "linear-gradient(180deg, rgba(237,233,254,0.58) 0%, rgba(248,250,252,0.98) 100%)",
  },
  {
    accent: "#059669",
    bg: "linear-gradient(180deg, rgba(220,252,231,0.62) 0%, rgba(248,250,252,0.98) 100%)",
  },
  {
    accent: "#D97706",
    bg: "linear-gradient(180deg, rgba(255,237,213,0.62) 0%, rgba(248,250,252,0.98) 100%)",
  },
  {
    accent: "#DC2626",
    bg: "linear-gradient(180deg, rgba(254,226,226,0.58) 0%, rgba(248,250,252,0.98) 100%)",
  },
] as const;

const priorityOptions: PriorityLevel[] = ["Critical", "High", "Medium", "Low"];

type KanbanTaskFormValues = {
  id: string;
  sourceColumnId: string;
  code: string;
  title: string;
  project: string;
  assignee: string;
  priority: PriorityLevel;
  dueDate: string;
  estimateHours: string;
  description: string;
  module: string;
  tags: string;
  stageColumnId: string;
};

const normalizeStageName = (value: string) => value.trim() || "New Stage";

const isActiveStage = (column: Pick<KanbanColumnRecord, "title" | "status">) => {
  const matchValue = `${column.status} ${column.title}`.toLowerCase();
  return (
    matchValue.includes("progress") ||
    matchValue.includes("active") ||
    matchValue.includes("working")
  );
};

const formatStageElapsed = (
  stageEnteredAt?: string,
  nowMs = Date.now(),
  pausedDurationMs = 0,
  stagePausedAt?: string,
) => {
  if (!stageEnteredAt) {
    return "";
  }

  const enteredMs = new Date(stageEnteredAt).getTime();

  if (Number.isNaN(enteredMs)) {
    return "";
  }

  const pausedAtMs = stagePausedAt ? new Date(stagePausedAt).getTime() : Number.NaN;
  const currentPauseMs =
    stagePausedAt && !Number.isNaN(pausedAtMs) ? Math.max(0, nowMs - pausedAtMs) : 0;
  const totalSeconds = Math.max(
    0,
    Math.floor((nowMs - enteredMs - pausedDurationMs - currentPauseMs) / 1000),
  );
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  }

  return `${String(hours).padStart(2, "0")}h ${String(minutes).padStart(2, "0")}m ${String(
    seconds,
  ).padStart(2, "0")}s`;
};

const getLaneTone = (column: KanbanColumnRecord, index: number) => {
  const matchValue = `${column.status} ${column.title}`.toLowerCase();

  if (matchValue.includes("review")) {
    return laneTonePresets[2];
  }

  if (
    matchValue.includes("done") ||
    matchValue.includes("complete") ||
    matchValue.includes("closed")
  ) {
    return laneTonePresets[3];
  }

  if (
    matchValue.includes("progress") ||
    matchValue.includes("active") ||
    matchValue.includes("working")
  ) {
    return laneTonePresets[1];
  }

  if (matchValue.includes("block") || matchValue.includes("hold")) {
    return laneTonePresets[5];
  }

  if (matchValue.includes("todo") || matchValue.includes("plan") || matchValue.includes("queue")) {
    return laneTonePresets[0];
  }

  return laneTonePresets[index % laneTonePresets.length];
};

const buildNextTaskCode = (columns: KanbanColumnRecord[]) => {
  const nextCode =
    columns
      .flatMap((column) => column.cards)
      .reduce((maxValue, card) => {
        const numericValue = Number(card.code.split("-").pop());
        return Number.isFinite(numericValue) ? Math.max(maxValue, numericValue) : maxValue;
      }, 400) + 1;

  return `BL-${nextCode}`;
};

const buildColumnId = () => `kanban-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const buildCardId = () => `k-card-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const buildInitialTaskFormValues = (
  columns: KanbanColumnRecord[],
  options?: {
    card?: KanbanCardRecord | null;
    stageColumnId?: string;
    defaultProject?: string;
  },
): KanbanTaskFormValues => ({
  id: options?.card?.id ?? "",
  sourceColumnId: options?.stageColumnId ?? columns[0]?.id ?? "",
  code: options?.card?.code ?? buildNextTaskCode(columns),
  title: options?.card?.title ?? "",
  project: options?.card?.project ?? options?.defaultProject ?? "",
  assignee: options?.card?.assignee ?? "",
  priority: options?.card?.priority ?? "Medium",
  dueDate: options?.card?.dueDate ?? "",
  estimateHours: options?.card?.estimateHours ? String(options.card.estimateHours) : "",
  description: options?.card?.description ?? "",
  module: options?.card?.module ?? "",
  tags: options?.card?.tags?.join(", ") ?? "",
  stageColumnId: options?.stageColumnId ?? columns[0]?.id ?? "",
});

const ProjectManagementKanbanPage = () => {
  const { showToast } = useToast();
  const [boardColumns, setBoardColumns] = React.useState<KanbanColumnRecord[]>(() =>
    loadProjectManagementKanban(),
  );
  const [selectedProject, setSelectedProject] = React.useState("all");
  const [selectedAssignee, setSelectedAssignee] = React.useState("all");
  const [taskDrawerOpen, setTaskDrawerOpen] = React.useState(false);
  const [taskMode, setTaskMode] = React.useState<"create" | "edit">("create");
  const [taskFormValues, setTaskFormValues] = React.useState<KanbanTaskFormValues>(() =>
    buildInitialTaskFormValues(loadProjectManagementKanban()),
  );
  const [draggingCardMeta, setDraggingCardMeta] = React.useState<{
    cardId: string;
    sourceColumnId: string;
  } | null>(null);
  const [timerTick, setTimerTick] = React.useState(() => Date.now());
  const supportStates = React.useMemo(() => loadProjectManagementSupportStates(), [boardColumns]);

  const availableProjects = React.useMemo(() => {
    const projectNames = loadProjectManagementProjects().map((project) => project.name);
    const cardProjects = boardColumns.flatMap((column) => column.cards.map((card) => card.project));
    return Array.from(new Set([...projectNames, ...cardProjects].filter(Boolean)));
  }, [boardColumns]);

  const assigneeOptions = React.useMemo(
    () =>
      Array.from(
        new Set(boardColumns.flatMap((column) => column.cards.map((card) => card.assignee)).filter(Boolean)),
      ),
    [boardColumns],
  );

  const filteredColumns = React.useMemo(
    () =>
      boardColumns.map((column) => ({
        ...column,
        cards: column.cards.filter((card) => {
          const matchesProject = selectedProject === "all" || card.project === selectedProject;
          const matchesAssignee =
            selectedAssignee === "all" || card.assignee === selectedAssignee;

          return matchesProject && matchesAssignee;
        }),
      })),
    [boardColumns, selectedAssignee, selectedProject],
  );

  const allVisibleCards = React.useMemo(
    () => filteredColumns.flatMap((column) => column.cards),
    [filteredColumns],
  );

  const summary = React.useMemo(() => {
    const totalCards = allVisibleCards.length;
    const highPriorityCards = allVisibleCards.filter(
      (card) => card.priority === "Critical" || card.priority === "High",
    ).length;
    const reviewCards = filteredColumns
      .filter((column) => `${column.title} ${column.status}`.toLowerCase().includes("review"))
      .reduce((sum, column) => sum + column.cards.length, 0);
    const doneCards = filteredColumns
      .filter((column) => {
        const laneValue = `${column.title} ${column.status}`.toLowerCase();
        return laneValue.includes("done") || laneValue.includes("complete");
      })
      .reduce((sum, column) => sum + column.cards.length, 0);

    return {
      totalCards,
      highPriorityCards,
      reviewCards,
      doneCards,
    };
  }, [allVisibleCards, filteredColumns]);

  const persistColumns = React.useCallback((nextColumns: KanbanColumnRecord[]) => {
    setBoardColumns(nextColumns);
    saveProjectManagementKanban(nextColumns);
  }, []);

  React.useEffect(() => {
    const intervalId = window.setInterval(() => {
      setTimerTick(Date.now());
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, []);

  const handleColumnTitleChange = React.useCallback(
    (columnId: string, nextTitle: string) => {
      persistColumns(
        boardColumns.map((column) =>
          column.id === columnId
            ? {
                ...column,
                title: nextTitle,
                status: normalizeStageName(nextTitle),
              }
            : column,
        ),
      );
    },
    [boardColumns, persistColumns],
  );

  const handleAddStage = React.useCallback(() => {
    const nextColumns = [
      ...boardColumns,
      {
        id: buildColumnId(),
        title: "New Stage",
        status: "New Stage",
        wipLimit: 5,
        cards: [],
      },
    ];

    persistColumns(nextColumns);
  }, [boardColumns, persistColumns]);

  const openCreateTaskDrawer = React.useCallback(() => {
    setTaskMode("create");
    setTaskFormValues(
      buildInitialTaskFormValues(boardColumns, {
        defaultProject: selectedProject !== "all" ? selectedProject : availableProjects[0] ?? "",
      }),
    );
    setTaskDrawerOpen(true);
  }, [availableProjects, boardColumns, selectedProject]);

  const openEditTaskDrawer = React.useCallback(
    (card: KanbanCardRecord, columnId: string) => {
      setTaskMode("edit");
      setTaskFormValues(
        buildInitialTaskFormValues(boardColumns, {
          card,
          stageColumnId: columnId,
        }),
      );
      setTaskDrawerOpen(true);
    },
    [boardColumns],
  );

  const closeTaskDrawer = React.useCallback(() => {
    setTaskDrawerOpen(false);
  }, []);

  const handleTaskFieldChange =
    (field: keyof KanbanTaskFormValues) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setTaskFormValues((current) => ({
        ...current,
        [field]: event.target.value,
      }));
    };

  const handleTaskSave = React.useCallback(() => {
    if (!taskFormValues.title.trim() || !taskFormValues.project.trim() || !taskFormValues.stageColumnId) {
      return;
    }

    const sourceIndex = boardColumns.findIndex((column) => column.id === taskFormValues.sourceColumnId);
    const targetIndex = boardColumns.findIndex((column) => column.id === taskFormValues.stageColumnId);

    if (taskMode === "edit" && sourceIndex >= 0 && targetIndex >= 0 && targetIndex < sourceIndex) {
      showToast("Task ne previous stage ma pachhu move kari shakay nahi.", "warning");
      return;
    }

    const sourceColumn = boardColumns.find((column) => column.id === taskFormValues.sourceColumnId) ?? null;
    const targetColumn = boardColumns.find((column) => column.id === taskFormValues.stageColumnId) ?? null;
    const existingCard = boardColumns
      .flatMap((column) => column.cards)
      .find((card) => card.id === taskFormValues.id);
    const assigneeHasActiveSupport = Object.values(supportStates).some(
      (state) =>
        state.active &&
        state.assignee.trim().toLowerCase() === taskFormValues.assignee.trim().toLowerCase(),
    );
    const shouldStartStageTimer = Boolean(
      targetColumn && isActiveStage(targetColumn) && (!sourceColumn || sourceColumn.id !== targetColumn.id),
    );
    const shouldKeepStageTimer = Boolean(
      targetColumn &&
        sourceColumn &&
        sourceColumn.id === targetColumn.id &&
        isActiveStage(targetColumn),
    );

    const nextCard: KanbanCardRecord = {
      id: taskFormValues.id || buildCardId(),
      code: taskFormValues.code.trim() || buildNextTaskCode(boardColumns),
      title: taskFormValues.title.trim(),
      project: taskFormValues.project.trim(),
      assignee: taskFormValues.assignee.trim(),
      priority: taskFormValues.priority,
      dueDate: taskFormValues.dueDate,
      estimateHours: Number(taskFormValues.estimateHours) || 0,
      stageEnteredAt: shouldStartStageTimer
        ? new Date().toISOString()
        : shouldKeepStageTimer
          ? existingCard?.stageEnteredAt
          : undefined,
      stagePausedAt:
        targetColumn && isActiveStage(targetColumn) && assigneeHasActiveSupport
          ? existingCard?.stagePausedAt ?? new Date().toISOString()
          : shouldKeepStageTimer
            ? existingCard?.stagePausedAt
            : undefined,
      stagePausedDurationMs: shouldKeepStageTimer ? existingCard?.stagePausedDurationMs ?? 0 : 0,
      description: taskFormValues.description.trim(),
      module: taskFormValues.module.trim(),
      tags: taskFormValues.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    };

    const columnsWithoutCurrentCard = boardColumns.map((column) => ({
      ...column,
      cards: column.cards.filter((card) => card.id !== nextCard.id),
    }));

    const nextColumns = columnsWithoutCurrentCard.map((column) =>
      column.id === taskFormValues.stageColumnId
        ? {
            ...column,
            cards: [nextCard, ...column.cards],
          }
        : column,
    );

    persistColumns(nextColumns);
    setTaskDrawerOpen(false);
  }, [boardColumns, persistColumns, showToast, supportStates, taskFormValues, taskMode]);

  const handleCardDragStart = React.useCallback(
    (event: React.DragEvent<HTMLDivElement>, cardId: string, sourceColumnId: string) => {
      setDraggingCardMeta({ cardId, sourceColumnId });
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", cardId);
    },
    [],
  );

  const handleColumnDrop = React.useCallback(
    (targetColumnId: string) => {
      if (!draggingCardMeta || draggingCardMeta.sourceColumnId === targetColumnId) {
        setDraggingCardMeta(null);
        return;
      }

      const sourceIndex = boardColumns.findIndex((column) => column.id === draggingCardMeta.sourceColumnId);
      const targetIndex = boardColumns.findIndex((column) => column.id === targetColumnId);

      if (sourceIndex >= 0 && targetIndex >= 0 && targetIndex < sourceIndex) {
        showToast("Task ne previous stage ma pachhu drag kari shakay nahi.", "warning");
        setDraggingCardMeta(null);
        return;
      }

      const sourceColumn = boardColumns.find((column) => column.id === draggingCardMeta.sourceColumnId);
      const draggedCard = sourceColumn?.cards.find((card) => card.id === draggingCardMeta.cardId);

      if (!draggedCard) {
        setDraggingCardMeta(null);
        return;
      }

      const nextColumns = boardColumns.map((column) => {
        if (column.id === draggingCardMeta.sourceColumnId) {
          return {
            ...column,
            cards: column.cards.filter((card) => card.id !== draggingCardMeta.cardId),
          };
        }

        if (column.id === targetColumnId) {
          const assigneeHasActiveSupport = Object.values(supportStates).some(
            (state) =>
              state.active &&
              state.assignee.trim().toLowerCase() === draggedCard.assignee.trim().toLowerCase(),
          );
          return {
            ...column,
            cards: [
              {
                ...draggedCard,
                stageEnteredAt: isActiveStage(column) ? new Date().toISOString() : undefined,
                stagePausedAt:
                  isActiveStage(column) && assigneeHasActiveSupport
                    ? new Date().toISOString()
                    : undefined,
                stagePausedDurationMs: 0,
              },
              ...column.cards,
            ],
          };
        }

        return column;
      });

      persistColumns(nextColumns);
      setDraggingCardMeta(null);
    },
    [boardColumns, draggingCardMeta, persistColumns, showToast, supportStates],
  );

  return (
    <>
      <Stack spacing={2.25}>
        <Box sx={{ ...controlSurfaceSx, p: { xs: 1.5, md: 2 } }}>
          <Stack
            direction={{ xs: "column", xl: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", xl: "center" }}
            spacing={1.5}
          >
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 800,
                  letterSpacing: "-0.02em",
                  color: "text.primary",
                }}
              >
                Kanban Board
              </Typography>
 
            </Box>

            <Stack
              direction={{ xs: "column", lg: "row" }}
              spacing={1.25}
              alignItems={{ lg: "center" }}
              sx={{ width: { xs: "100%", xl: "auto" } }}
            >
              <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={openCreateTaskDrawer}>
                New Task
              </Button>
              <Button variant="outlined" startIcon={<AddRoundedIcon />} onClick={handleAddStage}>
                Add Stage
              </Button>
              <TextField
                select
                size="small"
                label="Project"
                value={selectedProject}
                onChange={(event) => setSelectedProject(event.target.value)}
                sx={{ minWidth: { xs: "100%", sm: 220 } }}
              >
                <MenuItem value="all">All Projects</MenuItem>
                {availableProjects.map((project) => (
                  <MenuItem key={project} value={project}>
                    {project}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                size="small"
                label="Assignee"
                value={selectedAssignee}
                onChange={(event) => setSelectedAssignee(event.target.value)}
                sx={{ minWidth: { xs: "100%", sm: 180 } }}
              >
                <MenuItem value="all">All Assignees</MenuItem>
                {assigneeOptions.map((assignee) => (
                  <MenuItem key={assignee} value={assignee}>
                    {assignee}
                  </MenuItem>
                ))}
              </TextField>

              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Chip label={`${summary.totalCards} visible cards`} sx={{ fontWeight: 700 }} />
                <Chip
                  label={`${summary.highPriorityCards} high priority`}
                  sx={{ fontWeight: 700, bgcolor: "#FFEDD5", color: "#C2410C" }}
                />
                <Chip
                  label={`${summary.reviewCards} in review`}
                  sx={{ fontWeight: 700, bgcolor: "#EDE9FE", color: "#7C3AED" }}
                />
                <Chip
                  label={`${summary.doneCards} done`}
                  sx={{ fontWeight: 700, bgcolor: "#DCFCE7", color: "#15803D" }}
                />
              </Stack>
            </Stack>
          </Stack>
        
   

          <Box
            sx={{
              mt: 2,
              display: "flex",
              gap: 1.5,
              overflowX: "auto",
              alignItems: "stretch",
              pb: 0.5,
              "&::-webkit-scrollbar": {
                height: 8,
              },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: "rgba(148,163,184,0.45)",
                borderRadius: 999,
              },
            }}
          >
            {filteredColumns.map((column, columnIndex) => {
              const tone = getLaneTone(column, columnIndex);
              const wipPercent =
                column.wipLimit > 0 && Number.isFinite(column.wipLimit)
                  ? Math.min((column.cards.length / column.wipLimit) * 100, 100)
                  : 0;

              return (
                <Box
                  key={column.id}
                  onDragOver={(event) => {
                    event.preventDefault();
                    event.dataTransfer.dropEffect = "move";
                  }}
                  onDrop={() => handleColumnDrop(column.id)}
                  sx={{
                    minWidth: 330,
                    width: 330,
                    flexShrink: 0,
                    borderRadius: 3,
                    border:
                      draggingCardMeta ? `1px solid ${tone.accent}66` : "1px solid rgba(148,163,184,0.18)",
                    background: tone.bg,
                    boxShadow: "0px 6px 18px rgba(15,23,42,0.05)",
                    display: "flex",
                    flexDirection: "column",
                    maxHeight: { xs: 560, lg: 680 },
                    minHeight: { xs: 560, lg: 680 },
                  }}
                >
                  <Box 
                  >

                     <Box
                      sx={{
                        mb: 1.1,
                        height: 6,
                        borderRadius: 999,
                        bgcolor: "rgba(148,163,184,0.18)",
                        overflow: "hidden",
                      }}
                    >
                      <Box
                        sx={{
                          width: `${wipPercent}%`,
                          height: "100%",
                          bgcolor: tone.accent,
                          borderRadius: 999,
                        }}
                      />
                    </Box>


                    <Stack spacing={1} margin={1}>
                      <TextField
                        value={column.title}
                        onChange={(event) => handleColumnTitleChange(column.id, event.target.value)}
                        size="small"
                        fullWidth
                        inputProps={{
                          style: {
                            fontWeight: 900,
                            fontSize: "1rem",
                           },
                        }}
                      />
                     
                    </Stack>

                   

                   
                  </Box>

                  <Stack
                    spacing={1.2}
                    sx={{
                      px: 1.2,
                      pb: 1.2,
                      minHeight: 0,
                      flex: 1,
                      overflowY: "auto",
                      overflowX: "hidden",
                      "&::-webkit-scrollbar": {
                        width: 8,
                      },
                      "&::-webkit-scrollbar-thumb": {
                        backgroundColor: "rgba(148,163,184,0.4)",
                        borderRadius: 999,
                      },
                    }}
                  >
                    {column.cards.length > 0 ? (
                      column.cards.map((card) => (
                        <Box
                          key={card.id}
                          draggable
                          onDragStart={(event) => handleCardDragStart(event, card.id, column.id)}
                          onDragEnd={() => setDraggingCardMeta(null)}
                          onClick={() => openEditTaskDrawer(card, column.id)}
                          sx={{
                            borderRadius: 2.5,
                            p: 1.4,
                            border: "1px solid rgba(148,163,184,0.16)",
                            bgcolor: "rgba(255,255,255,0.96)",
                            boxShadow: "0px 8px 18px rgba(15,23,42,0.05)",
                            transition: "transform 0.18s ease, box-shadow 0.18s ease",
                            cursor: "pointer",
                            "&:hover": {
                              transform: "translateY(-2px)",
                              boxShadow: "0px 12px 24px rgba(15,23,42,0.08)",
                            },
                          }}
                        >
                          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
                            <Chip
                              label={card.code}
                              size="small"
                              sx={{
                                height: 24,
                                fontWeight: 800,
                                bgcolor: "rgba(37,99,235,0.08)",
                                color: "#1D4ED8",
                              }}
                            />
                            <DragIndicatorRoundedIcon
                              fontSize="small"
                              sx={{ color: "text.secondary", mt: 0.25 }}
                            />
                          </Stack>

                          <Typography
                            variant="body1"
                            sx={{
                              mt: 1.1,
                              fontWeight: 800,
                              color: "#0F172A",
                              lineHeight: 1.35,
                            }}
                          >
                            {card.title}
                          </Typography>

                          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.65 }}>
                            {card.project}
                          </Typography>

                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                            flexWrap="wrap"
                            useFlexGap
                            sx={{ mt: 1.25 }}
                          >
                            <PriorityBadge priority={card.priority} />
                            <Chip
                              label={card.assignee || "Unassigned"}
                              size="small"
                              variant="outlined"
                              sx={{
                                height: 26,
                                fontWeight: 600,
                                bgcolor: "rgba(248,250,252,0.9)",
                              }}
                            />
                            {card.module ? (
                              <Chip
                                label={card.module}
                                size="small"
                                sx={{
                                  height: 24,
                                  bgcolor: "rgba(241,245,249,0.95)",
                                  color: "#475569",
                                }}
                              />
                            ) : null}
                            {isActiveStage(column) && card.stageEnteredAt ? (
                              <Chip
                                label={`In stage ${formatStageElapsed(
                                  card.stageEnteredAt,
                                  timerTick,
                                  card.stagePausedDurationMs ?? 0,
                                  card.stagePausedAt,
                                )}${card.stagePausedAt ? " paused" : ""}`}
                                size="small"
                                sx={{
                                  height: 24,
                                  bgcolor: `${tone.accent}14`,
                                  color: tone.accent,
                                  fontWeight: 700,
                                }}
                              />
                            ) : null}
                          </Stack>

                          <Stack direction="row" spacing={0.8} flexWrap="wrap" useFlexGap sx={{ mt: 1.25 }}>
                            <Chip
                              label={`Due ${card.dueDate || "TBD"}`}
                              size="small"
                              sx={{
                                height: 24,
                                bgcolor: "rgba(248,250,252,0.95)",
                                color: "#475569",
                              }}
                            />
                            <Chip
                              label={`${card.estimateHours}h estimate`}
                              size="small"
                              sx={{
                                height: 24,
                                bgcolor: "rgba(248,250,252,0.95)",
                                color: "#475569",
                              }}
                            />
                          </Stack>

                          <Typography variant="caption" color="text.secondary" sx={{ mt: 1.15, display: "block" }}>
                            Click to view or edit task details
                          </Typography>
                        </Box>
                      ))
                    ) : (
                      <Box
                        sx={{
                          borderRadius: 2.5,
                          border: "1px dashed rgba(148,163,184,0.3)",
                          bgcolor: "rgba(255,255,255,0.55)",
                          minHeight: 160,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          p: 2,
                          textAlign: "center",
                        }}
                      >
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            No cards in this lane
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.4, display: "block" }}>
                            Navo task add karo ke drag kari ne aa stage ma muki do.
                          </Typography>
                        </Box>
                      </Box>
                    )}
                  </Stack>
                </Box>
              );
            })}
          </Box>
        </Box>
      </Stack>

      <Drawer anchor="right" open={taskDrawerOpen} onClose={closeTaskDrawer} sx={drawerPaperSx}>
        <Box
          sx={{
            px: 2,
            pt: { xs: 8, sm: 9 },
            pb: 2,
            minHeight: "100%",
            display: "flex",
            flexDirection: "column",
            boxSizing: "border-box",
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1.25}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                {taskMode === "create" ? "Create Kanban Task" : `Task Detail - ${taskFormValues.code}`}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.6 }}>
                Active stage ma gaya pachi elapsed timer start thase, ane task ne previous stage ma pachhu move kari shakay nahi.
              </Typography>
            </Box>
            <IconButton onClick={closeTaskDrawer}>
              <CloseRoundedIcon />
            </IconButton>
          </Stack>

          <Box sx={{ flex: 1, overflowY: "auto", pt: 2 }}>
            <Stack spacing={2}>
              {(() => {
                const currentStage = boardColumns.find((column) => column.id === taskFormValues.stageColumnId);
                const currentCard = boardColumns
                  .flatMap((column) => column.cards)
                  .find((card) => card.id === taskFormValues.id);

                return currentStage && isActiveStage(currentStage) ? (
                  <Alert severity="info">
                    Aa task active stage ma{" "}
                    {formatStageElapsed(
                      currentCard?.stageEnteredAt,
                      timerTick,
                      currentCard?.stagePausedDurationMs ?? 0,
                      currentCard?.stagePausedAt,
                    ) || "00h 00m 00s"}{" "}
                    thi che{currentCard?.stagePausedAt ? ", ane support chalu hova thi timer halt par che." : "."}
                  </Alert>
                ) : null;
              })()}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
                  gap: 2,
                }}
              >
                <TextField
                  label="Task Code"
                  value={taskFormValues.code}
                  onChange={handleTaskFieldChange("code")}
                  size="small"
                  fullWidth
                />
                <TextField
                  select
                  label="Stage"
                  value={taskFormValues.stageColumnId}
                  onChange={handleTaskFieldChange("stageColumnId")}
                  size="small"
                  fullWidth
                >
                  {boardColumns.map((column, index) => (
                    <MenuItem
                      key={column.id}
                      value={column.id}
                      disabled={
                        taskMode === "edit" &&
                        index <
                          boardColumns.findIndex(
                            (boardColumn) => boardColumn.id === taskFormValues.sourceColumnId,
                          )
                      }
                    >
                      {column.title}
                    </MenuItem>
                  ))}
                </TextField>
                <Box sx={{ gridColumn: "1 / -1" }}>
                  <TextField
                    label="Task Title"
                    value={taskFormValues.title}
                    onChange={handleTaskFieldChange("title")}
                    size="small"
                    fullWidth
                  />
                </Box>
                <TextField
                  select
                  label="Project"
                  value={taskFormValues.project}
                  onChange={handleTaskFieldChange("project")}
                  size="small"
                  fullWidth
                >
                  {availableProjects.map((project) => (
                    <MenuItem key={project} value={project}>
                      {project}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  label="Assignee"
                  value={taskFormValues.assignee}
                  onChange={handleTaskFieldChange("assignee")}
                  size="small"
                  fullWidth
                />
                <TextField
                  select
                  label="Priority"
                  value={taskFormValues.priority}
                  onChange={handleTaskFieldChange("priority")}
                  size="small"
                  fullWidth
                >
                  {priorityOptions.map((priority) => (
                    <MenuItem key={priority} value={priority}>
                      {priority}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  label="Estimate Hours"
                  value={taskFormValues.estimateHours}
                  onChange={handleTaskFieldChange("estimateHours")}
                  size="small"
                  fullWidth
                />
                <TextField
                  label="Due Date"
                  type="date"
                  value={taskFormValues.dueDate}
                  onChange={handleTaskFieldChange("dueDate")}
                  size="small"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  label="Module"
                  value={taskFormValues.module}
                  onChange={handleTaskFieldChange("module")}
                  size="small"
                  fullWidth
                />
                <Box sx={{ gridColumn: "1 / -1" }}>
                  <TextField
                    label="Tags"
                    value={taskFormValues.tags}
                    onChange={handleTaskFieldChange("tags")}
                    size="small"
                    fullWidth
                    helperText="Comma separated tags"
                  />
                </Box>
                <Box sx={{ gridColumn: "1 / -1" }}>
                  <TextField
                    label="Description"
                    value={taskFormValues.description}
                    onChange={handleTaskFieldChange("description")}
                    multiline
                    minRows={5}
                    fullWidth
                  />
                </Box>
              </Box>
            </Stack>
          </Box>

          <Stack direction="row" spacing={1.25} sx={{ pt: 2 }}>
            <Button variant="contained" onClick={handleTaskSave} sx={{ borderRadius: 999 }}>
              {taskMode === "create" ? "Add Task" : "Save Changes"}
            </Button>
            <Button variant="outlined" onClick={closeTaskDrawer} sx={{ borderRadius: 999 }}>
              Close
            </Button>
          </Stack>
        </Box>
      </Drawer>
    </>
  );
};

export default ProjectManagementKanbanPage;
