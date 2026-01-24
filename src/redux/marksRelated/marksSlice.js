import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  marksList: [],
  loading: false,
  error: null,
};

const marksSlice = createSlice({
  name: "marks",
  initialState,
  reducers: {
    // Requests & errors
    getRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    getSuccess: (state, action) => {
      state.loading = false;
      state.marksList = action.payload;
    },
    getFailed: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    getError: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Add / Update / Delete
    addSuccess: (state, action) => {
      state.loading = false;
      state.marksList.push(action.payload);
    },
    updateSuccess: (state, action) => {
      state.loading = false;
      const index = state.marksList.findIndex((m) => m._id === action.payload._id);
      if (index !== -1) state.marksList[index] = action.payload;
    },
    deleteSuccess: (state, action) => {
      state.loading = false;
      state.marksList = state.marksList.filter((m) => m._id !== action.payload);
    },
  },
});

export const {
  getRequest,
  getSuccess,
  getFailed,
  getError,
  addSuccess,
  updateSuccess,
  deleteSuccess,
} = marksSlice.actions;

export default marksSlice.reducer;
