import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    expensesList: [],
    expenseSummary: {},
    loading: false,
    error: null,
    response: null,
};

const expensesSlice = createSlice({
    name: 'expenses',
    initialState,
    reducers: {
        getRequest: (state) => {
            state.loading = true;
            state.error = null;
        },
        getSuccess: (state, action) => {
            state.expensesList = action.payload;
            state.loading = false;
            state.error = null;
            state.response = null;
        },
        getSummarySuccess: (state, action) => {
            state.expenseSummary = action.payload;
            state.loading = false;
            state.error = null;
            state.response = null;
        },
        addSuccess: (state, action) => {
            state.expensesList.unshift(action.payload);
            state.loading = false;
            state.error = null;
            state.response = "Expense added successfully";
        },
        updateSuccess: (state, action) => {
            const index = state.expensesList.findIndex(
                expense => expense._id === action.payload._id
            );
            if (index >= 0) {
                state.expensesList[index] = action.payload;
            }
            state.loading = false;
            state.error = null;
            state.response = "Expense updated successfully";
        },
        deleteSuccess: (state, action) => {
            state.expensesList = state.expensesList.filter(
                expense => expense._id !== action.payload._id
            );
            state.loading = false;
            state.error = null;
            state.response = "Expense deleted successfully";
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
    addSuccess,
    updateSuccess,
    deleteSuccess,
    getFailed,
    getError,
    clearError,
    clearResponse
} = expensesSlice.actions;

export const expensesReducer = expensesSlice.reducer;