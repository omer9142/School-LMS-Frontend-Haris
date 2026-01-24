import axios from 'axios';
import {
  getRequest,
  getSuccess,
  getFailed,
  updateRequest,
  updateSuccess,
  updateFailed
} from './studentHealthSlice';

// Admin/Teacher: Get Health Info for a Student
export const getStudentHealthInfo = (studentId) => async (dispatch) => {
  dispatch(getRequest());
  try {
    const { data } = await axios.get(
      `${process.env.REACT_APP_BASE_URL}/health/${studentId}`
    );
    
    if (data.success) {
      dispatch(getSuccess(data.data));
    } else {
      dispatch(getFailed(data.message));
    }
  } catch (error) {
    dispatch(getFailed(error.response?.data?.message || error.message));
  }
};

// Student: Get Own Health Info
export const getOwnHealthInfo = (studentId) => async (dispatch) => {
  dispatch(getRequest());
  try {
    const { data } = await axios.post(
      `${process.env.REACT_APP_BASE_URL}/health/me/own`,
      { studentId },
      { headers: { 'Content-Type': 'application/json' } }
    );
    
    if (data.success) {
      dispatch(getSuccess(data.data));
    } else {
      dispatch(getFailed(data.message));
    }
  } catch (error) {
    dispatch(getFailed(error.response?.data?.message || error.message));
  }
};

// Admin/Teacher: Create or Update Health Info
export const createOrUpdateHealthInfo = (studentId, healthData, currentUser) => async (dispatch) => {
  dispatch(updateRequest());
  
  try {
    console.log('Current User:', currentUser); // Debug log
    
    if (!currentUser || !currentUser._id || !currentUser.role) {
      throw new Error('User information is missing');
    }

    // Add admin ID and role to the request body
    const payload = {
      ...healthData,
      adminId: currentUser._id,
      role: currentUser.role
    };

    console.log('Sending payload:', payload); // Debug log

    const result = await axios.post(
      `${process.env.REACT_APP_BASE_URL}/health/${studentId}`,
      payload,
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );
    
    if (result.data.success) {
      dispatch(updateSuccess(result.data.data));
      return { success: true, message: result.data.message };
    } else {
      dispatch(updateFailed(result.data.message));
      return { success: false, message: result.data.message };
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to update health information';
    console.error('Error:', errorMessage); // Debug log
    dispatch(updateFailed(errorMessage));
    return { success: false, message: errorMessage };
  }
};