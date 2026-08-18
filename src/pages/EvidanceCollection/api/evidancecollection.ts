import { createApi } from "@reduxjs/toolkit/query/react";
import { createAppBaseQuery } from "../../../../shared/utils/customBaseQuery";

export const EVIDANCE_COLLECTION_API_BASE_URL =
  "https://apievidence.techelecon.in/api";

export interface EvidanceCollectionResponse<TData = unknown> {
  status?: boolean | number;
  message?: string;
  data?: TData;
  token?: string;
  refreshToken?: string;
  [key: string]: unknown;
}

export interface EvidanceCollectionRecord {
  [key: string]: unknown;
}

export interface AssingUserCategoryPayload {
  UserId: string;
  CategoryId: number;
  CompanyId: number;
}

export interface CreateCategoryPayload {
  CategoryName: string;
  CompanyId: number;
}

export interface AddUserPayload {
  UserName: string;
  HrmsId: string;
  CompanyId: number;
  DivisionId: number;
  RoleId: number;
}

export interface AddDivisionPayload {
  CompanyId: number;
  DivisionName: string;
}

export interface GetDivisionsPayload {
  CompanyId: number;
  DivisionName?: string;
}

export interface ApproveRejectRequestPayload {
  HrmsId: string;
  Status: number;
}

export interface GetViewMediaPayload {
  RefNo: string;
  CatId: number;
  ChildRefNo?: string;
  PhaseId?: number;
  Remarks?: string;
}

export interface CheckForAllowdDevicePayload {
  AndroidId: string;
  HrmsId: string;
}

export interface RefreshTokenPayload {
  RefreshToken: string;
}

export interface EvidenceLoginPayload {
  username: string;
  password: string;
}

export interface ReferenceNumberListPayload {
  CategoryId: number;
  PageNo?: number;
}

export interface FilterReferenceNoPayload {
  CategoryId: number;
  RefNo: string;
}

export interface CheckForCategoryPayload {
  RefNo: string;
  ChildRefNo?: string;
  isForInsert?: boolean;
}

export interface GetChildRefNoPayload {
  CategoryId: number;
  PageNo?: number;
  RefNo: string;
  ChildCategoryId: number;
}

export interface SaveTransactionPayload {
  CategoryId: number | string;
  ReferenceNo: string;
  CompanyName?: string;
  DivisonName?: string;
  Remarks?: string | Record<string, unknown>;
  Files?: FileLikeInput;
  Images?: FileLikeInput;
}

export interface SaveImagesPayload {
  CategoryId: number | string;
  ReferenceNo: string;
  Remarks?: string | Record<string, unknown>;
  Files?: FileLikeInput;
}

type FileLike = Blob | File;
type FileLikeInput = FileLike | FileLike[];

const appendFileEntries = (
  formData: FormData,
  key: string,
  files?: FileLikeInput
) => {
  if (!files) {
    return;
  }

  const fileList = Array.isArray(files) ? files : [files];

  fileList.forEach((file) => {
    formData.append(key, file);
  });
};

const appendTextEntry = (formData: FormData, key: string, value: unknown) => {
  if (value === undefined || value === null || value === "") {
    return;
  }

  if (typeof value === "object") {
    formData.append(key, JSON.stringify(value));
    return;
  }

  formData.append(key, String(value));
};

export const buildSaveTransactionFormData = (
  payload: SaveTransactionPayload
) => {
  const formData = new FormData();

  appendTextEntry(formData, "CategoryId", payload.CategoryId);
  appendTextEntry(formData, "ReferenceNo", payload.ReferenceNo);
  appendTextEntry(formData, "CompanyName", payload.CompanyName);
  appendTextEntry(formData, "DivisonName", payload.DivisonName);
  appendTextEntry(formData, "Remarks", payload.Remarks);
  appendFileEntries(formData, "Files", payload.Files);
  appendFileEntries(formData, "Images", payload.Images);

  return formData;
};

export const buildSaveImagesFormData = (payload: SaveImagesPayload) => {
  const formData = new FormData();

  appendTextEntry(formData, "CategoryId", payload.CategoryId);
  appendTextEntry(formData, "ReferenceNo", payload.ReferenceNo);
  appendTextEntry(formData, "Remarks", payload.Remarks);
  appendFileEntries(formData, "Files", payload.Files);

  return formData;
};

export const evidanceCollectionApi = createApi({
  reducerPath: "evidanceCollectionApi",
  baseQuery: createAppBaseQuery({
    baseUrl: EVIDANCE_COLLECTION_API_BASE_URL,
    redirectOnAuthFailure: false,
  }),
  tagTypes: ["EvidanceCollection"],
  endpoints: (builder) => ({
    login: builder.mutation<
      EvidanceCollectionResponse<EvidanceCollectionRecord>,
      EvidenceLoginPayload
    >({
      query: (body) => ({
        url: "/Login/login",
        method: "POST",
        body,
      }),
    }),
    assingUserCategory: builder.mutation<
      EvidanceCollectionResponse<EvidanceCollectionRecord>,
      AssingUserCategoryPayload
    >({
      query: (body) => ({
        url: "/UserMgmt/AssingUserCategory",
        method: "POST",
        body,
      }),
      invalidatesTags: ["EvidanceCollection"],
    }),
    createCategory: builder.mutation<
      EvidanceCollectionResponse<EvidanceCollectionRecord>,
      CreateCategoryPayload
    >({
      query: (body) => ({
        url: "/Category/CreateCategory",
        method: "POST",
        body,
      }),
      invalidatesTags: ["EvidanceCollection"],
    }),
    addUser: builder.mutation<
      EvidanceCollectionResponse<EvidanceCollectionRecord>,
      AddUserPayload
    >({
      query: (body) => ({
        url: "/UserMgmt/AddUser",
        method: "POST",
        body,
      }),
      invalidatesTags: ["EvidanceCollection"],
    }),
    addDivision: builder.mutation<
      EvidanceCollectionResponse<EvidanceCollectionRecord>,
      AddDivisionPayload
    >({
      query: (body) => ({
        url: "/Division/AddDivision",
        method: "POST",
        body,
      }),
      invalidatesTags: ["EvidanceCollection"],
    }),
    getDivisions: builder.mutation<
      EvidanceCollectionResponse<EvidanceCollectionRecord[]>,
      GetDivisionsPayload
    >({
      query: (body) => ({
        url: "/Division/GetDivisions",
        method: "POST",
        body,
      }),
    }),
    getCompanyList: builder.query<
      EvidanceCollectionResponse<EvidanceCollectionRecord[]>,
      void
    >({
      query: () => ({
        url: "/Company/GetCompayList",
        method: "GET",
      }),
      providesTags: [{ type: "EvidanceCollection" as const }],
    }),
    getRegistrationData: builder.query<
      EvidanceCollectionResponse<EvidanceCollectionRecord[]>,
      void
    >({
      query: () => ({
        url: "/Registration/GetRegistrationData",
        method: "GET",
      }),
      providesTags: ["EvidanceCollection"],
    }),
    approveRejectRequest: builder.mutation<
      EvidanceCollectionResponse<EvidanceCollectionRecord>,
      ApproveRejectRequestPayload
    >({
      query: (body) => ({
        url: "/Registration/ApproveRejectRequest",
        method: "POST",
        body,
      }),
      invalidatesTags: ["EvidanceCollection"],
    }),
    getUserData: builder.mutation<
      EvidanceCollectionResponse<EvidanceCollectionRecord>,
      void | Record<string, unknown>
    >({
      query: (body = {}) => ({
        url: "/User/GetUserData",
        method: "POST",
        body,
      }),
    }),
    getUserCategories: builder.mutation<
      EvidanceCollectionResponse<EvidanceCollectionRecord[]>,
      void | Record<string, unknown>
    >({
      query: (body = {}) => ({
        url: "/User/GetUserCategories",
        method: "POST",
        body,
      }),
    }),
    getImages: builder.mutation<
      EvidanceCollectionResponse<EvidanceCollectionRecord[]>,
      GetViewMediaPayload
    >({
      query: (body) => ({
        url: "/View/GetImages",
        method: "POST",
        body,
      }),
    }),
    getVideos: builder.mutation<
      EvidanceCollectionResponse<EvidanceCollectionRecord[]>,
      GetViewMediaPayload
    >({
      query: (body) => ({
        url: "/View/GetVideos",
        method: "POST",
        body,
      }),
    }),
    checkTransaction: builder.mutation<
      EvidanceCollectionResponse<EvidanceCollectionRecord>,
      GetViewMediaPayload
    >({
      query: (body) => ({
        url: "/View/CheckTransaction",
        method: "POST",
        body,
      }),
    }),
    getAudio: builder.mutation<
      EvidanceCollectionResponse<EvidanceCollectionRecord[]>,
      GetViewMediaPayload
    >({
      query: (body) => ({
        url: "/View/GetAudio",
        method: "POST",
        body,
      }),
    }),
    checkForAllowdDevice: builder.mutation<
      EvidanceCollectionResponse<EvidanceCollectionRecord>,
      CheckForAllowdDevicePayload
    >({
      query: (body) => ({
        url: "/Registration/checkForAllowdDevice",
        method: "POST",
        body,
      }),
    }),
    refreshToken: builder.mutation<
      EvidanceCollectionResponse<EvidanceCollectionRecord>,
      RefreshTokenPayload
    >({
      query: (body) => ({
        url: "/Login/refreshToken",
        method: "POST",
        body,
      }),
    }),
    registrationRequest: builder.mutation<
      EvidanceCollectionResponse<EvidanceCollectionRecord>,
      Record<string, unknown> | void
    >({
      query: (body = {}) => ({
        url: "/Registration/RegistrationRequest",
        method: "POST",
        body,
      }),
      invalidatesTags: ["EvidanceCollection"],
    }),
    getRefreneceNumbersList: builder.mutation<
      EvidanceCollectionResponse<EvidanceCollectionRecord[]>,
      ReferenceNumberListPayload
    >({
      query: (body) => ({
        url: "/MetaData/GetRefreneceNumbersList",
        method: "POST",
        body,
      }),
    }),
    checkAppVersion: builder.query<
      EvidanceCollectionResponse<EvidanceCollectionRecord>,
      void
    >({
      query: () => ({
        url: "/AppVersion/checkAppVersion",
        method: "GET",
      }),
    }),
    deleteAccount: builder.mutation<
      EvidanceCollectionResponse<EvidanceCollectionRecord>,
      Record<string, unknown> | void
    >({
      query: (body = {}) => ({
        url: "/UserMgmt/DeleteAccount",
        method: "POST",
        body,
      }),
      invalidatesTags: ["EvidanceCollection"],
    }),
    filterReferenceNo: builder.mutation<
      EvidanceCollectionResponse<EvidanceCollectionRecord[]>,
      FilterReferenceNoPayload
    >({
      query: (body) => ({
        url: "/MetaData/FilterReferenceNo",
        method: "POST",
        body,
      }),
    }),
    checkForCategory: builder.mutation<
      EvidanceCollectionResponse<EvidanceCollectionRecord>,
      CheckForCategoryPayload
    >({
      query: (body) => ({
        url: "/Category/CheckForCategory",
        method: "POST",
        body,
      }),
    }),
    getChildRefNo: builder.mutation<
      EvidanceCollectionResponse<EvidanceCollectionRecord[]>,
      GetChildRefNoPayload
    >({
      query: (body) => ({
        url: "/MetaData/GetChildRefNo",
        method: "POST",
        body,
      }),
    }),
    saveTransaction: builder.mutation<
      EvidanceCollectionResponse<EvidanceCollectionRecord>,
      SaveTransactionPayload | FormData
    >({
      query: (payload) => ({
        url: "/Transation/SaveNewTransction",
        method: "POST",
        body:
          payload instanceof FormData
            ? payload
            : buildSaveTransactionFormData(payload),
      }),
      invalidatesTags: ["EvidanceCollection"],
    }),
    saveImages: builder.mutation<
      EvidanceCollectionResponse<EvidanceCollectionRecord>,
      SaveImagesPayload | FormData
    >({
      query: (payload) => ({
        url: "/Transation/v1/SaveImages",
        method: "POST",
        body:
          payload instanceof FormData ? payload : buildSaveImagesFormData(payload),
      }),
      invalidatesTags: ["EvidanceCollection"],
    }),
    getRemarksList: builder.query<
      EvidanceCollectionResponse<EvidanceCollectionRecord[]>,
      string
    >({
      query: (refNo) => ({
        url: "/MetaData/GetRemarksList",
        method: "GET",
        params: { refNo },
      }),
      providesTags: [{ type: "EvidanceCollection" as const }],
    }),
  }),
});

export const {
  useLoginMutation,
  useAssingUserCategoryMutation,
  useCreateCategoryMutation,
  useAddUserMutation,
  useAddDivisionMutation,
  useGetDivisionsMutation,
  useGetCompanyListQuery,
  useLazyGetCompanyListQuery,
  useGetRegistrationDataQuery,
  useLazyGetRegistrationDataQuery,
  useApproveRejectRequestMutation,
  useGetUserDataMutation,
  useGetUserCategoriesMutation,
  useGetImagesMutation,
  useGetVideosMutation,
  useCheckTransactionMutation,
  useGetAudioMutation,
  useCheckForAllowdDeviceMutation,
  useRefreshTokenMutation,
  useRegistrationRequestMutation,
  useGetRefreneceNumbersListMutation,
  useCheckAppVersionQuery,
  useLazyCheckAppVersionQuery,
  useDeleteAccountMutation,
  useFilterReferenceNoMutation,
  useCheckForCategoryMutation,
  useGetChildRefNoMutation,
  useSaveTransactionMutation,
  useSaveImagesMutation,
  useGetRemarksListQuery,
  useLazyGetRemarksListQuery,
} = evidanceCollectionApi;
