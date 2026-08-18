import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Button,
  Card,
  Chip,
  Pagination,
  Radio,
  Select,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TextField,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  GridColDef,
  GridFilterModel,
  GridPaginationModel,
  GridSortModel,
} from "@mui/x-data-grid";
import { alpha } from "@mui/material/styles";
import PrecisionManufacturingOutlinedIcon from "@mui/icons-material/PrecisionManufacturingOutlined";
import QrCode2OutlinedIcon from "@mui/icons-material/QrCode2Outlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import LocalPrintshopOutlinedIcon from "@mui/icons-material/LocalPrintshopOutlined";
import RouteOutlinedIcon from "@mui/icons-material/RouteOutlined";
import WarehouseOutlinedIcon from "@mui/icons-material/WarehouseOutlined";
import CurrencyRupeeOutlinedIcon from "@mui/icons-material/CurrencyRupeeOutlined";
import ViewListOutlinedIcon from "@mui/icons-material/ViewListOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";

import ApiActionButton from "../../../../../shared/components/common/ApiActionButton";
import ReusableDataGrid from "../../../../../shared/components/common/ReusableDataGrid";
import { MuiSelect, MuiTextField } from "../../../../../shared/components/mui/input";
import { PageHeader } from "../../../../../shared/components/ui/form/stack";
import FormSection from "../../../../../shared/components/ui/form/FormSection";
import { useModal } from "../../../../../shared/hooks/useModal";
import { useToast } from "../../../../../shared/hooks/useToast";
import { useAppSelector } from "../../../../../shared/redux/hooks";
import {
  BarcodeLineItemViewModel,
  BarcodeSalesOrderStatus,
  BarcodeSalesOrderDetailsViewModel,
  mapSerialItem,
} from "../barcodeAdapters";
import { FinalInspection } from "./finalinspection";
import { EditListItem, type EditListItemRef } from "./editlistitem";
import { OrderComplition } from "./ordercomplition";
import {
  barcodeDefaults,
  BarcodeCompletionStage,
  BarcodeCreateWorkOrderResponseData,
  BarcodeMaterialIssueLotSerialItem,
  getBarcodeDefaultContext,
  useCreateWorkOrderMutation,
  useGenerateSerialNumbersMutation,
  useLazyGetCompletionGearboxDetailsQuery,
  useLazyGetQualityCheckDetailsQuery,
  useLazyGetUnderAssemblyDetailsQuery,
  useIssueMaterialMutation,
  useOrderLineItemEditMutation,
  usePrintLabelMutation,
  useSaveLotSerialAndMaterialIssueMutation,
  useUpdateOrderCompletionStageMutation,
} from "../../api/barcode";
import { printPdfBlob } from "../../../../../shared/utils/printPdfBlob";

type LineItemsProps = {
  orderDetails?: BarcodeSalesOrderDetailsViewModel | null;
  onOrderUpdated?: () => Promise<unknown> | unknown;
};
type StatusCode = "PL" | "SH" | "MI" | "PK" | "BOOKED" | string;
type ActionKey = "workOrder" | "serialNumber" | "issueMaterial" | "printLabel" | "edit";

type ActionConfig = {
  visible: boolean;
  enabled: boolean;
  label: string;
  mode?: string;
};

type SerialItem = {
  id?: number | null;
  serial_no: string;
  status: string | null;
  sh_type: string | null;
  sh_item: string | null;
  ass_rel_date: string | null;
  ac_ua_date: string | null;
  ac_qc_date?: string | null;
  ac_comp_date: string | null;
  ac_pi_date: string | null;
  ac_pk_date: string | null;
  tent_rel_date: string | null;
  rpm: string | null;
  motor_serial_no: string | null;
  ac_ds_date?: string | null;
  ac_ho_date?: string | null;
  ac_ca_date?: string | null;
};

type SerialWorkflowActionKey = "acUa" | "acQc" | "acComp" | "acPi" | "acPk" | "acDs";

type CompletionLookupMetadata = {
  oracle_order_no?: number | string | null;
  model_type?: string | null;
  qty?: number | string | null;
  order_header_id?: number | string | null;
  order_line_id?: number | string | null;
  kw?: number | string | null;
  input_RPM?: number | string | null;
  actual_ratio?: number | string | null;
  pole?: number | string | null;
  noiseLevel?: number | string | null;
  paintColor?: string | null;
  MotorMake?: string | null;
  OracleUserId?: number | string | null;
  P_AMB_TEMP?: string | null;
  P_GREASE_TEMP?: string | null;
  rpm?: number | string | null;
  motor_serial_no?: string | null;
  Model?: string | null;
  model?: string | null;
  wo_no?: string | null;
};

type LineItemRow = {
  id: string;
  lineId: number;
  headerId?: number | null;
  orgId?: number | null;
  shipFromOrgId?: number | null;
  line_no: string;
  item_code: string;
  description?: string;
  quantity: number;
  list_price: number;
  discount_percent: number;
  selling_price: number;
  amount: number;
  ship_to_location: string;
  road_permit: string | boolean;
  wo_no: string;
  wo_date: string | null;
  client_delivery_date: string | null;
  delivery_month: string | null;
  con_auth: string | null;
  status: StatusCode;
  mail_status?: string;
  model?: string | null;
  model_type?: string | null;
  kw?: number | null;
  ratio?: number | null;
  quantitys?: SerialItem[];
  actions?: Record<string, ActionConfig>;
};

type LineItemOverride = Partial<LineItemRow> & {
  forceEnableSerialNumber?: boolean;
  materialIssued?: boolean;
};

const meta: Record<
  string,
  { label: string; bg: string; color: string; accent: string }
> = {
  PL: { label: "In Planning", bg: "#FFF4D6", color: "#9A5B00", accent: "#D68A00" },
  SH: { label: "Shop Floor Ready", bg: "#DCFCE7", color: "#166534", accent: "#15803D" },
  MI: { label: "Material Issued", bg: "#DBEAFE", color: "#1D4ED8", accent: "#2563EB" },
  PK: { label: "Label Ready", bg: "#F3E8FF", color: "#7E22CE", accent: "#9333EA" },
  PI: { label: "Painting", bg: "#FCE7F3", color: "#BE185D", accent: "#EC4899" },
  BOOKED: { label: "Booked", bg: "#FFF4D6", color: "#9A5B00", accent: "#D68A00" },
};

const actionIcon: Record<string, React.ReactNode> = {
  workOrder: <PrecisionManufacturingOutlinedIcon fontSize="small" />,
  serialNumber: <QrCode2OutlinedIcon fontSize="small" />,
  issueMaterial: <Inventory2OutlinedIcon fontSize="small" />,
  printLabel: <LocalPrintshopOutlinedIcon fontSize="small" />,
  edit: <ViewListOutlinedIcon fontSize="small" />,
};

const actionSet = (
  status: StatusCode,
  options?: {
    forceEnableSerialNumber?: boolean;
    hasWorkOrder?: boolean;
    hasSerialNumbers?: boolean;
    materialIssued?: boolean;
  }
): Record<ActionKey, ActionConfig> => ({
  workOrder: {
    visible: !options?.hasWorkOrder,
    enabled: true,
    label: "Create WO",
  },
  serialNumber: {
    visible:
      !options?.hasSerialNumbers &&
      (options?.forceEnableSerialNumber || options?.hasWorkOrder || (status !== "PL" && status !== "BOOKED")),
    enabled:
      options?.forceEnableSerialNumber || (status !== "PL" && status !== "BOOKED"),
    label: "Serial No",
  },
  issueMaterial: {
    visible:
      Boolean(options?.hasSerialNumbers) &&
      !options?.materialIssued &&
      !["MI", "PK"].includes(status),
    enabled: Boolean(options?.hasSerialNumbers) && !options?.materialIssued,
    label: "Issue Material",
  },
  printLabel: {
    visible: true,
    enabled: options?.materialIssued || status === "MI" || status === "PK",
    label: "Print Label",
  },
  edit: { visible: true, enabled: true, label: "Edit" },
});

const sampleRows = (
  orderDetails?: BarcodeSalesOrderDetailsViewModel | null,
  overrides: Record<string, LineItemOverride> = {}
): LineItemRow[] =>
  (orderDetails?.line_items || []).map((line: BarcodeLineItemViewModel) => {
    const override = overrides[String(line.lineId)] || {};
    const resolvedQuantitys = override.quantitys ?? line.quantitys ?? [];
    const resolvedStatus = (override.status ?? line.status) as StatusCode;
    const resolvedWoNo = String(override.wo_no ?? line.wo_no ?? "");

    return {
      ...line,
      ...override,
      lineId: line.lineId,
      description: line.description || "Description not available",
      status: resolvedStatus,
      wo_no: resolvedWoNo,
      quantitys: resolvedQuantitys,
      actions: actionSet(resolvedStatus, {
        forceEnableSerialNumber: override.forceEnableSerialNumber,
        hasWorkOrder: Boolean(resolvedWoNo),
        hasSerialNumbers: resolvedQuantitys.length > 0,
        materialIssued: Boolean(override.materialIssued),
      }),
    };
  });

const cardSx = { border: "1px solid rgba(15,23,42,0.08)" };

const parseDate = (value: string | null | undefined) => {
  if (!value) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return new Date(`${value}T00:00:00`);
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
    const [d, m, y] = value.split("/").map(Number);
    return new Date(y, m - 1, d);
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const formatDate = (value: string | null | undefined) => {
  const date = parseDate(value);
  return date ? date.toLocaleDateString("en-GB") : value || "--";
};

const formatAmount = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);

const toNumeric = (value: unknown) => {
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : 0;
};

const toDisplayValue = (value: unknown) => {
  if (value === null || value === undefined || value === "") {
    return "--";
  }

  if (typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }

  return String(value);
};

const isPlainRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const MATERIAL_ISSUE_COLUMN_CONFIG: Array<{
  field: string;
  headerName: string;
  minWidth: number;
  aliases: string[];
}> = [
  { field: "srNo", headerName: "Sr No", minWidth: 90, aliases: ["srNo", "sr_no", "srno", "sr", "id"] },
  { field: "item", headerName: "Item", minWidth: 220, aliases: ["item", "item_code", "inventory_item", "segment1", "ordered_item"] },
  {
    field: "subInventory",
    headerName: "SUB INVENTORY",
    minWidth: 160,
    aliases: ["subInventory", "sub_inventory", "subinventory", "subinv", "from_subinventory_code"],
  },
  {
    field: "locator",
    headerName: "LOCATOR",
    minWidth: 140,
    aliases: ["locator", "locator_code", "segment2", "concatenated_segments", "from_locator"],
  },
  { field: "uom", headerName: "UOM", minWidth: 90, aliases: ["uom", "uom_code", "primary_uom_code"] },
  {
    field: "reqQty",
    headerName: "Req Qty",
    minWidth: 110,
    aliases: ["reqQty", "req_qty", "required_qty", "required_quantity", "request_quantity"],
  },
  {
    field: "qtyOpen",
    headerName: "Qty Open",
    minWidth: 110,
    aliases: ["qtyOpen", "qty_open", "open_qty", "open_quantity", "transaction_quantity"],
  },
  {
    field: "qtyOnHand",
    headerName: "Qty On Hand",
    minWidth: 130,
    aliases: ["qtyOnHand", "qty_on_hand", "onhand_qty", "on_hand_quantity", "quantity_on_hand"],
  },
  {
    field: "lotSerial",
    headerName: "Lot/Serial",
    minWidth: 140,
    aliases: ["lotSerial", "lot_serial", "lot_number", "serial_number", "lot_or_serial"],
  },
  {
    field: "selectLocator",
    headerName: "Select Locator",
    minWidth: 140,
    aliases: ["selectLocator", "select_locator", "locator_selected", "selected_locator", "locator_flag"],
  },
];

const getMaterialIssueValue = (row: Record<string, unknown>, aliases: string[]) => {
  for (const alias of aliases) {
    if (row[alias] !== undefined && row[alias] !== null && row[alias] !== "") {
      return row[alias];
    }

    const normalizedAlias = alias.toLowerCase();
    const matchedKey = Object.keys(row).find((key) => key.toLowerCase() === normalizedAlias);
    if (matchedKey && row[matchedKey] !== undefined && row[matchedKey] !== null && row[matchedKey] !== "") {
      return row[matchedKey];
    }
  }

  return null;
};

type MaterialIssueGridRow = {
  id: number;
  srNo: unknown;
  item: unknown;
  itemDescription: unknown;
  subInventory: unknown;
  locator: unknown;
  uom: unknown;
  reqQty: unknown;
  qtyOpen: unknown;
  qtyOnHand: unknown;
  lotSerial: unknown;
  selectLocator: unknown;
  issueMaterialId: unknown;
  inventoryItemId: unknown;
  inventoryItemKey: string;
  itemPrimaryUomCode: unknown;
  lotControlCode: number;
  serialNumberControlCode: number;
  supplyLocatorId: unknown;
  supplyLocator: unknown;
  supplySubinventory: unknown;
  requiredQuantity: unknown;
  quantityOpen: unknown;
  quantityOnHand: unknown;
  woNo: unknown;
  orgId: unknown;
  lineId: unknown;
  headerId: unknown;
  wipEntityId: unknown;
  operationSeqNum: unknown;
  subinventoryCode: unknown;
  locatorId: unknown;
  lotOptions: string[];
};

type MaterialIssueLotEntry = {
  id: number;
  lot: string;
  quantity: string;
};

const createFallbackMaterialIssueRow = (source: unknown, index: number): MaterialIssueGridRow => ({
  id: index + 1,
  srNo: index + 1,
  item: toDisplayValue(source),
  itemDescription: "--",
  subInventory: "--",
  locator: "--",
  uom: "--",
  reqQty: "--",
  qtyOpen: "--",
  qtyOnHand: "--",
  lotSerial: "--",
  selectLocator: "--",
  issueMaterialId: null,
  inventoryItemId: null,
  inventoryItemKey: "",
  itemPrimaryUomCode: "--",
  lotControlCode: 0,
  serialNumberControlCode: 0,
  supplyLocatorId: null,
  supplyLocator: "--",
  supplySubinventory: "--",
  requiredQuantity: "--",
  quantityOpen: "--",
  quantityOnHand: "--",
  woNo: "",
  orgId: null,
  lineId: null,
  headerId: null,
  wipEntityId: null,
  operationSeqNum: null,
  subinventoryCode: "--",
  locatorId: null,
  lotOptions: ["ABC"],
});

const normalizeMaterialIssueLotOptions = (value: unknown) => {
  if (Array.isArray(value)) {
    return value.map((option) => toDisplayValue(option));
  }

  return String(value || "")
    .split(",")
    .map((option) => option.trim())
    .filter(Boolean);
};

const mapMaterialIssueRecord = (
  entry: Record<string, unknown>,
  index: number
): MaterialIssueGridRow => {
  const lotSerialValue = getMaterialIssueValue(entry, MATERIAL_ISSUE_COLUMN_CONFIG[8].aliases);
  const lotOptions = normalizeMaterialIssueLotOptions(lotSerialValue);
  const inventoryItemId = getMaterialIssueValue(entry, [
    "inventory_item_id",
    "inventoryitemid",
    "inventoryItemId",
  ]);

  return {
    id: index + 1,
    srNo: getMaterialIssueValue(entry, ["srNo", "sr_no", "srno", "sr"]) ?? index + 1,
    item: getMaterialIssueValue(entry, MATERIAL_ISSUE_COLUMN_CONFIG[1].aliases),
    itemDescription: getMaterialIssueValue(entry, [
      "description",
      "item_description",
      "inventory_item_description",
      "item_desc",
    ]),
    subInventory: getMaterialIssueValue(entry, MATERIAL_ISSUE_COLUMN_CONFIG[2].aliases),
    locator: getMaterialIssueValue(entry, MATERIAL_ISSUE_COLUMN_CONFIG[3].aliases),
    uom: getMaterialIssueValue(entry, MATERIAL_ISSUE_COLUMN_CONFIG[4].aliases),
    reqQty: getMaterialIssueValue(entry, MATERIAL_ISSUE_COLUMN_CONFIG[5].aliases),
    qtyOpen: getMaterialIssueValue(entry, MATERIAL_ISSUE_COLUMN_CONFIG[6].aliases),
    qtyOnHand: getMaterialIssueValue(entry, MATERIAL_ISSUE_COLUMN_CONFIG[7].aliases),
    lotSerial: lotSerialValue,
    selectLocator: getMaterialIssueValue(entry, MATERIAL_ISSUE_COLUMN_CONFIG[9].aliases),
    issueMaterialId: getMaterialIssueValue(entry, [
      "issueMaterial_ID",
      "issuematerial_id",
      "issue_material_id",
      "issueMaterialId",
    ]),
    inventoryItemId,
    inventoryItemKey:
      inventoryItemId === undefined || inventoryItemId === null || inventoryItemId === ""
        ? ""
        : String(inventoryItemId),
    itemPrimaryUomCode: getMaterialIssueValue(entry, [
      "item_primary_uom_code",
      "primary_uom_code",
      "uom_code",
      "uom",
    ]),
    lotControlCode: toNumeric(
      getMaterialIssueValue(entry, [
        "lot_control_code",
        "lotcontrolcode",
        "lotControlCode",
      ])
    ),
    serialNumberControlCode: toNumeric(
      getMaterialIssueValue(entry, [
        "serial_number_control_code",
        "serialnumbercontrolcode",
        "serialNumberControlCode",
      ])
    ),
    supplyLocatorId: getMaterialIssueValue(entry, [
      "supply_locator_id",
      "supplylocatorid",
      "supplyLocatorId",
    ]),
    supplyLocator: getMaterialIssueValue(entry, [
      "supply_locator",
      "supplylocator",
      "supplyLocator",
      "locator",
      "locator_code",
    ]),
    supplySubinventory: getMaterialIssueValue(entry, [
      "supply_subinventory",
      "supplysubinventory",
      "supplySubinventory",
      "subinventory_code",
      "subInventory",
    ]),
    requiredQuantity: getMaterialIssueValue(entry, [
      "required_quantity",
      "required_qty",
      "reqQty",
      "req_qty",
    ]),
    quantityOpen: getMaterialIssueValue(entry, [
      "quantity_open",
      "qtyOpen",
      "qty_open",
      "open_quantity",
    ]),
    quantityOnHand: getMaterialIssueValue(entry, [
      "quantity_on_hand",
      "qtyOnHand",
      "qty_on_hand",
      "on_hand_quantity",
    ]),
    woNo: getMaterialIssueValue(entry, ["wo_no", "wono", "WO_NO", "WONO"]),
    orgId: getMaterialIssueValue(entry, ["org_id", "orgId", "organization_id"]),
    lineId: getMaterialIssueValue(entry, ["line_id", "lineId", "LINE_ID"]),
    headerId: getMaterialIssueValue(entry, ["header_id", "headerId", "HEADER_ID"]),
    wipEntityId: getMaterialIssueValue(entry, [
      "wip_entity_id",
      "wipentityid",
      "wipEntityId",
    ]),
    operationSeqNum: getMaterialIssueValue(entry, [
      "operation_seq_num",
      "operationseqnum",
      "operationSeqNum",
    ]),
    subinventoryCode: getMaterialIssueValue(entry, [
      "subinventory_code",
      "subinventoryCode",
      "supply_subinventory",
    ]),
    locatorId: getMaterialIssueValue(entry, ["locator_id", "locatorId", "supply_locator_id"]),
    lotOptions: lotOptions.length ? lotOptions : ["ABC"],
  };
};

const extractMaterialIssueSource = (response: unknown): unknown => {
  const topLevelSource =
    isPlainRecord(response) && "data" in response ? response.data : response;

  if (Array.isArray(topLevelSource)) {
    return topLevelSource;
  }

  if (!isPlainRecord(topLevelSource)) {
    return topLevelSource;
  }

  const candidateKeys = [
    "data",
    "Data",
    "rows",
    "Rows",
    "items",
    "Items",
    "records",
    "Records",
    "result",
    "Result",
    "issueMaterialItem",
    "IssueMaterialItem",
  ];

  for (const key of candidateKeys) {
    const value = topLevelSource[key];
    if (Array.isArray(value)) {
      return value;
    }

    if (isPlainRecord(value)) {
      const nestedArray = Object.values(value).find(Array.isArray);
      if (nestedArray) {
        return nestedArray;
      }
    }
  }

  const firstArrayValue = Object.values(topLevelSource).find(Array.isArray);
  if (firstArrayValue) {
    return firstArrayValue;
  }

  return topLevelSource;
};

const normalizeMaterialIssueRows = (response: unknown) => {
  const source = extractMaterialIssueSource(response);

  if (Array.isArray(source)) {
    return source.map((entry, index) => {
      if (!isPlainRecord(entry)) {
        return createFallbackMaterialIssueRow(entry, index);
      }

      return mapMaterialIssueRecord(entry, index);
    });
  }

  if (isPlainRecord(source)) {
    return [mapMaterialIssueRecord(source, 0)];
  }

  return [createFallbackMaterialIssueRow(source, 0)];
};

const getPayloadValue = <T,>(value: T | null | undefined | "", fallback: T) =>
  value === undefined || value === null || value === "" ? fallback : value;

const toPayloadScalar = (value: unknown, fallback: string | number = ""): string | number => {
  const resolvedValue =
    value === undefined || value === null || value === "" ? fallback : value;

  if (typeof resolvedValue === "string" || typeof resolvedValue === "number") {
    return resolvedValue;
  }

  return fallback;
};

const toNullablePayloadScalar = (
  value: unknown,
  fallback: unknown = null
): string | number | null => {
  const resolvedValue =
    value === undefined || value === null || value === "" ? fallback : value;

  if (typeof resolvedValue === "string" || typeof resolvedValue === "number") {
    return resolvedValue;
  }

  return null;
};

const buildMaterialIssueSaveItemPayload = (row: MaterialIssueGridRow) => ({
  issueMaterial_ID: toPayloadScalar(row.issueMaterialId, row.id),
  inventory_item_id: toPayloadScalar(row.inventoryItemId),
  inventory_item: String(getPayloadValue(row.item, "")),
  item_primary_uom_code: String(getPayloadValue(row.itemPrimaryUomCode, "")),
  lot_control_code: row.lotControlCode,
  serial_number_control_code: row.serialNumberControlCode,
  supply_locator_id: toNullablePayloadScalar(row.supplyLocatorId, row.locatorId),
  supply_locator: String(getPayloadValue(row.supplyLocator, row.locator)),
  supply_subinventory: String(getPayloadValue(row.supplySubinventory, row.subInventory)),
  required_quantity: toPayloadScalar(row.requiredQuantity, toPayloadScalar(row.reqQty)),
  quantity_open: toPayloadScalar(row.quantityOpen, toPayloadScalar(row.qtyOpen)),
  quantity_on_hand: toPayloadScalar(row.quantityOnHand, toPayloadScalar(row.qtyOnHand)),
  wo_no: String(getPayloadValue(row.woNo, "")),
  item_desc: String(getPayloadValue(row.itemDescription, "")),
  org_id: toPayloadScalar(row.orgId),
  line_id: toPayloadScalar(row.lineId),
  header_id: toPayloadScalar(row.headerId),
  wip_entity_id: toPayloadScalar(row.wipEntityId),
  operation_seq_num: toPayloadScalar(row.operationSeqNum),
  subinventory_code: String(getPayloadValue(row.subinventoryCode, row.supplySubinventory)),
  locator_id: toNullablePayloadScalar(row.locatorId, row.supplyLocatorId),
});

const buildLotSerialIssuedPayload = (
  row: MaterialIssueGridRow,
  entries: MaterialIssueLotEntry[]
): BarcodeMaterialIssueLotSerialItem[] =>
  entries.map((entry, index) => ({
    org_id: toPayloadScalar(row.orgId),
    wo_no: String(getPayloadValue(row.woNo, "")),
    inventory_item_id: toPayloadScalar(row.inventoryItemId),
    Quantity: toNumeric(entry.quantity),
    Lot_Number: entry.lot,
    issueMaterial_ID: toPayloadScalar(row.issueMaterialId, row.id),
    Lot_serial_Id: index + 1,
  }));

const getMaterialAllocationKey = (row: MaterialIssueGridRow) =>
  row.inventoryItemKey || String(row.id);

function LotSerialDrawer({
  row,
  savedEntries,
  onSaveAllocations,
  setDisplayTitle,
  setHideFooter,
  setWidth,
}: {
  row: MaterialIssueGridRow;
  savedEntries?: MaterialIssueLotEntry[];
  onSaveAllocations: (entries: MaterialIssueLotEntry[]) => void;
  setDisplayTitle?: (title: string) => void;
  setHideFooter?: (hidden: boolean) => void;
  setWidth?: (width: number | string) => void;
}) {
  const { showToast } = useToast();
  const { closeModal } = useModal();
  const [selectedLot, setSelectedLot] = useState("");
  const [quantity, setQuantity] = useState("");
  const [entries, setEntries] = useState<MaterialIssueLotEntry[]>([]);

  useEffect(() => {
    setDisplayTitle?.(`Lot/Serial - ${toDisplayValue(row.item)}`);
    setHideFooter?.(true);
    setWidth?.(980);
  }, [row.item, setDisplayTitle, setHideFooter, setWidth]);

  useEffect(() => {
    setEntries(savedEntries || []);
  }, [savedEntries]);

  const handleAdd = () => {
    if (!selectedLot) {
      showToast("Please select a lot before adding.", "warning");
      return;
    }

    if (toNumeric(quantity) <= 0) {
      showToast("Please enter a valid quantity before adding.", "warning");
      return;
    }

    setEntries((current) => [
      ...current,
      {
        id: current.length + 1,
        lot: selectedLot,
        quantity,
      },
    ]);
    setSelectedLot("");
    setQuantity("");
  };

  const handleReset = () => {
    setSelectedLot("");
    setQuantity("");
    setEntries([]);
  };

  const handleSave = () => {
    onSaveAllocations(entries);
    showToast(
      entries.length ? "Lot/Serial allocation saved successfully." : "Lot/Serial allocation cleared.",
      "success"
    );
    closeModal();
  };

  return (
    <Stack spacing={2} sx={{ px: 0.5, py: 1 }}>
      <Card sx={{ ...cardSx }}>
        <Box sx={{ p: 2.5 }}>
          <Typography variant="caption" color="text.secondary">
            Lot / Serial Selection
          </Typography>
          <Typography variant="h6" fontWeight={800} sx={{ mb: 2.5 }}>
            Material Allocation
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "180px 220px 1fr" },
              gap: 1.5,
              alignItems: "center",
              mb: 3,
            }}
          >
            <Typography color="text.secondary">Item</Typography>
            <Typography fontWeight={700}>{toDisplayValue(row.item)}</Typography>
            <Typography>{toDisplayValue(row.itemDescription)}</Typography>

            <Typography color="text.secondary">Required Quantity</Typography>
            <Typography fontWeight={700}>{toDisplayValue(row.reqQty)}</Typography>
            <Box />
          </Box>

          <TableContainer
            sx={{
              borderRadius: 1.5,
              border: "1px solid",
              borderColor: "divider",
              backgroundColor: "background.paper",
              maxWidth: 760,
            }}
          >
            <Table size="small">
              <TableHead>
                <TableRow
                  sx={{
                    "& th": {
                      bgcolor: "#F8FAFC",
                      color: "#475569",
                      fontSize: "0.78rem",
                      fontWeight: 800,
                      borderColor: "divider",
                    },
                  }}
                >
                  <TableCell>LOT</TableCell>
                  <TableCell>Quantity</TableCell>
                  <TableCell>On Hand Qty</TableCell>
                  <TableCell align="center">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell sx={{ width: 220 }}>
                    <Select
                      size="small"
                      fullWidth
                      displayEmpty
                      value={selectedLot}
                      onChange={(event) => setSelectedLot(String(event.target.value))}
                    >
                      <MenuItem value="">-Select-</MenuItem>
                      {row.lotOptions.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </Select>
                  </TableCell>
                  <TableCell sx={{ width: 180 }}>
                    <TextField
                      size="small"
                      value={quantity}
                      onChange={(event) => setQuantity(event.target.value)}
                    />
                  </TableCell>
                  <TableCell sx={{ width: 180 }}>{toDisplayValue(row.qtyOnHand)}</TableCell>
                  <TableCell align="center" sx={{ width: 120 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={handleAdd}
                      sx={{ minWidth: 80, textTransform: "none" }}
                    >
                      ADD
                    </Button>
                  </TableCell>
                </TableRow>
                {entries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>{entry.lot}</TableCell>
                    <TableCell>{entry.quantity}</TableCell>
                    <TableCell>{toDisplayValue(row.qtyOnHand)}</TableCell>
                    <TableCell align="center">--</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Stack direction="row" spacing={1.5} sx={{ mt: 3 }}>
            <Button
              variant="contained"
              onClick={handleSave}
              sx={{ minWidth: 96, textTransform: "none" }}
            >
              Save
            </Button>
            <Button
              variant="outlined"
              onClick={handleReset}
              sx={{ minWidth: 96, textTransform: "none" }}
            >
              Reset
            </Button>
          </Stack>
        </Box>
      </Card>
    </Stack>
  );
}

const buildMaterialIssueColumns = ({
  duplicateInventoryCounts,
  selectedLocatorByInventory,
  onSelectLocator,
  onLotSerialClick,
}: {
  duplicateInventoryCounts: Record<string, number>;
  selectedLocatorByInventory: Record<string, number>;
  onSelectLocator: (inventoryItemId: string, rowId: number) => void;
  onLotSerialClick: (row: MaterialIssueGridRow) => void;
}): GridColDef[] => {
  return MATERIAL_ISSUE_COLUMN_CONFIG.map((column) => ({
    field: column.field,
    headerName: column.headerName,
    flex: 1,
    minWidth: column.minWidth,
    renderCell: (params) => {
      const row = params.row as MaterialIssueGridRow;

      if (column.field === "selectLocator") {
        const inventoryItemId = row.inventoryItemKey;
        const canChooseLocator =
          Boolean(inventoryItemId) && (duplicateInventoryCounts[inventoryItemId] || 0) > 1;

        if (!canChooseLocator) {
          return "--";
        }

        return (
          <Radio
            size="small"
            checked={selectedLocatorByInventory[inventoryItemId] === Number(row.id)}
            onChange={() => onSelectLocator(inventoryItemId, Number(row.id))}
          />
        );
      }

      if (column.field === "lotSerial") {
        if (Number(row.lotControlCode) !== 2) {
          return "--";
        }

        return (
          <Button
            size="small"
            variant="outlined"
            onClick={() => onLotSerialClick(row)}
            sx={{
              minWidth: 96,
              textTransform: "none",
              borderRadius: 2,
              whiteSpace: "nowrap",
            }}
          >
            Lot/Serial
          </Button>
        );
      }

      return toDisplayValue(params.value);
    },
  }));
};

function MaterialIssueResponseDrawer({
  response,
  lineNo,
  onSaved,
}: {
  response: unknown;
  lineNo: string;
  onSaved?: () => Promise<unknown> | unknown;
}) {
  const { showToast } = useToast();
  const { openModal, closeModal } = useModal();
  const [saveLotSerialAndMaterialIssue, { isLoading: isSavingMaterialIssue }] =
    useSaveLotSerialAndMaterialIssueMutation();
  const rows = useMemo(() => normalizeMaterialIssueRows(response), [response]);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });
  const [sortModel, setSortModel] = useState<GridSortModel>([]);
  const [filterModel, setFilterModel] = useState<GridFilterModel>({
    items: [],
    quickFilterValues: [],
  });
  const [selectedLocatorByInventory, setSelectedLocatorByInventory] = useState<
    Record<string, number>
  >({});
  const [lotSerialEntriesByRow, setLotSerialEntriesByRow] = useState<
    Record<string, MaterialIssueLotEntry[]>
  >({});
  const lotSerialEntriesRef = useRef<Record<string, MaterialIssueLotEntry[]>>({});

  const duplicateInventoryCounts = useMemo(() => {
    return rows.reduce<Record<string, number>>((acc, row) => {
      const inventoryItemId = (row as MaterialIssueGridRow).inventoryItemKey;
      if (!inventoryItemId) {
        return acc;
      }

      acc[inventoryItemId] = (acc[inventoryItemId] || 0) + 1;
      return acc;
    }, {});
  }, [rows]);

  useEffect(() => {
    setSelectedLocatorByInventory(() => {
      const nextSelection: Record<string, number> = {};

      rows.forEach((row) => {
        const materialRow = row as MaterialIssueGridRow;
        const inventoryItemId = materialRow.inventoryItemKey;
        if (!inventoryItemId || (duplicateInventoryCounts[inventoryItemId] || 0) <= 1) {
          return;
        }

        if (nextSelection[inventoryItemId] === undefined) {
          nextSelection[inventoryItemId] = Number(materialRow.id);
        }
      });

      return nextSelection;
    });
  }, [duplicateInventoryCounts, rows]);

  useEffect(() => {
    setLotSerialEntriesByRow((current) => {
      const validAllocationKeys = new Set(
        rows.map((row) => getMaterialAllocationKey(row as MaterialIssueGridRow))
      );
      const nextEntries = Object.entries(current).filter(([rowId]) =>
        validAllocationKeys.has(rowId)
      );
      return nextEntries.length === Object.keys(current).length
        ? current
        : Object.fromEntries(nextEntries);
    });
  }, [rows]);

  useEffect(() => {
    lotSerialEntriesRef.current = lotSerialEntriesByRow;
  }, [lotSerialEntriesByRow]);

  const handleSelectLocator = useCallback((inventoryItemId: string, rowId: number) => {
    setSelectedLocatorByInventory((current) => ({
      ...current,
      [inventoryItemId]: rowId,
    }));
  }, []);

  const selectedMaterialRows = useMemo(
    () =>
      rows.filter((row) => {
        const inventoryItemId = row.inventoryItemKey;
        const isDuplicateLocator =
          Boolean(inventoryItemId) && (duplicateInventoryCounts[inventoryItemId] || 0) > 1;

        if (!isDuplicateLocator) {
          return true;
        }

        return selectedLocatorByInventory[inventoryItemId] === Number(row.id);
      }),
    [duplicateInventoryCounts, rows, selectedLocatorByInventory]
  );

  const handleSaveLotSerialAllocations = useCallback((
    row: MaterialIssueGridRow,
    entries: MaterialIssueLotEntry[]
  ) => {
    const allocationKey = getMaterialAllocationKey(row);
    lotSerialEntriesRef.current = {
      ...lotSerialEntriesRef.current,
      [allocationKey]: entries,
    };
    setLotSerialEntriesByRow((current) => ({
      ...current,
      [allocationKey]: entries,
    }));
  }, []);

  const handleLotSerialClick = useCallback((row: MaterialIssueGridRow) => {
    openModal({
      title: `Lot/Serial - ${toDisplayValue(row.item)}`,
      width: 980,
      showCloseButton: true,
      askDataChangeConfirm: false,
      component: (modalProps: any) => (
        <LotSerialDrawer
          {...modalProps}
          row={row}
          savedEntries={lotSerialEntriesByRow[getMaterialAllocationKey(row)] || []}
          onSaveAllocations={(entries) => handleSaveLotSerialAllocations(row, entries)}
        />
      ),
    });
  }, [lotSerialEntriesByRow, openModal, handleSaveLotSerialAllocations]);

  const handleSaveMaterialIssue = useCallback(async () => {
    if (!selectedMaterialRows.length) {
      showToast("No material issue rows are available to save.", "warning");
      return;
    }

    try {
      const latestLotSerialEntries = lotSerialEntriesRef.current;
      const response = await saveLotSerialAndMaterialIssue({
        IssueMaterialItem: {
          data: selectedMaterialRows.map((row) => buildMaterialIssueSaveItemPayload(row)),
        },
        LotserialnumberIssued: {
          Data: selectedMaterialRows.flatMap(
            (row) =>
              buildLotSerialIssuedPayload(
                row,
                latestLotSerialEntries[getMaterialAllocationKey(row)] || []
              )
          ),
        },
      }).unwrap();

      if (!(response?.status === true || response?.status === 1)) {
        throw new Error(response?.message || "Material issue save failed");
      }

      await onSaved?.();
      showToast(response?.message || "Material issue saved successfully.", "success");
      closeModal();
    } catch (error: any) {
      const message =
        error?.data?.message || error?.message || error?.error || "Unable to save material issue";
      showToast(message, "error");
    }
  }, [
    closeModal,
    onSaved,
    saveLotSerialAndMaterialIssue,
    selectedMaterialRows,
    showToast,
  ]);

  const columns = useMemo(
    () =>
      buildMaterialIssueColumns({
        duplicateInventoryCounts,
        selectedLocatorByInventory,
        onSelectLocator: handleSelectLocator,
        onLotSerialClick: handleLotSerialClick,
      }),
    [duplicateInventoryCounts, lotSerialEntriesByRow, selectedLocatorByInventory]
  );

  return (
    <Stack spacing={2} sx={{ px: 0.5, py: 1 }}>
      <Card sx={{ ...cardSx }}>
        <Box
          sx={{
            px: 2.5,
            py: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          <Box>
            <Typography variant="caption" color="text.secondary">
              Material Issue Response
            </Typography>
            <Typography variant="h6" fontWeight={800}>
              Line {lineNo} material allocation
            </Typography>
          </Box>
          <Button
            variant="contained"
            onClick={handleSaveMaterialIssue}
            disabled={isSavingMaterialIssue}
            sx={{ minWidth: 180, textTransform: "none" }}
          >
            {isSavingMaterialIssue ? "Saving..." : "Save Material Issue"}
          </Button>
        </Box>
      </Card>
      <ReusableDataGrid
        rows={rows}
        columns={columns}
        totalCount={rows.length}
        loading={false}
        paginationModel={paginationModel}
        setPaginationModel={setPaginationModel}
        sortModel={sortModel}
        setSortModel={setSortModel}
        filterModel={filterModel}
        setFilterModel={setFilterModel}
        title="Material Issue Response"
        refetch={() => undefined}
        enableViewToggle={false}
        permissions={{
          create: false,
          edit: false,
          delete: false,
          view: false,
          download: true,
        }}
        uniqueIdField="id"
        height="calc(100vh - 150px)"
        noRowsMessage="No material issue response data found"
      />
    </Stack>
  );
}

const resolveCompletionStage = (status: string): BarcodeCompletionStage => {
  if (status === "PI") {
    return "painting";
  }

  if (status === "PK") {
    return "packing";
  }

  return "completion";
};

const serialActionButtonMeta: Record<
  SerialWorkflowActionKey,
  { label: string; status: string; stage?: BarcodeCompletionStage; dateField: keyof SerialItem }
> = {
  acUa: { label: "Under Assembly", status: "UA", dateField: "ac_ua_date" },
  acQc: { label: "Quality Check", status: "QC", dateField: "ac_qc_date" },
  acComp: {
    label: "Completion",
    status: "CP",
    stage: "completion",
    dateField: "ac_comp_date",
  },
  acPi: { label: "Painting", status: "PI", stage: "painting", dateField: "ac_pi_date" },
  acPk: { label: "Packing", status: "PK", stage: "packing", dateField: "ac_pk_date" },
  acDs: { label: "Dispatch", status: "DS", dateField: "ac_ds_date" },
};

const serialActionPrerequisites: Record<
  SerialWorkflowActionKey,
  { field: keyof SerialItem; label: string }
> = {
  acUa: { field: "ass_rel_date", label: "Release" },
  acQc: { field: "ac_ua_date", label: "Assembly" },
  acComp: { field: "ac_qc_date", label: "Quality Check" },
  acPi: { field: "ac_comp_date", label: "Completion" },
  acPk: { field: "ac_pi_date", label: "Painting" },
  acDs: { field: "ac_pk_date", label: "Packing" },
};

const hasWorkflowValue = (value: string | null | undefined) => Boolean(String(value || "").trim());

const normalizeWorkflowStatus = (value: string | null | undefined) =>
  String(value || "").trim().toUpperCase();

const getSerialWorkflowActionState = (
  serial: SerialItem,
  actionKey: SerialWorkflowActionKey,
) => {
  const prerequisite = serialActionPrerequisites[actionKey];
  const prerequisiteValue = serial[prerequisite.field] as string | null | undefined;
  const hasPrerequisite = hasWorkflowValue(prerequisiteValue);
  const normalizedStatus = normalizeWorkflowStatus(serial.status);

  if (actionKey === "acUa" && normalizedStatus !== "MI") {
    return {
      enabled: false,
      helperText: "Under Assembly will enable only when serial status is MI.",
    };
  }

  const enabled = hasPrerequisite;

  return {
    enabled,
    helperText: enabled ? "" : `${serialActionButtonMeta[actionKey].label} will enable after ${prerequisite.label}.`,
  };
};

const dateHeaderLabel = (label: string) => (
  <Stack direction="row" spacing={0.5} alignItems="center">
    <Box component="span">{label}</Box>
    <CalendarMonthOutlinedIcon sx={{ fontSize: 15 }} />
  </Stack>
);

function SerialNumberDrawer({
  row,
  orderDetails,
  onSerialUpdated,
  setDisplayTitle,
  setHideFooter,
  setWidth,
}: {
  row: LineItemRow;
  orderDetails?: BarcodeSalesOrderDetailsViewModel | null;
  onSerialUpdated?: (
    lineId: number,
    serialNo: string,
    updates: Partial<SerialItem>,
  ) => void;
  setDisplayTitle?: (title: string) => void;
  setHideFooter?: (hidden: boolean) => void;
  setWidth?: (width: number | string) => void;
}) {
  const { showToast } = useToast();
  const { openModal } = useModal();
  const authUserId = useAppSelector((state) => state.auth.id);
  const [triggerUnderAssembly] = useLazyGetUnderAssemblyDetailsQuery();
  const [triggerQualityCheck] = useLazyGetQualityCheckDetailsQuery();
  const [triggerCompletionLookup] = useLazyGetCompletionGearboxDetailsQuery();
  const [updateOrderCompletionStage] = useUpdateOrderCompletionStageMutation();
  const serialsCount = row.quantitys?.length || 0;
  const [serialRows, setSerialRows] = useState<SerialItem[]>(() => row.quantitys || []);
  const [pendingActionKey, setPendingActionKey] = useState<string | null>(null);

  useEffect(() => {
    setDisplayTitle?.(`Line ${row.line_no} Serial Numbers`);
    setHideFooter?.(true);
    setWidth?.(980);
  }, [row.line_no, setDisplayTitle, setHideFooter, setWidth]);

  useEffect(() => {
    setSerialRows(row.quantitys || []);
  }, [row.quantitys]);

  const currentOrder = orderDetails?.order;

  const handleSerialWorkflowAction = async (
    serial: SerialItem,
    actionKey: SerialWorkflowActionKey,
  ) => {
    const serialActionId = `${serial.serial_no}-${actionKey}`;
    const metaConfig = serialActionButtonMeta[actionKey];

    if (actionKey === "acQc") {
      openModal({
        title: serial.serial_no,
        width: 980,
        showCloseButton: true,
        askDataChangeConfirm: false,
        component: (modalProps: any) => (
          <FinalInspection
            {...modalProps}
            serialNumber={serial.serial_no}
            onSaved={({ savedAt }) => {
              const serialUpdates: Partial<SerialItem> = {
                ac_qc_date: savedAt,
              };

              setSerialRows((current) =>
                current.map((entry) =>
                  entry.serial_no === serial.serial_no
                    ? {
                        ...entry,
                        ...serialUpdates,
                      }
                    : entry,
                ),
              );
              onSerialUpdated?.(row.lineId, serial.serial_no, serialUpdates);
            }}
          />
        ),
      });
      return;
    }

    if (actionKey === "acComp") {
      openModal({
        title: serial.serial_no,
        width: 980,
        showCloseButton: true,
        askDataChangeConfirm: false,
        component: (modalProps: any) => (
          <OrderComplition
            {...modalProps}
            serialNumber={serial.serial_no}
            serialId={serial.id}
            defaultStatus="CP"
            statusOptions={["CP"]}
            onSaved={({ savedAt }) => {
              const serialUpdates: Partial<SerialItem> = {
                ac_comp_date: savedAt,
              };

              setSerialRows((current) =>
                current.map((entry) =>
                  entry.serial_no === serial.serial_no
                    ? {
                        ...entry,
                        ...serialUpdates,
                      }
                    : entry,
                ),
              );
              onSerialUpdated?.(row.lineId, serial.serial_no, serialUpdates);
            }}
          />
        ),
      });
      return;
    }

    if (actionKey === "acDs") {
      showToast("Dispatch API is not available in barcode docs yet.", "warning");
      return;
    }

    if (!serial.serial_no?.trim()) {
      showToast("Serial number is required for this action.", "warning");
      return;
    }

    setPendingActionKey(serialActionId);

    try {
      let successMessage = `${metaConfig.label} completed successfully`;
      let serialUpdates: Partial<SerialItem> = {};

      if (actionKey === "acUa") {
        if (!serial.id) {
          showToast("Serial id is required for Under Assembly action.", "warning");
          return;
        }

        const response = await triggerUnderAssembly({
          serial_no: serial.serial_no,
          id: serial.id,
        }).unwrap();

        serialUpdates = {
          ac_ua_date: new Date().toISOString(),
        };
        successMessage =
          response?.message ||
          "Under assembly updated successfully";
      }

      if (actionKey === "acPi" || actionKey === "acPk") {
        if (!serial.id) {
          showToast(`Serial id is required for ${metaConfig.label} action.`, "warning");
          return;
        }

        const stage = metaConfig.stage || resolveCompletionStage(metaConfig.status);
        const updateResponse = await updateOrderCompletionStage({
          stage,
          body: {
            serial_no: String(serial.serial_no || ""),
            id: Number(serial.id),
          },
        }).unwrap();

        serialUpdates =
          actionKey === "acPi"
            ? { ac_pi_date: new Date().toISOString() }
            : { ac_pk_date: new Date().toISOString() };
        successMessage = updateResponse?.message || `${metaConfig.label} updated successfully`;
      }

      if (Object.keys(serialUpdates).length) {
        setSerialRows((current) =>
          current.map((entry) =>
            entry.serial_no === serial.serial_no
              ? {
                  ...entry,
                  ...serialUpdates,
                }
              : entry,
          ),
        );
        onSerialUpdated?.(row.lineId, serial.serial_no, serialUpdates);
      }

      showToast(successMessage, "success");
    } catch (error: any) {
      const message =
        error?.data?.message || error?.error || `Unable to process ${metaConfig.label}`;
      showToast(message, "error");
    } finally {
      setPendingActionKey(null);
    }
  };

  const renderSerialWorkflowCell = (
    serial: SerialItem,
    actionKey: SerialWorkflowActionKey,
  ) => {
    const actionMeta = serialActionButtonMeta[actionKey];
    const value = serial[actionMeta.dateField] as string | null | undefined;
    const isPending = pendingActionKey === `${serial.serial_no}-${actionKey}`;
    const actionState = getSerialWorkflowActionState(serial, actionKey);

    if (value) {
      return <TableCell>{formatDate(value)}</TableCell>;
    }

    return (
      <TableCell>
        <Tooltip title={actionState.helperText} disableHoverListener={actionState.enabled}>
          <Box component="span">
            <Button
              size="small"
              variant="contained"
              disabled={!actionState.enabled || isPending}
              onClick={() => void handleSerialWorkflowAction(serial, actionKey)}
              sx={{
                minWidth: 88,
                textTransform: "none",
                whiteSpace: "nowrap",
                borderRadius: 2,
                boxShadow: "none",
                fontSize: "0.72rem",
                px: 1,
                py: 0.4,
              }}
            >
              {isPending ? "Working..." : actionMeta.label}
            </Button>
          </Box>
        </Tooltip>
      </TableCell>
    );
  };

  return (
    <Box sx={{ px: { xs: 0.5, md: 1 }, py: 1 }}>
      <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} sx={{ mb: 2.5 }}>
        <Card sx={{ ...cardSx, flex: 1 }}>
          <Box sx={{ p: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Serial Register
            </Typography>
            <Typography variant="h6" fontWeight={800}>
              {serialsCount} serials logged
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Each serial child can drive manufacturing, issue and label workflow.
            </Typography>
          </Box>
        </Card>
        <Card sx={{ ...cardSx, flex: 1 }}>
          <Box sx={{ p: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Dispatch Readiness
            </Typography>
            <Typography variant="h6" fontWeight={800}>
              {row.actions?.printLabel?.enabled
                ? "Ready for label print"
                : "Not ready for label print"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Work order {row.wo_no || "--"} with target dispatch{" "}
              {formatDate(row.client_delivery_date)}.
            </Typography>
          </Box>
        </Card>
      
        <Card sx={{ ...cardSx, flex: 1 }}>
          <Box sx={{ p: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Ordered Item
            </Typography>
            <Typography variant="h6" fontWeight={800}>
              {row.item_code}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {row.description || "--"}
            </Typography>
          </Box>
        </Card>
        <Card sx={{ ...cardSx, flex: 1 }}>
          <Box sx={{ p: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Line Snapshot
            </Typography>
            <Typography variant="h6" fontWeight={800}>
              Qty {row.quantity}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Ship to {row.ship_to_location || "--"} | Status{" "}
              {meta[row.status]?.label || row.status}
            </Typography>
          </Box>
        </Card>
      </Stack>

      <Typography variant="body1" fontWeight={800} sx={{ mb: 1.5, color: "text.primary" }}>
        Serial Number Wise Child Items
      </Typography>
      <TableContainer
        sx={{ border: "1px solid", borderColor: "divider", borderRadius: 3, bgcolor: "#FFF" }}
      >
        <Table size="small">
          <TableHead>
            <TableRow
              sx={{
                "& th": {
                  bgcolor: "#F8FAFC",
                  color: "#475569",
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                },
              }}
            >
              <TableCell>Serial No</TableCell>
              <TableCell>{dateHeaderLabel("Ass Rel")}</TableCell>
              <TableCell>{dateHeaderLabel("Ac Ua")}</TableCell>
              <TableCell>{dateHeaderLabel("Qc")}</TableCell>
              <TableCell>{dateHeaderLabel("Ac Comp")}</TableCell>
              <TableCell>{dateHeaderLabel("Ac PI")}</TableCell>
              <TableCell>{dateHeaderLabel("Ac Pk")}</TableCell>
              <TableCell>{dateHeaderLabel("Ac Ds")}</TableCell>
              <TableCell>{dateHeaderLabel("Tent Rel")}</TableCell>
              <TableCell>{dateHeaderLabel("Ac Ho")}</TableCell>
              <TableCell>{dateHeaderLabel("Ac Ca")}</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Sh Type</TableCell>
              <TableCell>Sh Item</TableCell>
              <TableCell>Rpm</TableCell>
              <TableCell>Motor Serial No</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {serialRows.length ? (
              serialRows.map((serial) => (
                <TableRow key={serial.serial_no} hover>
                  <TableCell>
                    <Typography fontWeight={700}>{serial.serial_no}</Typography>
                  </TableCell>
                  <TableCell>{formatDate(serial.ass_rel_date)}</TableCell>
                  {renderSerialWorkflowCell(serial, "acUa")}
                  {renderSerialWorkflowCell(serial, "acQc")}
                  {renderSerialWorkflowCell(serial, "acComp")}
                  {renderSerialWorkflowCell(serial, "acPi")}
                  {renderSerialWorkflowCell(serial, "acPk")}
                  {renderSerialWorkflowCell(serial, "acDs")}
                  <TableCell>{formatDate(serial.tent_rel_date)}</TableCell>
                  <TableCell>{formatDate(serial.ac_ho_date)}</TableCell>
                  <TableCell>{formatDate(serial.ac_ca_date)}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={meta[serial.status || ""]?.label || serial.status}
                      sx={{
                        bgcolor: meta[serial.status || ""]?.bg || "#ccc",
                        color: meta[serial.status || ""]?.color || "#000",
                        fontWeight: 700,
                      }}
                    />
                  </TableCell>
                  <TableCell>{serial.sh_type || "--"}</TableCell>
                  <TableCell>{serial.sh_item || "--"}</TableCell>
                  <TableCell>{serial.rpm || "--"}</TableCell>
                  <TableCell>{serial.motor_serial_no || "--"}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={16} align="center" sx={{ py: 4 }}>
                  <Typography fontWeight={700}>Serials not generated yet.</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Start with work order approval, then enable serial number generation.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

function Row({
  row,
  onOpenSerialDrawer,
  onAction,
}: {
  row: LineItemRow;
  onOpenSerialDrawer: (row: LineItemRow) => void;
  onAction: (row: LineItemRow, actionKey: ActionKey) => void;
}) {
  const serialsCount = row.quantitys?.length || 0;
  const coverage = Math.min(
    100,
    Math.round((serialsCount / Math.max(row.quantity || 1, 1)) * 100)
  );
  const statusMeta = meta[row.status] || meta.PL;
  const handleOpenSerialDrawer = () => onOpenSerialDrawer(row);
  const stopRowToggle = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
  };

  return (
    <TableRow
      hover
      onClick={handleOpenSerialDrawer}
      sx={{
        "& > *": {
          verticalAlign: "top",
          borderColor: "divider",
        },
        cursor: "pointer",
      }}
    >
      <TableCell sx={{ minWidth: 70 }}>
        <Typography fontWeight={700}>{row.line_no}</Typography>
        <Typography variant="caption" color="text.secondary">
          {row.lineId || "--"}
        </Typography>
      </TableCell>
      <TableCell sx={{ minWidth: 270 }}>
        <Typography fontWeight={700}>{row.item_code}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {row.description}
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1.25 }}>
          <Tooltip title={`Ship to ${row.ship_to_location}`}>
            <Chip
              size="small"
              label={row.ship_to_location}
              sx={{ bgcolor: "#EFF6FF", color: "#1D4ED8", fontWeight: 700 }}
            />
          </Tooltip>
          <Tooltip title={row.road_permit ? "Road Permit Required" : "Road Permit Not Required"}>
            <Chip
              size="small"
              label={row.road_permit ? "Road Permit Required" : "Road Permit Not Required"}
              variant="outlined"
            />
          </Tooltip>
        </Stack>
      </TableCell>
      <TableCell sx={{ minWidth: 90 }}>
        <Typography fontWeight={700}>{row.quantity}</Typography>
        <Typography variant="caption" color="text.secondary">
          {" "}
          units
        </Typography>
      </TableCell>
      <TableCell sx={{ minWidth: 150 }}>
        <Typography fontWeight={700}>{formatAmount(row.selling_price)}</Typography>
        <Typography variant="caption" color="text.secondary" display="block">
          List {formatAmount(row.list_price)}
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block">
          Discount {row.discount_percent}%
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block">
          Amount {formatAmount(row.amount)}
        </Typography>
      </TableCell>
      <TableCell sx={{ minWidth: 130 }}>
        <Typography fontWeight={700}>{formatDate(row.client_delivery_date)}</Typography>
        <Typography variant="caption" color="text.secondary" display="block">
          Month {row.delivery_month || "--"}
        </Typography>
      </TableCell>
      <TableCell sx={{ minWidth: 125 }}>
        <Typography fontWeight={700}>{row.wo_no || "--"}</Typography>
        <Typography variant="caption" color="text.secondary" display="block">
          WO Date {formatDate(row.wo_date)}
        </Typography>
      </TableCell>
      <TableCell sx={{ minWidth: 130 }}>
        <Chip
          label={statusMeta.label || row.status}
          size="small"
          sx={{ bgcolor: statusMeta.bg, color: statusMeta.color, fontWeight: 800, mb: 1 }}
        />
        <Typography variant="caption" color="text.secondary" display="block">
          {serialsCount} serials | {coverage}% mapped
        </Typography>
      </TableCell>

      <TableCell sx={{ minWidth: 280 }}>
        <Stack direction="column" spacing={0.3} flexWrap="wrap" useFlexGap>
          {row.actions &&
            (Object.entries(row.actions) as [string, ActionConfig][]).map(([key, action]) =>
              action.visible ? (
                <Tooltip
                  key={key}
                  title={
                    action.enabled
                      ? action.label
                      : `${action.label} available after next stage`
                  }
                >
                  <span onClick={stopRowToggle}>
                    <Button
                      size="small"
                      variant={action.enabled ? "contained" : "outlined"}
                      disabled={!action.enabled}
                      onClick={(event) => {
                        event.stopPropagation();
                        onAction(row, key as ActionKey);
                      }}
                      startIcon={
                        actionIcon[key] || (
                          <PrecisionManufacturingOutlinedIcon fontSize="small" />
                        )
                      }
                      sx={{
                        minWidth: 122,
                        justifyContent: "flex-start",
                        textTransform: "none",
                        borderRadius: 2,
                        boxShadow: "none",
                        ...(action.enabled
                          ? { bgcolor: "#0F172A", "&:hover": { bgcolor: "#1E293B" } }
                          : { borderColor: "divider", color: "text.disabled" }),
                      }}
                    >
                      {action.label}
                    </Button>
                  </span>
                </Tooltip>
              ) : null
            )}
        </Stack>
      </TableCell>
    </TableRow>
  );
}

function Index({ orderDetails, onOrderUpdated }: LineItemsProps) {
  const { openModal } = useModal();
  const { showToast } = useToast();
  const [createWorkOrder] = useCreateWorkOrderMutation();
  const [generateSerialNumbers] = useGenerateSerialNumbersMutation();
  const [issueMaterial] = useIssueMaterialMutation();
  const [orderLineItemEdit] = useOrderLineItemEditMutation();
  const [printLabel] = usePrintLabelMutation();
  const [status, setStatus] = useState("");
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const [rowOverrides, setRowOverrides] = useState<Record<string, LineItemOverride>>({});
  const [rows, setRows] = useState<LineItemRow[]>(() => sampleRows(orderDetails, rowOverrides));
  const rowsPerPage = 4;

  useEffect(() => {
    setRows(sampleRows(orderDetails, rowOverrides));
  }, [orderDetails, rowOverrides]);

  const statusOptions = useMemo(
    () => [
      { value: "", label: "All Status" },
      ...Array.from(new Set(rows.map((row) => row.status))).map((value) => ({
        value,
        label: meta[value]?.label || value,
      })),
    ],
    [rows]
  );

  const filteredRows = useMemo(() => {
    const q = searchText.trim().toLowerCase();

    return rows.filter((row) => {
      const haystack = [
        row.line_no,
        row.lineId,
        row.id,
        row.item_code,
        row.description,
        row.wo_no,
        row.ship_to_location,
        row.status,
        row.mail_status,
        ...(row.quantitys || []).map((serial) => serial.serial_no),
      ]
        .join(" ")
        .toLowerCase();

      return (
        (!q || haystack.includes(q)) &&
        (!status || row.status === status)
      );
    });
  }, [rows, searchText, status]);

  const pagedRows = useMemo(
    () => filteredRows.slice((page - 1) * rowsPerPage, page * rowsPerPage),
    [filteredRows, page]
  );

  const summary = useMemo(
    () => ({
      qty: rows.reduce((sum, row) => sum + (row.quantity || 0), 0),
      amount: rows.reduce((sum, row) => sum + (row.amount || 0), 0),
      serials: rows.reduce((sum, row) => sum + (row.quantitys?.length || 0), 0),
      issueReady: rows.filter((row) => row.actions?.issueMaterial?.enabled).length,
      labelReady: rows.filter((row) => row.actions?.printLabel?.enabled).length,
    }),
    [rows]
  );

  const currentOrder = orderDetails?.order;
  const currentCustomer = orderDetails?.order_information?.main?.customer;

  const salesOrderNo = currentOrder?.order_number || "N/A";
  const customerCode = currentCustomer?.customer_number || "N/A";

  const tiles = [
    {
      title: "TOTAL GEAR QTY",
      value: String(summary.qty),
      caption: "Across all line items",
      icon: <PrecisionManufacturingOutlinedIcon />,
      accent: "#1D4ED8",
    },
    {
      title: "SERIALS CREATED",
      value: String(summary.serials),
      caption: "Child items registered",
      icon: <QrCode2OutlinedIcon />,
      accent: "#0F766E",
    },
    {
      title: "READY FOR LABEL",
      value: String(summary.labelReady),
      caption: "Lines ready to print",
      icon: <LocalPrintshopOutlinedIcon />,
      accent: "#7C3AED",
    },
    {
      title: "ORDER VALUE",
      value: formatAmount(summary.amount),
      caption: "Net selling value",
      icon: <CurrencyRupeeOutlinedIcon />,
      accent: "#B45309",
    },
  ];

  const handleSerialUpdated = (
    lineId: number,
    serialNo: string,
    updates: Partial<SerialItem>,
  ) => {
    setRows((current) =>
      current.map((currentRow) =>
        currentRow.lineId === lineId
          ? {
              ...currentRow,
              quantitys: (currentRow.quantitys || []).map((serial) =>
                serial.serial_no === serialNo
                  ? {
                      ...serial,
                      ...updates,
                    }
                  : serial,
              ),
            }
          : currentRow,
      ),
    );
  };

  const handleOpenSerialDrawer = (row: LineItemRow) => {
    openModal({
      title: `Line ${row.line_no} Serial Numbers`,
      width: "calc(100% - 180px)",
      showCloseButton: true,
      askDataChangeConfirm: false,
      component: (modalProps: any) => (
        <SerialNumberDrawer
          {...modalProps}
          row={row}
          orderDetails={orderDetails}
          onSerialUpdated={handleSerialUpdated}
        />
      ),
    });
  };

  const handleRowAction = async (row: LineItemRow, actionKey: ActionKey) => {
    if (actionKey === "edit") {
      const editRef = React.createRef<EditListItemRef>();

      openModal({
        title: `Edit Line ${row.line_no}`,
        width: 520,
        showCloseButton: true,
        askDataChangeConfirm: false,
        component: (modalProps: any) => (
          <EditListItem
            ref={editRef}
            {...modalProps}
            defaultValues={{
              roadPermit: Boolean(row.road_permit),
              deliveryMonth: row.delivery_month || "",
              status: row.status || "",
            }}
            statusOptions={Object.entries(meta).map(([value, details]) => ({
              value,
              label: details.label,
            }))}
            onSubmitSection={async (payload) => {
              const oracleOrderNo = currentOrder?.order_number;

              if (!oracleOrderNo) {
                throw new Error("Oracle order number is missing for this sales order.");
              }

              const nextRoadPermit = payload.roadPermit;
              const nextDeliveryMonth = payload.deliveryMonth;
              const nextStatus = payload.status || row.status;
              const lineKey = String(row.lineId);

              const response = await orderLineItemEdit({
                status: nextStatus,
                del_month: nextDeliveryMonth,
                road_permit: nextRoadPermit,
                oracle_order_no: oracleOrderNo,
              }).unwrap();

              if (!(response?.status === true || response?.status === 1)) {
                throw new Error(response?.message || "Unable to update line item");
              }

              setRowOverrides((current) => ({
                ...current,
                [lineKey]: {
                  ...current[lineKey],
                  road_permit: nextRoadPermit,
                  delivery_month: nextDeliveryMonth,
                  status: nextStatus,
                },
              }));

              setRows((current) =>
                current.map((currentRow) =>
                  currentRow.id === row.id
                    ? {
                        ...currentRow,
                        road_permit: nextRoadPermit,
                        delivery_month: nextDeliveryMonth,
                        status: nextStatus,
                        actions: actionSet(nextStatus, {
                          forceEnableSerialNumber:
                            rowOverrides[String(currentRow.lineId)]?.forceEnableSerialNumber,
                          hasWorkOrder: Boolean(
                            (rowOverrides[String(currentRow.lineId)]?.wo_no ?? currentRow.wo_no) || ""
                          ),
                          hasSerialNumbers: Boolean(currentRow.quantitys?.length),
                          materialIssued: Boolean(
                            rowOverrides[String(currentRow.lineId)]?.materialIssued
                          ),
                        }),
                      }
                    : currentRow
                )
              );

              await onOrderUpdated?.();
            }}
          />
        ),
        action: (
          <ApiActionButton
            onApiCall={() => editRef.current?.submit?.() ?? Promise.resolve()}
            loadingText="Saving..."
          >
            Save Changes
          </ApiActionButton>
        ),
      });
      return;
    }

    try {
      let successMessage = "Line item action completed";

      if (actionKey === "workOrder") {
        const response = await createWorkOrder({
          ...getBarcodeDefaultContext(),
          LINE_ID: row.lineId,
          order_type: String(currentOrder?.order_type || ""),
        }).unwrap();
        if (response?.status === true || response?.status === 1) {
          const workOrderData = (response?.data || {}) as BarcodeCreateWorkOrderResponseData;
          const nextWoNo = String(workOrderData.WONO || "");
          const nextWoDate = workOrderData.WONODATE || null;

          setRowOverrides((current) => ({
            ...current,
            [String(row.lineId)]: {
              ...current[String(row.lineId)],
              wo_no: nextWoNo,
              wo_date: nextWoDate,
              forceEnableSerialNumber: true,
            },
          }));

          setRows((current) =>
            current.map((currentRow) =>
              currentRow.id === row.id
                ? {
                    ...currentRow,
                    wo_no: nextWoNo,
                    wo_date: nextWoDate,
                  actions: actionSet(currentRow.status, {
                      forceEnableSerialNumber: true,
                      hasWorkOrder: Boolean(nextWoNo),
                      hasSerialNumbers: Boolean(currentRow.quantitys?.length),
                      materialIssued: Boolean(
                        rowOverrides[String(currentRow.lineId)]?.materialIssued
                      ),
                    }),
                  }
                : currentRow
            )
          );
        }

        successMessage =
          response?.data?.Massage ||
          response?.message ||
          "Work order processed successfully";
      }

      if (actionKey === "serialNumber") {
        const response = await generateSerialNumbers({
          DIVISION_ID: barcodeDefaults.divisionId,
          LINE_ID: row.lineId,
        }).unwrap();
        const generatedSerials = Array.isArray((response?.data as any)?.serial_line_items)
          ? ((response?.data as any).serial_line_items as any[]).map(mapSerialItem)
          : [];

        if (generatedSerials.length) {
          setRowOverrides((current) => ({
            ...current,
            [String(row.lineId)]: {
              ...current[String(row.lineId)],
              quantitys: generatedSerials,
            },
          }));

          setRows((current) =>
            current.map((currentRow) =>
              currentRow.id === row.id
                ? {
                    ...currentRow,
                    quantitys: generatedSerials,
                    actions: actionSet(currentRow.status, {
                      forceEnableSerialNumber:
                        rowOverrides[String(currentRow.lineId)]?.forceEnableSerialNumber,
                      hasWorkOrder: Boolean(
                        (rowOverrides[String(currentRow.lineId)]?.wo_no ?? currentRow.wo_no) || ""
                      ),
                      hasSerialNumbers: generatedSerials.length > 0,
                      materialIssued: Boolean(
                        rowOverrides[String(currentRow.lineId)]?.materialIssued
                      ),
                    }),
                  }
                : currentRow
            )
          );
        }

        successMessage = response?.message || "Serial numbers generated successfully";
      }

      if (actionKey === "issueMaterial") {
        const response = await issueMaterial({
          ...getBarcodeDefaultContext(),
          LINE_ID: row.lineId,
        }).unwrap();

        if (!(response?.status === true || response?.status === 1)) {
          throw new Error(response?.message || "Material issue request failed");
        }

        openModal({
          title: `Material Issue Response - Line ${row.line_no}`,
          width: "calc(100% - 160px)",
          showCloseButton: true,
          askDataChangeConfirm: false,
          component: (modalProps: any) => (
            <MaterialIssueResponseDrawer
              {...modalProps}
              response={response}
              lineNo={row.line_no}
              onSaved={async () => {
                setRowOverrides((current) => ({
                  ...current,
                  [String(row.lineId)]: {
                    ...current[String(row.lineId)],
                    materialIssued: true,
                  },
                }));

                setRows((current) =>
                  current.map((currentRow) =>
                    currentRow.id === row.id
                      ? {
                          ...currentRow,
                          actions: actionSet(currentRow.status, {
                            forceEnableSerialNumber:
                              rowOverrides[String(currentRow.lineId)]?.forceEnableSerialNumber,
                            hasWorkOrder: Boolean(
                              (rowOverrides[String(currentRow.lineId)]?.wo_no ?? currentRow.wo_no) || ""
                            ),
                            hasSerialNumbers: Boolean(currentRow.quantitys?.length),
                            materialIssued: true,
                          }),
                        }
                      : currentRow
                  )
                );

                await onOrderUpdated?.();
              }}
            />
          ),
        });

        showToast(response?.message || "Material issue response loaded successfully.", "success");
        return;
      }

      if (actionKey === "printLabel") {
        if (!row.wo_no) {
          showToast("Work order number missing for label print", "warning");
          return;
        }

        const response = await printLabel({
          WONO: row.wo_no,
          Line_Id: row.lineId,
          ORGANIZATION_ID: row.orgId ?? barcodeDefaults.organizationId,
          ORDER_LINE_NO:
            Number.isFinite(Number(row.line_no)) ? Number(row.line_no) : row.line_no,
        }).unwrap();

        if (response?.blob) {
          await printPdfBlob(response.blob, {
            fileName: response.fileName || `label-${row.wo_no}.pdf`,
          });
          successMessage = "Label PDF opened in print dialog";
        } else {
          successMessage = response?.message || "Print label request submitted successfully";
        }
      }

      await onOrderUpdated?.();
      showToast(successMessage, "success");
    } catch (error: any) {
      const message =
        error?.data?.message || error?.error || "Unable to process line action";
      showToast(message, "error");
    }
  };

  return (
    <Stack spacing={1}>
      <Box>
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          spacing={2}
        >
          <Box>
            <PageHeader title={`Sales Order ${salesOrderNo} / ${customerCode}`} />
          </Box>
          <Stack direction="row" spacing={1.25} flexWrap="wrap" useFlexGap>
            <Chip
              icon={<WarehouseOutlinedIcon />}
              label={`${rows.length} line items`}
              sx={{ bgcolor: "rgba(255,255,255,0.12)", height: 34 }}
            />
            <Chip
              icon={<RouteOutlinedIcon />}
              label={`${summary.issueReady} ready for issue`}
              sx={{ bgcolor: "rgba(255,255,255,0.12)", height: 34 }}
            />
          </Stack>
        </Stack>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)", lg: "repeat(4, 1fr)" },
          gap: 2,
        }}
      >
        {tiles.map((tile) => (
          <Card key={tile.title} sx={{ ...cardSx, height: "100%" }}>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ p: 2 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  display: "grid",
                  placeItems: "center",
                  color: tile.accent,
                  bgcolor: alpha(tile.accent, 0.12),
                }}
              >
                {tile.icon}
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  {tile.title}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
                  <Typography variant="h6" fontWeight={800}>
                    {tile.value}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "text.secondary" }}>
                    {tile.caption}
                  </Typography>
                </Box>
              </Box>
            </Stack>
          </Card>
        ))}
      </Box>

      <FormSection
        title="Sales Order Line Items"
        description="Click any line item to open its serial-number child records in a child drawer"
        icon={<ViewListOutlinedIcon fontSize="small" />}
        accentColor="#1D4ED8"
        headerActions={
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "minmax(260px, 360px) minmax(180px, 220px)",
              },
              gap: 1.25,
              width: { xs: "100%", md: "auto" },
              alignItems: "start",
            }}
          >
            <MuiTextField
              label="Search line item / WO"
              value={searchText}
              onChange={(event) => {
                setSearchText(event.target.value);
                setPage(1);
              }}
            />
            <MuiSelect
              label="Status"
              options={statusOptions}
              value={status}
              onChange={(event) => {
                setStatus(String(event.target.value));
                setPage(1);
              }}
            />
          </Box>
        }
      >
        <Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow
                  sx={{
                    "& th": {
                      bgcolor: "#F8FAFC",
                      color: "#475569",
                      fontSize: "0.78rem",
                      fontWeight: 800,
                      whiteSpace: "nowrap",
                    },
                  }}
                >
                  <TableCell>Line</TableCell>
                  <TableCell>Ordered Item</TableCell>
                  <TableCell>Qty</TableCell>
                  <TableCell>Commercial</TableCell>
                  <TableCell>Delivery</TableCell>
                  <TableCell>Work Order</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pagedRows.map((row) => (
                  <Row
                    key={row.id}
                    row={row}
                    onOpenSerialDrawer={handleOpenSerialDrawer}
                    onAction={handleRowAction}
                  />
                ))}
                {!pagedRows.length && (
                  <TableRow>
                    <TableCell colSpan={10} align="center" sx={{ py: 7 }}>
                      <Typography variant="h6" fontWeight={800}>
                        No line items matched the current filters.
                      </Typography>
                      <Typography color="text.secondary">
                        Try clearing search or status filters to see the full execution board.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 2,
              p: 1.75,
              borderTop: "1px solid",
              borderColor: "divider",
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Showing {pagedRows.length} of {filteredRows.length} filtered line items
            </Typography>
            <Pagination
              count={Math.max(1, Math.ceil(filteredRows.length / rowsPerPage))}
              page={page}
              onChange={(_, value) => setPage(value)}
              size="small"
              color="primary"
            />
          </Box>
        </Box>
      </FormSection>
    </Stack>
  );
}

export const LineItems = memo(Index);
