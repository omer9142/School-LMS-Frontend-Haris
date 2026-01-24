import axios from 'axios';
import {
  createRequest,
  createSuccess,
  createFailed,
  createError,
  getListSuccess,
  updateSuccess,
  deleteSuccess,
} from './financeSlice';

const BASE = process.env.REACT_APP_BASE_URL || '';

/**
 * registerFinance - admin creates a finance user
 * @param {Object} financeData - { name, email, password, adminID, school }
 */
export const registerFinance = (financeData) => async (dispatch) => {
  dispatch(createRequest());

  try {
    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    console.log('📤 Sending create request:', financeData);
    const res = await axios.post(`${BASE}/FinanceReg`, financeData, config);
    console.log('✅ Create response:', res.data);

    if (res.data && res.status >= 200 && res.status < 300) {
      dispatch(createSuccess(res.data));
    } else {
      dispatch(createFailed('Failed to create finance user'));
    }
  } catch (err) {
    console.error('❌ Create error:', err);
    const message = err.response?.data?.message || err.message || 'Failed to create finance user';
    dispatch(createError(message));
  }
};

/**
 * getFinanceByAdmin - fetch all finance accounts for an admin
 * @param {String} adminID
 */
export const getFinanceByAdmin = (adminID) => async (dispatch) => {
  dispatch(createRequest());

  try {
    console.log('📤 Fetching finance list for admin:', adminID);
    const res = await axios.get(`${BASE}/FinanceByAdmin/${adminID}`);
    console.log('✅ Fetch response:', res.data);

    if (res.data && res.status === 200) {
      // Dispatch with array of finance accounts
      dispatch(getListSuccess(Array.isArray(res.data) ? res.data : []));
    } else {
      dispatch(createFailed("No finance records found"));
    }
  } catch (err) {
    console.error('❌ Fetch error:', err);
    const message =
      err.response?.data?.message || err.message || "Failed to fetch finance accounts";
    dispatch(createError(message));
  }
};

/**
 * updateFinance - update an existing finance account (admin action)
 * @param {String} financeID
 * @param {Object} updateData - { name, email, password (optional) }
 */
export const updateFinance = (financeID, updateData) => async (dispatch) => {
  dispatch(createRequest());

  try {
    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    console.log('📤 Sending update request:', financeID, updateData);
    const res = await axios.put(`${BASE}/FinanceUpdate/${financeID}`, updateData, config);
    console.log('✅ Update response:', res.data);

    if (res.data && res.status === 200) {
      dispatch(updateSuccess(res.data));
    } else {
      dispatch(createFailed('Failed to update finance account'));
    }
  } catch (err) {
    console.error('❌ Update error:', err);
    const message = err.response?.data?.message || err.message || 'Failed to update finance account';
    dispatch(createError(message));
  }
};

/**
 * updateFinanceProfile - finance user updates their own profile
 * @param {String} financeId
 * @param {Object} updateData - { name, email, currentPassword, newPassword }
 */
export const updateFinanceProfile = (financeId, updateData) => async (dispatch) => {
  dispatch(createRequest());

  try {
    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    console.log('📤 Updating finance profile:', financeId, updateData);
    const res = await axios.put(`${BASE}/FinanceProfileUpdate/${financeId}`, updateData, config);
    console.log('✅ Profile update response:', res.data);

    if (res.data && res.status === 200) {
      // Dispatch success with the updated finance data
      dispatch(updateSuccess(res.data));
      
      // Also update the current user in user state
      // Assuming your user slice has an action to update current user
      if (res.data.finance) {
        dispatch({
          type: 'user/updateCurrentUser',
          payload: res.data.finance,
        });
        
        // Update localStorage if needed
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
        if (userInfo && userInfo.user) {
          userInfo.user = { ...userInfo.user, ...res.data.finance };
          localStorage.setItem('userInfo', JSON.stringify(userInfo));
        }
      }
      
      return res.data;
    } else {
      dispatch(createFailed('Failed to update profile'));
      throw new Error('Failed to update profile');
    }
  } catch (err) {
    console.error('❌ Profile update error:', err);
    const message = err.response?.data?.message || err.message || 'Failed to update profile';
    dispatch(createError(message));
    throw new Error(message);
  }
};

/**
 * deleteFinance - delete a finance account
 * @param {String} financeID
 * @param {String} adminID - for refreshing the list after deletion
 */
export const deleteFinance = (financeID, adminID) => async (dispatch) => {
  dispatch(createRequest());

  try {
    console.log('📤 Sending delete request:', financeID);
    const res = await axios.delete(`${BASE}/FinanceDelete/${financeID}`);
    console.log('✅ Delete response:', res.data);

    if (res.data && res.status === 200) {
      dispatch(deleteSuccess(res.data));
      // Refresh the list after successful deletion
      if (adminID) {
        setTimeout(() => {
          dispatch(getFinanceByAdmin(adminID));
        }, 500);
      }
    } else {
      dispatch(createFailed('Failed to delete finance account'));
    }
  } catch (err) {
    console.error('❌ Delete error:', err);
    const message = err.response?.data?.message || err.message || 'Failed to delete finance account';
    dispatch(createError(message));
  }
};

export const loginFinance = (credentials) => async (dispatch) => {
  dispatch(createRequest());

  try {
    const config = {
      headers: { 'Content-Type': 'application/json' },
    };

    console.log('📤 Logging in finance user:', credentials);
    const res = await axios.post(`${BASE}/Login`, credentials, config);
    console.log('✅ Finance login response:', res.data);

    if (res.data && res.status === 200) {
      dispatch(createSuccess(res.data));
      localStorage.setItem('financeInfo', JSON.stringify(res.data));
    } else {
      dispatch(createFailed('Finance login failed'));
    }
  } catch (err) {
    console.error('❌ Finance login error:', err);
    const message = err.response?.data?.message || err.message || 'Finance login failed';
    dispatch(createError(message));
  }
};