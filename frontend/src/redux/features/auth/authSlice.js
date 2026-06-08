import { createSlice } from "@reduxjs/toolkit";
import { clearAuth, getStoredAuth, normalizeRole, persistAuth } from "@/utils/auth";

const storedAuth = getStoredAuth();

const initialState = {
  accessToken: storedAuth.token || undefined,
  user: storedAuth.user ? { ...storedAuth.user, role: normalizeRole(storedAuth.user.role) } : undefined,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    userLoggedIn: (state, { payload }) => {
      state.accessToken = payload.accessToken || state.accessToken;
      state.user = payload.user ? { ...payload.user, role: normalizeRole(payload.user.role) } : state.user;
      persistAuth(state.accessToken, state.user);
    },
    userLoggedOut: (state) => {
      state.accessToken = undefined;
      state.user = undefined;
      clearAuth();
    },
  },
});

export const { userLoggedIn, userLoggedOut } = authSlice.actions;
export default authSlice.reducer;
