// frontend\src\redux\features\RoleApi.js
// frontend/src/redux/features/RoleApi.js
import { apiSlice } from "../api/apiSlice";

export const roleApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // دریافت لیست نقش‌ها با pagination و فیلتر
    listRoles: builder.query({
      query: ({ page = 1, limit = 10, status }) => {
        const params = new URLSearchParams({ page, limit });
        if (status) params.append("status", status);
        return `/roles?${params.toString()}`;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.roles.map((role) => ({ type: "Role", id: role._id })),
              { type: "Role", id: "LIST" },
            ]
          : [{ type: "Role", id: "LIST" }],
    }),

    // دریافت یک نقش با آی‌دی
    getRoleById: builder.query({
      query: (id) => `/roles/${id}`,
      providesTags: (result, error, id) => [{ type: "Role", id }],
    }),

    // ایجاد نقش جدید
    createRole: builder.mutation({
      query: (roleData) => ({
        url: "/roles",
        method: "POST",
        body: roleData,
      }),
      invalidatesTags: [{ type: "Role", id: "LIST" }],
    }),

    // آپدیت نقش
    updateRole: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/roles/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Role", id },
        { type: "Role", id: "LIST" },
      ],
    }),

    // حذف نقش
    deleteRole: builder.mutation({
      query: (id) => ({
        url: `/roles/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Role", id: "LIST" }],
    }),

    // تغییر وضعیت نقش
    changeRoleStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/roles/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Role", id },
        { type: "Role", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useListRolesQuery,
  useGetRoleByIdQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
  useChangeRoleStatusMutation,
} = roleApi;
