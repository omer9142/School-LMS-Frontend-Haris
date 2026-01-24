// src/api.js
import axios from 'axios';
import store from './redux/store'; // adjust path to your store
import { authLogout } from './redux/userRelated/userSlice';

const baseURL = process.env.REACT_APP_BASE_URL || 'https://school-lms-backend-1.onrender.com';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// attach token from localStorage for every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// handle 401 globally (optional)
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response && err.response.status === 401) {
      // optional: dispatch logout to clear store/localStorage
      try {
        store.dispatch(authLogout());
      } catch (e) { /* ignore if circular import */ }
    }
    return Promise.reject(err);
  }
);

export default api;
