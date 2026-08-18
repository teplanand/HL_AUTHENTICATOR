import { useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import TimelineIcon from "@mui/icons-material/Timeline";
import { formatDateWithShortMonth } from "../../../shared/utils/FormatDate";

type StepStatus = "Not Started" | "In Progress" | "Completed";

type TimelineStep = {
  key: string;
  title: string;
  planDate?: unknown;
  actualDate?: unknown;
  status: StepStatus;
  color: string;
  detailLines?: string[];
  highlight?: boolean;
  hidePlanActual?: boolean;
};

type TimelineStageContent = {
  stageKey:
    | "design"
    | "planning"
    | "manufacturing"
    | "assembly"
    | "qc"
    | "dispatch"
    | "painting";
  title: string;
  description: string;
  steps: TimelineStep[];
};

type OrderTrackingTimelineContentProps = {
  stage?: string;
  rowData?: Record<string, unknown> | null;
  embedded?: boolean;
  setDisplayTitle?: (title: string) => void;
  setHideFooter?: (hidden: boolean) => void;
  setWidth?: (width: number | string) => void;
};

const statusColorMap: Record<StepStatus, string> = {
  "Not Started": "#9CA3AF",
  "In Progress": "#2563EB",
  "Completed": "#22C55E",
};

const normalizeStageKey = (stage?: string) => {
  const normalized = String(stage ?? "")
    .trim()
    .toLowerCase();

  switch (normalized) {
    case "design":
      return "design" as const;
    case "amp":
    case "planning":
      return "planning" as const;
    case "mfg":
    case "manufacturing":
      return "manufacturing" as const;
    case "assembly":
      return "assembly" as const;
    case "testing":
    case "qc":
      return "qc" as const;
    case "dispatch":
      return "dispatch" as const;
    case "painting":
      return "painting" as const;
    default:
      return "design" as const;
  }
};

const formatDate = (value: unknown) => {
  if (!value) {
    return "-";
  }

  return formatDateWithShortMonth(String(value)) || "-";
};

const formatValue = (value: unknown) =>
  value === null || value === undefined || value === "" ? "-" : String(value);

const hasMeaningfulValue = (value: unknown) =>
  value !== null &&
  value !== undefined &&
  (!(typeof value === "string") || value.trim() !== "");

export const getStepStatus = (plan: unknown, actual: unknown): StepStatus => {
  if (!hasMeaningfulValue(plan) && !hasMeaningfulValue(actual)) {
    return "Not Started";
  }

  if (hasMeaningfulValue(plan) && !hasMeaningfulValue(actual)) {
    return "In Progress";
  }

  if (hasMeaningfulValue(plan) && hasMeaningfulValue(actual)) {
    return "Completed";
  }

  return "Not Started";
};

const getCompletionColor = (plan: unknown, actual: unknown) => {
  if (!hasMeaningfulValue(plan) && !hasMeaningfulValue(actual)) {
    return statusColorMap["Not Started"];
  }

  if (hasMeaningfulValue(plan) && !hasMeaningfulValue(actual)) {
    return statusColorMap["In Progress"];
  }

  if (!hasMeaningfulValue(plan) && hasMeaningfulValue(actual)) {
    return statusColorMap["Completed"];
  }

  const planDate = new Date(String(plan));
  const actualDate = new Date(String(actual));

  if (!Number.isNaN(planDate.getTime()) && !Number.isNaN(actualDate.getTime())) {
    return planDate.getTime() >= actualDate.getTime() ? "#22C55E" : "#EF4444";
  }

  const planNumber = Number(plan);
  const actualNumber = Number(actual);

  if (!Number.isNaN(planNumber) && !Number.isNaN(actualNumber)) {
    return planNumber >= actualNumber ? "#22C55E" : "#EF4444";
  }

  return statusColorMap["Completed"];
};

const getDesignCycleStatus = (value1: unknown, value2: unknown): StepStatus => {
  const first = Number(value1);
  const second = Number(value2);
  const hasFirstProgress = !Number.isNaN(first) && first > 0;
  const hasSecondProgress = !Number.isNaN(second) && second > 0;

  if (!hasFirstProgress && !hasSecondProgress) {
    return "Not Started";
  }

  if (hasFirstProgress && !hasSecondProgress) {
    return "In Progress";
  }

  return "Completed";
};

const getDesignCycleColor = (value1: unknown, value2: unknown) => {
  const status = getDesignCycleStatus(value1, value2);

  if (status !== "Completed") {
    return statusColorMap[status];
  }

  const first = Number(value1);
  const second = Number(value2);

  if (!Number.isNaN(first) && !Number.isNaN(second) && second > first) {
    return "#EF4444";
  }

  return statusColorMap.Completed;
};

const buildTimelineStage = (
  stage: string | undefined,
  rowData: Record<string, unknown> | null
): TimelineStageContent => {
  const stageKey = normalizeStageKey(stage);
  const activeLabel = String(stage ?? "").trim().toLowerCase();

  const buildPlanActualStep = (
    key: string,
    title: string,
    planField: string,
    actualField: string,
    aliases: string[] = []
  ): TimelineStep => ({
    key,
    title,
    planDate: rowData?.[planField],
    actualDate: rowData?.[actualField],
    status: getStepStatus(rowData?.[planField], rowData?.[actualField]),
    color: getCompletionColor(rowData?.[planField], rowData?.[actualField]),
    highlight:
      activeLabel === title.toLowerCase() ||
      aliases.includes(activeLabel),
  });

  switch (stageKey) {
    case "design":
      return {
        stageKey,
        title: "Design Timeline",
        description: "Track drawing submission, approval, BOM progress, and design-cycle validation.",
        steps: [
          buildPlanActualStep(
            "ga_drawing_submission",
            "GA Drawing Submission",
            "ga_dim_drw_submission_design_plan",
            "ga_dim_drw_submission_design_actual"
          ),
          buildPlanActualStep(
            "final_drawing_approval",
            "Final Drawing Approval",
            "final_drg_approval_received_date_plan",
            "final_drg_approval_received_date_actual"
          ),
          buildPlanActualStep("bom", "BOM", "bom_plan", "bom_actual", ["bom"]),
          {
            key: "drawing_cycle_time_check",
            title: "Drawing Cycle Time Check",
            status: getDesignCycleStatus(
              rowData?.po_received_date_to_ga_drw_submission_days,
              rowData?.ga_drawing_submission_to_final_approval_received_days
            ),
            color: getDesignCycleColor(
              rowData?.po_received_date_to_ga_drw_submission_days,
              rowData?.ga_drawing_submission_to_final_approval_received_days
            ),
            detailLines: [
              `PO to GA Submission Days: ${formatValue(
                rowData?.po_received_date_to_ga_drw_submission_days
              )}`,
              `GA Submission to Approval Days: ${formatValue(
                rowData?.ga_drawing_submission_to_final_approval_received_days
              )}`,
            ],
            hidePlanActual: true,
          },
        ],
      };
    case "planning":
      return {
        stageKey,
        title: "Planning Timeline",
        description: "Track planning progress through AMP plan vs actual completion.",
        steps: [
          buildPlanActualStep("amp", "AMP", "amp_plan", "amp_actual", ["amp"]),
        ],
      };
    case "manufacturing":
      return {
        stageKey,
        title: "Manufacturing Timeline",
        description: "See each manufacturing checkpoint to understand exactly where the process is blocked.",
        steps: [
          buildPlanActualStep(
            "gear_case",
            "Gear Case",
            "gear_case_plan",
            "gearcase_actual",
            ["gearcase", "gear case"]
          ),
          buildPlanActualStep(
            "internal",
            "Internal",
            "internal_plan",
            "internal_actual",
            ["internal"]
          ),
          buildPlanActualStep("bo", "BO", "bo_plan", "bo_actual", ["bo"]),
          buildPlanActualStep(
            "assembly",
            "Assembly",
            "assembly_plan",
            "assembly_actual",
            ["assembly"]
          ),
        ],
      };
    case "assembly":
      return {
        stageKey,
        title: "Assembly Timeline",
        description: "Track the assembly checkpoint through plan vs actual completion.",
        steps: [
          buildPlanActualStep(
            "assembly",
            "Assembly",
            "assembly_plan",
            "assembly_actual",
            ["assembly"]
          ),
        ],
      };
    case "qc":
      return {
        stageKey,
        title: "QC Timeline",
        description: "Track quality-control progress through testing plan vs actual.",
        steps: [
          buildPlanActualStep(
            "testing",
            "Testing",
            "testing_plan",
            "testing_actual",
            ["testing"]
          ),
        ],
      };
    case "dispatch":
      return {
        stageKey,
        title: "Dispatch Timeline",
        description: "Track dispatch readiness using dispatch plan vs actual dates.",
        steps: [
          buildPlanActualStep(
            "dispatch",
            "Dispatch",
            "dispatch_date_plan",
            "dispatch_date_actual",
            ["dispatch"]
          ),
        ],
      };
    case "painting":
      return {
        stageKey,
        title: "Painting Timeline",
        description: "Detailed painting steps are not configured yet.",
        steps: [
          {
            key: "painting_pending_config",
            title: "Painting Step Configuration",
            status: "Not Started",
            color: statusColorMap["Not Started"],
            detailLines: ["No internal painting timeline fields are available yet."],
          },
        ],
      };
  }
};

export const OrderTrackingTimelineContent = ({
  stage,
  rowData,
  embedded = false,
  setDisplayTitle,
  setHideFooter,
  setWidth,
}: OrderTrackingTimelineContentProps) => {
  const timelineStage = useMemo(
    () => buildTimelineStage(stage, rowData),
    [rowData, stage]
  );

  useEffect(() => {
    if (!embedded) {
      return;
    }

    setDisplayTitle?.(timelineStage.title);
    setHideFooter?.(true);
    setWidth?.("780px");
  }, [embedded, setDisplayTitle, setHideFooter, setWidth, timelineStage.title]);

  return (
    <Box className="grid gap-2">
      {!embedded ? (
        <Box>
          <Typography variant="h4" fontWeight={700}>
            {timelineStage.title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {timelineStage.description}
          </Typography>
        </Box>
      ) : null}

      <Box className="rounded-lg">
        <CardContent className="grid gap-2">
          <Box className="grid gap-0.5">
            <Typography variant="subtitle2" color="text.secondary">
              Order Summary
            </Typography>
            <Typography variant="body1" fontWeight={600}>
              Line ID: {String(rowData?.line_id ?? "-")}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Customer: {String(rowData?.end_cust_name ?? "-")}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Item: {String(rowData?.ora_item_desc ?? "-")}
            </Typography>
          </Box>

          <Divider />

          <Box>
            <Typography variant="subtitle1" fontWeight={700}>
              {timelineStage.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {timelineStage.description}
            </Typography>
          </Box>

          <Stack spacing={1.5}>
            {timelineStage.steps.map((step) => (
              <Box
                key={step.key}
                
              >
                 

                <Card
                  variant="outlined"
                   
                >
                  <CardContent className="grid gap-5">
                    <Box
                      className="flex flex-wrap items-center justify-between gap-2"
                    >
                      <Box className="flex items-center gap-2">
                        <TimelineIcon
                          fontSize="small"
                          color={step.highlight ? "primary" : "disabled"}
                        />
                        <Typography variant="subtitle1" fontWeight={700}>
                          {step.title}
                        </Typography>
                      </Box>
                      <Chip
                        label={step.status}
                        size="small"
                        className="font-semibold !text-white [&_.MuiChip-label]:!text-white"
                        style={{ backgroundColor: step.color }}
                      />
                    </Box>

                    {!step.hidePlanActual ? (
                      <Box className="grid gap-1.5 sm:grid-cols-2">
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Plan Date
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {formatDate(step.planDate)}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Actual Date
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {formatDate(step.actualDate)}
                          </Typography>
                        </Box>
                      </Box>
                    ) : null}

                    {step.detailLines?.length ? (
                      <Stack spacing={0.25}>
                        {step.detailLines.map((line) => (
                          <Typography key={line} variant="body2" color="text.secondary">
                            {line}
                          </Typography>
                        ))}
                      </Stack>
                    ) : null}
                  </CardContent>
                </Card>

                 
              </Box>
            ))}
          </Stack>
        </CardContent>
      </Box>
    </Box>
  );
};

const OrderTrackingTimelinePage = () => {
  const navigate = useNavigate();
  const { state } = useLocation() as {
    state?: {
      stage?: string;
      rowData?: Record<string, unknown>;
    };
  };

  return (
    <Box className="grid gap-2">
      <Box
        className="flex flex-wrap items-center justify-between gap-2"
      >
        <Box>
          <Typography variant="h4" fontWeight={700}>
            {String(state?.stage ?? "Timeline")} Timeline
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Stage-wise internal steps for the selected order tracking process.
          </Typography>
        </Box>
        <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>
          Back
        </Button>
      </Box>

      <OrderTrackingTimelineContent stage={state?.stage} rowData={state?.rowData ?? null} />
    </Box>
  );
};

export default OrderTrackingTimelinePage;
