// frontend/src/redux/features/equipmentApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

/**
 * Equipment API (RTK Query)
 * - baseUrl: http://localhost:7000/api
 * - endpoints:
 *    GET  /equipment
 *    GET  /equipment/:id
 *    POST /equipment
 *    PUT  /equipment/:id
 *    DELETE /equipment/:id
 *    POST /equipment/:id/maintenance
 *
 * TransformResponse handles both:
 * - raw array: []
 * - wrapper: { success: true, data: [...] }
 *
 * Tags: 'Equipment' for cache invalidation
 */

export const equipmentApi = createApi({
  reducerPath: "equipmentApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:7000/api",
    prepareHeaders: (headers) => {
      // اگر توکن در sessionStorage دارید، اینجا اضافه کنید
      try {
        const raw = sessionStorage.getItem("currentUser");
        if (raw) {
          const user = JSON.parse(raw);
          // فرض: user.token یا user.accessToken اگر داشته باشی
          const token = user?.token || user?.accessToken || null;
          if (token) headers.set("Authorization", `Bearer ${token}`);
        }
      } catch (e) {
        /* ignore parse errors */
      }
      return headers;
    },
  }),
  tagTypes: ["Equipment"],
  endpoints: (build) => ({
    // GET /equipment  -> لیست همه تجهیزات
    getEquipments: build.query({
      query: (params = {}) => {
        // params می‌تواند فیلتر/صفحه/limit را شامل کند: { minHealth: 50, operationalStatus: 'Operational' }
        const queryString = new URLSearchParams(params).toString();
        return {
          url: `/equipment${queryString ? `?${queryString}` : ""}`,
          method: "GET",
        };
      },
      // transformResponse: normalize server response to array
      transformResponse: (response) => {
        // ممکنه response == [] یا { success: true, data: [...] } یا { data: [...] }
        if (Array.isArray(response)) return response;
        if (response?.data && Array.isArray(response.data))
          return response.data;
        if (response?.data && typeof response.data === "object")
          return [response.data];
        // fallback: try to return data field or response itself
        return response?.data ?? response;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map((r) => ({
                type: "Equipment",
                id: r._id || r.equipmentCode,
              })),
              { type: "Equipment", id: "LIST" },
            ]
          : [{ type: "Equipment", id: "LIST" }],
    }),

    // GET /equipment/:id
    getEquipmentById: build.query({
      query: (id) => `/equipment/${id}`,
      transformResponse: (response) => {
        if (!response) return null;
        // server may send { success: true, data: {...} } or raw object
        return response?.data ?? response;
      },
      providesTags: (result, error, id) => [{ type: "Equipment", id }],
    }),

    // POST /equipment
    createEquipment: build.mutation({
      query: (payload) => ({
        url: "/equipment",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: [{ type: "Equipment", id: "LIST" }],
    }),

    // PUT /equipment/:id
    updateEquipment: build.mutation({
      query: ({ id, ...patch }) => ({
        url: `/equipment/${id}`,
        method: "PUT",
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Equipment", id },
        { type: "Equipment", id: "LIST" },
      ],
    }),

    // DELETE /equipment/:id
    deleteEquipment: build.mutation({
      query: (id) => ({
        url: `/equipment/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Equipment", id },
        { type: "Equipment", id: "LIST" },
      ],
    }),

    // POST /equipment/:id/maintenance
    addMaintenanceLog: build.mutation({
      query: ({ id, ...log }) => ({
        url: `/equipment/${id}/maintenance`,
        method: "POST",
        body: log,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Equipment", id },
        { type: "Equipment", id: "LIST" },
      ],
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  useGetEquipmentsQuery,
  useGetEquipmentByIdQuery,
  useCreateEquipmentMutation,
  useUpdateEquipmentMutation,
  useDeleteEquipmentMutation,
  useAddMaintenanceLogMutation,
} = equipmentApi;

export default equipmentApi;
