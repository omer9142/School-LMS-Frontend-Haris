import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    profitData: null,
    loading: false,
    error: null,
    statestatus: "idle"
};

const profitSlice = createSlice({
    name: 'profit',
    initialState,
    reducers: {
        getRequest: (state) => {
            state.loading = true;
            state.error = null;
        },
        getSuccess: (state, action) => {
            state.profitData = action.payload;
            state.loading = false;
            state.error = null;
            state.statestatus = "success";
        },
        getFailed: (state, action) => {
            state.loading = false;
            state.error = null;
            state.statestatus = "failed";
        },
        getError: (state, action) => {
            state.loading = false;
            state.error = action.payload;
            state.statestatus = "error";
        },
        underControl: (state) => {
            state.loading = false;
            state.error = null;
            state.statestatus = "idle";
        }
    },
});

export const {
    getRequest,
    getSuccess,
    getFailed,
    getError,
    underControl
} = profitSlice.actions;

export const profitReducer = profitSlice.reducer;