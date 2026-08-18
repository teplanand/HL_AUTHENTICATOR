import React, { useCallback, useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { Box, Button, ButtonBase, Card, CardContent, Chip, TextField, Tooltip, Typography } from "@mui/material";
import {
  GridColDef,
  GridFilterInputValueProps,
  GridFilterModel,
  getGridDateOperators,
  GridFilterOperator,
  GridPaginationModel,
  GridRenderCellParams,
  GridSortModel,
} from "@mui/x-data-grid";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

import ApiActionButton from "../../../shared/components/common/ApiActionButton";
import ReusableDataGrid from "../../../shared/components/common/ReusableDataGrid";
import { useModal } from "../../../shared/hooks/useModal";
import { useGetOrdersMutation } from "./api/ordertracking";
import OpenEditPlanModal from "./Dashboard/components/AddEditPlan";
import { ViewDetails, ViewDetailsRef } from "./Dashboard/components/viewdetails";
import { OrderTrackingTimelineContent } from "./timeline";
import { formatDateWithShortMonth, SHORT_MONTH_DATE_FORMAT } from "../../../shared/utils/FormatDate";
import { ordertrackingdata } from "./Dashboard/data";

////// filter by number

const ORDER_TRACKING_COLORS = {
  slate: "#64748b",
  warning: "#f59e0b",
  success: "#10b981",
  danger: "#ef4444",
  statusSuccess: "#22C55E",
  statusDanger: "#EF4444",
  statusInfo: "#2563EB",
  statusMuted: "#9CA3AF",
} as const;

const STATUS_COLORS = {
  "Not Started": ORDER_TRACKING_COLORS.statusMuted,
  "In Progress": ORDER_TRACKING_COLORS.statusInfo,
  "Completed": ORDER_TRACKING_COLORS.statusSuccess,
} as const;

const SUMMARY_STATUS_COLORS = {
  "Completed On Time": ORDER_TRACKING_COLORS.statusSuccess,
  "Completed Delayed": ORDER_TRACKING_COLORS.statusDanger,
  "In Progress On Time": ORDER_TRACKING_COLORS.statusInfo,
  "In Progress Delay": "#60A5FA",
  "Not Started": ORDER_TRACKING_COLORS.statusMuted,
} as const;

const STAGE_ACCENT_COLORS = {
  Design: ORDER_TRACKING_COLORS.slate,
  Manufacturing: ORDER_TRACKING_COLORS.warning,
  Assembly: ORDER_TRACKING_COLORS.success,
  Testing: ORDER_TRACKING_COLORS.danger,
  Dispatch: ORDER_TRACKING_COLORS.success,
} as const;

const withAlpha = (hexColor: string, alpha: string) => `${hexColor}${alpha}`;

const ORDER_TRACKING_TOOLTIP_PROPS = {
  arrow: true,
  slotProps: {
    tooltip: {
      className:
        "!rounded-md !border !border-gray-200 !bg-white !px-2.5 !py-1.5 !text-xs !font-medium !text-gray-800 shadow-sm dark:!border-gray-700 dark:!bg-gray-900 dark:!text-white/90",
    },
    arrow: {
      className: "!text-white dark:!text-gray-900",
    },
  },
} as const;

const summaryCardClassMap: Record<
  string,
  { card: string; active: string; value: string; numberColor: string }
> = {
  Design: {
    card: "dashboard-stat-card dashboard-stat-card--requested",
    active: "dashboard-stat-card--requested-active",
    value: "dashboard-stat-value--requested",
    numberColor: STAGE_ACCENT_COLORS.Design,
  },
  Manufacturing: {
    card: "dashboard-stat-card dashboard-stat-card--pending",
    active: "dashboard-stat-card--pending-active",
    value: "dashboard-stat-value--pending",
    numberColor: STAGE_ACCENT_COLORS.Manufacturing,
  },
  Assembly: {
    card: "dashboard-stat-card dashboard-stat-card--approved",
    active: "dashboard-stat-card--approved-active",
    value: "dashboard-stat-value--approved",
    numberColor: STAGE_ACCENT_COLORS.Assembly,
  },
  Testing: {
    card: "dashboard-stat-card dashboard-stat-card--rejected",
    active: "dashboard-stat-card--rejected-active",
    value: "dashboard-stat-value--rejected",
    numberColor: STAGE_ACCENT_COLORS.Testing,
  },
  Dispatch: {
    card: "dashboard-stat-card dashboard-stat-card--approved",
    active: "dashboard-stat-card--approved-active",
    value: "dashboard-stat-value--approved",
    numberColor: STAGE_ACCENT_COLORS.Dispatch,
  },
};

const processStageColumns = [
  { field: "design", headerName: "Design" },
  { field: "manufacturing", headerName: "Mfg"  },
  { field: "assembly", headerName: "Assembly"  },
  { field: "testing", headerName: "Testing"  },
  { field: "dispatch", headerName: "Dispatch"  },
] as const;

const planDateColumns = [
  { field: "amp_actual", headerName: "AMP Date"  },
  { field: "bom_actual", headerName: "BOM Date"  },
  { field: "gearcase_actual", headerName: "Gearcase Date"  },
  { field: "internal_actual", headerName: "Internal Date"  },
  { field: "bo_actual", headerName: "BO Date" },
  { field: "assembly_actual", headerName: "Assembly Date" },
  { field: "testing_actual", headerName: "Testing Date"  },
  { field: "dispatch_date_actual", headerName: "Dispatch Date",  filterable: true },
] as const;

const orderTrackingStageValueOptions = [
  "Not Started",
  "In Progress",
  "Completed",
] as const;

const orderTrackingCurrentStageOptions = [
  "Not Started",
  "Design",
  "Mfg",
  "Assembly",
  "Testing",
  "Dispatch",
  "Completed",
] as const;

const currentStatusBadgeColorMap = {
  "Not Started": ORDER_TRACKING_COLORS.statusMuted,
  Design: STAGE_ACCENT_COLORS.Design,
  Mfg: STAGE_ACCENT_COLORS.Manufacturing,
  Assembly: STAGE_ACCENT_COLORS.Assembly,
  Testing: STAGE_ACCENT_COLORS.Testing,
  Dispatch: STAGE_ACCENT_COLORS.Dispatch,
  Completed: ORDER_TRACKING_COLORS.statusSuccess,
} as const;

const HEADER_SEARCHABLE_FIELDS = new Set([
  "cust_po_no",
  "division",
  "sub_division",
  "order_type",
  "work_order_no",
  "line_no",
  "spare_gearbox",
  "qty",
  "item_code",
  "currency",
  "cust_po_date",
  "delivery_date_po",
  "commited_ex_works_delivery_date",
  "perc_time_taken_of_total_po_delivery",
  "end_cust_name",
  "branch_name",
  "uom",
  "po_value",
  "status_code",
]);

const actualToPlanFieldMap: Record<string, string> = {
  amp_actual: "amp_plan",
  bom_actual: "bom_plan",
  gearcase_actual: "gear_case_plan",
  internal_actual: "internal_plan",
  bo_actual: "bo_plan",
  assembly_actual: "assembly_plan",
  testing_actual: "testing_plan",
  dispatch_date_actual: "dispatch_date_plan",
};

const summaryCardKeys: Record<(typeof processStageColumns)[number]["field"], string> = {
  design: "Design",
  manufacturing: "Manufacturing",
  assembly: "Assembly",
  testing: "Testing",
  dispatch: "Dispatch",
};

const summaryStatuses = [
  { key: "Completed On Time", color: SUMMARY_STATUS_COLORS["Completed On Time"], tooltip: "Completed On Time" },
  { key: "Completed Delayed", color: SUMMARY_STATUS_COLORS["Completed Delayed"], tooltip: "Completed Delayed" },
  // { key: "In Progress On Time", color: SUMMARY_STATUS_COLORS["In Progress On Time"], tooltip: "In Progress On Time" },
  // { key: "In Progress Delay", color: SUMMARY_STATUS_COLORS["In Progress Delay"], tooltip: "In Progress Delay" },
  // { key: "Not Started", color: SUMMARY_STATUS_COLORS["Not Started"], tooltip: "Not Started" },
] as const;

type SummaryStatusKey = (typeof summaryStatuses)[number]["key"];
type ProcessStageField = (typeof processStageColumns)[number]["field"];
type DateFilterInputProps = GridFilterInputValueProps;
const DAY_IN_MS = 24 * 60 * 60 * 1000;

dayjs.extend(customParseFormat);

const parseOrderTrackingFilterDate = (value: unknown) => {
  if (!value || typeof value !== "string") {
    return null;
  }

  const parsedValue = dayjs(
    value,
    ["YYYY-MM-DD", SHORT_MONTH_DATE_FORMAT, "D-MMM-YYYY", "DD/MM/YYYY", "D/M/YYYY"],
    true
  );
  return parsedValue.isValid() ? parsedValue : null;
};

const formatOrderTrackingFilterDate = (value: unknown) => {
  const parsedValue = parseOrderTrackingFilterDate(value);
  return parsedValue ? parsedValue.format(SHORT_MONTH_DATE_FORMAT) : "";
};

const formatOrderTrackingExportDate = (value: unknown) => {
  if (!value) {
    return "";
  }

  return formatDateWithShortMonth(String(value));
};

const OrderTrackingDateFilterInput = React.memo((props: DateFilterInputProps) => {
  const { item, applyValue, focusElementRef, disabled, slotProps } = props;
  const [inputValue, setInputValue] = useState(() => formatOrderTrackingFilterDate(item.value));

  useEffect(() => {
    setInputValue(formatOrderTrackingFilterDate(item.value));
  }, [item.value]);

  const commitValue = useCallback((nextInputValue: string) => {
    if (!nextInputValue) {
      applyValue({
        ...item,
        value: "",
      });
      return;
    }

    const parsedValue = parseOrderTrackingFilterDate(nextInputValue);
    if (!parsedValue) {
      return;
    }

    applyValue({
      ...item,
      value: parsedValue.format("YYYY-MM-DD"),
    });
  }, [applyValue, item]);

  return (
    <TextField
      value={inputValue}
      disabled={disabled}
      onChange={(event) => {
        const nextInputValue = event.target.value;
        setInputValue(nextInputValue);
        commitValue(nextInputValue);
      }}
      onBlur={() => {
        const parsedValue = parseOrderTrackingFilterDate(inputValue);

        if (!inputValue) {
          commitValue("");
          return;
        }

        if (!parsedValue) {
          setInputValue("");
          commitValue("");
          return;
        }

        const normalizedValue = parsedValue.format(SHORT_MONTH_DATE_FORMAT);
        setInputValue(normalizedValue);
        commitValue(normalizedValue);
      }}
      onKeyDown={(event) => {
        if (event.key !== "Enter") {
          return;
        }

        const parsedValue = parseOrderTrackingFilterDate(inputValue);
        if (!parsedValue) {
          return;
        }

        const normalizedValue = parsedValue.format(SHORT_MONTH_DATE_FORMAT);
        setInputValue(normalizedValue);
        commitValue(normalizedValue);
      }}
      placeholder={SHORT_MONTH_DATE_FORMAT}
      size="small"
      inputRef={focusElementRef}
      inputProps={{
        inputMode: "text",
        maxLength: 11,
      }}
      sx={{
        width: 160,
        ...(slotProps?.root ?? {}),
      }}
    />
  );
});

const orderTrackingDateFilterOperators: GridFilterOperator[] = getGridDateOperators(false).map((operator) => ({
  ...operator,
  InputComponent: OrderTrackingDateFilterInput,
}));

const getGridDateValue = (row: Record<string, unknown>, field: string) => {
  const rawValue = row?.[field];

  if (!rawValue) {
    return null;
  }

  const parsedDate = new Date(String(rawValue));
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
};

const getOrderTrackingPlanOrActualDateValue = (
  row: Record<string, unknown>,
  actualField: string,
) => {
  const planField = actualToPlanFieldMap[actualField];

  return (
    getGridDateValue(row, actualField) ||
    (planField ? getGridDateValue(row, planField) : null)
  );
};

const orderTrackingExportOnlyColumns: GridColDef[] = [
  {
    field: "work_order_date",
    headerName: "Order Booked Date",
    valueFormatter: (value) => formatOrderTrackingExportDate(value),
    sortable: false,
    filterable: false,
    disableColumnMenu: true,
  },
  {
    field: "item_description_export",
    headerName: "Item Description",
    valueGetter: (_value: unknown, row: Record<string, unknown>) =>
      String(row.ora_item_desc ?? row.item_desc_cust_po ?? ""),
    sortable: false,
    filterable: false,
    disableColumnMenu: true,
    minWidth: 220,
  },
  {
    field: "ga_dim_drw_submission_design_plan",
    headerName: "GA Submission Plan Date",
    valueFormatter: (value) => formatOrderTrackingExportDate(value),
    sortable: false,
    filterable: false,
    disableColumnMenu: true,
  },
  {
    field: "final_drg_approval_received_date_plan",
    headerName: "Final Approval Plan Date",
    valueFormatter: (value) => formatOrderTrackingExportDate(value),
    sortable: false,
    filterable: false,
    disableColumnMenu: true,
  },
  {
    field: "amp_plan",
    headerName: "AMP Plan Date",
    valueFormatter: (value) => formatOrderTrackingExportDate(value),
    sortable: false,
    filterable: false,
    disableColumnMenu: true,
  },
  {
    field: "bom_plan",
    headerName: "BOM Plan Date",
    valueFormatter: (value) => formatOrderTrackingExportDate(value),
    sortable: false,
    filterable: false,
    disableColumnMenu: true,
  },
  {
    field: "gear_case_plan",
    headerName: "Gear Case Plan Date",
    valueFormatter: (value) => formatOrderTrackingExportDate(value),
    sortable: false,
    filterable: false,
    disableColumnMenu: true,
  },
  {
    field: "internal_plan",
    headerName: "Internal Plan Date",
    valueFormatter: (value) => formatOrderTrackingExportDate(value),
    sortable: false,
    filterable: false,
    disableColumnMenu: true,
  },
  {
    field: "bo_plan",
    headerName: "BO Plan Date",
    valueFormatter: (value) => formatOrderTrackingExportDate(value),
    sortable: false,
    filterable: false,
    disableColumnMenu: true,
  },
  {
    field: "assembly_plan",
    headerName: "Assembly Plan Date",
    valueFormatter: (value) => formatOrderTrackingExportDate(value),
    sortable: false,
    filterable: false,
    disableColumnMenu: true,
  },
  {
    field: "testing_plan",
    headerName: "Testing Plan Date",
    valueFormatter: (value) => formatOrderTrackingExportDate(value),
    sortable: false,
    filterable: false,
    disableColumnMenu: true,
  },
  {
    field: "dispatch_date_plan",
    headerName: "Dispatch Plan Date",
    valueFormatter: (value) => formatOrderTrackingExportDate(value),
    sortable: false,
    filterable: false,
    disableColumnMenu: true,
  },
];

const orderTrackingExportFields = [
  "line_id",
  "cust_po_no",
  "division",
  "sub_division",
  "order_type",
  "work_order_no",
  "line_no",
  "spare_gearbox",
  "end_cust_name",
  "branch_name",
  "qty",
  "uom",
  "po_value",
  "item_code",
  "currency",
  "cust_po_date",
  "work_order_date",
  "item_description_export",
  "delivery_date_po",
  "commited_ex_works_delivery_date",
  "perc_time_taken_of_total_po_delivery",
  "status_code",
  "current_status",
  "design",
  "manufacturing",
  "assembly",
  "testing",
  "dispatch",
  "ga_dim_drw_submission_design_plan",
  "final_drg_approval_received_date_plan",
  "amp_plan",
  "bom_plan",
  "gear_case_plan",
  "internal_plan",
  "bo_plan",
  "assembly_plan",
  "testing_plan",
  "dispatch_date_plan",
  "amp_actual",
  "bom_actual",
  "gearcase_actual",
  "internal_actual",
  "bo_actual",
  "assembly_actual",
  "testing_actual",
  "dispatch_date_actual",
] as const;


const isNull = (val: any) => val === null || val === undefined;

const getStageStatus = (plan: any, actual: any) => {
  if (isNull(plan) && isNull(actual)) return "Not Started";
  if (!isNull(plan) && isNull(actual)) return "In Progress";
  if (!isNull(plan) && !isNull(actual)) return "Completed";
  return "Not Started";
};

const getDateOnlyTimestamp = (value: unknown) => {
  if (!value) {
    return null;
  }

  const parsed = new Date(String(value));
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return Date.UTC(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
};

const getAbsoluteDateDiffInDays = (start: unknown, end: unknown) => {
  const startTimestamp = getDateOnlyTimestamp(start);
  const endTimestamp = getDateOnlyTimestamp(end);

  if (startTimestamp === null || endTimestamp === null) {
    return null;
  }

  return Math.abs((endTimestamp - startTimestamp) / DAY_IN_MS);
};

const getFinalApprovalTimePercent = (row: Record<string, unknown>) => {
  const deliveryDaysFromPoDate = getAbsoluteDateDiffInDays(
    row.cust_po_date,
    row.delivery_date_po
  );
  const daysInDrawingApproval = getAbsoluteDateDiffInDays(
    row.cust_po_date,
    row.final_drg_approval_received_date_actual
  );

  return deliveryDaysFromPoDate && daysInDrawingApproval !== null
    ? (daysInDrawingApproval / deliveryDaysFromPoDate) * 100
    : null;
};

const getDesignCycleStatus = (value1: unknown, value2: unknown) => {
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
    return statusColorMap[status] || STATUS_COLORS["Not Started"];
  }

  const first = Number(value1);
  const second = Number(value2);

  if (!Number.isNaN(first) && !Number.isNaN(second) && second > first) {
    return SUMMARY_STATUS_COLORS["Completed Delayed"];
  }

  return STATUS_COLORS.Completed;
};

const getCompletedColor = (plan: any, actual: any) => {
  if (isNull(plan) && isNull(actual)) return STATUS_COLORS["Not Started"];
  if (!isNull(plan) && isNull(actual)) return STATUS_COLORS["In Progress"];
  if (isNull(plan) && !isNull(actual)) return STATUS_COLORS.Completed;

  const planDate = new Date(String(plan));
  const actualDate = new Date(String(actual));

  if (!Number.isNaN(planDate.getTime()) && !Number.isNaN(actualDate.getTime())) {
    return planDate.getTime() >= actualDate.getTime()
      ? STATUS_COLORS.Completed
      : SUMMARY_STATUS_COLORS["Completed Delayed"];
  }

  const planNumber = Number(plan);
  const actualNumber = Number(actual);

  if (!Number.isNaN(planNumber) && !Number.isNaN(actualNumber)) {
    return planNumber >= actualNumber
      ? STATUS_COLORS.Completed
      : SUMMARY_STATUS_COLORS["Completed Delayed"];
  }

  return STATUS_COLORS.Completed;
};

const getPlanActualDisplayColor = (plan: any, actual: any) => {
  if (isNull(plan) && isNull(actual)) return STATUS_COLORS["Not Started"];
  if (isNull(plan) !== isNull(actual)) return STATUS_COLORS["Not Started"];

  const planDate = new Date(String(plan));
  const actualDate = new Date(String(actual));

  if (!Number.isNaN(planDate.getTime()) && !Number.isNaN(actualDate.getTime())) {
    return planDate.getTime() >= actualDate.getTime()
      ? STATUS_COLORS.Completed
      : SUMMARY_STATUS_COLORS["Completed Delayed"];
  }

  const planNumber = Number(plan);
  const actualNumber = Number(actual);

  if (!Number.isNaN(planNumber) && !Number.isNaN(actualNumber)) {
    return planNumber >= actualNumber
      ? STATUS_COLORS.Completed
      : SUMMARY_STATUS_COLORS["Completed Delayed"];
  }

  return STATUS_COLORS["In Progress"];
};

const getTodayDateTimestamp = () => {
  const today = new Date();
  return Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
};

const isPlanDateDelayedAgainstToday = (plan: unknown) => {
  const planTimestamp = getDateOnlyTimestamp(plan);

  if (planTimestamp === null) {
    return false;
  }

  const todayTimestamp = getTodayDateTimestamp();

  return todayTimestamp > planTimestamp;
};

const getPendingPlanDatesForStage = (field: string, row: Record<string, any>) => {
  switch (field) {
    case "design":
      return [[row.bom_plan, row.bom_actual]]
        .filter(([, actual]) => isNull(actual))
        .map(([plan]) => plan);
    case "manufacturing":
    case "assembly":
      return [
        [row.gear_case_plan, row.gearcase_actual],
        [row.internal_plan, row.internal_actual],
        [row.bo_plan, row.bo_actual],
        [row.assembly_plan, row.assembly_actual],
      ]
        .filter(([, actual]) => isNull(actual))
        .map(([plan]) => plan);
    case "testing":
      return isNull(row.testing_actual) ? [row.testing_plan] : [];
    case "dispatch":
      return isNull(row.dispatch_date_actual) ? [row.dispatch_date_plan] : [];
    default:
      return [];
  }
};

const getInProgressStatusKey = (field: string, row: Record<string, any>) => {
  const pendingPlanDates = getPendingPlanDatesForStage(field, row);

  return pendingPlanDates.some((planDate) => isPlanDateDelayedAgainstToday(planDate))
    ? "In Progress Delay"
    : "In Progress On Time";
};

const getSummaryStatusKey = (field: string, row: Record<string, any>) => {
  const status = String(row[field] ?? "Not Started");

  if (status === "In Progress") {
    return getInProgressStatusKey(field, row);
  }

  if (status !== "Completed") {
    return status;
  }

  return getProcessStatusColor(field, row) === SUMMARY_STATUS_COLORS["Completed Delayed"]
    ? "Completed Delayed"
    : "Completed On Time";
};
const statusColorMap: Record<string, string> = STATUS_COLORS;

const getAggregateCompletedColor = (
  checks: Array<[any, any]>,
  fallbackStatus: string
) => {
  const completedColors = checks
    .filter(([plan, actual]) => getStageStatus(plan, actual) === "Completed")
    .map(([plan, actual]) => getCompletedColor(plan, actual));

  if (completedColors.length === 0) {
    return statusColorMap[fallbackStatus] || STATUS_COLORS["Not Started"];
  }

  return completedColors.some((color) => color === SUMMARY_STATUS_COLORS["Completed Delayed"])
    ? SUMMARY_STATUS_COLORS["Completed Delayed"]
    : STATUS_COLORS.Completed;
};

const getDesignProcessColor = (row: Record<string, any>) => {
  const designStatus = getDesignStatus(row);

  if (designStatus === "Completed") {
    return getCompletedColor(row.bom_plan, row.bom_actual);
  }

  if (designStatus === "In Progress") {
    return getInProgressStatusKey("design", row) === "In Progress Delay"
      ? SUMMARY_STATUS_COLORS["In Progress Delay"]
      : SUMMARY_STATUS_COLORS["In Progress On Time"];
  }

  return STATUS_COLORS["Not Started"];
};

const getProcessStatusColor = (field: string, row: Record<string, any>) => {
  const stageStatus = String(row[field] ?? "Not Started");

  if (stageStatus === "In Progress") {
    return SUMMARY_STATUS_COLORS[
      getInProgressStatusKey(field, row) as keyof typeof SUMMARY_STATUS_COLORS
    ];
  }

  if (stageStatus === "Not Started") {
    return STATUS_COLORS["Not Started"];
  }

  switch (field) {
    case "design":
      return getDesignProcessColor(row);
    case "manufacturing":
    case "assembly":
      return getAggregateCompletedColor(
        [
          [row.gear_case_plan, row.gearcase_actual],
          [row.internal_plan, row.internal_actual],
          [row.bo_plan, row.bo_actual],
          [row.assembly_plan, row.assembly_actual],
        ],
        String(row[field] ?? "Not Started")
      );
    case "testing":
      return getCompletedColor(row.testing_plan, row.testing_actual);
    case "dispatch":
      return getCompletedColor(row.dispatch_date_plan, row.dispatch_date_actual);
    default:
      return statusColorMap[stageStatus] || STATUS_COLORS["Not Started"];
  }
};

const getDesignStatus = (row: any) => {
  return getStageStatus(row.bom_plan, row.bom_actual);
};

const getSalesStatus = (row: any) => {
  return getStageStatus(
    row.delivery_date_po,
    row.delivery_days_frm_po_date
  );
};

const getDispatchStatus = (row: any) => {
  return getStageStatus(
    row.dispatch_date_plan,
    row.dispatch_date_actual
  );
};

const getQCStatus = (row: any) => {
  return getStageStatus(
    row.testing_plan,
    row.testing_actual
  );
};

const getPlanningStatus = (row: any) => {
  return getStageStatus(
    row.amp_plan,
    row.amp_actual
  );
};



const getManufacturingStatus = (row: any) => {
  const steps = [
    [row.gear_case_plan, row.gearcase_actual],
    [row.internal_plan, row.internal_actual],
    [row.bo_plan, row.bo_actual],
    [row.assembly_plan, row.assembly_actual],
  ];

  const statuses = steps.map(([plan, actual]) =>
    getStageStatus(plan, actual)
  );

  if (statuses.every(s => s === "Not Started")) return "Not Started";
  if (statuses.every(s => s === "Completed")) return "Completed";

  return "In Progress";
};

const getManufacturingCoreStatus = (row: any) => {
  const steps = [
    [row.gear_case_plan, row.gearcase_actual],
    [row.internal_plan, row.internal_actual],
    [row.bo_plan, row.bo_actual],
  ];

  const statuses = steps.map(([plan, actual]) => getStageStatus(plan, actual));

  if (statuses.every((status) => status === "Not Started")) return "Not Started";
  if (statuses.every((status) => status === "Completed")) return "Completed";

  return "In Progress";
};

const getAssemblyStageStatus = (row: any) =>
  getStageStatus(row.assembly_plan, row.assembly_actual);

const getStatusColumnStage = (row: any) => {
  const dispatchStatus = getDispatchStatus(row);
  const testingStatus = getQCStatus(row);
  const assemblyStatus = getAssemblyStageStatus(row);
  const manufacturingCoreStatus = getManufacturingCoreStatus(row);
  const designStatus = getDesignStatus(row);

  if (dispatchStatus === "Completed") {
    return "Completed";
  }

  if (testingStatus === "Completed") {
    return "Dispatch";
  }

  if (assemblyStatus === "Completed") {
    return "Testing";
  }

  if (manufacturingCoreStatus === "Completed") {
    return "Assembly";
  }

  if (designStatus === "Completed") {
    return "Mfg";
  }

  if (designStatus === "Not Started") {
    return "Not Started";
  }

  return "Design";
};

 

const getFullStatus = (row: any) => {
  return {
    design: getDesignStatus(row),
    sales: getSalesStatus(row),
    planning: getPlanningStatus(row),
    manufacturing: getManufacturingStatus(row),
    assembly: getAssemblyStageStatus(row),
    qc: getQCStatus(row),
    dispatch: getDispatchStatus(row),
  };
};

 


const OrderTrackingDashboard = () => {
  const { openModal } = useModal();
  const [columnSearchFilters, setColumnSearchFilters] = useState<Record<string, string>>({});
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 5,
  });
  const [sortModel, setSortModel] = useState<GridSortModel>([
    { field: "date", sort: "desc" },
  ]);
  const [filterModel, setFilterModel] = useState<GridFilterModel>({
    items: [],
    quickFilterValues: [],
  });
  const [activeTab, setActiveTab] = useState("Design");
  const [activeStageFilter, setActiveStageFilter] = useState<{
    field: ProcessStageField;
    status: SummaryStatusKey;
  } | null>(null);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("Update Plan");
  const [selectedField, setSelectedField] = useState("");
  const [selectedRowData, setSelectedRowData] = useState<Record<string, unknown> | null>(null);

  const [getOrders, { isLoading, data }] = useGetOrdersMutation();

  const refreshOrders = useCallback(() => {
    void getOrders();
  }, [getOrders]);

  useEffect(() => {
    refreshOrders();
  }, [refreshOrders]);

  const rows = useMemo(() => {

  const apiRows = Array.isArray(data?.data) ? data.data : [];
  //const sourceRows = apiRows.length > 0 ? apiRows : ordertrackingdata;
 
  const sourceRows =  apiRows;
  
  return sourceRows.map((item: any, index: number) => {
    const status = getFullStatus(item);

    return {
      ...item,
      id: item.id ?? index,
      item_code:
        item.item_code ??
        item.Item_code ??
        item.inventory_item ??
        item.segment1 ??
        item.ordered_item ??
        "",
      current_status: getStatusColumnStage(item),

      design: status.design,
      manufacturing: status.manufacturing,
      assembly: status.assembly,
      testing: status.qc,
      dispatch: status.dispatch,
    };
  });
}, [data]);

  const stageSummaryCounts = useMemo(
    () =>
      processStageColumns.reduce<Record<string, Record<string, number>>>((acc, stage) => {
        const counts = rows.reduce<Record<string, number>>(
          (stageAcc, row) => {
            const status = getSummaryStatusKey(stage.field, row as Record<string, any>);
            stageAcc[status] = (stageAcc[status] ?? 0) + 1;
            return stageAcc;
          },
          {
            "Completed On Time": 0,
            "Completed Delayed": 0,
            "In Progress On Time": 0,
            "In Progress Delay": 0,
            "Not Started": 0,
          }
        );

        acc[stage.field] = counts;
        return acc;
      }, {}),
    [rows]
  );

  const filteredRows = useMemo(() => {
    if (!activeStageFilter) {
      return rows;
    }

    return rows.filter(
      (row) =>
        getSummaryStatusKey(activeStageFilter.field, row as Record<string, any>) ===
        activeStageFilter.status
    );
  }, [activeStageFilter, rows]);

  const totalCount = filteredRows.length;

  const handlePlanModalClose = useCallback(() => {
    setIsPlanModalOpen(false);
  }, []);

  const handleSummaryCountClick = useCallback(
    (field: ProcessStageField, summaryKey: string, statusKey: SummaryStatusKey) => {
      setActiveTab(summaryKey);
      setPaginationModel((current) => ({ ...current, page: 0 }));
      setActiveStageFilter((current) => {
        if (current?.field === field && current.status === statusKey) {
          return null;
        }

        return { field, status: statusKey };
      });
    },
    []
  );

  const clearStageFilter = useCallback(() => {
    setActiveStageFilter(null);
    setPaginationModel((current) => ({ ...current, page: 0 }));
  }, []);

  const handleLineIdClick = useCallback(
    (row: Record<string, unknown>) => {
      const viewDetailsFormRef = React.createRef<ViewDetailsRef>();

      openModal({
        title: "View Details",
        widthprops: "900px",
        showCloseButton: true,
        askDataChangeConfirm: false,
        component: (modelProps: any) => (
          <ViewDetails ref={viewDetailsFormRef} {...modelProps} defaultValues={row} />
        ),
        action: (
          <ApiActionButton
            onApiCall={() => viewDetailsFormRef.current?.submit?.() ?? Promise.resolve()}
          >
            Update
          </ApiActionButton>
        ),
      });
    },
    [openModal]
  );

  const handlePlanCellClick = useCallback(
    (field: string, title: string, row: Record<string, unknown>) => {
      setModalTitle(`${title} Plan Update`);
      setSelectedField(field);
      setSelectedRowData({...row,notes:''});
      setIsPlanModalOpen(true);
    },
    []
  );

  const handleTimelineOpen = useCallback(
    (stage: string, row: Record<string, unknown>) => {
      openModal({
        title: `${stage} Timeline`,
        width: "500px",
        showCloseButton: true,
        askDataChangeConfirm: false,
        hideFooter: true,
        component: (modalProps: any) => (
          <OrderTrackingTimelineContent
            {...modalProps}
            embedded
            stage={stage}
            rowData={row}
          />
        ),
      });
    },
    [openModal]
  );

  const renderActualDateCell = useCallback(
    (params: GridRenderCellParams) => {
      const value = params.row?.[params.field];
      const planField = actualToPlanFieldMap[params.field];
      const planValue = planField ? params.row?.[planField] : undefined;
      const displayPlanValue = planValue ? formatDateWithShortMonth(String(planValue)) || "-" : "-";
      const displayActualValue = value ? formatDateWithShortMonth(String(value)) || "-" : "-";
      const displayColor = getPlanActualDisplayColor(planValue, value);
      const title =
        typeof params.colDef.headerName === "string" && params.colDef.headerName.trim()
          ? params.colDef.headerName
          : params.field;

      return (
        <ButtonBase
          onClick={(event) => {
            event.stopPropagation();
            handlePlanCellClick(params.field, title, params.row as Record<string, unknown>);
          }}
          className="flex h-full w-full cursor-pointer items-center justify-center rounded-none px-3 py-2"
        >
          <Box
            className="grid w-full gap-px text-center leading-[1.15]"
          >
            <Tooltip title="Plan Date" {...ORDER_TRACKING_TOOLTIP_PROPS}>
              <Typography
                component="span"
                className="whitespace-nowrap text-[0.66rem] text-slate-500"
              >
                {displayPlanValue}
              </Typography>
            </Tooltip>
            <Tooltip title="Actual Date" {...ORDER_TRACKING_TOOLTIP_PROPS}>
              <Typography
                component="span"
                className="whitespace-nowrap text-[0.7rem] font-semibold"
                style={{ color: displayColor }}
              >
                {displayActualValue}
              </Typography>
            </Tooltip>
          </Box>
        </ButtonBase>
      );
    },
    [handlePlanCellClick]
  );

const renderProcessCell = useCallback(
  (params: GridRenderCellParams) => {
    const status = params.value as string;
    const row = params.row as Record<string, any>;
    const summaryStatus = getSummaryStatusKey(params.field, row);

    const bgcolor =
      status === "Completed" || status === "In Progress"
        ? getProcessStatusColor(params.field, row)
        : statusColorMap[status] || STATUS_COLORS["Not Started"];
    const tooltipLabel =
      status === "Completed" || status === "In Progress"
        ? summaryStatus
        : status.replace(/_/g, " ");

    const title =
      typeof params.colDef.headerName === "string" && params.colDef.headerName.trim()
        ? params.colDef.headerName
        : params.field;

    return (
      <Tooltip title={tooltipLabel} {...ORDER_TRACKING_TOOLTIP_PROPS}>
        <ButtonBase
          onClick={(event) => {
            event.stopPropagation();
            handleTimelineOpen(title, params.row as Record<string, unknown>);
          }}
          className="flex h-full w-full cursor-pointer   rounded-none"
          style={{maxWidth:'50px'}}
        >
          <Box
            className="h-4 min-w-4 w-4 rounded-full"
            style={{ backgroundColor: bgcolor }}
          />
        </ButtonBase>
      </Tooltip>
    );
  },
  [handleTimelineOpen]
);

  const renderDateCell = useCallback((params: GridRenderCellParams) => {
    return formatDateWithShortMonth(String(params.value || "")) || "-";
  }, []);

  const renderMetricCell = useCallback((params: GridRenderCellParams) => {
    const computedValue = getFinalApprovalTimePercent(
      params.row as Record<string, unknown>
    );

    if (computedValue === null || Number.isNaN(computedValue)) {
      return "-";
    }

    return `${computedValue.toFixed(2)}%`;
  }, []);

  const renderCurrentStatusCell = useCallback((params: GridRenderCellParams) => {
    const status = String(params.value ?? "").trim();
    const scheduleShipDate = params.row?.schedule_ship_date;
    const isOnHold =
      scheduleShipDate === null ||
      scheduleShipDate === undefined ||
      String(scheduleShipDate).trim() === "";

    if (!status) {
      return "-";
    }

    return (
      <Box className="flex h-full w-full items-center gap-2">
        <Chip
          label={status}
          size="small"
          className="font-semibold !text-white [&_.MuiChip-label]:!text-white"
          style={{
            backgroundColor:
              currentStatusBadgeColorMap[status as keyof typeof currentStatusBadgeColorMap] ??
              statusColorMap[status as keyof typeof statusColorMap] ??
              ORDER_TRACKING_COLORS.statusMuted,
          }}
        />
        {isOnHold ? (
          <Chip
            label="Hold"
            size="small"
            variant="outlined"
            className="font-semibold"
            style={{
              color: ORDER_TRACKING_COLORS.warning,
              borderColor: ORDER_TRACKING_COLORS.warning,
              backgroundColor: withAlpha(ORDER_TRACKING_COLORS.warning, "14"),
            }}
          />
        ) : null}
      </Box>
    );
  }, []);

  const getColumnSearchValue = useCallback(
    (field: string) => columnSearchFilters[field] ?? "",
    [columnSearchFilters]
  );

  const handleColumnSearchChange = useCallback(
    (field: string, value: string) => {
      setColumnSearchFilters((current) => ({
        ...current,
        [field]: value,
      }));
    },
    []
  );

  const renderColumnHeaderWithSearch = useCallback(
    (field: string, label: string) => (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          width: "100%",
          minWidth: 0,
          py: 0.125,
        }}
      >
        <TextField
          size="small"
          variant="outlined"
          value={getColumnSearchValue(field)}
          placeholder={label}
          onChange={(event) => handleColumnSearchChange(field, event.target.value)}
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => event.stopPropagation()}
          slotProps={{
            input: {
              sx: {
                height: 24,
                fontSize: "0.72rem",
                backgroundColor: "#fcfdff",
                width: "100%",
              },
            },
          }}
          sx={{
            width: "100%",
            minWidth: 0,
            "& .MuiOutlinedInput-root": {
              borderRadius: "8px",
              width: "100%",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.75)",
              "& fieldset": {
                borderColor: "rgba(203, 213, 225, 0.8)",
              },
              "&:hover fieldset": {
                borderColor: "rgba(148, 163, 184, 0.8)",
              },
              "&.Mui-focused fieldset": {
                borderColor: "rgba(59, 130, 246, 0.45)",
                borderWidth: "1px",
              },
            },
            "& .MuiOutlinedInput-input": {
              px: 0.75,
              py: 0.2,
              width: "100%",
            },
            "& .MuiOutlinedInput-input::placeholder": {
              color: "rgba(100, 116, 139, 0.9)",
              opacity: 1,
              fontSize: "0.72rem",
            },
          }}
        />
      </Box>
    ),
    [getColumnSearchValue, handleColumnSearchChange]
  );

  const columns: GridColDef[] = useMemo<GridColDef[]>(() => [
      {
        field: "line_id",
        headerName: "Line",
        sortable:false,
        filterable: false,
        disableColumnMenu: true,
        renderCell: (params: GridRenderCellParams) => (
          <Box
            onClick={(event) => {
              event.stopPropagation();
              handleLineIdClick(params.row as Record<string, unknown>);
            }}
            className="flex h-full w-full cursor-pointer items-center justify-start whitespace-nowrap font-semibold text-blue-600"
          >
            <Tooltip title={params.value}>
              <span>View</span>
            </Tooltip>
          </Box>
        ),
      },
      {
        field: "cust_po_no",
        headerName: "Customer PO",
        filterable: HEADER_SEARCHABLE_FIELDS.has("cust_po_no"),
        sortable:false,
        disableColumnMenu: true,
        minWidth: 100,
        renderHeader: () => renderColumnHeaderWithSearch("cust_po_no", "Customer PO"),
      },
      {
        field: "division",
        headerName: "Division",
        filterable: HEADER_SEARCHABLE_FIELDS.has("division"),
        sortable:false,
        disableColumnMenu: true,
        minWidth: 100,
        renderHeader: () => renderColumnHeaderWithSearch("division", "Division"),
      },
      {
        field: "sub_division",
        headerName: "Sub Division",
        filterable: HEADER_SEARCHABLE_FIELDS.has("sub_division"),
        sortable:false,
        disableColumnMenu: true,
        minWidth: 100,
        renderHeader: () => renderColumnHeaderWithSearch("sub_division", "Sub Division"),
      },
      {
        field: "order_type",
        headerName: "Order Type",
        filterable: HEADER_SEARCHABLE_FIELDS.has("order_type"),
        sortable:false,
        disableColumnMenu: true,
        minWidth: 100,
        renderHeader: () => renderColumnHeaderWithSearch("order_type", "Order Type"),
      },
      {
        field: "work_order_no",
        headerName: "Order Number",
        filterable: HEADER_SEARCHABLE_FIELDS.has("work_order_no"),
        sortable:false,
        disableColumnMenu: true,
        minWidth: 100,
        renderHeader: () => renderColumnHeaderWithSearch("work_order_no", "Order Number"),
      },
      {
        field: "line_no",
        headerName: "Line No",
        filterable: HEADER_SEARCHABLE_FIELDS.has("line_no"),
        sortable:false,
        disableColumnMenu: true,
        minWidth: 100,
        renderHeader: () => renderColumnHeaderWithSearch("line_no", "Line No"),
      },
      {
        field: "spare_gearbox",
        headerName: "Spare / Products",
        filterable: HEADER_SEARCHABLE_FIELDS.has("spare_gearbox"),
        sortable:false,
        disableColumnMenu: true,
        minWidth: 150,
        renderHeader: () => renderColumnHeaderWithSearch("spare_gearbox", "Spare / Products"),
      },
      {
        field: "end_cust_name",
        headerName: "Customer Name",
        filterable: HEADER_SEARCHABLE_FIELDS.has("end_cust_name"),
        sortable:false,
        disableColumnMenu: true,
        minWidth: 100,
        flex: 1,
        renderHeader: () => renderColumnHeaderWithSearch("end_cust_name", "Customer Name"),
      },
       {
        field: "branch_name",
        headerName: "Branch Name",
        sortable:false,
        filterable: HEADER_SEARCHABLE_FIELDS.has("branch_name"),
        disableColumnMenu: true,
        flex: 1,
        minWidth: 100,
        renderHeader: () => renderColumnHeaderWithSearch("branch_name", "Branch Name"),
      },
       {
        field: "qty",
        headerName: "Qty",
        filterable: HEADER_SEARCHABLE_FIELDS.has("qty"),
        sortable: true,
        disableColumnMenu: true,
        minWidth: 100,
        renderHeader: () => renderColumnHeaderWithSearch("qty", "Qty"),
      },
       {
        field: "uom",
        headerName: "UOM",
        filterable: HEADER_SEARCHABLE_FIELDS.has("uom"),
        sortable: false,
        disableColumnMenu: true,
        minWidth: 100,
        renderHeader: () => renderColumnHeaderWithSearch("uom", "UOM"),
      },
       {
        field: "po_value",
        headerName: "PO Value",
        filterable: HEADER_SEARCHABLE_FIELDS.has("po_value"),
       sortable: false,
        disableColumnMenu: true,
        minWidth: 100,
        renderHeader: () => renderColumnHeaderWithSearch("po_value", "PO Value"),
      },
      {
        field: "item_code",
        headerName: "Item Code",
        filterable: HEADER_SEARCHABLE_FIELDS.has("item_code"),
        sortable: false,
        disableColumnMenu: true,
        minWidth: 120,
        renderHeader: () => renderColumnHeaderWithSearch("item_code", "Item Code"),
      },
      {
        field: "currency",
        headerName: "Currency",
        filterable: HEADER_SEARCHABLE_FIELDS.has("currency"),
        sortable: true,
        disableColumnMenu: true,
        minWidth: 110,
        renderHeader: () => renderColumnHeaderWithSearch("currency", "Currency"),
      },
      {
        field: "cust_po_date",
        headerName: "Cust PO Date",
        type: "date" as const,
        sortable: true,
        filterable: HEADER_SEARCHABLE_FIELDS.has("cust_po_date"),
        disableColumnMenu: true,
        minWidth: 140,
        filterOperators: orderTrackingDateFilterOperators,
        valueGetter: (_value: unknown, row: Record<string, unknown>) =>
          getGridDateValue(row, "cust_po_date"),
        valueFormatter: (value) => formatOrderTrackingExportDate(value),
        renderHeader: () => renderColumnHeaderWithSearch("cust_po_date", "Cust PO Date"),
        renderCell: renderDateCell,
      },
      {
        field: "delivery_date_po",
        headerName: "Delivery Date",
        type: "date" as const,
        sortable: true,
        filterable: HEADER_SEARCHABLE_FIELDS.has("delivery_date_po"),
        disableColumnMenu: true,
        minWidth: 140,
        filterOperators: orderTrackingDateFilterOperators,
        valueGetter: (_value: unknown, row: Record<string, unknown>) =>
          getGridDateValue(row, "delivery_date_po"),
        valueFormatter: (value) => formatOrderTrackingExportDate(value),
        renderHeader: () => renderColumnHeaderWithSearch("delivery_date_po", "Delivery Date"),
        renderCell: renderDateCell,
      },
      {
        field: "commited_ex_works_delivery_date",
        headerName: "Ex Works Date",
        type: "date" as const,
        sortable: true,
        filterable: HEADER_SEARCHABLE_FIELDS.has("commited_ex_works_delivery_date"),
        disableColumnMenu: true,
        minWidth: 140,
        filterOperators: orderTrackingDateFilterOperators,
        valueGetter: (_value: unknown, row: Record<string, unknown>) =>
          getGridDateValue(row, "commited_ex_works_delivery_date"),
        valueFormatter: (value) => formatOrderTrackingExportDate(value),
        renderHeader: () => renderColumnHeaderWithSearch("commited_ex_works_delivery_date", "Ex Works Date"),
        renderCell: renderDateCell,
      },
      {
        field: "perc_time_taken_of_total_po_delivery",
        headerName: "Approval %",
        sortable: true,
        filterable: HEADER_SEARCHABLE_FIELDS.has("perc_time_taken_of_total_po_delivery"),
        disableColumnMenu: true,
        minWidth: 120,
        valueGetter: (_value: unknown, row: Record<string, unknown>) =>
          getFinalApprovalTimePercent(row),
        renderHeader: () => renderColumnHeaderWithSearch("perc_time_taken_of_total_po_delivery", "Approval %"),
        renderCell: renderMetricCell,
      },
      {
        field: "status_code",
        headerName: "Oracle Status Code",
        sortable: false,
        filterable: HEADER_SEARCHABLE_FIELDS.has("status_code"),
        disableColumnMenu: true,
        minWidth: 180,
        renderHeader: () => renderColumnHeaderWithSearch("status_code", "Oracle Status Code"),
      },
      {
        field: "current_status",
        headerName: "Status",
        type: "singleSelect" as const,
        valueOptions: orderTrackingCurrentStageOptions,
        filterable: false,
        sortable: true,
        minWidth: 150,
        renderCell: renderCurrentStatusCell,
      },
      ...processStageColumns.map<GridColDef>((column) => ({
        ...column,
        type: "singleSelect" as const,
        valueOptions: orderTrackingStageValueOptions,
        sortable: false,
        filterable: false,
        renderCell: renderProcessCell,
      })),
      ...planDateColumns.map<GridColDef>((column) => {
        const planDateColumn = {
          ...column,
          type: "date" as const,
          sortable: false,
          filterable: false,
          filterOperators: orderTrackingDateFilterOperators,
          valueGetter: (_value: unknown, row: Record<string, unknown>) =>
            getGridDateValue(row, column.field),
          filterValueGetter: (row: Record<string, unknown>) =>
            getOrderTrackingPlanOrActualDateValue(row, column.field),
          valueFormatter: (value: unknown) => formatOrderTrackingExportDate(value),
          renderCell: renderActualDateCell,
        };

        return planDateColumn as unknown as GridColDef;
      }),
      ...orderTrackingExportOnlyColumns,
    ],
    [
      handleLineIdClick,
      renderActualDateCell,
      renderColumnHeaderWithSearch,
      renderCurrentStatusCell,
      renderDateCell,
      renderMetricCell,
      renderProcessCell,
    ]
  );

  const gridHeaderControls = useMemo(() => {
    if (!activeStageFilter) {
      return undefined;
    }

    return (
      <Box
        className="flex flex-wrap items-center gap-2"
      >
        <Typography variant="body2" color="text.secondary">
          Showing {summaryCardKeys[activeStageFilter.field]} rows with status {activeStageFilter.status}.
        </Typography>
        <Button size="small" variant="outlined" onClick={clearStageFilter}>
          Clear Stage Filter
        </Button>
      </Box>
    );
  }, [activeStageFilter, clearStageFilter]);

  return (
    <Box>
      <Box
        className="mb-4 grid gap-3"
        sx={{
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, minmax(0, 1fr))",
            lg: "repeat(5, minmax(0, 1fr))",
            xl: "repeat(5, minmax(0, 1fr))",
          },
        }}
      >
        {processStageColumns.map((stage) => {
          const summaryKey = summaryCardKeys[stage.field];

          return (
          <Card
            key={stage.field}
            onClick={() => setActiveTab(summaryKey)}
            className={clsx(
              summaryCardClassMap[summaryKey].card,
              "overflow-hidden rounded-xl",
              activeTab === summaryKey && summaryCardClassMap[summaryKey].active
            )}
            sx={{
              width: "100%",
              minWidth: 0,
            }}
          >
            <CardContent className="grid gap-2.5  ">
              <Typography
                variant="subtitle2"
                color="textSecondary"
                className="dashboard-stat-title text-[0.74rem] font-semibold uppercase tracking-[0.04em] sm:text-[0.78rem]"
              >
                {stage.headerName}
              </Typography>
              <Box
                className="grid grid-cols-5 gap-1.5 sm:gap-2"
              >
                {summaryStatuses.map((status) => (
                  <Tooltip key={status.key} title={status.tooltip} {...ORDER_TRACKING_TOOLTIP_PROPS}>
                    <Box
                      className="overflow-hidden rounded-md"
                      style={{
                        backgroundColor: withAlpha(status.color, "12"),
                        border: `1px solid ${withAlpha(status.color, "33")}`,
                      }}
                    >
                      <ButtonBase
                        onClick={(event) => {
                          event.stopPropagation();
                          handleSummaryCountClick(
                            stage.field,
                            summaryKey,
                            status.key
                          );
                        }}
                        className="grid h-full min-h-9 w-full place-items-center px-1 py-1.5 sm:min-h-10"
                        style={{
                          backgroundColor:
                            activeStageFilter?.field === stage.field &&
                            activeStageFilter.status === status.key
                              ? withAlpha(status.color, "24")
                              : "transparent",
                        }}
                      >
                        <Typography
                          variant="h6"
                          className={clsx(
                            "dashboard-stat-value text-[0.95rem] leading-none font-semibold sm:text-[1.05rem]",
                            summaryCardClassMap[summaryKey].value
                          )}
                          style={{ color: status.color }}
                        >
                          {stageSummaryCounts[stage.field]?.[status.key] ?? 0}
                        </Typography>
                      </ButtonBase>
                    </Box>
                  </Tooltip>
                ))}
              </Box>
            </CardContent>
          </Card>
        )})}
      </Box>

      <Box
        className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 rounded-lg px-1 py-1"
      >
        <Typography
          variant="subtitle2"
          className="mr-1 whitespace-nowrap font-bold text-gray-800 dark:text-white/90 sm:mr-2"
        >
          Color Legend
        </Typography>
        {summaryStatuses.map((status) => (
          <Box
            key={status.key}
            className="flex items-center gap-1.5"
          >
            <Box
              className="h-3 min-w-3 w-3 rounded-full"
              style={{ backgroundColor: status.color }}
            />
            <Typography variant="caption" color="text.secondary" className="whitespace-nowrap">
              {status.key}
            </Typography>
          </Box>
        ))}
      </Box>

      <ReusableDataGrid
        rows={filteredRows}
        columns={columns}
        totalCount={totalCount}
        loading={isLoading}
        rowHeight={52}
        paginationModel={paginationModel}
        setPaginationModel={setPaginationModel}
        sortModel={sortModel}
        setSortModel={setSortModel}
        filterModel={filterModel}
        setFilterModel={setFilterModel}
        title="Order Tracking"
        headerControls={gridHeaderControls}
        height="calc(100vh - 290px)"
        showFilterButton={false}
        columnHeaderHeight={96}
        disableColumnMenu
        pageSizeOptions={[5, 10, 15, 20, 50]}
        enableViewToggle={false}
        permissions={{ create: true, edit: false, delete: false, download: true, view: true }}
        uniqueIdField="id"
        headerTextAlign="left"
        headerVerticalAlign="top"
        searchableFields={[
          "division",
          "sub_division",
          "order_type",
          "work_order_no",
          "line_no",
          "spare_gearbox",
          "qty",
          "item_code",
          "currency",
          "cust_po_date",
          "delivery_date_po",
          "commited_ex_works_delivery_date",
          "perc_time_taken_of_total_po_delivery",
          "end_cust_name",
          "line_id",
          "cust_po_no",
          "branch_name",
          "uom",
          "status_code",
          "current_status",
        ]}
        columnSearchFilters={columnSearchFilters}
        initialColumnVisibilityModel={Object.fromEntries(
          orderTrackingExportOnlyColumns.map((column) => [column.field, false]),
        )}
        csvExportOptions={{
          allColumns: true,
          fields: [...orderTrackingExportFields],
        }}
      />

      <OpenEditPlanModal
        open={isPlanModalOpen}
        title={modalTitle}
        rowData={selectedRowData}
        field={selectedField}
        onClose={handlePlanModalClose}
      />
    </Box>
  );
};

export default OrderTrackingDashboard;
