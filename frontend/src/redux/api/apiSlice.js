// redux/api/apiSlice.js
import Cookies from "js-cookie";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import { API_BASE_URL } from "@/config/api";

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: async (headers) => {
      try {
        if (typeof window !== "undefined") {
          const userInfo = Cookies.get("userInfo");
          if (userInfo) {
            const user = JSON.parse(userInfo);
            if (user?.accessToken) {
              headers.set("Authorization", `Bearer ${user.accessToken}`);
            }
          }
        }
      } catch (error) {
        console.error("Error parsing user info:", error);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({}), // همه endpoint ها از طریق injectEndpoints ساخته میشن
  tagTypes: ["User", "Role", "Owner", "Property", "Contract"],
});
