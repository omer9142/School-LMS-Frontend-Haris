import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  timetable: [],   // full grid for a class
  loading: false,
  error: null,
};

const timetableSlice = createSlice({
  name: "timetable",
  initialState,
  reducers: {
    // loading states
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },

    // store timetable
    setTimetable: (state, action) => {
      state.timetable = action.payload;
    },

    // add / update / delete slot locally
    addOrUpdateSlot: (state, action) => {
      const { day, period, entry } = action.payload;
      const updated = state.timetable.map((row) =>
        row.day === day && row.period === period ? { ...row, ...entry } : row
      );
      state.timetable = updated;
    },

    deleteSlot: (state, action) => {
      const { day, period } = action.payload;
      const updated = state.timetable.map((row) =>
        row.day === day && row.period === period ? { ...row, subject: null, teacher: null } : row
      );
      state.timetable = updated;
    },
  },
});

export const {
  setLoading,
  setError,
  setTimetable,
  addOrUpdateSlot,
  deleteSlot,
  
} = timetableSlice.actions;

export default timetableSlice.reducer;
