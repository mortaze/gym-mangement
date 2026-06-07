// frontend/redux/features/userApi.js
import { apiSlice } from "../api/apiSlice";

export const userApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    // =======================
    // ✅ ایجاد کاربر
    // =======================
    createUser: builder.mutation({
      query: (formData) => ({
        url: `users/`,
        method: "POST",
        body: formData, // FormData شامل تصویر و بقیه فیلدها
      }),
      invalidatesTags: [{ type: "User", id: "LIST" }],
    }),

    // =======================
    // ✅ دریافت کاربر با employeeCode
    // =======================
    getUserByEmployeeCode: builder.query({
      query: (code) => `users/employee/${code}`,
      transformResponse: (response) => response.data || {},
      providesTags: (result, error, code) => [{ type: "User", id: code }],
    }),

    // =======================
    // ✅ دریافت کاربر با ID
    // =======================
    getUserById: builder.query({
      query: (id) => `users/${id}`,
      transformResponse: (response) => response.data || {},
      providesTags: (result, error, id) => [{ type: "User", id }],
    }),

    // =======================
    // ✅ آپدیت کاربر با FormData
    // =======================
    updateUser: builder.mutation({
      query: ({ id, formData }) => ({
        url: `users/${id}`,
        method: "PUT",
        body: formData, // body باید FormData باشه
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "User", id },
        { type: "User", id: "LIST" },
      ],
    }),

    // =======================
    // ✅ حذف کاربر
    // =======================
    deleteUser: builder.mutation({
      query: (id) => ({
        url: `users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "User", id: "LIST" }],
    }),

    // =======================
    // ✅ تغییر وضعیت کاربر
    // =======================
    changeUserStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `users/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "User", id },
        { type: "User", id: "LIST" },
      ],
    }),

    // =======================
    // ✅ لیست کاربران با فیلتر و صفحه‌بندی
    // =======================
    listUsers: builder.query({
      query: ({ page = 1, limit = 10, status, role } = {}) => {
        const params = new URLSearchParams();
        params.append("page", page);
        params.append("limit", limit);
        if (status) params.append("status", status);
        if (role) params.append("role", role);
        return `users?${params.toString()}`;
      },
      transformResponse: (response) => response.users || [], // ✅ تغییر این خط
      providesTags: (result) =>
        Array.isArray(result)
          ? [
              ...result.map((user) => ({ type: "User", id: user._id })),
              { type: "User", id: "LIST" },
            ]
          : [{ type: "User", id: "LIST" }],
    }),

    // =======================
    // ✅ دریافت پروفایل کاربر لاگین‌شده
    // =======================
    getMe: builder.query({
      query: () => `users/me`,
      transformResponse: (response) => response.data || {},
      providesTags: [{ type: "User", id: "ME" }],
    }),
  }),
});

export const {
  useCreateUserMutation,
  useGetUserByEmployeeCodeQuery,
  useGetUserByIdQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useGetMeQuery,
  useChangeUserStatusMutation,
  useListUsersQuery,
} = userApi;
