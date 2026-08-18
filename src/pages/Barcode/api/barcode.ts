import { createApi } from "@reduxjs/toolkit/query/react";
import { createAppBaseQuery } from "../../../../shared/utils/customBaseQuery";

export interface BarcodeApiResponse<TData = unknown> {
  status?: boolean | number;
  message?: string;
  data?: TData | null;
  records?: number;
}

export interface BarcodeContextPayload {
  ORGANIZATION_ID: number;
  DIVISION_ID: number;
}

export interface BarcodeSalesOrdersRequest {
  DIVISION_ID: number;
}

export interface BarcodeSalesOrdersByStatusRequest {
  DIVISION_ID: number;
  STATUS: string;
}

export interface BarcodeSalesOrderDetailsRequest extends BarcodeContextPayload {
  order_number: number | string;
}

export interface BarcodeCreateWorkOrderRequest extends BarcodeContextPayload {
  LINE_ID: number | string;
  order_type: string;
}

export interface BarcodeCreateWorkOrderResponseData {
  header_id?: number | null;
  Massage?: string | null;
  ORACLE_ORDER_NUMBER?: number | string | null;
  ORDER_TYPE?: string | null;
  WONO?: string | null;
  WONODATE?: string | null;
}

export interface BarcodeGenerateSerialRequest {
  DIVISION_ID: number;
  LINE_ID: number | string;
}

export interface BarcodeIssueMaterialRequest extends BarcodeContextPayload {
  LINE_ID: number | string;
}

export interface BarcodeWipMaterialIssueRequest {
  WONO: string;
  SHIP_FROM_ORG_ID: number | string;
  LINE_ID: number | string;
  HEADER_ID: number | string;
}

export interface BarcodeMaterialIssueSaveItem {
  issueMaterial_ID: number | string;
  inventory_item_id: number | string;
  inventory_item: string;
  item_primary_uom_code: string;
  lot_control_code: number | string;
  serial_number_control_code: number | string;
  supply_locator_id: number | string | null;
  supply_locator: string;
  supply_subinventory: string;
  required_quantity: number | string;
  quantity_open: number | string;
  quantity_on_hand: number | string;
  wo_no: string;
  item_desc: string;
  org_id: number | string;
  line_id: number | string;
  header_id: number | string;
  wip_entity_id: number | string;
  operation_seq_num: number | string;
  subinventory_code: string;
  locator_id: number | string | null;
}

export interface BarcodeMaterialIssueLotSerialItem {
  org_id: number | string;
  wo_no: string;
  inventory_item_id: number | string;
  Quantity: number | string;
  Lot_Number: string;
  issueMaterial_ID: number | string;
  Lot_serial_Id: number | string;
}

export interface BarcodeSaveLotSerialAndMaterialIssueRequest {
  IssueMaterialItem: {
    data: BarcodeMaterialIssueSaveItem[];
  };
  LotserialnumberIssued: {
    Data: BarcodeMaterialIssueLotSerialItem[];
  };
}

export interface BarcodeOrderLineItemEditRequest {
  status: string;
  del_month: string;
  road_permit: boolean;
  oracle_order_no: number | string;
}

export interface BarcodePrintLabelRequest {
  WONO: string;
  Line_Id: number | string;
  ORGANIZATION_ID?: number | string;
  ORDER_LINE_NO?: number | string;
}

export interface BarcodePrintLabelResponse {
  blob: Blob | null;
  message?: string;
  data?: unknown;
  contentType?: string | null;
  fileName?: string | null;
}

export interface BarcodeSerialLookupRequest {
  serial_no: string;
}

export interface BarcodeUnderAssemblyRequest {
  serial_no: string;
  id: number | string;
}

export interface BarcodeCompletionLookupRequest {
  BarcodeSerialNo: string;
}

export type BarcodeCompletionStage = "completion" | "painting" | "packing";

export interface BarcodeCompletionRecordPayload {
  serial_no: string;
  id: number;
  status?: string;
}

export interface BarcodeCompletionUpdateRequest {
  stage: BarcodeCompletionStage;
  body: BarcodeCompletionRecordPayload;
}

export interface BarcodeQualityCheckSaveRequest {
  serial_no: string;
  position: string;
  pole: string;
  make: string;
  additional_requirement: boolean;
  breather_plug: boolean;
  oil_level_indicator: boolean;
  oil_level_sticker: boolean;
  caution_sticker: boolean;
  name_plate: boolean;
  shaft_protector: boolean;
  adaptor_cover: boolean;
  eye_bolt: boolean;
  torque_brush: boolean;
  end_cover: boolean;
  spring_washer: boolean;
  circlip: boolean;
  hex_bolt: boolean;
  washer: boolean;
  output_flange: boolean;
  single_exe_shaft: boolean;
  double_exe_shaft: boolean;
  torque_arm: boolean;
  motor_mounting_ring: boolean;
  mountingfeet: boolean;
  hold_back_cw_acw: string;
  bore_size: string;
  remarks: string;
  created_by: string;
}

export interface BarcodeImportResponseData {
  order_booked_date?: string | null;
  order_type_id?: number | null;
  header_id?: number | null;
  ordernumber?: number | string | null;
  customer_name?: string | null;
  customer_number?: string | null;
}

export interface BarcodeSalesOrderInitCounter {
  label?: string | null;
  key?: string | null;
  value?: number | string | boolean | null;
}

export type BarcodeSalesOrderInitData =
  | BarcodeSalesOrderInitCounter[]
  | Record<string, number | string | boolean | null | undefined>;

export interface BarcodeSalesOrderLineSerialRaw {
  id?: number | null;
  serial_no?: string | null;
  SERIAL_NO?: string | null;
  LINE_ID?: number | string | null;
  ORACLE_LINE_NO?: string | null;
  ass_rel_date?: string | null;
  ASS_REL_DATE?: string | null;
  ac_ua_date?: string | null;
  AC_UA_DATE?: string | null;
  ac_qc_date?: string | null;
  AC_QC_DATE?: string | null;
  ac_comp_date?: string | null;
  AC_COMP_DATE?: string | null;
  ac_pi_date?: string | null;
  AC_PI_DATE?: string | null;
  ac_pk_date?: string | null;
  AC_PK_DATE?: string | null;
  ac_ds_date?: string | null;
  AC_DS_DATE?: string | null;
  tent_rel_date?: string | null;
  TENT_REL_DATE?: string | null;
  ac_ho_date?: string | null;
  AC_HO_DATE?: string | null;
  ac_ca_date?: string | null;
  AC_CA_DATE?: string | null;
  status?: string | null;
  STATUS?: string | null;
  sh_type?: string | null;
  SH_TYPE?: string | null;
  sh_item?: string | null;
  SH_ITEM?: string | null;
  rpm?: string | number | null;
  RPM?: string | number | null;
  motor_serial_no?: string | null;
  MOTOR_SERIAL_NO?: string | null;
  FULLSTATUS?: string | null;
  REASON_FOR_STATUS?: string | null;
  WF_INSTANCE_ID?: number | string | null;
}

export interface BarcodeSalesOrderLineRaw {
  LINE_ID?: number;
  HEADER_ID?: number;
  ORG_ID?: number;
  ORDERED_ITEM?: string | null;
  ORDERED_QUANTITY?: number | string | null;
  UNIT_LIST_PRICE?: number | string | null;
  UNIT_SELLING_PRICE?: number | string | null;
  SHIP_FROM_ORG_ID?: number | string | null;
  SHIP_TO_ORG_ID?: number | string | null;
  AMOUNT?: number | string | null;
  DISCOUNT?: number | string | null;
  DESCRIPTION?: string | null;
  MODEL?: string | null;
  MODEL_TYPE?: string | null;
  KW?: number | string | null;
  RATIO?: number | string | null;
  WIP_ENTITY_NAME?: string | null;
  CREATION_DATE?: string | null;
  serial_line_items?: BarcodeSalesOrderLineSerialRaw[] | null;
  id?: number | null;
  line_no?: string | number | null;
  lineId?: number | string | null;
  headerId?: number | string | null;
  orgId?: number | string | null;
  item_code?: string | null;
  description?: string | null;
  quantity?: number | string | null;
  list_price?: number | string | null;
  discount_percent?: number | string | null;
  selling_price?: number | string | null;
  amount?: number | string | null;
  ship_to_location?: number | string | null;
  road_permit?: boolean | null;
  wo_no?: number | string | null;
  wo_date?: string | null;
  client_delivery_date?: string | null;
  delivery_month?: string | null;
  con_auth?: string | null;
  status?: string | null;
  mail_status?: string | null;
  model?: string | null;
  model_type?: string | null;
  ratio?: number | string | null;
  kw?: number | string | null;
  quantitys?: BarcodeSalesOrderLineSerialRaw[] | null;
}

export interface BarcodeSalesOrderDetailsRaw {
  header_id?: number | null;
  order?: {
    order_number?: number | string | null;
    order_type?: string | null;
    status?: string | null;
    order_date?: string | null;
    currency?: string | null;
    tax_category?: string | null;
  } | null;
  customer?: {
    name?: string | null;
    customer_name?: string | null;
    customer_number?: string | null;
    customer_po?: string | null;
    contact?: string | null;
  } | null;
  billing_address?: {
    location?: string | null;
    address_line_1?: string | null;
    address_line_2?: string | null;
    city?: string | null;
    pincode?: string | null;
    state?: string | null;
  } | null;
  shipping_address?: {
    location?: string | null;
    address_line_1?: string | null;
    address_line_2?: string | null;
    city?: string | null;
    pincode?: string | null;
    state?: string | null;
  } | null;
  sales?: {
    sales_person?: string | null;
    price_list?: string | null;
    sales_channel?: string | null;
  } | null;
  amounts?: {
    sub_total?: string | number | null;
    tax?: string | number | null;
    total?: string | number | null;
  } | null;
  shipping?: {
    shipping_method?: string | null;
    freight_terms?: string | null;
  } | null;
  payment?: {
    payment_terms?: string | null;
  } | null;
  bank_details?: {
    context_value?: string | null;
    bank_address?: string | null;
    bank_name?: string | null;
    delivery_condition?: string | null;
    destination?: string | null;
    group_proj_ref?: string | null;
    proj_title?: string | null;
    insurance_by?: string | null;
    contact_name?: string | null;
    email_address_and_phone?: string | null;
  } | null;
  other_details?: {
    payment_terms?: string | null;
    warehouse?: string | null;
    fob?: string | null;
    shipping_method?: string | null;
    freight_terms?: string | null;
    shipment_priority?: string | null;
    packing_instruction?: string | null;
    order_source?: string | null;
    order_source_reference?: string | null;
  } | null;
  line_items?: BarcodeSalesOrderLineRaw[] | null;
}

export interface BarcodeSerialLookupResponseData {
  rpm?: number | string | null;
  motor_serial_no?: string | null;
  Model?: string | null;
  wo_no?: string | null;
  model?: string | null;
  status?: string | null;
  serial_no?: string | null;
  oracle_order_no?: number | string | null;
}

const parseNumericEnv = (value: string | undefined, fallback: number) => {
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : fallback;
};

const getFileNameFromContentDisposition = (value: string | null) => {
  if (!value) {
    return null;
  }

  const utfMatch = value.match(/filename\*=UTF-8''([^;]+)/i);
  if (utfMatch?.[1]) {
    return decodeURIComponent(utfMatch[1]);
  }

  const asciiMatch = value.match(/filename="?([^"]+)"?/i);
  return asciiMatch?.[1] || null;
};

export const barcodeDefaults = {
  baseUrl:
    import.meta.env.VITE_BARCODE_API_BASE_URL || "https://barcodeapi.techelecon.in/api",
  organizationId: parseNumericEnv(import.meta.env.VITE_BARCODE_ORGANIZATION_ID, 43),
  divisionId: parseNumericEnv(import.meta.env.VITE_BARCODE_DIVISION_ID, 374),
};

export const getBarcodeDefaultContext = (): BarcodeContextPayload => ({
  ORGANIZATION_ID: barcodeDefaults.organizationId,
  DIVISION_ID: barcodeDefaults.divisionId,
});

export const barcodeApi = createApi({
  reducerPath: "barcodeApi",
  baseQuery: createAppBaseQuery({
    baseUrl: barcodeDefaults.baseUrl,
    includeAuthHeader: false,
  }),
  tagTypes: ["BarcodeSalesOrder"],
  endpoints: (builder) => ({
    getSalesOrders: builder.query<
      BarcodeApiResponse,
      Partial<BarcodeSalesOrdersRequest> | void
    >({
      query: (body) => ({
        url: "/barcode/sales-orders/",
        method: "POST",
        body: {
          DIVISION_ID: barcodeDefaults.divisionId,
          ...(body || {}),
        },
      }),
      providesTags: ["BarcodeSalesOrder"],
    }),
    getSalesOrdersByStatus: builder.query<
      BarcodeApiResponse,
      BarcodeSalesOrdersByStatusRequest
    >({
      query: (body) => ({
        url: "/barcode/sales-orders/bystatus",
        method: "POST",
        body,
      }),
    }),
    getSalesOrdersInit: builder.query<
      BarcodeApiResponse<BarcodeSalesOrderInitData>,
      Partial<BarcodeContextPayload> | void
    >({
      query: (body) => ({
        url: "/barcode/sales-orders/init",
        method: "POST",
        body: {
          ...getBarcodeDefaultContext(),
          ...(body || {}),
        },
      }),
    }),
    importSalesOrders: builder.mutation<
      BarcodeApiResponse<BarcodeImportResponseData>,
      Partial<BarcodeContextPayload> | void
    >({
      query: (body) => ({
        url: "/barcode/sales-orders/import",
        method: "POST",
        body: {
          ...getBarcodeDefaultContext(),
          ...(body || {}),
        },
      }),
      invalidatesTags: ["BarcodeSalesOrder"],
    }),
    getSalesOrderDetails: builder.query<
      BarcodeApiResponse<BarcodeSalesOrderDetailsRaw>,
      BarcodeSalesOrderDetailsRequest
    >({
      query: (body) => ({
        url: "/barcode/sales-orders/salseOrderDetails",
        method: "POST",
        body,
      }),
      providesTags: (_result, _error, arg) => [
        { type: "BarcodeSalesOrder", id: String(arg.order_number) },
      ],
    }),
    createWorkOrder: builder.mutation<
      BarcodeApiResponse<BarcodeCreateWorkOrderResponseData>,
      BarcodeCreateWorkOrderRequest
    >({
      query: (body) => ({
        url: "/barcode/sales-orders/workordercreate",
        method: "POST",
        body,
      }),
    }),
    generateSerialNumbers: builder.mutation<BarcodeApiResponse, BarcodeGenerateSerialRequest>({
      query: (body) => ({
        url: "/barcode/sales-orders/generateSrNO",
        method: "POST",
        body,
      }),
    }),
    issueMaterial: builder.mutation<BarcodeApiResponse, BarcodeIssueMaterialRequest>({
      query: (body) => ({
        url: "/barcode/sales-orders/IssueMaterial",
        method: "POST",
        body,
      }),
    }),
    wipMaterialIssue: builder.mutation<BarcodeApiResponse, BarcodeWipMaterialIssueRequest>({
      query: (body) => ({
        url: "/barcode/sales-orders/IssueMaterial",
        method: "POST",
        body,
      }),
    }),
    saveLotSerialAndMaterialIssue: builder.mutation<
      BarcodeApiResponse,
      BarcodeSaveLotSerialAndMaterialIssueRequest
    >({
      query: (body) => ({
        url: "/barcode/sales-orders/saveLotSerialandMaterialIssue",
        method: "POST",
        body,
      }),
    }),
    orderLineItemEdit: builder.mutation<BarcodeApiResponse, BarcodeOrderLineItemEditRequest>({
      query: (body) => ({
        url: "/barcode/sales-orders/orderLineItemEdit",
        method: "POST",
        body,
      }),
    }),
    printLabel: builder.mutation<BarcodePrintLabelResponse, BarcodePrintLabelRequest>({
      query: (body) => ({
        url: "/barcode/sales-orders/printlabel",
        method: "POST",
        body,
        headers: {
          Accept: "application/pdf, application/json",
        },
        responseHandler: async (response) => {
          const contentType = response.headers.get("content-type") || "";

          if (contentType.toLowerCase().includes("application/json")) {
            return response.json();
          }

          return response.blob();
        },
      }),
      transformResponse: (response: Blob | BarcodeApiResponse, meta) => {
        const contentType = meta?.response?.headers.get("content-type");
        const fileName = getFileNameFromContentDisposition(
          meta?.response?.headers.get("content-disposition")
        );

        if (response instanceof Blob) {
          return {
            blob: response,
            contentType,
            fileName,
          };
        }

        return {
          blob: null,
          message: response?.message,
          data: response?.data,
          contentType,
          fileName,
        };
      },
    }),
    getUnderAssemblyDetails: builder.query<
      BarcodeApiResponse<BarcodeSerialLookupResponseData>,
      BarcodeUnderAssemblyRequest
    >({
      query: (body) => ({
        url: "/barcode/sales-orders/underAssembly",
        method: "POST",
        body,
      }),
    }),
    getQualityCheckDetails: builder.query<
      BarcodeApiResponse<BarcodeSerialLookupResponseData>,
      BarcodeSerialLookupRequest
    >({
      query: (body) => ({
        url: "/barcode/sales-orders/qualityCheck",
        method: "POST",
        body,
      }),
    }),
    getCompletionGearboxDetails: builder.query<
      BarcodeApiResponse<BarcodeSerialLookupResponseData>,
      BarcodeCompletionLookupRequest
    >({
      query: (body) => ({
        url: "/barcode/order-completion/completionGearboxSerialNumber",
        method: "POST",
        body,
      }),
    }),
    updateOrderCompletionStage: builder.mutation<
      BarcodeApiResponse,
      BarcodeCompletionUpdateRequest
    >({
      query: ({ stage, body }) => ({
        url: `/barcode/order-completion/${stage}`,
        method: "POST",
        body,
      }),
    }),
    qualityCheckSave: builder.mutation<
      BarcodeApiResponse,
      BarcodeQualityCheckSaveRequest
    >({
      query: (body) => ({
        url: "/barcode/sales-orders/qualityCheckSave",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useLazyGetSalesOrdersQuery,
  useGetSalesOrdersQuery,
  useLazyGetSalesOrdersByStatusQuery,
  useGetSalesOrdersInitQuery,
  useImportSalesOrdersMutation,
  useGetSalesOrderDetailsQuery,
  useLazyGetSalesOrderDetailsQuery,
  useCreateWorkOrderMutation,
  useGenerateSerialNumbersMutation,
  useIssueMaterialMutation,
  useSaveLotSerialAndMaterialIssueMutation,
  useOrderLineItemEditMutation,
  usePrintLabelMutation,
  useWipMaterialIssueMutation,
  useLazyGetUnderAssemblyDetailsQuery,
  useLazyGetQualityCheckDetailsQuery,
  useLazyGetCompletionGearboxDetailsQuery,
  useUpdateOrderCompletionStageMutation,
  useQualityCheckSaveMutation,
} = barcodeApi;
