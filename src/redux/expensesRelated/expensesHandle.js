import axios from 'axios';
import {
    getRequest,
    getSuccess,
    getSummarySuccess,
    addSuccess,
    updateSuccess,
    deleteSuccess,
    getFailed,
    getError
} from './expensesSlice';

export const getAllExpenses = (id, filters = {}) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const { month, category, search } = filters;
        const params = {};
        if (month) params.month = month;
        if (category && category !== 'all') params.category = category;
        if (search) params.search = search;

        const result = await axios.get(
            `${process.env.REACT_APP_BASE_URL}/Expenses/${id}`,
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

export const getExpenseSummary = (id, month) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const params = month ? { month } : {};
        const result = await axios.get(
            `${process.env.REACT_APP_BASE_URL}/ExpenseSummary/${id}`,
            { params }
        );

        dispatch(getSummarySuccess(result.data));
    } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || 'Failed to load expense summary';
        dispatch(getError(errorMessage));
    }
}

export const addNewExpense = (expenseData) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.post(
            `${process.env.REACT_APP_BASE_URL}/ExpenseCreate`,
            expenseData
        );
        
        dispatch(addSuccess(result.data));
    } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || 'Failed to add expense';
        dispatch(getError(errorMessage));
    }
}

export const updateExpenseDetails = (expenseId, expenseData) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.put(
            `${process.env.REACT_APP_BASE_URL}/updateExpense/${expenseId}`,
            expenseData
        );
        
        dispatch(updateSuccess(result.data));
    } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || 'Failed to update expense';
        dispatch(getError(errorMessage));
    }
}

export const deleteExpenseRecord = (expenseId, adminId) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.delete(
            `${process.env.REACT_APP_BASE_URL}/deleteExpense/${expenseId}`
        );
        
        dispatch(deleteSuccess(result.data));
        // Refresh the list
        dispatch(getAllExpenses(adminId));
    } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || 'Failed to delete expense';
        dispatch(getError(errorMessage));
    }
}