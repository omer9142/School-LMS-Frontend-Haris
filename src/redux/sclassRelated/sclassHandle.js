import axios from 'axios';
import {
    getRequest,
    getSuccess,
    getFailed,
    getError,
    getStudentsSuccess,
    detailsSuccess,
    getFailedTwo,
    getSubjectsSuccess,
    getSubDetailsSuccess,
    getSubDetailsRequest,
    getUnassignedStudentsSuccess,
    clearUnassignedStudents,

} from './sclassSlice';

export const getAllSclasses = (id, address) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.get(`${process.env.REACT_APP_BASE_URL}/${address}List/${id}`);
        if (result.data.message) {
            dispatch(getFailedTwo(result.data.message));
        } else {
            dispatch(getSuccess(result.data));
        }
    } catch (error) {
        dispatch(getError(error));
    }
}

export const getClassStudents = (id) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.get(`${process.env.REACT_APP_BASE_URL}/Sclass/Students/${id}`);
        if (result.data.message) {
            dispatch(getFailedTwo(result.data.message));
        } else {
            dispatch(getStudentsSuccess(result.data));
        }
    } catch (error) {
        dispatch(getError(error));
    }
}

export const getClassDetails = (id) => async (dispatch) => {
  dispatch(getRequest());
  try {
    const result = await axios.get(`${process.env.REACT_APP_BASE_URL}/sclass/${id}`);
    if (result.data) {
      dispatch(detailsSuccess(result.data));
    }
  } catch (error) {
    dispatch(getError(error.response?.data?.message || error.message));
  }
};


export const getSubjectList = (id, address) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.get(`${process.env.REACT_APP_BASE_URL}/${address}/${id}`);
        if (result.data.message) {
            dispatch(getFailed(result.data.message));
        } else {
            dispatch(getSubjectsSuccess(result.data));
        }
    } catch (error) {
        dispatch(getError(error));
    }
}

export const getTeacherFreeClassSubjects = (id) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.get(`${process.env.REACT_APP_BASE_URL}/FreeSubjectList/${id}`);
        if (result.data.message) {
            dispatch(getFailed(result.data.message));
        } else {
            dispatch(getSubjectsSuccess(result.data));
        }
    } catch (error) {
        dispatch(getError(error));
    }
}

export const getSubjectDetails = (id, address) => async (dispatch) => {
    dispatch(getSubDetailsRequest());

    try {
        const result = await axios.get(`${process.env.REACT_APP_BASE_URL}/${address}/${id}`);
        if (result.data) {
            dispatch(getSubDetailsSuccess(result.data));
        }
    } catch (error) {
        dispatch(getError(error));
    }
}

export const deleteSubject = (id, address) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.delete(`${process.env.REACT_APP_BASE_URL}/${address}/${id}`);
        if (result.data.message) {
            dispatch(getFailed(result.data.message));
        } else {
            dispatch(getSuccess(result.data)); // or stuffDone() if you want to just refresh
        }
    } catch (error) {
        dispatch(getError(error.response?.data?.message || error.message));
    }
};

export const deleteClass = (id, address) => async (dispatch) => {
    dispatch(getRequest());
    try {
        const result = await axios.delete(`${process.env.REACT_APP_BASE_URL}/${address}/${id}`);
        if (result.data.message) {
            dispatch(getFailed(result.data.message));
        } else {
            dispatch(getSuccess(result.data)); 
        }
    } catch (error) {
        dispatch(getError(error.response?.data?.message || error.message));
    }
};

export const removeStudentFromClass = (classId, studentId) => async (dispatch) => {
    dispatch(getRequest());
    try {
        await axios.put(
            `${process.env.REACT_APP_BASE_URL}/Sclass/${classId}/RemoveStudent/${studentId}`
        );
        // After success, re-fetch the students of that class
        dispatch(getClassStudents(classId));
    } catch (error) {
        dispatch(getError(error.response?.data?.message || error.message));
    }
};

// ✅ Fetch all unassigned students of a school
export const getUnassignedStudents = (schoolId) => async (dispatch) => {
  dispatch(getRequest());
  try {
    const result = await axios.get(
      `${process.env.REACT_APP_BASE_URL}/students/unassigned/${schoolId}`
    );
    if (result.data.message) {
      dispatch(getFailedTwo(result.data.message));
      dispatch(clearUnassignedStudents());
    } else {
      // Use the new action specifically for unassigned students
      dispatch(getUnassignedStudentsSuccess(result.data));
    }
  } catch (error) {
    dispatch(getError(error.response?.data?.message || error.message));
    dispatch(clearUnassignedStudents());
  }
};

// ✅ Assign an unassigned student to a class
export const assignStudentToClass = (classId, studentId) => async (dispatch) => {
  dispatch(getRequest());
  try {
    const result = await axios.put(
      `${process.env.REACT_APP_BASE_URL}/sclass/${classId}/assign-student/${studentId}`
    );
    
    // Return success so we can handle it in the component
    dispatch(getSuccess("Student assigned successfully"));
    return { success: true, data: result.data };
    
  } catch (error) {
    dispatch(getError(error.response?.data?.message || error.message));
    return { success: false, error: error.response?.data?.message || error.message };
  }
};

export const deleteAllSubjects = (classId) => async (dispatch) => {
  dispatch(getRequest());
  try {
    const result = await axios.delete(`${process.env.REACT_APP_BASE_URL}/sclass/${classId}/subjects`);
    dispatch(getSuccess(result.data));
  } catch (error) {
    dispatch(getError(error.response?.data?.message || error.message));
  }
};

export const removeAllStudentsFromClass = (classId) => async (dispatch) => {
  dispatch(getRequest()); // Show loading state
  
  try {
    console.log('Removing all students from class:', classId);
    
    const result = await axios.put(
      `${process.env.REACT_APP_BASE_URL}/sclass/${classId}/RemoveAllStudents`
    );
    
    console.log('Remove all students result:', result.data);
    
    // Dispatch success action
    dispatch(getSuccess(result.data));
    
    // Refresh the students list for this class
    dispatch(getClassStudents(classId));
    
    return { success: true, message: result.data.message };
    
  } catch (error) {
    console.error('Remove all students error:', error);
    
    const errorMessage = error.response?.data?.message || error.message;
    dispatch(getError(errorMessage));
    
    return { success: false, error: errorMessage };
  }
};