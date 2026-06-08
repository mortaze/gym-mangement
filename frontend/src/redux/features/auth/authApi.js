import { apiSlice } from "@/redux/api/apiSlice";
import { userLoggedIn } from "./authSlice";

export const authApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    // ===============================
    // 🔹 Login User
    // ===============================
    loginUser: builder.mutation({
      query: (data) => ({
        url: "auth/login",
        method: "POST",
        body: data,
      }),
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          const result = await queryFulfilled;

          // ذخیره در Redux و localStorage
          dispatch(
            userLoggedIn({
              accessToken: result.data.token,
              user: result.data.user,
            })
          );

        } catch (err) {
          console.error("Login failed:", err);
        }
      },
    }),

    // ===============================
    // 🔹 Dynamic Login Guide (identifiers only, no passwords)
    // ===============================
    getLoginGuides: builder.query({
      query: () => "auth/login-guides",
      providesTags: ["Auth"],
    }),

    // ===============================
    // 🔹 Get Current User
    // ===============================
    getUser: builder.query({
      query: () => "auth/me",
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          const result = await queryFulfilled;
          dispatch(
            userLoggedIn({
              accessToken: typeof window !== "undefined" ? localStorage.getItem("token") : undefined,
              user: result.data.user,
            })
          );
        } catch (err) {
          console.error("Get user failed:", err);
        }
      },
    }),

    // ===============================
    // 🔹 Confirm Email
    // ===============================
    confirmEmail: builder.query({
      query: (token) => `user/confirmEmail/${token}`,
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          const result = await queryFulfilled;

          dispatch(
            userLoggedIn({
              accessToken: result.data.token,
              user: result.data.user,
            })
          );
        } catch (err) {
          console.error("Confirm email failed:", err);
        }
      },
    }),

    // ===============================
    // 🔹 Reset Password
    // ===============================
    resetPassword: builder.mutation({
      query: (data) => ({
        url: "user/forget-password",
        method: "PATCH",
        body: data,
      }),
    }),

    // ===============================
    // 🔹 Confirm Forgot Password
    // ===============================
    confirmForgotPassword: builder.mutation({
      query: (data) => ({
        url: "user/confirm-forget-password",
        method: "PATCH",
        body: data,
      }),
    }),

    // ===============================
    // 🔹 Change Password
    // ===============================
    changePassword: builder.mutation({
      query: (data) => ({
        url: "user/change-password",
        method: "PATCH",
        body: data,
      }),
    }),

    // ===============================
    // 🔹 Update Profile
    // ===============================
    updateProfile: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `user/update-user/${id}`,
        method: "PUT",
        body: data,
      }),
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          const result = await queryFulfilled;

          dispatch(
            userLoggedIn({
              accessToken: result.data.token,
              user: result.data.user,
            })
          );
        } catch (err) {
          console.error("Update profile failed:", err);
        }
      },
    }),
  }),
});

export const {
  useLoginUserMutation,
  useGetLoginGuidesQuery,
  useGetUserQuery,
  useConfirmEmailQuery,
  useResetPasswordMutation,
  useConfirmForgotPasswordMutation,
  useChangePasswordMutation,
  useUpdateProfileMutation,
} = authApi;
