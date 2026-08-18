import { forwardRef, memo, useCallback, useEffect, useImperativeHandle, useMemo, useState } from "react";
import { Box, CircularProgress, Stack, Tab, Tabs, Tooltip, Typography } from "@mui/material";
import dayjs from "dayjs";
import { Controller, useForm, useWatch } from "react-hook-form";
import { MuiDatePicker, MuiTextField } from "../../../../../shared/components/mui/input";
import { FormStackGrid } from "../../../../../shared/components/ui/form/stack";
import FormSection from "../../../../../shared/components/ui/form/FormSection";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import TimelineOutlinedIcon from "@mui/icons-material/TimelineOutlined";
import { useToast } from "../../../../../shared/hooks/useToast";
import { useGetOrderByIdMutation, useUpdateOrderMutation } from "../../api/ordertracking";
import { formatDateTimeWithShortMonth } from "../../../../../shared/utils/FormatDate";

const DAY_IN_MS = 24 * 60 * 60 * 1000;

const ORDER_INFORMATION_FIELDS = [
 
  "division",
  "sub_division",
  "cust_po_no",
  "end_cust_name",
  "branch_name",
  "qty",
  "uom",
  "item_desc_cust_po",
  "ora_item_desc",
  
  "po_value",
  "cust_po_date",
  "cust_po_tech_clear_date",
  "delivery_date_po",
    
  "ga_dim_no",
    "po_received_date_to_ga_drw_submission_days",
  "ga_drawing_submission_to_final_approval_received_days",
  "ga_dim_drw_submission_design_plan",
  "ga_dim_drw_submission_design_actual",
  "final_drg_approval_received_date_plan",
  "final_drg_approval_received_date_actual",

  "work_order_no",
  "work_order_date",
  "commited_ex_works_delivery_date",
] as const;

const CALCULATED_FIELD_KEYS = new Set([
  "delivery_days_frm_po_date",
  "days_in_drawing_approval",
  "perc_time_taken_of_total_po_delivery",
    "on_time_delivery",
]);

const DATE_INPUT_FIELDS = new Set([
  "cust_po_date",
  "cust_po_tech_clear_date",
  "delivery_date_po",
 
  "ga_dim_drw_submission_design_plan",
  "ga_dim_drw_submission_design_actual",
  "final_drg_approval_received_date_plan",
  "final_drg_approval_received_date_actual",
  "work_order_date",
  "commited_ex_works_delivery_date",
  
]);

const EDITABLE_ORDER_FIELDS = new Set([
  "cust_po_tech_clear_date",
  "delivery_date_po",
  "ga_dim_no",
  "ga_dim_drw_submission_design_plan",
  "ga_dim_drw_submission_design_actual",
  "final_drg_approval_received_date_plan",
  "final_drg_approval_received_date_actual",
  "po_received_date_to_ga_drw_submission_days",
  "ga_drawing_submission_to_final_approval_received_days",
]);
const MULTILINE_FIELDS = new Set(["item_desc_cust_po", "ora_item_desc"]);
const LABEL_OVERRIDES: Record<string, string> = {
  id: "ID",
  po: "PO",
  ga: "GA",
  uom: "UOM",
  cust_po_tech_clear_date: "PO Tech Clear Date",
  delivery_date_po: "PO Delivery Date",
  item_desc_cust_po: "Customer PO Item Description",
  ora_item_desc: "Oracle Item Description",
  commited_ex_works_delivery_date: "Committed Ex Works Date",
  ga_dim_no: "GA Dim No",
  ga_dim_drw_submission_design_plan: "GA Submission Plan",
  ga_dim_drw_submission_design_actual: "GA Submission Actual",
  final_drg_approval_received_date_plan: "Final Approval Plan",
  final_drg_approval_received_date_actual: "Final Approval Actual",
  po_received_date_to_ga_drw_submission_days: "Tech cleared PO to 1st GA Submission days",
  ga_drawing_submission_to_final_approval_received_days: "GA to Final Approval Days",
  remark: "Remark",
  remarks: "Remarks",
  bd_remark: "BD Remark",
  bd_remarks: "BD Remarks",
  business_development_remark: "Business Development Remark",
  business_development_remarks: "Business Development Remarks",
  sales_execution_remark: "Sales Execution Remark",
  sales_execution_remarks: "Sales Execution Remarks",
  se_remark: "Sales Execution Remark",
  se_remarks: "Sales Execution Remarks",
  design_remark: "Design Remark",
  design_remarks: "Design Remarks",
  de_remark: "Design Remark",
  de_remarks: "Design Remarks",
  planning_remark: "Planning Remark",
  planning_remarks: "Planning Remarks",
  pl_remark: "Planning Remark",
  pl_remarks: "Planning Remarks",
};

type RemarkLogItem = {
  order_tracking_id?: number | null;
  remark?: string | null;
  bd_remark?: string | null;
  business_development_remark?: string | null;
  sales_execution_remark?: string | null;
  se_remark?: string | null;
  design_remark?: string | null;
  de_remark?: string | null;
  planning_remark?: string | null;
  pl_remark?: string | null;
  id?: number | string | null;
  created_date?: string | null;
  created_by?: string | null;
  updated_date?: string | null;
  updated_by?: string | null;
  is_deleted?: boolean;
  deleted_date?: string | null;
  deleted_by?: string | null;
  is_active?: boolean;
  IsAudit?: boolean;
  DoLog?: boolean;
  DoAudit?: boolean;
  [key: string]: unknown;
};

const toFieldLabel = (key: string) =>
  LABEL_OVERRIDES[key] ??
  key
    .split("_")
    .filter(Boolean)
    .map((word) => {
      const normalizedWord = word.toLowerCase();
      if (LABEL_OVERRIDES[normalizedWord]) {
        return LABEL_OVERRIDES[normalizedWord];
      }

      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");

const formatInputDate = (val: string | null | undefined) => {
  if (!val) return "";
  return String(val).split("T")[0];
};

const getDateOnlyTimestamp = (value: unknown) => {
  if (!value) return null;

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

const getOnTimeDeliveryScore = (requestDate: unknown, deliveryDateActual: unknown) => {
  const requestTimestamp = getDateOnlyTimestamp(requestDate);
  const deliveryActualTimestamp = getDateOnlyTimestamp(deliveryDateActual);

  if (requestTimestamp === null || deliveryActualTimestamp === null) {
    return null;
  }

  return deliveryActualTimestamp >= requestTimestamp ? 100 : 0;
};

const formatMetricValue = (value: number | null, suffix = "") => {
  if (value === null || Number.isNaN(value)) {
    return "-";
  }

  return `${value.toFixed(2)}${suffix}`;
};

const getPlanActualDisplayColor = (plan: unknown, actual: unknown) => {
  if (!plan && !actual) return "#9CA3AF";
  if ((!plan && actual) || (plan && !actual)) return "#9CA3AF";

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

  return "#2563EB";
};

const isOrderFieldReadOnly = (field: string) => !EDITABLE_ORDER_FIELDS.has(field);
const getFieldHighlightSx = (field: string) =>
  isOrderFieldReadOnly(field)
    ? undefined
    : {
        "& .MuiOutlinedInput-notchedOutline": {
          borderColor: "#EAB308",
          borderWidth: 1.5,
        },
        "& .MuiInputLabel-root": {
          color: "#A16207",
          fontWeight: 600,
        },
      };

const NON_CALCULATED_ORDER_FIELDS = ORDER_INFORMATION_FIELDS.filter(
  (field) => !CALCULATED_FIELD_KEYS.has(field)
);
const READ_ONLY_ORDER_FIELDS = NON_CALCULATED_ORDER_FIELDS.filter((field) =>
  isOrderFieldReadOnly(field)
);
const EDITABLE_ORDER_INFORMATION_FIELDS = NON_CALCULATED_ORDER_FIELDS.filter(
  (field) => !isOrderFieldReadOnly(field)
);

const getFieldGridColumn = (field: string, columns: number) => {
  if (MULTILINE_FIELDS.has(field)) {
    return { md: `span ${columns}` };
  }

  return undefined;
};

interface ViewDetailsProps {
  defaultValues?: Record<string, any>;
  onClose?: () => void;
}

export type ViewDetailsRef = {
  submit: () => Promise<void>;
};

type RemarkSectionConfig = {
  id: string;
  label: string;
  textField: string;
  historyField: string;
  placeholder: string;
  legacyHistoryFields?: string[];
};

const REMARK_SECTIONS: RemarkSectionConfig[] = [
  {
    id: "remarks",
    label: "Remarks",
    textField: "remark",
    historyField: "remarks",
    placeholder: "Enter new remark",
  },
  {
    id: "bd_remarks",
    label: "BD Remarks",
    textField: "bd_remark",
    historyField: "bd_remarks",
    placeholder: "Enter new BD remark",
    legacyHistoryFields: ["business_development_remarks", "business_development_remark"],
  },
  {
    id: "se_remarks",
    label: "SE Remarks",
    textField: "se_remark",
    historyField: "se_remarks",
    placeholder: "Enter new sales execution remark",
    legacyHistoryFields: ["sales_execution_remarks", "sales_execution_remark"],
  },
  {
    id: "de_remarks",
    label: "DE Remarks",
    textField: "de_remark",
    historyField: "de_remarks",
    placeholder: "Enter new design remark",
    legacyHistoryFields: ["design_remarks", "design_remark"],
  },
  {
    id: "pl_remarks",
    label: "PL Remarks",
    textField: "pl_remark",
    historyField: "pl_remarks",
    placeholder: "Enter new planning remark",
    legacyHistoryFields: ["planning_remarks", "planning_remark"],
  },
];

const toPascalCase = (value: string) =>
  value
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");

const toCapitalizedSnakeCase = (value: string) =>
  value
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("_");

const getFieldKeyCandidates = (field: string) => {
  const pascalCase = toPascalCase(field);
  const capitalizedSnakeCase = toCapitalizedSnakeCase(field);

  return Array.from(
    new Set([
      field,
      field.toLowerCase(),
      field.toUpperCase(),
      capitalizedSnakeCase,
      pascalCase,
      pascalCase ? pascalCase.charAt(0).toLowerCase() + pascalCase.slice(1) : field,
    ])
  );
};

const getTextFromRecordKeys = (
  record: Record<string, unknown>,
  keys: readonly string[]
) => {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return "";
};

const hasTextForKeys = (item: unknown, keys: readonly string[]) => {
  if (!item || typeof item !== "object") {
    return false;
  }

  return Boolean(getTextFromRecordKeys(item as Record<string, unknown>, keys));
};

const getRemarkText = (
  item: unknown,
  section: RemarkSectionConfig
) => {
  if (typeof item === "string") {
    return item.trim();
  }

  if (!item || typeof item !== "object") {
    return "";
  }

  const record = item as Record<string, unknown>;
  return getTextFromRecordKeys(record, getFieldKeyCandidates(section.textField));
};

const normalizeRemarksLog = (
  value: unknown,
  section: RemarkSectionConfig
): RemarkLogItem[] => {
  if (Array.isArray(value)) {
    return value
      .map((item, index) => {
        if (item && typeof item === "object") {
          if (!hasTextForKeys(item, getFieldKeyCandidates(section.textField))) {
            return null;
          }

          return item as RemarkLogItem;
        }

        const textValue = getRemarkText(item, section);
        if (!textValue) {
          return null;
        }

        return {
          id: `${section.textField}-array-${index}`,
          [section.textField]: textValue,
          created_date: null,
        } as RemarkLogItem;
      })
      .filter((item): item is RemarkLogItem => Boolean(item));
  }

  if (typeof value === "string") {
    const trimmedValue = value.trim();
    if (!trimmedValue) {
      return [];
    }

    if (
      (trimmedValue.startsWith("[") && trimmedValue.endsWith("]")) ||
      (trimmedValue.startsWith("{") && trimmedValue.endsWith("}"))
    ) {
      try {
        return normalizeRemarksLog(JSON.parse(trimmedValue), section);
      } catch {
        // Fall back to plain string rendering below.
      }
    }

    return trimmedValue
      ? [
          {
            id: "legacy-remark",
            [section.textField]: trimmedValue,
            created_date: null,
          },
        ]
      : [];
  }

  return [];
};

const getHistorySourceValue = (
  source: Record<string, any>,
  section: RemarkSectionConfig
) => {
  const historyKeyCandidates = [
    ...getFieldKeyCandidates(section.historyField),
    ...(section.legacyHistoryFields ?? []),
  ];

  for (const key of historyKeyCandidates) {
    const value = source?.[key];
    if (value !== undefined && value !== null && value !== "") {
      return value;
    }
  }

  const textKeyCandidates = getFieldKeyCandidates(section.textField);

  for (const key of textKeyCandidates) {
    const value = source?.[key];
    if (value !== undefined && value !== null && value !== "") {
      return value;
    }
  }

  return undefined;
};

const collectHistoryLogs = (
  source: Record<string, any>,
  section: RemarkSectionConfig
) => {
  const normalizedLogs = [getHistorySourceValue(source, section)].flatMap((historyValue) =>
    normalizeRemarksLog(historyValue, section)
  );

  const uniqueLogs = new Map<string, RemarkLogItem>();

  normalizedLogs.forEach((item, index) => {
    const key = [
      item.id ?? "",
      item.created_date ?? "",
      getRemarkText(item, section),
      index,
    ].join("|");

    if (!uniqueLogs.has(key)) {
      uniqueLogs.set(key, item);
    }
  });

  return Array.from(uniqueLogs.values());
};

const normalizeOrderDetailsPayload = (
  value: unknown,
  fallback: Record<string, any>
): Record<string, any> => {
  if (Array.isArray(value)) {
    const firstItem = value[0];
    return firstItem && typeof firstItem === "object" ? (firstItem as Record<string, any>) : fallback;
  }

  if (value && typeof value === "object") {
    return value as Record<string, any>;
  }

  return fallback;
};

const buildRemarkHistoryPayload = (
  existingValue: unknown,
  nextRemark: unknown,
  orderTrackingId: number | string | undefined,
  section: RemarkSectionConfig
) => {
  const normalizedExistingLogs = normalizeRemarksLog(existingValue, section);
  const trimmedRemark = typeof nextRemark === "string" ? nextRemark.trim() : "";

  if (!trimmedRemark) {
    return normalizedExistingLogs;
  }

  return [
    ...normalizedExistingLogs,
    {
      id: `${section.textField}-${Date.now()}`,
      order_tracking_id:
        typeof orderTrackingId === "number" ? orderTrackingId : Number(orderTrackingId) || null,
      [section.textField]: trimmedRemark,
      created_date: new Date().toISOString(),
      is_active: true,
    },
  ];
};

function Index(
  { defaultValues: rowData, onClose }: ViewDetailsProps,
  ref: React.Ref<ViewDetailsRef>
) {
  const [getOrderById, { isLoading: isFetching }] = useGetOrderByIdMutation();
  const [updateOrder] = useUpdateOrderMutation();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState(0);
  const [activeRemarkTab, setActiveRemarkTab] = useState(0);
  const [orderDetails, setOrderDetails] = useState<Record<string, any> | null>(null);

  const { register, control, handleSubmit, reset } = useForm();
  const watchedCustPoDate = useWatch({ control, name: "cust_po_date" });
  const watchedDeliveryDatePo = useWatch({ control, name: "delivery_date_po" });
  const watchedcommited_ex_works_delivery_date = useWatch({ control, name: "commited_ex_works_delivery_date" });
  const watchedDispatchDateActual = useWatch({ control, name: "dispatch_date_actual" });
  const watchedFinalApprovalActual = useWatch({
    control,
    name: "final_drg_approval_received_date_actual",
  });
  const watchedPlanActualValues = useWatch({ control });
  const remarkLogsBySection = useMemo(
    () =>
      REMARK_SECTIONS.reduce<Record<string, RemarkLogItem[]>>((accumulator, section) => {
        accumulator[section.id] = collectHistoryLogs(orderDetails ?? rowData ?? {}, section);
        return accumulator;
      }, {}),
    [orderDetails, rowData]
  );
  const activeRemarkSection = REMARK_SECTIONS[activeRemarkTab] ?? REMARK_SECTIONS[0];

  useEffect(() => {
    if (!rowData?.id) return;
    getOrderById(rowData.id)
      .unwrap()
      .then((result) => {
        const d = normalizeOrderDetailsPayload(result.data, rowData);
        setOrderDetails(d);
        reset({
          id: d.id ?? rowData?.id ?? "",
          line_id: d.line_id ?? "",
          division: d.division ?? "",
          sub_division: d.sub_division ?? "",
          cust_po_no: d.cust_po_no ?? "",
          end_cust_name: d.end_cust_name ?? "",
          branch_name: d.branch_name ?? "",
          item_desc_cust_po: d.item_desc_cust_po ?? "",
          ora_item_desc: d.ora_item_desc ?? "",
          qty: d.qty ?? "",
          uom: d.uom ?? "",
          po_value: d.po_value ?? "",
          cust_po_date: formatInputDate(d.cust_po_date),
          cust_po_tech_clear_date: formatInputDate(d.cust_po_tech_clear_date),
          delivery_date_po: formatInputDate(d.delivery_date_po),
          delivery_days_frm_po_date: d.delivery_days_frm_po_date ?? "",
          ga_dim_no: d.ga_dim_no ?? "",
          ga_dim_drw_submission_design_plan: formatInputDate(d.ga_dim_drw_submission_design_plan),
          ga_dim_drw_submission_design_actual: formatInputDate(d.ga_dim_drw_submission_design_actual),
          final_drg_approval_received_date_plan: formatInputDate(d.final_drg_approval_received_date_plan),
          final_drg_approval_received_date_actual: formatInputDate(d.final_drg_approval_received_date_actual),
          po_received_date_to_ga_drw_submission_days: d.po_received_date_to_ga_drw_submission_days ?? "",
          ga_drawing_submission_to_final_approval_received_days:
            d.ga_drawing_submission_to_final_approval_received_days ?? "",
          days_in_drawing_approval: d.days_in_drawing_approval ?? "",
          perc_time_taken_of_total_po_delivery: d.perc_time_taken_of_total_po_delivery ?? "",
          work_order_no: d.work_order_no ?? "",
          work_order_date: formatInputDate(d.work_order_date),
          commited_ex_works_delivery_date: formatInputDate(d.commited_ex_works_delivery_date),
           amp_plan: formatInputDate(d.amp_plan),
          amp_actual: formatInputDate(d.amp_actual),
          bom_plan: formatInputDate(d.bom_plan),
          bom_actual: formatInputDate(d.bom_actual),
          gear_case_plan: formatInputDate(d.gear_case_plan),
          gearcase_actual: formatInputDate(d.gearcase_actual),
          internal_plan: formatInputDate(d.internal_plan),
          internal_actual: formatInputDate(d.internal_actual),
          bo_plan: formatInputDate(d.bo_plan),
          bo_actual: formatInputDate(d.bo_actual),
          assembly_plan: formatInputDate(d.assembly_plan),
          assembly_actual: formatInputDate(d.assembly_actual),
          testing_plan: formatInputDate(d.testing_plan),
          testing_actual: formatInputDate(d.testing_actual),
          dispatch_date_plan: formatInputDate(d.dispatch_date_plan),
          dispatch_date_actual: formatInputDate(d.dispatch_date_actual),
          on_time_delivery: d.on_time_delivery ?? "",
          ...Object.fromEntries(REMARK_SECTIONS.map((section) => [section.textField, ""])),
        });
      })
      .catch(() => {
        /* keep form blank on error */
      });
  }, [getOrderById, reset, rowData]);

  const computedMetrics = useMemo(() => {
    const source = orderDetails ?? rowData ?? {};
    const deliveryDaysFromPoDate = getAbsoluteDateDiffInDays(
      watchedCustPoDate || source.cust_po_date,
      watchedDeliveryDatePo || source.delivery_date_po
    );
    const daysInDrawingApproval = getAbsoluteDateDiffInDays(
      watchedCustPoDate || source.cust_po_date,
      watchedFinalApprovalActual || source.final_drg_approval_received_date_actual
    );
    const onTimeDelivery = getOnTimeDeliveryScore(
      watchedcommited_ex_works_delivery_date || source.commited_ex_works_delivery_date || watchedDeliveryDatePo || source.delivery_date_po,
      watchedDispatchDateActual || source.dispatch_date_actual
    );
    const percentTimeTaken =
      deliveryDaysFromPoDate && daysInDrawingApproval !== null
        ? (daysInDrawingApproval / deliveryDaysFromPoDate) * 100
        : null;

    return {
      delivery_days_frm_po_date: deliveryDaysFromPoDate,
      days_in_drawing_approval: daysInDrawingApproval,
      perc_time_taken_of_total_po_delivery: percentTimeTaken,
      on_time_delivery: onTimeDelivery,
    };
  }, [
    orderDetails,
    rowData,
    watchedCustPoDate,
    watchedDeliveryDatePo,
    watchedcommited_ex_works_delivery_date,
    watchedDispatchDateActual,
    watchedFinalApprovalActual,
  ]);

  const onSubmit = useCallback(async (formData: any) => {
    if (!rowData?.id) return;
    const sourceData = orderDetails ?? rowData ?? {};
    const remarkPayload = REMARK_SECTIONS.reduce<Record<string, unknown>>((accumulator, section) => {
      const nextRemark = typeof formData[section.textField] === "string" ? formData[section.textField].trim() : "";

      accumulator[section.textField] = nextRemark;
      accumulator[section.historyField] = buildRemarkHistoryPayload(
        getHistorySourceValue(sourceData, section),
        nextRemark,
        rowData.id,
        section
      );

      return accumulator;
    }, {});

    try {
      await updateOrder({
        ...rowData,
        ...sourceData,
        ...formData,
        ...remarkPayload,
        id: rowData.id,
        on_time_delivery: computedMetrics.on_time_delivery,
        delivery_days_frm_po_date: computedMetrics.delivery_days_frm_po_date,
        days_in_drawing_approval: computedMetrics.days_in_drawing_approval,
        perc_time_taken_of_total_po_delivery:
          computedMetrics.perc_time_taken_of_total_po_delivery,
      }).unwrap();

      showToast("Order updated successfully", "success");
      onClose?.();
    } catch (error: any) {
      showToast(error?.data?.message || "Failed to update order", "error");
    }
  }, [computedMetrics, onClose, orderDetails, rowData, showToast, updateOrder]);

  useImperativeHandle(
    ref,
    () => ({
      submit: async () => {
        await handleSubmit(onSubmit)();
      },
    }),
    [handleSubmit, onSubmit]
  );

  if (isFetching) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 300, gap: 2 }}>
        <CircularProgress />
        <Typography variant="body2" color="text.secondary">Loading details...</Typography>
      </Box>
    );
  }

  const renderOrderField = (field: (typeof ORDER_INFORMATION_FIELDS)[number], columns: number) => {
    const label = toFieldLabel(field);

    return (
      <Box
        key={field}
        sx={{
          mb: 1,
          minWidth: 0,
          gridColumn: getFieldGridColumn(field, columns),
        }}
      >
        {DATE_INPUT_FIELDS.has(field) ? (
          <Controller
            name={field}
            control={control}
            render={({ field: dateField }) => (
              <MuiDatePicker
                label={label}
                value={dateField.value ? dayjs(dateField.value) : null}
                onChange={(value) =>
                  dateField.onChange(
                    value && dayjs(value).isValid()
                      ? dayjs(value).format("YYYY-MM-DD")
                      : ""
                  )
                }
                readOnly={isOrderFieldReadOnly(field)}
                textFieldSx={getFieldHighlightSx(field)}
              />
            )}
          />
        ) : (
          <MuiTextField
            label={label}
            {...register(field)}
            type="text"
            multiline={MULTILINE_FIELDS.has(field)}
            rows={MULTILINE_FIELDS.has(field) ? 3 : undefined}
            inputProps={
              isOrderFieldReadOnly(field)
                ? { readOnly: MULTILINE_FIELDS.has(field) ? false : true }
                : undefined
            }
            sx={getFieldHighlightSx(field)}
            fullWidth
          />
        )}
      </Box>
    );
  };

  const renderRemarkHistory = (items: RemarkLogItem[], section: RemarkSectionConfig) => (
    <Stack
      spacing={1}
      sx={{
        p: 1.5,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1.5,
        backgroundColor: "background.default",
        maxHeight: 260,
        overflowY: "auto",
      }}
    >
      {items.length ? (
        items.map((remarkItem, index) => (
          <Box
            key={String(remarkItem.id ?? `${remarkItem.created_date ?? section.textField}-${index}`)}
            sx={{
              p: 1.25,
              borderRadius: 1.25,
              border: "1px solid",
              borderColor: "divider",
              backgroundColor: "background.paper",
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 600, whiteSpace: "pre-wrap" }}>
              {getRemarkText(remarkItem, section) || "-"}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.75 }}>
              {remarkItem.created_date ? formatDateTimeWithShortMonth(remarkItem.created_date) : ""}
            </Typography>
          </Box>
        ))
      ) : (
        <Typography variant="body2" color="text.secondary">
          {`No ${section.label.toLowerCase()} history available.`}
        </Typography>
      )}
    </Stack>
  );

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ width: "100%", overflowX: "hidden" }}>
      <Stack spacing={1}>
        <Tabs
          value={activeTab}
          onChange={(_, value) => setActiveTab(value)}
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: "divider" }}
        >
          <Tab label="Order Information" />
          <Tab label="Plan vs Actual Dates" />
        </Tabs>

        {activeTab === 0 && (
          <FormSection
            title="Order Information"
            description="Line item identification, customer, and delivery details"
            icon={<InfoOutlinedIcon fontSize="small" />}
          >
            <Stack spacing={2}>
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
                  Order Details
                </Typography>
                <FormStackGrid
                  columns={3}
                  sx={{
                    maxWidth: "100%",
                    alignItems: "start",
                    gridTemplateColumns: {
                      xs: "1fr",
                      md: "repeat(2, minmax(0, 1fr))",
                      lg: "repeat(3, minmax(0, 1fr))",
                    },
                  }}
                >
                  {READ_ONLY_ORDER_FIELDS.map((field) => renderOrderField(field, 3))}
                </FormStackGrid>
              </Box>

              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
                  Remarks
                </Typography>
                <Box
                  sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 1.5,
                    overflow: "hidden",
                    backgroundColor: "background.paper",
                  }}
                >
                  <Tabs
                    value={activeRemarkTab}
                    onChange={(_, value) => setActiveRemarkTab(value)}
                    variant="scrollable"
                    scrollButtons="auto"
                    allowScrollButtonsMobile
                    sx={{
                      px: 1,
                      borderBottom: "1px solid",
                      borderColor: "divider",
                      backgroundColor: "background.default",
                    }}
                  >
                    {REMARK_SECTIONS.map((section) => (
                      <Tab key={section.id} label={section.label} />
                    ))}
                  </Tabs>

                  <Stack
                    spacing={2}
                    sx={{
                      p: 2,
                    }}
                  >
                    <MuiTextField
                      label={activeRemarkSection.label}
                      {...register(activeRemarkSection.textField)}
                      type="text"
                      multiline
                      rows={3}
                      placeholder={activeRemarkSection.placeholder}
                      fullWidth
                    />

                    <Box>
                      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
                        {activeRemarkSection.label} History
                      </Typography>
                      {renderRemarkHistory(
                        remarkLogsBySection[activeRemarkSection.id] ?? [],
                        activeRemarkSection
                      )}
                    </Box>
                  </Stack>
                </Box>
              </Box>

              {EDITABLE_ORDER_INFORMATION_FIELDS.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
                    Editable Details
                  </Typography>
                  <FormStackGrid
                    columns={3}
                    sx={{
                      maxWidth: "100%",
                      alignItems: "start",
                      gridTemplateColumns: {
                        xs: "1fr",
                        md: "repeat(2, minmax(0, 1fr))",
                        lg: "repeat(3, minmax(0, 1fr))",
                      },
                    }}
                  >
                    {EDITABLE_ORDER_INFORMATION_FIELDS.map((field) => renderOrderField(field, 3))}
                  </FormStackGrid>
                </Box>
              )}

              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
                  Calculated Values
                </Typography>
                <FormStackGrid columns={4}>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 1.5,
                      border: "1px solid",
                      borderColor: "divider",
                      backgroundColor: "background.default",
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      PO Delivery in days from PO date 
                    </Typography>
                    <Typography variant="h6" sx={{ mt: 0.5 }}>
                      {formatMetricValue(computedMetrics.delivery_days_frm_po_date)}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 1.5,
                      border: "1px solid",
                      borderColor: "divider",
                      backgroundColor: "background.default",
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      Days In Drawing Approval
                    </Typography>
                    <Typography variant="h6" sx={{ mt: 0.5 }}>
                      {formatMetricValue(computedMetrics.days_in_drawing_approval)}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 1.5,
                      border: "1px solid",
                      borderColor: "divider",
                      backgroundColor: "background.default",
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      Final Approval Time
                    </Typography>
                    <Typography variant="h6" sx={{ mt: 0.5 }}>
                      {formatMetricValue(
                        computedMetrics.perc_time_taken_of_total_po_delivery,
                        "%"
                      )}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 1.5,
                      border: "1px solid",
                      borderColor: "divider",
                      backgroundColor: "background.default",
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      On Time Delivery
                    </Typography>
                    <Typography variant="h6" sx={{ mt: 0.5 }}>
                      {computedMetrics.on_time_delivery ?? "-"}
                    </Typography>
                  </Box>


                </FormStackGrid>
              </Box>

            </Stack>
          </FormSection>
        )}

        {activeTab === 1 && (
          <FormSection
            title="Plan vs Actual Dates"
            description="Scheduled and actual completion dates across manufacturing stages"
            icon={<TimelineOutlinedIcon fontSize="small" />}
            accentColor="#1D4ED8"
          >
            <FormStackGrid columns={3}>
              {[
                { label: "AMP", plan: "amp_plan", actual: "amp_actual" },
                { label: "BOM", plan: "bom_plan", actual: "bom_actual" },
                { label: "Gear Case", plan: "gear_case_plan", actual: "gearcase_actual" },
                { label: "Internal", plan: "internal_plan", actual: "internal_actual" },
                { label: "BO", plan: "bo_plan", actual: "bo_actual" },
                { label: "Assembly", plan: "assembly_plan", actual: "assembly_actual" },
                { label: "Testing", plan: "testing_plan", actual: "testing_actual" },
                { label: "Dispatch", plan: "dispatch_date_plan", actual: "dispatch_date_actual" },
              ].map(({ label, plan, actual }) => {
                const planValue = watchedPlanActualValues?.[plan];

                return (
                  <Box key={label} sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 3 }}>
                    <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}>
                      {label}
                    </Typography>
                    <Tooltip title="Plan Date" arrow placement="top">
                      <Box>
                        <Controller
                          name={plan}
                          control={control}
                          render={({ field }) => (
                            <MuiDatePicker
                              label="Plan"
                              value={field.value ? dayjs(field.value) : null}
                              onChange={(value) =>
                                field.onChange(
                                  value && dayjs(value).isValid() ? dayjs(value).format("YYYY-MM-DD") : ""
                                )
                              }
                              readOnly
                            />
                          )}
                        />
                      </Box>
                    </Tooltip>
                    <Box sx={{ mt: 1 }}>
                    <Tooltip title="Actual Date" arrow placement="top">
                      <Box>
                        <Controller
                          name={actual}
                          control={control}
                          render={({ field }) => {
                            const displayColor = getPlanActualDisplayColor(
                              planValue,
                              field.value
                            );

                            return (
                              <MuiDatePicker
                                label="Actual"
                                value={field.value ? dayjs(field.value) : null}
                                onChange={(value) =>
                                  field.onChange(
                                    value && dayjs(value).isValid() ? dayjs(value).format("YYYY-MM-DD") : ""
                                  )
                                }
                                readOnly
                                textFieldSx={{
                                  "& .MuiOutlinedInput-notchedOutline": {
                                    borderColor: displayColor,
                                    borderWidth: 1.5,
                                  },
                                  "& .MuiInputLabel-root": {
                                    color: displayColor,
                                    fontWeight: 600,
                                  },
                                  "& .MuiOutlinedInput-input": {
                                    color: displayColor,
                                    fontWeight: 600,
                                  },
                                }}
                              />
                            );
                          }}
                        />
                      </Box>
                    </Tooltip>
                    </Box>
                  </Box>
                );
              })}
            </FormStackGrid>
          </FormSection>
        )}
      </Stack>
    </Box>
  );
}

export const ViewDetails = memo(forwardRef(Index));
