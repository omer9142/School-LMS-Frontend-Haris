import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    salariesList: [],
    salarySummary: {},
    loading: false,
    error: null,
    response: null,
};

const salariesSlice = createSlice({
    name: 'salaries',
    initialState,
    reducers: {
        getRequest: (state) => {
            state.loading = true;
            state.error = null;
        },
        getSuccess: (state, action) => {
            state.salariesList = action.payload;
            state.loading = false;
            state.error = null;
            state.response = null;
        },
        getSummarySuccess: (state, action) => {
            state.salarySummary = action.payload;
            state.loading = false;
            state.error = null;
            state.response = null;
        },
        addOrUpdateSuccess: (state, action) => {
            // Update existing or add new salary record
            const existingIndex = state.salariesList.findIndex(
                salary => salary._id === action.payload._id
            );
            if (existingIndex >= 0) {
                state.salariesList[existingIndex] = action.payload;
            } else {
                state.salariesList.push(action.payload);
            }
            state.loading = false;
            state.error = null;
            state.response = "Salary record saved successfully";
        },
        updateStatusSuccess: (state, action) => {
            const index = state.salariesList.findIndex(
                salary => salary._id === action.payload._id
            );
            if (index >= 0) {
                state.salariesList[index] = action.payload;
            }
            state.loading = false;
            state.error = null;
            state.response = "Salary status updated successfully";
        },
        deleteSuccess: (state, action) => {
            state.salariesList = state.salariesList.filter(
                salary => salary._id !== action.payload._id
            );
            state.loading = false;
            state.error = null;
            state.response = "Salary record deleted successfully";
        },
        getFailed: (state, action) => {
            state.response = action.payload;
            state.loading = false;
            state.error = null;
        },
        getError: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        },
        clearResponse: (state) => {
            state.response = null;
        }
    },
});

export const {
    getRequest,
    getSuccess,
    getSummarySuccess,
    addOrUpdateSuccess,
    updateStatusSuccess,
    deleteSuccess,
    getFailed,
    getError,
    clearError,
    clearResponse
} = salariesSlice.actions;

export const salariesReducer = salariesSlice.reducer;