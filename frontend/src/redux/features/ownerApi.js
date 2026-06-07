import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_BASE_URL } from "@/config/api";

export const ownerApi = createApi({
  reducerPath: "ownerApi",
  baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL }),
  tagTypes: ["Owner"],
  endpoints: (builder) => ({
    addOwner: builder.mutation({
      query: (body) => ({ url: "/owners", method: "POST", body }),
      invalidatesTags: [{ type: "Owner", id: "LIST" }],
    }),
    getOwnerById: builder.query({
      query: (id) => `/owners/${id}`,
      providesTags: (result, error, id) => [{ type: "Owner", id }],
    }),
    updateOwner: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/owners/${id}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Owner", id },
        { type: "Owner", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useAddOwnerMutation,
  useGetOwnerByIdQuery,
  useUpdateOwnerMutation,
} = ownerApi;

export default ownerApi;
