import axios from 'axios';
import {
    getRequest,
    getSuccess,
    getSummarySuccess,
    addOrUpdateSuccess,
    updateStatusSuccess,
    deleteSuccess,
    getFailed,
    getError
} from './salariesSlice';

export const getAllSalaries = (id, filters = {}) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const { month, status } = filters;
        const params = {};
        if (month) params.month = month;
        if (status && status !== 'all') params.status = status;

        const result = await axios.get(
            `${process.env.REACT_APP_BASE_URL}/Salaries/${id}`,
            { params }
        );

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

export const getSalarySummary = (id, month) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const params = month ? { month } : {};
        const result = await axios.get(
            `${process.env.REACT_APP_BASE_URL}/SalarySummary/${id}`,
            { params }
        );

        dispatch(getSummarySuccess(result.data));
    } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || 'Failed to load salary summary';
        dispatch(getError(errorMessage));
    }
}

export const getTeacherSalaryHistory = (schoolId, teacherId) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.get(
            `${process.env.REACT_APP_BASE_URL}/TeacherSalaryHistory/${schoolId}/${teacherId}`
        );

        if (result.data.message) {
            dispatch(getFailed(result.data.message));
        } else {
            // Return data for component use
            return result.data;
        }
    } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || 'Failed to load salary history';
        dispatch(getError(errorMessage));
        throw error;
    }
}

export const createOrUpdateSalary = (salaryData) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.post(
            `${process.env.REACT_APP_BASE_URL}/SalaryCreate`,
            salaryData
        );
        
        dispatch(addOrUpdateSuccess(result.data));
        return result.data;
    } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || 'Failed to save salary record';
        dispatch(getError(errorMessage));
        throw error;
    }
}

export const updateSalaryStatus = (salaryId, statusData) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.put(
            `${process.env.REACT_APP_BASE_URL}/updateSalaryStatus/${salaryId}`,
            statusData
        );
        
        dispatch(updateStatusSuccess(result.data));
        return result.data;
    } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || 'Failed to update salary status';
        dispatch(getError(errorMessage));
        throw error;
    }
}

export const updateMultipleSalariesStatus = (salaryIds, statusData, adminId) => async (dispatch) => {
    dispatch(getRequest());

    try {
        await axios.put(
            `${process.env.REACT_APP_BASE_URL}/updateMultipleSalariesStatus`,
            { salaryIds, ...statusData }
        );
        
        // Refresh the list
        dispatch(getAllSalaries(adminId));
    } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || 'Failed to update salaries';
        dispatch(getError(errorMessage));
        throw error;
    }
}

export const deleteSalaryRecord = (salaryId, adminId) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.delete(
            `${process.env.REACT_APP_BASE_URL}/deleteSalary/${salaryId}`
        );
        
        dispatch(deleteSuccess(result.data));
        // Refresh the list
        dispatch(getAllSalaries(adminId));
    } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || 'Failed to delete salary record';
        dispatch(getError(errorMessage));
    }
}