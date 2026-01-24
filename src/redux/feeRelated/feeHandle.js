// redux/feeRelated/feeHandle.js
import axios from "axios";
import {
  requestStart,
  requestFailed,
  getFeesSuccess,
  getSummarySuccess,
  createFeeSuccess,
  updateFeeSuccess,
  deleteFeeSuccess,
  getStudentFeesSuccess,
} from "./feeSlice";

const BASE = process.env.REACT_APP_BASE_URL || "";

/**
 * Fetch all fees for an admin (includes populated student info)
 * Supports params: { adminID, status, sclass, search, page, limit }
 */
export const fetchFees = (adminID, params = {}) => async (dispatch) => {
  dispatch(requestStart());
  try {
    const query = { 
      adminID,
      limit: 1000, 
      ...params
    };
    const res = await axios.get(`${BASE}/fees`, { params: query });
    if (res.status === 200) {
      dispatch(getFeesSuccess(res.data));
    } else {
      dispatch(requestFailed("Failed to fetch fees"));
    }
  } catch (err) {
    const msg = err.response?.data?.message || err.message;
    dispatch(requestFailed(msg));
  }
};

/**
 * Fetch fee summary
 */
export const fetchFeeSummary = (adminID) => async (dispatch) => {
  dispatch(requestStart());
  try {
    const res = await axios.get(`${BASE}/fees/summary`, { params: { adminID } });
    if (res.status === 200) {
      dispatch(getSummarySuccess(res.data));
    } else {
      dispatch(requestFailed("Failed to fetch summary"));
    }
  } catch (err) {
    const msg = err.response?.data?.message || err.message;
    dispatch(requestFailed(msg));
  }
};

/**
 * Create single fee
 */
export const createFee = (feeData) => async (dispatch) => {
  dispatch(requestStart());
  try {
    const config = { headers: { "Content-Type": "application/json" } };
    const res = await axios.post(`${BASE}/fees/create`, feeData, config);
    if (res.status === 201) {
      dispatch(createFeeSuccess(res.data.fee));
    } else {
      dispatch(requestFailed("Failed to create fee"));
    }
  } catch (err) {
    const msg = err.response?.data?.message || err.message;
    dispatch(requestFailed(msg));
  }
};

/**
 * Bulk create fees (generate challans)
 * payload: { adminID, classIds?: [classId1, classId2], classId?, amount, dueDate, month, remarks }
 * Now supports both single classId (backward compatibility) and multiple classIds
 */
export const createBulkFees = (payload) => async (dispatch) => {
  dispatch(requestStart());
  try {
    const config = { headers: { "Content-Type": "application/json" } };
    const res = await axios.post(`${BASE}/fees/bulk-create`, payload, config);
    if (res.status === 201) {
      // Log the response for debugging
      console.log("Bulk fees created:", res.data);
      
      // Refresh data
      dispatch(fetchFeeSummary(payload.adminID));
      dispatch(fetchFees(payload.adminID));
      
      return res.data;
    } else {
      dispatch(requestFailed("Failed to create bulk fees"));
    }
  } catch (err) {
    const msg = err.response?.data?.message || err.message;
    dispatch(requestFailed(msg));
    throw err;
  }
};

/**
 * Update a fee record
 */
export const updateFee = (feeID, updateData) => async (dispatch) => {
  dispatch(requestStart());
  try {
    const res = await axios.put(`${BASE}/fees/${feeID}`, updateData);
    if (res.status === 200) {
      dispatch(updateFeeSuccess(res.data.fee));
      return res.data.fee;
    } else {
      dispatch(requestFailed("Failed to update fee"));
    }
  } catch (err) {
    const msg = err.response?.data?.message || err.message;
    dispatch(requestFailed(msg));
    throw err;
  }
};

/**
 * Delete a fee record
 */
export const deleteFee = (feeID) => async (dispatch) => {
  dispatch(requestStart());
  try {
    const res = await axios.delete(`${BASE}/fees/${feeID}`);
    if (res.status === 200) {
      dispatch(deleteFeeSuccess(feeID));
    } else {
      dispatch(requestFailed("Failed to delete fee"));
    }
  } catch (err) {
    const msg = err.response?.data?.message || err.message;
    dispatch(requestFailed(msg));
    throw err;
  }
};

/**
 * Mark overdue fees (manual trigger, optionally pass adminID)
 */
export const markOverdueFees = (adminID) => async (dispatch) => {
  dispatch(requestStart());
  try {
    const res = await axios.post(`${BASE}/fees/mark-overdue`, null, { params: { adminID } });
    if (res.status === 200) {
      // refresh
      if (adminID) {
        dispatch(fetchFeeSummary(adminID));
        dispatch(fetchFees(adminID));
      }
      return res.data;
    } else {
      dispatch(requestFailed("Failed to mark overdue"));
    }
  } catch (err) {
    const msg = err.response?.data?.message || err.message;
    dispatch(requestFailed(msg));
    throw err;
  }
};

export const fetchStudentFees = (studentId) => async (dispatch) => {
  dispatch(requestStart());
  try {
    const res = await axios.get(`${BASE}/fees/student/${studentId}`);
    if (res.status === 200) {
      dispatch(getStudentFeesSuccess(res.data));
    } else {
      dispatch(requestFailed("Failed to fetch your fees"));
    }
  } catch (err) {
    const msg = err.response?.data?.message || err.message;
    dispatch(requestFailed(msg));
  }
};