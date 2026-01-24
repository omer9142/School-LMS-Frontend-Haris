import axios from 'axios';
import {
    getRequest,
    getSuccess,
    getFailed,
    getError
} from './noticeSlice';

export const getAllNotices = (id, address, role = null) => async (dispatch) => {
    dispatch(getRequest());

    try {
        let url = `${process.env.REACT_APP_BASE_URL}/${address}List/${id}`;
        
        // Add role query parameter if provided
        if (role) {
            url += `?role=${role}`;
        }
        
        const result = await axios.get(url);
        
        if (result.data.message) {
            dispatch(getFailed(result.data.message));
        } else {
            dispatch(getSuccess(result.data));
        }
    } catch (error) {
        dispatch(getError(error));
    }
}

export const deleteNotice = (noticeId) => async (dispatch) => {
    try {
        await axios.delete(`${process.env.REACT_APP_BASE_URL}/Notice/${noticeId}`);
        // no need to dispatch here, component will refetch notices
    } catch (error) {
        console.error("Delete notice error:", error.response?.data || error.message);
        dispatch(getError(error));
        throw error;
    }
};