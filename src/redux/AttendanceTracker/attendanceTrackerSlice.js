// redux/attendanceTrackerRelated/attendanceTrackerSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  dailyTracker: [],
  rangeTracker: [],
  classDetails: null,
  loading: false,
  loadingDetails: false,
  error: null,
  detailsError: null,
};

const attendanceTrackerSlice = createSlice({
  name: "attendanceTracker",
  initialState,
  reducers: {
    getRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    getSuccess: (state, action) => {
      state.dailyTracker = action.payload;
      state.loading = false;
      state.error = null;
    },
    getRangeSuccess: (state, action) => {
      state.rangeTracker = action.payload;
      state.loading = false;
      state.error = null;
    },
    getFailed: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    getDetailsRequest: (state) => {
      state.loadingDetails = true;
      state.detailsError = null;
    },
    getDetailsSuccess: (state, action) => {
      state.classDetails = action.payload;
      state.loadingDetails = false;
      state.detailsError = null;
    },
    getDetailsFailed: (state, action) => {
      state.loadingDetails = false;
      state.detailsError = action.payload;
    },
    clearDetails: (state) => {
      state.classDetails = null;
      state.detailsError = null;
    },
  },
});

export const {
  getRequest,
  getSuccess,
  getRangeSuccess,
  getFailed,
  getDetailsRequest,
  getDetailsSuccess,
  getDetailsFailed,
  clearDetails,
} = attendanceTrackerSlice.actions;

export const attendanceTrackerReducer = attendanceTrackerSlice.reducer;