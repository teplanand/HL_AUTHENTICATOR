import { createApi } from "@reduxjs/toolkit/query/react";
import { createAppBaseQuery } from "../../../../shared/utils/customBaseQuery";

export interface WarehouseRecord {
  [key: string]: unknown;
}

export interface WarehouseResponse<TData = WarehouseRecord[]> {
  status?: boolean | number;
  message?: string;
  data?: TData;
}

export interface ListParams {
  [key: string]: string | number | boolean | null | undefined;
}

export interface IdArg {
  id: number | string;
}

export interface WarehouseDashboardParams {
  warehouse_id: number | string;
}

export interface CreateWarehousePayload {
  org_id?: string;
  warehouse_code: string;
  warehouse_name: string;
  manager_name?: string;
  contact_number?: string;
  email?: string;
  location?: string;
  address?: string;
  storage_capacity?: number;
  notes?: string;
  status?: "ACTIVE" | "INACTIVE";
  created_by?: string | null;
}

export interface UpdateWarehousePayload {
  id: number | string;
  warehouse_code?: string;
  warehouse_name?: string;
  manager_name?: string;
  contact_number?: string;
  email?: string;
  location?: string;
  address?: string;
  storage_capacity?: number;
  notes?: string;
  status?: "ACTIVE" | "INACTIVE";
  is_active?: boolean;
}

export interface CreateZonePayload {
  warehouse_id: number;
  zone_code: string;
  zone_title: string;
  zone_description?: string | null;
  status?: "ACTIVE" | "INACTIVE";
  created_by?: string | null;
}

export interface UpdateZonePayload {
  id: number | string;
  zone_code?: string;
  zone_title?: string;
  zone_description?: string | null;
  status?: "ACTIVE" | "INACTIVE";
}

export interface CreateRackPayload {
  warehouse_id: number;
  zone_id?: number;
  rack_code: string;
  rack_description?: string;
  status?: "ACTIVE" | "INACTIVE";
  created_by?: string;
}

export interface UpdateRackPayload {
  id: number | string;
  warehouse_id?: number;
  zone_id?: number;
  rack_code?: string;
  rack_description?: string;
  status?: "ACTIVE" | "INACTIVE";
  fifo?: boolean;
  exp_date?: string | null;
}

export interface CreatePalletPayload {
  warehouse_id: number;
  zone_id: number;
  rack_id: number;
  pallet_code: string;
  max_capacity?: number;
  status?: "AVAILABLE" | "OCCUPIED";
  created_by?: string;
}

export interface UpdatePalletPayload {
  id: number | string;
  zone_id?: number;
  rack_id?: number;
  pallet_code?: string;
  max_capacity?: number;
  status?: "AVAILABLE" | "OCCUPIED";
}

export interface CreateWarehouseItemPayload {
  oracle_code: string;
  rack_id?: number;
  sub_loc_id: number;
  pallet_id: number;
  item_desc?: string;
  item_category?: string;
  locator?: string;
  sub_inventory?: string;
  detail_qty?: number;
  in_qty?: number;
  out_qty?: number;
  has_expiry: boolean;
  expiry_date?: string | null;
  item_image_document_id?: number | null;
  item_image_name?: string | null;
  item_image_path?: string | null;
  file_name?: string | null;
  item_image_file?: File | null;
  qr_code?: string;
  qty: number;
}

export interface UpdateWarehouseItemPayload extends CreateWarehouseItemPayload {
  id: number | string;
}

export interface UpdateWarehouseItemRequest {
  id: number | string;
  body: Omit<UpdateWarehouseItemPayload, "id"> | FormData;
}

export interface CreateTransactionPayload {
  oracle_code: string;
  rack_id: number | string;
  sub_loc_id: number | string;
  pallet_id?: number | string;
  operation: "1" | "2" | "IN" | "OUT";
  qty: number | string;
  supplier_id?: number | string | null;
  created_by?: string;
}

const cleanParams = (params?: ListParams | void) => {
  const cleanedParams: Record<string, string | number | boolean> = {};
  const safeParams: ListParams = params ? params : {};

  Object.entries(safeParams).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== "") {
      cleanedParams[key] = value;
    }
  });

  return cleanedParams;
};

const resolveId = (arg: number | string | IdArg) =>
  typeof arg === "object" ? arg.id : arg;

const appendFormDataValue = (formData: FormData, key: string, value: unknown) => {
  if (value === undefined || value === null) {
    return;
  }

  if (value instanceof Blob) {
    formData.append(key, value);
    return;
  }

  formData.append(key, typeof value === "boolean" ? String(value) : String(value));
};

export const buildWarehouseItemFormData = (
  payload: Omit<CreateWarehouseItemPayload, never> | Omit<UpdateWarehouseItemPayload, "id">,
  excludedKeys: string[] = []
) => {
  const formData = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }

    if (excludedKeys.includes(key)) {
      return;
    }

    if (key === "item_image_file") {
      if (value instanceof File) {
        formData.append("file", value);
      }
      return;
    }

    if (key === "item_image_path" && typeof value === "string" && value.startsWith("data:")) {
      return;
    }

    appendFormDataValue(formData, key, value);
  });

  return formData;
};

export const warehouseApi = createApi({
  reducerPath: "warehouseApi",
  baseQuery: createAppBaseQuery({
    baseUrl: "https://wmsapi.techelecon.in/api",
  }),
  tagTypes: ["Warehouse"],
  endpoints: (builder) => ({
    createWarehouse: builder.mutation<
      WarehouseResponse<WarehouseRecord>,
      CreateWarehousePayload
    >({
      query: (body) => ({
        url: "/warehouse",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Warehouse"],
    }),
    listWarehouses: builder.query<WarehouseResponse, ListParams | void>({
      query: (params) => ({
        url: "/warehouse",
        method: "GET",
        params: cleanParams(params),
      }),
      providesTags: ["Warehouse"],
    }),
    getWarehouseById: builder.query<
      WarehouseResponse<WarehouseRecord>,
      number | string | IdArg
    >({
      query: (arg) => ({
        url: `/warehouse/${resolveId(arg)}`,
        method: "GET",
      }),
      providesTags: ["Warehouse"],
    }),
    updateWarehouse: builder.mutation<
      WarehouseResponse<WarehouseRecord>,
      UpdateWarehousePayload
    >({
      query: ({ id, ...body }) => ({
        url: `/warehouse/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Warehouse"],
    }),
    deleteWarehouse: builder.mutation<WarehouseResponse<WarehouseRecord>, number | string>({
      query: (id) => ({
        url: `/warehouse/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Warehouse"],
    }),
    getWarehouseDashboard: builder.query<
      WarehouseResponse<WarehouseRecord>,
      WarehouseDashboardParams
    >({
      query: ({ warehouse_id }) => ({
        url: "/warehouse/dashboard",
        method: "GET",
        params: { warehouse_id },
      }),
      providesTags: ["Warehouse"],
    }),

    createZone: builder.mutation<WarehouseResponse<WarehouseRecord>, CreateZonePayload>({
      query: (body) => ({
        url: "/zone",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Warehouse"],
    }),
    listZones: builder.query<WarehouseResponse, ListParams | void>({
      query: (params) => ({
        url: "/zone",
        method: "GET",
        params: cleanParams(params),
      }),
      providesTags: ["Warehouse"],
    }),
    getZoneById: builder.query<WarehouseResponse<WarehouseRecord>, number | string | IdArg>({
      query: (arg) => ({
        url: `/zone/${resolveId(arg)}`,
        method: "GET",
      }),
      providesTags: ["Warehouse"],
    }),
    updateZone: builder.mutation<WarehouseResponse<WarehouseRecord>, UpdateZonePayload>({
      query: ({ id, ...body }) => ({
        url: `/zone/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Warehouse"],
    }),
    deleteZone: builder.mutation<WarehouseResponse<WarehouseRecord>, number | string>({
      query: (id) => ({
        url: `/zone/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Warehouse"],
    }),

    createRack: builder.mutation<WarehouseResponse<WarehouseRecord>, CreateRackPayload>({
      query: (body) => ({
        url: "/rack",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Warehouse"],
    }),
    listRacks: builder.query<WarehouseResponse, ListParams | void>({
      query: (params) => ({
        url: "/rack",
        method: "GET",
        params: cleanParams(params),
      }),
      providesTags: ["Warehouse"],
    }),
    getRackById: builder.query<WarehouseResponse<WarehouseRecord>, number | string | IdArg>({
      query: (arg) => ({
        url: `/rack/${resolveId(arg)}`,
        method: "GET",
      }),
      providesTags: ["Warehouse"],
    }),
    updateRack: builder.mutation<WarehouseResponse<WarehouseRecord>, UpdateRackPayload>({
      query: ({ id, ...body }) => ({
        url: `/rack/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Warehouse"],
    }),
    deleteRack: builder.mutation<WarehouseResponse<WarehouseRecord>, number | string>({
      query: (id) => ({
        url: `/rack/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Warehouse"],
    }),

    createPallet: builder.mutation<WarehouseResponse<WarehouseRecord>, CreatePalletPayload>({
      query: (body) => ({
        url: "/pallet",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Warehouse"],
    }),
    listPallets: builder.query<WarehouseResponse, ListParams | void>({
      query: (params) => ({
        url: "/pallet",
        method: "GET",
        params: cleanParams(params),
      }),
      providesTags: ["Warehouse"],
    }),
    getPalletById: builder.query<WarehouseResponse<WarehouseRecord>, number | string | IdArg>({
      query: (arg) => ({
        url: `/pallet/${resolveId(arg)}`,
        method: "GET",
      }),
      providesTags: ["Warehouse"],
    }),
    updatePallet: builder.mutation<WarehouseResponse<WarehouseRecord>, UpdatePalletPayload>({
      query: ({ id, ...body }) => ({
        url: `/pallet/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Warehouse"],
    }),
    deletePallet: builder.mutation<WarehouseResponse<WarehouseRecord>, number | string>({
      query: (id) => ({
        url: `/pallet/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Warehouse"],
    }),

    createWarehouseItem: builder.mutation<
      WarehouseResponse<WarehouseRecord>,
      CreateWarehouseItemPayload | FormData
    >({
      query: (body) => ({
        url: "/item",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Warehouse"],
    }),
    listWarehouseItems: builder.query<WarehouseResponse, ListParams | void>({
      query: (params) => ({
        url: "/item",
        method: "GET",
        params: cleanParams(params),
      }),
      providesTags: ["Warehouse"],
    }),
    getWarehouseItemById: builder.query<
      WarehouseResponse<WarehouseRecord>,
      number | string | IdArg
    >({
      query: (arg) => ({
        url: `/item/${resolveId(arg)}`,
        method: "GET",
      }),
      providesTags: ["Warehouse"],
    }),
    updateWarehouseItem: builder.mutation<
      WarehouseResponse<WarehouseRecord>,
      UpdateWarehouseItemRequest
    >({
      query: ({ id, body }) => ({
        url: `/item/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Warehouse"],
    }),
    deleteWarehouseItem: builder.mutation<
      WarehouseResponse<WarehouseRecord>,
      number | string
    >({
      query: (id) => ({
        url: `/item/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Warehouse"],
    }),

    createTransaction: builder.mutation<
      WarehouseResponse<WarehouseRecord>,
      CreateTransactionPayload
    >({
      query: (body) => ({
        url: "/transaction",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Warehouse"],
    }),
    listTransactions: builder.query<WarehouseResponse, ListParams | void>({
      query: (params) => ({
        url: "/transaction",
        method: "GET",
        params: cleanParams(params),
      }),
      providesTags: ["Warehouse"],
    }),
    getTransactionById: builder.query<
      WarehouseResponse<WarehouseRecord>,
      number | string | IdArg
    >({
      query: (arg) => ({
        url: `/transaction/${resolveId(arg)}`,
        method: "GET",
      }),
      providesTags: ["Warehouse"],
    }),
  }),
});

export const {
  useCreateWarehouseMutation,
  useListWarehousesQuery,
  useLazyListWarehousesQuery,
  useGetWarehouseByIdQuery,
  useLazyGetWarehouseByIdQuery,
  useUpdateWarehouseMutation,
  useDeleteWarehouseMutation,
  useGetWarehouseDashboardQuery,
  useLazyGetWarehouseDashboardQuery,
  useCreateZoneMutation,
  useListZonesQuery,
  useLazyListZonesQuery,
  useGetZoneByIdQuery,
  useLazyGetZoneByIdQuery,
  useUpdateZoneMutation,
  useDeleteZoneMutation,
  useCreateRackMutation,
  useListRacksQuery,
  useLazyListRacksQuery,
  useGetRackByIdQuery,
  useLazyGetRackByIdQuery,
  useUpdateRackMutation,
  useDeleteRackMutation,
  useCreatePalletMutation,
  useListPalletsQuery,
  useLazyListPalletsQuery,
  useGetPalletByIdQuery,
  useLazyGetPalletByIdQuery,
  useUpdatePalletMutation,
  useDeletePalletMutation,
  useCreateWarehouseItemMutation,
  useListWarehouseItemsQuery,
  useLazyListWarehouseItemsQuery,
  useGetWarehouseItemByIdQuery,
  useLazyGetWarehouseItemByIdQuery,
  useUpdateWarehouseItemMutation,
  useDeleteWarehouseItemMutation,
  useCreateTransactionMutation,
  useListTransactionsQuery,
  useLazyListTransactionsQuery,
  useGetTransactionByIdQuery,
  useLazyGetTransactionByIdQuery,
} = warehouseApi;
