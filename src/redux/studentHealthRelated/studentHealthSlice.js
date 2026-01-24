import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  healthData: null,
  loading: false,
  error: null,
  success: false,
  message: ''
};

const studentHealthSlice = createSlice({
  name: 'studentHealth',
  initialState,
  reducers: {
    getRequest: (state) => {
      state.loading = true;
      state.error = null;
      state.success = false;
    },
    getSuccess: (state, action) => {
      state.loading = false;
      state.healthData = action.payload;
      state.error = null;
      state.success = true;
    },
    getFailed: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.success = false;
    },
    
    updateRequest: (state) => {
      state.loading = true;
      state.error = null;
      state.success = false;
    },
    updateSuccess: (state, action) => {
      state.loading = false;
      state.healthData = action.payload;
      state.error = null;
      state.success = true;
      state.message = 'Health information updated successfully';
    },
    updateFailed: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.success = false;
    },
    
    clearState: (state) => {
      state.healthData = null;
      state.loading = false;
      state.error = null;
      state.success = false;
      state.message = '';
    }
  }
});

export const {
  getRequest,
  getSuccess,
  getFailed,
  updateRequest,
  updateSuccess,
  updateFailed,
  clearState
} = studentHealthSlice.actions;

export const studentHealthReducer = studentHealthSlice.reducer;