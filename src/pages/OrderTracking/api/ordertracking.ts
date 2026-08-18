import { createApi } from "@reduxjs/toolkit/query/react";
import { createAppBaseQuery } from "../../../../shared/utils/customBaseQuery";

// ─── Payload / Response Types ────────────────────────────────────────────────

export interface OrderTrackingOtherOptions {
  doLog?: boolean;
  whCon?: string;
  UniqueId?: number;
}

export interface OrderTrackingPayload {
  AppToken: string;
  UserName?: string;
  ClientIP?: string;
  data?: Record<string, unknown>;
  Other?: OrderTrackingOtherOptions;
}

export interface OrderTrackingRecord {
  [key: string]: unknown;
}

export interface OrderTrackingUpdateData {
  id: number;
  line_id?: number;
  division?: string;
  sub_division?: string;
  cust_po_no?: string;
  end_cust_name?: string;
  branch_name?: string;
  item_desc_cust_po?: string;
  ora_item_desc?: string;
  qty?: number;
  uom?: string;
  po_value?: number;
  cust_po_date?: string | null;
  cust_po_tech_clear_date?: string | null;
  delivery_date_po?: string | null;
  delivery_days_frm_po_date?: number | null;
  ga_dim_no?: string | null;
  ga_dim_drw_submission_design_plan?: string | null;
  ga_dim_drw_submission_design_actual?: string | null;
  final_drg_approval_received_date_plan?: string | null;
  final_drg_approval_received_date_actual?: string | null;
  work_order_no?: string;
  work_order_date?: string | null;
  commited_ex_works_delivery_date?: string | null;
  amp_plan?: string | null;
  amp_actual?: string | null;
  bom_plan?: string | null;
  bom_actual?: string | null;
  gear_case_plan?: string | null;
  gearcase_actual?: string | null;
  internal_plan?: string | null;
  internal_actual?: string | null;
  bo_plan?: string | null;
  bo_actual?: string | null;
  assembly_plan?: string | null;
  assembly_actual?: string | null;
  testing_plan?: string | null;
  testing_actual?: string | null;
  dispatch_date_plan?: string | null;
  dispatch_date_actual?: string | null;
  on_time_delivery?: number | string | null;
  remark?: string;
  remarks?: unknown;
  [key: string]: unknown;
}

export interface OrderTrackingResponse {
  status: number;
  message: string;
  data: OrderTrackingRecord[] | OrderTrackingRecord | null;
}

export interface SysConfigurationRecord {
  id: number | string;
  config_title?: string | null;
  config_description?: string | null;
  config_value?: string | number | null;
  division?: string | null;
  start_date?: string | null;
  end_date?: string | null;
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
}

export interface SysConfigurationResponse {
  status: number;
  message: string;
  data: SysConfigurationRecord[];
}

export interface GetSysConfigurationsArgs {
  division?: string;
  whCon?: string;
  data?: Record<string, unknown>;
}

export interface GetSysConfigurationByIdPayload {
  AppToken: string;
  UserName?: string;
  ClientIP?: string;
  data: Record<string, unknown>;
  Other: {
    UniqueId: number;
    doLog?: boolean;
  };
}

export interface UpdateSysConfigurationsPayload {
  AppToken: string;
  UserName?: string;
  ClientIP?: string;
  data: SysConfigurationRecord;
  Other?: {
    doLog?: boolean;
  };
}

// ─── Default Payload Builder ──────────────────────────────────────────────────

export const buildOrderTrackingPayload = (
  overrides: Partial<OrderTrackingPayload> = {}
): OrderTrackingPayload => ({
  AppToken: "abcd",
  UserName: "",
  ClientIP: "::1",
  data: {},
  Other: {
    doLog: true,
    whCon: "1=1",
  },
  ...overrides,

});

export const buildSysConfigurationsWherePayload = ({
  division = "CP",
  whCon,
  data = {},
}: GetSysConfigurationsArgs = {}) => ({
  AppToken: "abcd",
  UserName: "",
  ClientIP: "::1",
  data,
  Other: {
    doLog: true,
    whCon: whCon ?? `1=1 and  division = '${division}'`,
  },
});

export const buildUpdateSysConfigurationsPayload = (
  data: SysConfigurationRecord
): UpdateSysConfigurationsPayload => ({
  AppToken: "abcd",
  UserName: "",
  ClientIP: "::1",
  data,
  Other: {
    doLog: true,
  },
});

export const buildSysConfigurationByIdPayload = (
  UniqueId: number
): GetSysConfigurationByIdPayload => ({
  AppToken: "abcd",
  UserName: "",
  ClientIP: "::1",
  data: {},
  Other: {
    UniqueId,
    doLog: true,
  },
});

// ─── API ──────────────────────────────────────────────────────────────────────

export const orderTrackingApi = createApi({
  reducerPath: "orderTrackingApi",
  baseQuery: createAppBaseQuery({
    baseUrl: "https://ordtrk.techelecon.in/api",
    includeAuthHeader: false,
    redirectOnAuthFailure: false,
    prepareHeaders: (headers) => {
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  tagTypes: ["OrderTracking"],

  endpoints: (builder) => ({
    getOrders: builder.mutation<OrderTrackingResponse, Partial<OrderTrackingPayload> | void>({
      query: (overrides) => {
        const safeOverrides: Partial<OrderTrackingPayload> =
          overrides && typeof overrides === "object" ? overrides : {};

        return {
          url: "/oracle_trans/GetDataWhere",
          method: "POST",
          body: buildOrderTrackingPayload(safeOverrides),
        };
      },
    }),
    getOrderById: builder.mutation<OrderTrackingResponse, number>({
      query: (UniqueId) => ({
        url: "/oracle_trans/GetById",
        method: "POST",
        body: {
          AppToken: "abcd",
          UserName: "",
          ClientIP: "::1",
          data: {},
          Other: { UniqueId, doLog: true },
        },
      }),
    }),
    updateOrder: builder.mutation<OrderTrackingResponse, OrderTrackingUpdateData>({
      query: (data) => ({
        url: "/oracle_trans/Update",
        method: "POST",
        body: {
          AppToken: "abcd",
          UserName: "",
          ClientIP: "::1",
          data,
          Other: { doLog: true },
        },
      }),
    }),
    getSysConfigurations: builder.mutation<
      SysConfigurationResponse,
      GetSysConfigurationsArgs | void
    >({
      query: (args) => ({
        url: "/sys_configurations/Getsys_configurationsWhere",
        method: "POST",
        body: buildSysConfigurationsWherePayload(
          (args ?? {}) as GetSysConfigurationsArgs
        ),
      }),
    }),
    getSysConfigurationById: builder.mutation<SysConfigurationResponse, number>({
      query: (UniqueId) => ({
        url: "/sys_configurations/Getsys_configurationsById",
        method: "POST",
        body: buildSysConfigurationByIdPayload(UniqueId),
      }),
    }),
    updateSysConfigurations: builder.mutation<
      SysConfigurationResponse,
      SysConfigurationRecord
    >({
      query: (data) => ({
        url: "/sys_configurations/Updatesys_configurations",
        method: "POST",
        body: buildUpdateSysConfigurationsPayload(data),
      }),
    }),
  }),
});

export const {
  useGetOrdersMutation,
  useGetOrderByIdMutation,
  useUpdateOrderMutation,
  useGetSysConfigurationsMutation,
  useGetSysConfigurationByIdMutation,
  useUpdateSysConfigurationsMutation,
} = orderTrackingApi;
