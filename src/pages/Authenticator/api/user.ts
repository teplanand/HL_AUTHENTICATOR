import { createApi } from "@reduxjs/toolkit/query/react";
import customBaseQuery from "../../../../shared/utils/customBaseQuery";

export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: customBaseQuery,
  tagTypes: ["User"],
  endpoints: (builder) => ({
    // ✅ CREATE USER
    createUser: builder.mutation({
      query: (body) => ({
        url: "/user",
        method: "POST",
        body,
      }),
      invalidatesTags: ["User"],
    }),

    // ✅ LIST USERS with filters, pagination, and sorting
    listUsers: builder.query({
      query: (params: any = {}) => {
        const cleanedParams: Record<string, any> = {};

        Object.entries(params).forEach(([key, value]) => {
          if (
            value !== null &&
            value !== undefined &&
            value !== ""
          ) {
            cleanedParams[key] = value;
          }
        });

        return {
          url: "/user",
          method: "GET",
          params: cleanedParams,
        };
      },
      providesTags: ["User"],
    }),

    // ✅ GET SINGLE USER
    getUser: builder.query({
      query: (id) => `/user/${id}`,
      providesTags: ["User"],
    }),

    getUsersByRole: builder.query({
      query: (roleName: string) => ({
        url: "/user/by-role",
        method: "GET",
        params: {
          role_name: roleName,
        },
      }),
      providesTags: ["User"],
    }),

    // ✅ UPDATE USER
    updateUser: builder.mutation({
      query: ({ id, body }) => ({
        url: `/user/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["User"],
    }),

    // ✅ DELETE USER (HARD)
    deleteUser: builder.mutation({
      query: (id) => ({
        url: `/user/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["User"],
    }),

    // ✅ SOFT DELETE USER
    softDeleteUser: builder.mutation({
      query: (id) => ({
        url: `/user/soft/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["User"],
    }),
  }),
});

// ✅ Export hooks
export const {
  useCreateUserMutation,
  useListUsersQuery,
  useGetUserQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useGetUsersByRoleQuery,
  useSoftDeleteUserMutation,
} = userApi;
