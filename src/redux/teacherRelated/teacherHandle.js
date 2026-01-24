// redux/teacherRelated/teacherHandle.js
import axios from 'axios';
import api from '../../api.js';
import {
    getRequest,
    getSuccess,
    getFailed,
    getError,
    postDone,
    doneSuccess,
    teacherRequest,
    teacherSuccess,
    teacherFail,
    addingStarted,
    addedSuccess,
    addFailed
} from './teacherSlice';

export const getAllTeachers = (id) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.get(`${process.env.REACT_APP_BASE_URL}/Teachers/${id}`);
        if (result.data.message) {
            dispatch(getFailed(result.data.message));
        } else {
            dispatch(getSuccess(result.data));
        }
    } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch teachers';
        dispatch(getError(errorMessage));
    }
}

export const getTeacherDetails = (id) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.get(`${process.env.REACT_APP_BASE_URL}/Teacher/${id}`);
        if (result.data) {
            dispatch(doneSuccess(result.data));
        } else {
            dispatch(getError("No teacher data found"));
        }
    } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch teacher details';
        dispatch(getError(errorMessage));
    }
}
export const getTeacherDetailsWithPassword = (id) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.get(`${process.env.REACT_APP_BASE_URL}/Teacher/${id}/password`);
        if (result.data) {
            dispatch(doneSuccess(result.data));
        } else {
            dispatch(getError("No teacher data found"));
        }
    } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch teacher details with password';
        dispatch(getError(errorMessage));
    }
}
export const assignTeacherToClass = (teacherId, sclassId) => async (dispatch) => {
    try {
        dispatch(teacherRequest());
        
        const { data } = await api.put("/assign-class", 
            { teacherId, sclassId },
            { headers: { "Content-Type": "application/json" } }
        );
        
        dispatch(teacherSuccess(data));
        // Refresh teacher details to get updated data
        dispatch(getTeacherDetails(teacherId));
        return data;
    } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || 'Failed to assign teacher to class';
        dispatch(teacherFail(errorMessage));
        throw error;
    }
};

export const updateTeachSubject = (teacherId, subjectId) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.put(
            `${process.env.REACT_APP_BASE_URL}/TeacherSubject`,
            { teacherId, subjectId },
            { headers: { 'Content-Type': 'application/json' } }
        );
        dispatch(postDone());
        // Refresh teacher details
        dispatch(getTeacherDetails(teacherId));
        return result.data;
    } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || 'Failed to update subjects';
        dispatch(getError(errorMessage));
        throw error;
    }
};

export const updateTeacherDetails = (teacherId, updatedData) => async (dispatch) => {
    try {
        dispatch(teacherRequest());

        const { data } = await axios.put(
            `${process.env.REACT_APP_BASE_URL}/Teacher/${teacherId}`,
            updatedData,
            { headers: { 'Content-Type': 'application/json' } }
        );

        dispatch(teacherSuccess(data));
        // Refresh teacher details
        dispatch(getTeacherDetails(teacherId));
        return data;
    } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || 'Failed to update teacher';
        dispatch(teacherFail(errorMessage));
        throw error;
    }
};

export const registerUser = (fields, role) => async (dispatch) => {
    try {
        dispatch(addingStarted());
        const { data } = await axios.post(
            `${process.env.REACT_APP_BASE_URL}/${role}Reg`,
            fields,
            { headers: { 'Content-Type': 'application/json' } }
        );
        dispatch(addedSuccess(data));
        return data;
    } catch (err) {
        const payload = err.response?.data || { message: err.message || 'Failed to register teacher' };
        dispatch(addFailed(payload));
        throw err;
    }
};

export const removeTeacherSubjects = (teacherId, subjectIds) => async (dispatch) => {
    dispatch(teacherRequest());
    try {
        const { data } = await api.put("/remove-subject", { teacherId, subjectIds });
        dispatch(teacherSuccess(data));
        // Refresh teacher details
        dispatch(getTeacherDetails(teacherId));
        return data;
    } catch (err) {
        const errorMessage = err.response?.data?.message || err.message || 'Failed to remove subjects';
        dispatch(teacherFail(errorMessage));
        throw err;
    }
};

// ✅ FIXED: assignClassTeacher action
export const assignClassTeacher = (teacherId, classId) => async (dispatch) => {
    try {
        dispatch(teacherRequest());
        const { data } = await api.put("/assign-class-teacher", { teacherId, classId });
        dispatch(teacherSuccess(data));
        // Refresh teacher details to get updated classTeacherOf
        dispatch(getTeacherDetails(teacherId));
        return data;
    } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || 'Failed to assign class teacher';
        dispatch(teacherFail(errorMessage));
        throw error;
    }
};

// ✅ FIXED: removeClassTeacherAction
export const removeClassTeacherAction = (teacherId, classId) => async (dispatch) => {
  try {
    dispatch(teacherRequest());
    const { data } = await api.put("/remove-class-teacher", { teacherId, classId });
    dispatch(teacherSuccess(data));
    dispatch(getTeacherDetails(teacherId));
    return data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to remove class teacher';
    dispatch(teacherFail(errorMessage));
    throw error;
  }
};

// NEW: Remove teacher from a class (not just class teacher role)
export const removeTeacherFromClass = (teacherId, classId) => async (dispatch) => {
    try {
        dispatch(teacherRequest());
        
        const { data } = await api.put("/remove-teacher-from-class", 
            { teacherId, classId },
            { headers: { "Content-Type": "application/json" } }
        );
        
        dispatch(teacherSuccess(data));
        // Refresh teacher details to get updated data
        dispatch(getTeacherDetails(teacherId));
        return data;
    } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || 'Failed to remove teacher from class';
        dispatch(teacherFail(errorMessage));
        throw error;
    }
};