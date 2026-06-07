// frontend/src/redux/store.js
import { configureStore } from "@reduxjs/toolkit";
import { apiSlice } from "./api/apiSlice";
import { roleApi } from "./features/roleApi";
import { equipmentApi } from "./features/equipmentApi";
// slices
import authSlice from "./features/auth/authSlice";

const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer, // RTK Query base API
    [roleApi.reducerPath]: roleApi.reducer, // Role API
    [equipmentApi.reducerPath]: equipmentApi.reducer,
    auth: authSlice, // Auth slice
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(equipmentApi.middleware)
      .concat(apiSlice.middleware)
      .concat(roleApi.middleware), // اضافه کردن middleware مربوط به roleApi

  devTools: process.env.NODE_ENV !== "production",
});

export default store;
