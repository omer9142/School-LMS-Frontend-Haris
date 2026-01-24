import axios from 'axios';
import {
    getRequest,
    getSuccess,
    getFailed,
    getError,
    stuffDone,
    getAttendanceSuccess,
    getTimetableSuccess,
    getStudentDetailsSuccess,
} from './studentSlice';

export const getAllStudents = () => async (dispatch) => {
  dispatch(getRequest());
  try {
    const { data } = await axios.get(`${process.env.REACT_APP_BASE_URL}/Students`);
    dispatch(getSuccess(data));
  } catch (error) {
    dispatch(getError(error?.response?.data?.message || error.message));
  }
};


export const updateStudentFields = (id, fields, address) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.put(`${process.env.REACT_APP_BASE_URL}/${address}/${id}`, fields, {
            headers: { 'Content-Type': 'application/json' },
        });
        if (result.data.message) {
            dispatch(getFailed(result.data.message));
        } else {
            dispatch(stuffDone());
        }
    } catch (error) {
        dispatch(getError(error));
    }
}

export const removeStuff = (id, address) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.delete(`${process.env.REACT_APP_BASE_URL}/${address}/${id}`);
        if (result.data.message) {
            dispatch(stuffDone()); // success, student deleted
        } else {
            dispatch(getFailed("Unexpected response"));
        }
    } catch (error) {
        dispatch(getError(error.response?.data?.message || error.message));
    }
};


export const updateStudentProfilePicture = (id, formData) => async (dispatch) => {
  dispatch(getRequest());
  try {
    const result = await axios.put(
      `${process.env.REACT_APP_BASE_URL}/Student/${id}/uploadProfile`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' }
      }
    );
    if (result.data.message) {
      dispatch(getFailed(result.data.message));
    } else {
      dispatch(getSuccess(result.data)); // refresh with updated user
    }
  } catch (error) {
    dispatch(getError(error));
  }
};

export const getStudentAttendance = (studentId) => async (dispatch) => {
  dispatch(getRequest());
  try {
    const { data } = await axios.get(
      `${process.env.REACT_APP_BASE_URL}/Attendance/Student/${studentId}`
    );

    // Transform data so we always have className in it
    const formattedData = data.map((att) => ({
      _id: att._id,
      status: att.status,
      date: att.date,
      sclassName: att.sclass?.sclassName || att.subName || "Unknown Class",
      markedBy: att.markedBy?.name || "Unknown",
    }));

    dispatch(getAttendanceSuccess(formattedData));
  } catch (error) {
    dispatch(getError(error?.response?.data?.message || error.message));
  }
};

export const getStudentTimetable = (studentId) => async (dispatch) => {
  dispatch(getRequest());
  try {
    const { data } = await axios.get(
      `${process.env.REACT_APP_BASE_URL}/Timetable/student/${studentId}`
    );
    dispatch(getTimetableSuccess(data));
  } catch (error) {
    dispatch(getError(error?.response?.data?.message || error.message));
  }
};

export const getStudentMarks = (studentId) => async (dispatch) => {
  try {
    dispatch({ type: 'STUDENT_MARKS_REQUEST' });

    const { data } = await axios.get(`${process.env.REACT_APP_BASE_URL}/marks/student/${studentId}`); // backend endpoint

    dispatch({ type: 'STUDENT_MARKS_SUCCESS', payload: data });
  } catch (error) {
    dispatch({
      type: 'STUDENT_MARKS_FAIL',
      payload: error.response?.data?.message || error.message,
    });
  }
};


export const getStudentDetailsWithPassword = (id) => async (dispatch) => {
  dispatch(getRequest());
  try {
    const result = await axios.get(`${process.env.REACT_APP_BASE_URL}/Student/${id}/password`);
    if (result.data) {
      dispatch(getStudentDetailsSuccess(result.data));  // ← Use the new action!
    } else {
      dispatch(getError("No student data found"));
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch student details with password';
    dispatch(getError(errorMessage));
  }
}