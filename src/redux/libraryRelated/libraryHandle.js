import axios from 'axios';
import {
    getRequest,
    getSuccess,
    getSalesSuccess,
    getFailed,
    getError,
    stuffAdded,
    bookSold
} from './librarySlice';

// 1️⃣ FETCH ALL BOOKS
export const getAllBooks = (schoolId) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.get(`${process.env.REACT_APP_BASE_URL}/library/books/${schoolId}`);
        
        if (result.data.message) {
            dispatch(getFailed(result.data.message));
        } else {
            dispatch(getSuccess(result.data));
        }
    } catch (error) {
        dispatch(getError(error.response?.data?.message || error.message || 'Network Error'));
    }
};

// 2️⃣ CREATE A NEW BOOK
export const createBook = (bookData) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.post(
            `${process.env.REACT_APP_BASE_URL}/library/book`,
            bookData
        );
        
        if (result.data.message && result.data.message.includes('error')) {
            dispatch(getError(result.data.message));
        } else {
            dispatch(stuffAdded());
        }
    } catch (error) {
        dispatch(getError(error.response?.data?.message || error.message || 'Network Error'));
    }
};

// 3️⃣ SELL A BOOK
export const sellBook = (saleData) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.post(
            `${process.env.REACT_APP_BASE_URL}/library/sell`,
            saleData
        );
        
        if (result.data.message === 'Book sold successfully') {
            dispatch(bookSold());
        } else if (result.data.message) {
            dispatch(getError(result.data.message));
        }
    } catch (error) {
        dispatch(getError(error.response?.data?.message || error.message || 'Network Error'));
    }
};

// 4️⃣ FETCH ALL BOOK SALES
export const getAllBookSales = (schoolId) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.get(`${process.env.REACT_APP_BASE_URL}/library/sales/${schoolId}`);
        
        if (result.data.message) {
            dispatch(getFailed(result.data.message));
        } else {
            dispatch(getSalesSuccess(result.data));
        }
    } catch (error) {
        dispatch(getError(error.response?.data?.message || error.message || 'Network Error'));
    }
};

// 5️⃣ UPDATE A BOOK
export const updateBook = (bookId, bookData) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.put(
            `${process.env.REACT_APP_BASE_URL}/library/book/${bookId}`,
            bookData
        );
        
        if (result.data.message && result.data.message.includes('error')) {
            dispatch(getError(result.data.message));
        } else {
            dispatch(stuffAdded()); // Reuse stuffAdded for updates
        }
    } catch (error) {
        dispatch(getError(error.response?.data?.message || error.message || 'Network Error'));
    }
};

// 6️⃣ DELETE A BOOK
export const deleteBook = (bookId) => async (dispatch) => {
    dispatch(getRequest());

    try {
        await axios.delete(`${process.env.REACT_APP_BASE_URL}/library/book/${bookId}`);
        dispatch(stuffAdded()); // Trigger refresh after delete
    } catch (error) {
        dispatch(getError(error.response?.data?.message || error.message || 'Network Error'));
    }
};