import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  status: 'idle',
  response: null,
  error: null,
  createdFinance: null,
  financeList: [],
};

const financeSlice = createSlice({
  name: 'finance',
  initialState,
  reducers: {
    createRequest(state) {
      state.status = 'loading';
      state.error = null;
    },
    createSuccess(state, action) {
      state.status = 'succeeded';
      state.response = action.payload;
      state.createdFinance = action.payload.finance || null;
      state.error = null;
    },
    getListSuccess(state, action) {
      state.status = 'succeeded';
      state.financeList = action.payload;
      state.response = action.payload;
      state.error = null;
    },
    updateSuccess(state, action) {
      state.status = 'succeeded';
      state.response = action.payload;
      state.error = null;
      
      // Update financeList if the updated finance is in the list
      if (action.payload.finance && Array.isArray(state.financeList)) {
        const updatedIndex = state.financeList.findIndex(
          finance => finance._id === action.payload.finance._id
        );
        if (updatedIndex !== -1) {
          state.financeList[updatedIndex] = action.payload.finance;
        }
      }
    },
    deleteSuccess(state, action) {
      state.status = 'succeeded';
      state.response = action.payload;
      state.error = null;
      
      // Remove deleted finance from financeList
      if (action.payload.deletedFinanceId && Array.isArray(state.financeList)) {
        state.financeList = state.financeList.filter(
          finance => finance._id !== action.payload.deletedFinanceId
        );
      }
    },
    createFailed(state, action) {
      state.status = 'failed';
      state.response = action.payload || null;
      state.error = action.payload || null;
    },
    createError(state, action) {
      state.status = 'failed';
      state.error = action.payload || 'Network error';
      state.response = null;
    },
    clearFinanceState(state) {
      state.status = 'idle';
      state.response = null;
      state.error = null;
      state.createdFinance = null;
      // Keep financeList intact when clearing
    },
    // Add this action to update a single finance in the list
    updateFinanceInList(state, action) {
      if (Array.isArray(state.financeList)) {
        const updatedIndex = state.financeList.findIndex(
          finance => finance._id === action.payload._id
        );
        if (updatedIndex !== -1) {
          state.financeList[updatedIndex] = action.payload;
        }
      }
    },
  },
});

export const {
  createRequest,
  createSuccess,
  getListSuccess,
  updateSuccess,
  deleteSuccess,
  createFailed,
  createError,
  clearFinanceState,
  updateFinanceInList,
} = financeSlice.actions;

export default financeSlice.reducer;