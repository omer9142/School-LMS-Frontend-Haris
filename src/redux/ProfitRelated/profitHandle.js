import axios from 'axios';
import {
    getRequest,
    getSuccess,
    getFailed,
    getError
} from './profitSlice';


export const getProfitSummary = (identifier, filters = {}, isSchoolName = false) => async (dispatch) => {
    dispatch(getRequest());

    try {
        // Build query params
        const params = new URLSearchParams();
        if (filters.startDate) params.append('startDate', filters.startDate);
        if (filters.endDate) params.append('endDate', filters.endDate);
        if (filters.month) params.append('month', filters.month);

        const queryString = params.toString();
        
        // Choose endpoint based on whether it's a school name or ID
        let url;
        if (isSchoolName) {
            // For Finance users - use school name
            url = `${process.env.REACT_APP_BASE_URL}/finance/profit-summary-by-name/${encodeURIComponent(identifier)}${queryString ? `?${queryString}` : ''}`;
        } else {
            // For Admin users - use school ID
            url = `${process.env.REACT_APP_BASE_URL}/finance/profit-summary/${identifier}${queryString ? `?${queryString}` : ''}`;
        }
        
        console.log('Fetching profit summary for:', identifier);
        console.log('URL:', url);
        
        const result = await axios.get(url);
        
        if (result.data.message) {
            dispatch(getFailed(result.data.message));
        } else {
            dispatch(getSuccess(result.data));
        }
    } catch (error) {
        console.error('Error fetching profit summary:', error);
        dispatch(getError(error.response?.data?.message || error.message || 'Network Error'));
    }
};