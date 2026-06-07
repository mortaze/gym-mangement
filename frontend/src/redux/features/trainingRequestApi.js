import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const trainingRequestApi = createApi({
  reducerPath: "trainingRequestApi",
  baseQuery: fetchBaseQuery({ baseUrl: "http://localhost:7000/api" }),
  tagTypes: ["TrainingRequest"],
  endpoints: (builder) => ({
    // ایجاد درخواست جدید
    createRequest: builder.mutation({
      query: (data) => ({
        url: "/training-requests",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["TrainingRequest"],
    }),

    // دریافت همه درخواست‌ها
    getAllRequests: builder.query({
      query: () => "/training-requests",
      providesTags: ["TrainingRequest"],
    }),

    // دریافت درخواست‌ها برای یک کاربر
    getRequestsByUser: builder.query({
      query: (userId) => `/training-requests/user/${userId}`,
      providesTags: ["TrainingRequest"],
    }),

    // دریافت درخواست‌ها برای یک مربی
    getRequestsByTrainer: builder.query({
      query: (trainerId) => `/training-requests/trainer/${trainerId}`,
      providesTags: ["TrainingRequest"],
    }),

    // دریافت یک درخواست خاص
    getRequestById: builder.query({
      query: (id) => `/training-requests/${id}`,
      providesTags: ["TrainingRequest"],
    }),

    // بروزرسانی درخواست
    updateRequest: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/training-requests/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["TrainingRequest"],
    }),

    // حذف درخواست
    deleteRequest: builder.mutation({
      query: (id) => ({
        url: `/training-requests/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["TrainingRequest"],
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  useCreateRequestMutation,
  useGetAllRequestsQuery,
  useGetRequestsByUserQuery,
  useGetRequestsByTrainerQuery,
  useGetRequestByIdQuery,
  useUpdateRequestMutation,
  useDeleteRequestMutation,
} = trainingRequestApi;
