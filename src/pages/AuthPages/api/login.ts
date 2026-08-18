import { createApi } from "@reduxjs/toolkit/query/react";
import customBaseQuery from "../../../../shared/utils/customBaseQuery";

const LOGIN_API_URL =
  import.meta.env.VITE_LOGIN_API_URL || "/users/login";

interface ResetPasswordBody {
  email: string;
  password: string;
}

export const loginApi = createApi({
  reducerPath: "loginApi",
  baseQuery: customBaseQuery,
  tagTypes: ["login"],
  endpoints: (builder) => ({
    sendOtp: builder.mutation({
      query: (body) => ({
        url: "/auth/send-otp",
        method: "POST",
        body,
      }),
      invalidatesTags: ["login"],
    }),
    verifyOtp: builder.mutation({
      query: (body) => ({
        url: "/auth/verify-otp",
        method: "POST",
        body,
      }),
    }),
    emailLogin: builder.mutation({
      query: (credentials) => ({
        url: LOGIN_API_URL,
        method: "POST",
        body: credentials,
      }),
    }),

    resetPassword: builder.mutation({
      query: (credentials: ResetPasswordBody) => ({
        url: "/auth/forgot-password",
        method: "POST",
        body: credentials,
      }),
    }),

    getMyPermissions: builder.query({
      query: () => "/auth/me/permissions",
    }),

    logoutAll: builder.mutation({
      query: () => ({
        url: "/auth/logout-all",
        method: "POST",
      }),
    }),
  }),
});

export const {
  useSendOtpMutation,
  useVerifyOtpMutation,
  useEmailLoginMutation,
  useResetPasswordMutation,
  useGetMyPermissionsQuery,
  useLogoutAllMutation,
} = loginApi;

