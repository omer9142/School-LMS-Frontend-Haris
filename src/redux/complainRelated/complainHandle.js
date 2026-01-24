// redux/complainRelated/complainHandle.js
import axios from 'axios';
import {
    getRequest,
    getSuccess,
    getFailed,
    getError
} from './complainSlice';

export const getAllComplains = (id, address) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.get(`${process.env.REACT_APP_BASE_URL}/Complains/${id}`);

        if (result.data.message) {
            dispatch(getFailed(result.data.message));
        } else {
            dispatch(getSuccess(result.data));
        }
    } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || 'Something went wrong';
        dispatch(getError(errorMessage));
    }
}

export const updateComplainStatus = (complainId, status) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.put(`${process.env.REACT_APP_BASE_URL}/updateComplain/${complainId}`, { status });
        
        // After successful update, refresh the list to get updated data
        dispatch(getAllComplains(result.data.school, "Complain"));
    } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || 'Failed to update status';
        dispatch(getError(errorMessage));
    }
}

export const updateMultipleComplainsStatus = (complainIds, status, adminId) => async (dispatch) => {
    dispatch(getRequest());

    try {
        await axios.put(`${process.env.REACT_APP_BASE_URL}/updateMultipleComplains`, { 
            complainIds, 
            status 
        });
        
        // Refresh the list after bulk update
        dispatch(getAllComplains(adminId, "Complain"));
    } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || 'Failed to update complaints';
        dispatch(getError(errorMessage));
    }
}

export const deleteComplain = (complainId, adminId) => async (dispatch) => {
    dispatch(getRequest());

    try {
        await axios.delete(`${process.env.REACT_APP_BASE_URL}/deleteComplain/${complainId}`);
        
        // Refresh the list after deletion
        dispatch(getAllComplains(adminId, "Complain"));
    } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || 'Failed to delete complaint';
        dispatch(getError(errorMessage));
    }
}