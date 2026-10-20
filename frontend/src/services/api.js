import axios from 'axios';
import toast from 'react-hot-toast';

// Dynamic base URL detection for both Vite, Create React App, and Live Render fallback
const getBaseURL = () => {
  // Check for Vite environment variable protocol
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) {
    const url = import.meta.env.VITE_API_URL;
    return url.endsWith('/api') ? url : `${url}/api`;
  }
  
  // Check for Create React App environment variable protocol
  if (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_URL) {
    const url = process.env.REACT_APP_API_URL;
    return url.endsWith('/api') ? url : `${url}/api`;
  }
  
  // Hardcoded fallback straight to your live deployment to prevent relative-path 405 errors
  return 'https://onrender.com';
};

const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 30000
});

// Request interceptor
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  error => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  response => response,
  error => {
    const message = error.response?.data?.message || 'Something went wrong';

    // Prevent endless redirection loop if the user is already on the login page
    if (error.response?.status === 401 && window.location.pathname !== '/login') {
      localStorage.removeItem('token');
      window.location.href = '/login';
    } else if (error.response?.status !== 400 && error.response?.status !== 401) {
      // Don't auto-toast validation or auth errors, let components handle them
      toast.error(message);
    }

    return Promise.reject(error);
  }
);

export default api;
