// redux/feeRelated/feeSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  fees: { fees: [], page: 1, limit: 100 },
  summary: {},
  loading: false,
  error: null,
};

const feeSlice = createSlice({
  name: "fee",
  initialState,
  reducers: {
    requestStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    requestFailed: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    getFeesSuccess: (state, action) => {
      state.loading = false;
      state.error = null;
      // Backend returns { fees: [...], page, limit }
      state.fees = action.payload;
    },
    getSummarySuccess: (state, action) => {
      state.loading = false;
      state.summary = action.payload;
    },
    createFeeSuccess: (state, action) => {
      state.loading = false;
      // Optionally add to fees array
      if (state.fees.fees) {
        state.fees.fees.unshift(action.payload);
      }
    },
    updateFeeSuccess: (state, action) => {
      state.loading = false;
      const index = state.fees.fees?.findIndex(f => f._id === action.payload._id);
      if (index !== -1 && state.fees.fees) {
        state.fees.fees[index] = action.payload;
      }
    },
    getStudentFeesSuccess: (state, action) => {
      state.loading = false;
      state.studentFees = action.payload;
    },
    deleteFeeSuccess: (state, action) => {
      state.loading = false;
      if (state.fees.fees) {
        state.fees.fees = state.fees.fees.filter(f => f._id !== action.payload);
      }
    },
  },
});

export const {
  requestStart,
  requestFailed,
  getFeesSuccess,
  getSummarySuccess,
  createFeeSuccess,
  updateFeeSuccess,
  deleteFeeSuccess,
  getStudentFeesSuccess,
} = feeSlice.actions;

export default feeSlice.reducer;