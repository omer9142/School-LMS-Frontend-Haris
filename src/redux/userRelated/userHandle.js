// src/redux/userRelated/userHandle.js
import axios from 'axios';
import api from '../../api'; // your axios instance with baseURL + interceptors
import {
  authRequest,
  authSuccess,
  authFailed,
  authError,
  authLogout,
  getRequest,
  doneSuccess,
  getError,
  getFailed,    // also for error below
  stuffAdded,
  getSuccess
} from './userSlice';

// Helper to get a nice error message
const getCleanError = (error) =>
  error?.response?.data?.message || error?.message || 'Unknown error';

// loginUser now posts to /Login (backend decides role)
export const loginUser = (fields) => async (dispatch) => {
  dispatch(authRequest());

  try {
    // Post to universal login endpoint
    const { data } = await api.post('/Login', fields);

    // Extract token, role, and user object from response (try all variants)
    const token =
      data?.token ||
      data?.admin?.token ||
      data?.user?.token ||
      data?.student?.token ||
      data?.teacher?.token ||
      '';

    const roleRaw =
      data.role ||
      data.admin?.role ||
      data.user?.role ||
      data.student?.role ||
      data.teacher?.role ||
      '';

    // Normalize role string to "Admin" / "Student" / "Teacher" with capital first letter
    const role = roleRaw
      ? roleRaw.charAt(0).toUpperCase() + roleRaw.slice(1).toLowerCase()
      : '';

    // Extract the user object (fallback to full data object)
    const userObj = data.user || data.admin || data.student || data.teacher || { ...data };

    // Assign normalized role back to user object for redux and localStorage
    if (role) userObj.role = role;

    // Persist token, role, user info to localStorage
    if (token) localStorage.setItem('authToken', token);
    if (role) localStorage.setItem('role', role);
    if (userObj) {
      localStorage.setItem('user', JSON.stringify(userObj));
      localStorage.setItem('userId', userObj._id || userObj.id || '');
    }

    // Set default auth header on axios instance (good for all future requests)
    if (token) api.defaults.headers.common.Authorization = `Bearer ${token}`;

    // Dispatch success with user object payload
    dispatch(authSuccess(userObj));

    // Bootstrap data based on role:
    // Admin, Teacher, Student can all fetch their own dashboards data after login
    const roleLower = role.toLowerCase();

    if (roleLower === 'admin') {
      dispatch(getRequest());
      try {
        const adminId = userObj._id || userObj.id;

        const [
          studentsRes,
          classesRes,
          subjectsRes,
          teachersRes,
          noticesRes,
          complainsRes,
        ] = await Promise.all([
          api.get(`/Students/${adminId}`).then((r) => r.data).catch(() => []),
          api.get(`/SclassList/${adminId}`).then((r) => r.data).catch(() => []),
          api.get(`/AllSubjects/${adminId}`).then((r) => r.data).catch(() => []),
          api.get(`/Teachers/${adminId}`).then((r) => r.data).catch(() => []),
          api.get(`/NoticeList/${adminId}`).then((r) => r.data).catch(() => []),
          api.get(`/ComplainList/${adminId}`).then((r) => r.data).catch(() => []),
        ]);

        const payload = {
          students: studentsRes || [],
          classes: classesRes || [],
          subjects: subjectsRes || [],
          teachers: teachersRes || [],
          notices: noticesRes || [],
          complains: complainsRes || [],
        };

        dispatch(doneSuccess(payload));

        // Optional: persist as fallback
        localStorage.setItem('students', JSON.stringify(payload.students));
        localStorage.setItem('classes', JSON.stringify(payload.classes));
        localStorage.setItem('subjects', JSON.stringify(payload.subjects));
        localStorage.setItem('teachers', JSON.stringify(payload.teachers));
        localStorage.setItem('notices', JSON.stringify(payload.notices));
        localStorage.setItem('complains', JSON.stringify(payload.complains));
      } catch (err) {
        dispatch(getError(getCleanError(err)));
      }
    } else if (roleLower === 'teacher') {
      dispatch(getRequest());
      try {
        const teacherId = userObj._id || userObj.id;

        // Example: fetch teacher specific data (adjust endpoints to your API)
        const [classesRes, subjectsRes, noticesRes] = await Promise.all([
          api.get(`/TeacherClasses/${teacherId}`).then((r) => r.data).catch(() => []),
          api.get(`/TeacherSubjects/${teacherId}`).then((r) => r.data).catch(() => []),
          api.get(`/TeacherNotices/${teacherId}`).then((r) => r.data).catch(() => []),
        ]);

        const payload = {
          classes: classesRes || [],
          subjects: subjectsRes || [],
          notices: noticesRes || [],
        };

        dispatch(doneSuccess(payload));
        // You can persist these if needed
      } catch (err) {
        dispatch(getError(getCleanError(err)));
      }
    } else if (roleLower === 'student') {
      dispatch(getRequest());
      try {
        const studentId = userObj._id || userObj.id;

        // Example: fetch student specific data (adjust endpoints to your API)
        const [homeworkRes, attendanceRes, noticesRes] = await Promise.all([
          api.get(`/StudentHomework/${studentId}`).then((r) => r.data).catch(() => []),
          api.get(`/StudentAttendance/${studentId}`).then((r) => r.data).catch(() => []),
          api.get(`/StudentNotices/${studentId}`).then((r) => r.data).catch(() => []),
        ]);

        const payload = {
          homework: homeworkRes || [],
          attendance: attendanceRes || [],
          notices: noticesRes || [],
        };

        dispatch(doneSuccess(payload));
        // You can persist these if needed
      } catch (err) {
        dispatch(getError(getCleanError(err)));
      }
    }

  } catch (error) {
    // Dispatch authError with cleaned error message
    const message = getCleanError(error);
    dispatch(authError(message));
  }
};

export const registerUser = (fields, role) => async (dispatch) => {
    dispatch(authRequest());

    try {
        const formattedRole = role && role.toString().trim();
        const url = `${process.env.REACT_APP_BASE_URL}/${formattedRole}Reg`;

        console.log('Registering user with URL:', url);
        console.log('Fields:', { ...fields, password: '***HIDDEN***' });

        // Send as JSON data (no file upload)
        const result = await axios.post(url, fields, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const data = result.data || {};
        console.log('Registration success:', data);
        
        if (data.schoolName) {
            dispatch(authSuccess(data));
        } else if (data.school) {
            dispatch(stuffAdded());
        } else {
            dispatch(authFailed(data.message || 'Registration failed'));
        }
    } catch (error) {
        console.error('Registration error:', error.response?.data || error.message);
        dispatch(authError(getCleanError(error)));
    }
};

export const logoutUser = () => (dispatch) => {
    // clear local storage
    localStorage.removeItem('authToken');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    localStorage.removeItem('userId');

    dispatch(authLogout());
};

export const getUserDetails = (id, address) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.get(`${process.env.REACT_APP_BASE_URL}/${address}/${id}`);
        if (result.data) {
            dispatch(doneSuccess(result.data));
        }
    } catch (error) {
        dispatch(getError(getCleanError(error)));
    }
};

export const getStudentDetails = (id) => async (dispatch) => {
    dispatch(getRequest());
    try {
        const result = await axios.get(`${process.env.REACT_APP_BASE_URL}/Student/${id}`);
        if (result.data) {
            dispatch(doneSuccess(result.data));  // goes into student slice
        }
    } catch (error) {
        dispatch(getError(error.message));
    }
};

export const deleteUser = (id, address) => async (dispatch) => {
    dispatch(getRequest());
    try {
        const res = await axios.delete(`${process.env.REACT_APP_BASE_URL}/Teacher/${id}`);  
        dispatch(getSuccess(res.data));
    } catch (error) {
        dispatch(getFailed(error.response?.data?.message || error.message));
    }
};

export const updateUser = (fields, id, address) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.put(`${process.env.REACT_APP_BASE_URL}/${address}/${id}`, fields, {
            headers: { 'Content-Type': 'application/json' },
        });
        const data = result.data || {};
        if (data.schoolName) {
            dispatch(authSuccess(data));
        } else {
            dispatch(doneSuccess(data));
        }
    } catch (error) {
        dispatch(getError(getCleanError(error)));
    }
};

export const addStuff = (fields, address) => async (dispatch) => {
    dispatch(authRequest());

    try {
        const result = await axios.post(`${process.env.REACT_APP_BASE_URL}/${address}Create`, fields, {
            headers: { 'Content-Type': 'application/json' },
        });

        if (result.data && result.data.message) {
            dispatch(authFailed(result.data.message));
        } else {
            dispatch(stuffAdded(result.data));
        }
    } catch (error) {
        dispatch(authError(getCleanError(error)));
    }
};

// ✅ ADD THIS NEW FUNCTION FOR PROFILE PICTURE UPLOAD
export const uploadStudentProfilePicture = (id, formData) => async (dispatch) => {
    dispatch(getRequest()); // Start loading state

    try {
        const result = await axios.post(
            `${process.env.REACT_APP_BASE_URL}/Student/${id}/uploadProfile`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );

        if (result.data && result.data.student) {
            // ✅ Update the current user in Redux with new profile image (this stops loading)
            dispatch(authSuccess(result.data.student));
            
            // Also update localStorage
            localStorage.setItem('user', JSON.stringify(result.data.student));
            
            return { success: true, message: result.data.message };
        } else {
            // ✅ Stop loading state on failure
            dispatch(authFailed(result.data.message || 'Upload failed'));
            return { success: false, message: result.data.message || 'Upload failed' };
        }
    } catch (error) {
        const message = getCleanError(error);
        // ✅ Stop loading state on error
        dispatch(authError(message));
        return { success: false, message };
    }
};

