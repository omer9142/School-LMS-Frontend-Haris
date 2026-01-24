// redux/attendanceTrackerRelated/attendanceTrackerHandle.js
import axios from "axios";
import {
  getRequest,
  getSuccess,
  getRangeSuccess,
  getFailed,
  getDetailsSuccess,
  getDetailsFailed,
} from "./attendanceTrackerSlice";

const REACT_APP_BASE_URL = process.env.REACT_APP_BASE_URL || "";

export const getDailyAttendanceTracker = (date) => async (dispatch, getState) => {
  dispatch(getRequest());
  try {
    const { token } = getState().user;
    const response = await axios.get(
      `${REACT_APP_BASE_URL}/Admin/Tracker/Daily?date=${date}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    dispatch(getSuccess(response.data));
  } catch (error) {
    dispatch(getFailed(error.response?.data?.message || error.message));
  }
};

export const getAttendanceTrackerRange = (startDate, endDate, classId = null) => 
  async (dispatch, getState) => {
    dispatch(getRequest());
    try {
      const { token } = getState().user;
      let url = `${REACT_APP_BASE_URL}/Admin/Tracker/Range?startDate=${startDate}&endDate=${endDate}`;
      
      if (classId) {
        url += `&classId=${classId}`;
      }

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      dispatch(getRangeSuccess(response.data));
    } catch (error) {
      dispatch(getFailed(error.response?.data?.message || error.message));
    }
  };

// 🆕 NEW: Get class attendance details for a specific class and date
export const getClassAttendanceDetails = (sclassId, date) => async (dispatch, getState) => {
  try {
    const { token } = getState().user;
    const response = await axios.get(
      `${REACT_APP_BASE_URL}/Attendance/class-details?sclassId=${sclassId}&date=${date}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    
    console.log("Class Attendance Details Response:", response.data);
    return response.data; // Return the data directly
  } catch (error) {
    console.error("Error fetching class attendance details:", error);
    throw error;
  }
};