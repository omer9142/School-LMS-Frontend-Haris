import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    booksList: [],
    salesList: [],
    loading: false,
    error: null,
    response: null,
    statestatus: "idle"
};

const librarySlice = createSlice({
    name: 'library',
    initialState,
    reducers: {
        getRequest: (state) => {
            state.loading = true;
            state.error = null;
            state.response = null;
        },
        getSuccess: (state, action) => {
            state.booksList = action.payload;
            state.loading = false;
            state.error = null;
            state.response = null;
            state.statestatus = "success";
        },
        getSalesSuccess: (state, action) => {
            state.salesList = action.payload;
            state.loading = false;
            state.error = null;
            state.response = null;
            state.statestatus = "success";
        },
        getFailed: (state, action) => {
            state.loading = false;
            state.error = null;
            state.response = action.payload;
            state.statestatus = "failed";
        },
        getError: (state, action) => {
            state.loading = false;
            state.error = action.payload;
            state.response = null;
            state.statestatus = "error";
        },
        stuffAdded: (state) => {
            state.loading = false;
            state.error = null;
            state.response = null;
            state.statestatus = "added";
        },
        bookSold: (state) => {
            state.loading = false;
            state.error = null;
            state.response = null;
            state.statestatus = "sold";
        },
        underControl: (state) => {
            state.loading = false;
            state.error = null;
            state.response = null;
            state.statestatus = "idle";
        }
    },
});

export const {
    getRequest,
    getSuccess,
    getSalesSuccess,
    getFailed,
    getError,
    stuffAdded,
    bookSold,
    underControl
} = librarySlice.actions;

export const libraryReducer = librarySlice.reducer;