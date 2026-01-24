// studentSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  studentsList: [],
  attendance: [],
  timetable: [],
  studentDetails: null,
  marks: [], // ✅ marks array
  loading: false,
  error: null,
  response: null,
  statestatus: "idle",
};

const studentSlice = createSlice({
  name: "student",
  initialState,
  reducers: {
    // ---------------- Existing ----------------
    getRequest: (state) => {
      state.loading = true;
    },
    stuffDone: (state) => {
      state.loading = false;
      state.error = null;
      state.response = null;
      state.statestatus = "added";
    },
    getSuccess: (state, action) => {
      state.studentsList = action.payload;
      state.loading = false;
      state.error = null;
      state.response = null;
    },
    getAttendanceSuccess: (state, action) => {
      state.attendance = action.payload;
      state.loading = false;
      state.error = null;
      state.response = null;
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
    underStudentControl: (state) => {
      state.loading = false;
      state.response = null;
      state.error = null;
      state.statestatus = "idle";
    },
    getTimetableSuccess: (state, action) => {
      state.loading = false;
      state.error = null;
      state.timetable = action.payload;
    },
    getStudentDetailsSuccess: (state, action) => {
  state.studentDetails = action.payload;   // ← Store the single student object
  state.loading = false;
  state.error = null;
  state.response = null;
},

    // ---------------- Marks ----------------
    getMarksRequest: (state) => {
      state.loading = true;
    },
    getMarksSuccess: (state, action) => {
      state.marks = action.payload;
      state.loading = false;
      state.error = null;
    },
    getMarksFail: (state, action) => {
      state.marks = [];
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  getRequest,
  getSuccess,
  getAttendanceSuccess,
  getFailed,
  getError,
  underStudentControl,
  stuffDone,
  getTimetableSuccess,
  // ✅ Marks actions
  getMarksRequest,
  getStudentDetailsSuccess,
  getMarksSuccess,
  getMarksFail,
} = studentSlice.actions;

export const studentReducer = studentSlice.reducer;
