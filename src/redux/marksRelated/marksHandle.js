import axios from "axios";
import {
  getRequest,
  getSuccess,
  getFailed,
  getError,
  addSuccess,
  updateSuccess,
  deleteSuccess,
} from "./marksSlice"; // make sure your slice exports these actions

const BASE_URL = process.env.REACT_APP_BASE_URL;

// ✅ Fetch marks by teacher
export const fetchMarksByTeacher = (teacherId) => async (dispatch) => {
  dispatch(getRequest());
  try {
    const res = await axios.get(`${BASE_URL}/marks/teacher/${teacherId}`);
    dispatch(getSuccess(res.data));
  } catch (error) {
    dispatch(getError(error.response?.data?.message || error.message));
  }
};

// ✅ Fetch marks by student
export const fetchMarksByStudent = (studentId) => async (dispatch) => {
  dispatch(getRequest());
  try {
    const res = await axios.get(`${BASE_URL}/marks/student/${studentId}`);
    dispatch(getSuccess(res.data));
  } catch (error) {
    dispatch(getError(error.response?.data?.message || error.message));
  }
};

// ✅ Fetch marks by subject
export const fetchMarksBySubject = (subjectId) => async (dispatch) => {
  dispatch(getRequest());
  try {
    const res = await axios.get(`${BASE_URL}/marks/subject/${subjectId}`);
    dispatch(getSuccess(res.data));
  } catch (error) {
    dispatch(getError(error.response?.data?.message || error.message));
  }
};

// ✅ Add marks
export const addMarks = (payload) => async (dispatch) => {
  dispatch(getRequest());
  try {
    const res = await axios.post(`${BASE_URL}/marks/add`, payload);
    dispatch(addSuccess(res.data));
  } catch (error) {
    dispatch(getError(error.response?.data?.message || error.message));
  }
};

// ✅ Update marks
export const updateMarks = (id, payload) => async (dispatch) => {
  dispatch(getRequest());
  try {
    const res = await axios.put(`${BASE_URL}/marks/${id}`, payload);
    dispatch(updateSuccess(res.data));
  } catch (error) {
    dispatch(getError(error.response?.data?.message || error.message));
  }
};

// ✅ Delete marks
export const deleteMarks = (id) => async (dispatch) => {
  dispatch(getRequest());
  try {
    await axios.delete(`${BASE_URL}/marks/${id}`);
    dispatch(deleteSuccess(id));
  } catch (error) {
    dispatch(getError(error.response?.data?.message || error.message));
  }
};


