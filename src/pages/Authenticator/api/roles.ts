import { createApi } from "@reduxjs/toolkit/query/react";
import customBaseQuery from "../../../../shared/utils/customBaseQuery";

export const roleApi = createApi({
  reducerPath: "roleApi",
  baseQuery: customBaseQuery,
  tagTypes: ["Roles"],

  endpoints: (builder) => ({
    // ✅ Create Role
    createRole: builder.mutation({
      query: (body) => ({
        url: "/roles",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Roles"],
    }),

    // ✅ Get All Roles (with search, pagination)
    getRoles: builder.query({
      query: ({
        skip = 0,
        limit = 10,
        search,
        sort_by,
        sort_order = "asc",
        is_active,
        ...rest
      }) => {
        const params: any = { skip, limit, ...rest };

        if (search) params.search = search;
        if (sort_by) params.sort_by = sort_by;
        if (sort_order) params.sort_order = sort_order;
        if (is_active !== undefined && is_active !== null)
          params.is_active = is_active;

        return {
          url: `/roles`,
          method: "GET",
          params,
        };
      },
      providesTags: ["Roles"],
    }),

    // ✅ Get All Roles (List for Dropdowns)
    getAllRoles: builder.query({
      query: ({ search, sort_by, sort_order, is_active, }: { search?: string; sort_by?: string; sort_order?: "asc" | "desc", is_active?: boolean } = {}) => {
        const params: any = {};
        if (search) params.search = search;
        if (sort_by) params.sort_by = sort_by;
        if (sort_order) params.sort_order = sort_order;
        if (is_active) params.is_active = is_active;

        return {
          url: `/roles/all`,
          method: "GET",
          params,
        };
      },
      providesTags: ["Roles"],
    }),

    // ✅ Get Role by ID
    getRoleById: builder.query({
      query: (id) => `/roles/${id}`,
      providesTags: ["Roles"],
    }),

    // ✅ Update Role
    updateRole: builder.mutation({
      query: ({ id, data }) => ({
        url: `/roles/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Roles"],
    }),

    // ✅ Delete Role (Hard)
    deleteRole: builder.mutation({
      query: (id) => ({
        url: `/roles/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Roles"],
    }),

    // ✅ Soft Delete Role
    softDeleteRole: builder.mutation({
      query: (id) => ({
        url: `/roles/soft/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Roles"],
    }),
  }),
});

export const {
  useCreateRoleMutation,
  useGetRolesQuery,
  useGetRoleByIdQuery,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
  useSoftDeleteRoleMutation,
  useGetAllRolesQuery,
} = roleApi;
