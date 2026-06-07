import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  status: {},
  identity: {},
  legalStatus: {},
  ownership: {},
  location: {},
  boundaries: {},
  additionalInfo: {},
};

const propertyDraftSlice = createSlice({
  name: "propertyDraft",
  initialState,
  reducers: {
    setStatus: (state, action) => {
      state.status = action.payload || {};
    },
    setIdentity: (state, action) => {
      state.identity = action.payload || {};
    },
    setLegalStatus: (state, action) => {
      state.legalStatus = action.payload || {};
    },
    setOwnership: (state, action) => {
      state.ownership = action.payload || {};
    },
    setLocation: (state, action) => {
      state.location = action.payload || {};
    },
    setBoundaries: (state, action) => {
      state.boundaries = action.payload || {};
    },
    setAdditionalInfo: (state, action) => {
      state.additionalInfo = action.payload || {};
    },
    resetDraft: () => initialState,
  },
});

export const {
  setStatus,
  setIdentity,
  setLegalStatus,
  setOwnership,
  setLocation,
  setBoundaries,
  setAdditionalInfo,
  resetDraft,
} = propertyDraftSlice.actions;

export default propertyDraftSlice.reducer;
