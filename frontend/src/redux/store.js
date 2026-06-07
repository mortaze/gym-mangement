// frontend/src/redux/store.js
import { configureStore } from "@reduxjs/toolkit";
import { apiSlice } from "./api/apiSlice";
import { roleApi } from "./features/roleApi";
import { equipmentApi } from "./features/equipmentApi";
import { ownerApi } from "./features/ownerApi";
// slices
import authSlice from "./features/auth/authSlice";
import propertyDraftReducer from "./features/propertyDraftSlice";

const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer, // RTK Query base API
    [roleApi.reducerPath]: roleApi.reducer, // Role API
    [equipmentApi.reducerPath]: equipmentApi.reducer,
    [ownerApi.reducerPath]: ownerApi.reducer,
    auth: authSlice, // Auth slice
    propertyDraft: propertyDraftReducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(equipmentApi.middleware)
      .concat(ownerApi.middleware)
      .concat(apiSlice.middleware)
      .concat(roleApi.middleware), // اضافه کردن middleware مربوط به roleApi

  devTools: process.env.NODE_ENV !== "production",
});

export default store;
