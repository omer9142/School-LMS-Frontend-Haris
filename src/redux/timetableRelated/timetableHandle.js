import axios from "axios";

import {
  setLoading,
  setError,
  setTimetable,
  addOrUpdateSlot,
  deleteSlot,
} from "./timetableSlice";

// ✅ Fetch timetable for a class
export const getClassTimetable = (classId) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const res = await axios.get(`${process.env.REACT_APP_BASE_URL}/timetable/class/${classId}`);
    dispatch(setTimetable(res.data));
  } catch (err) {
    dispatch(setError(err.response?.data?.message || "Failed to load timetable"));
  } finally {
    dispatch(setLoading(false));
  }
};

// ✅ Save a new timetable (array of entries)
export const saveTimetable = (payload) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const res = await axios.post(`${process.env.REACT_APP_BASE_URL}/timetable`, payload);

    // Optionally refetch after saving
    // dispatch(getClassTimetable(payload[0].classId));
    return res.data;
  } catch (err) {
    dispatch(setError(err.response?.data?.message || "Failed to save timetable"));
    throw err;
  } finally {
    dispatch(setLoading(false));
  }
};

// ✅ Update one slot
export const updateTimetableEntry = (id, payload) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const res = await axios.put(`${process.env.REACT_APP_BASE_URL}/timetable/${id}`, payload);
    dispatch(addOrUpdateSlot(res.data));
    return res.data;
  } catch (err) {
    dispatch(setError(err.response?.data?.message || "Failed to update timetable"));
    throw err;
  } finally {
    dispatch(setLoading(false));
  }
};

// ✅ Delete one slot
export const removeTimetableEntry = (id) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    await axios.delete(`${process.env.REACT_APP_BASE_URL}/timetable/${id}`);
    dispatch(deleteSlot(id));
  } catch (err) {
    dispatch(setError(err.response?.data?.message || "Failed to delete entry"));
    throw err;
  } finally {
    dispatch(setLoading(false));
  }
};

// ✅ Fetch timetable for a teacher
export const getTeacherTimetable = (teacherId) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const res = await axios.get(
      `${process.env.REACT_APP_BASE_URL}/timetable/teacher/${teacherId}`
    );
    dispatch(setTimetable(res.data)); // will overwrite timetable state
  } catch (err) {
    dispatch(
      setError(err.response?.data?.message || "Failed to load teacher timetable")
    );
  } finally {
    dispatch(setLoading(false));
  }
};
