import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Attach Bearer token to all outgoing requests if token is in localStorage
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('framelog_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to catch unauthorized responses
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // If unauthorized and we have a token, it might be expired
      // Do not auto-redirect if we are already on login/register
      const currentPath = window.location.pathname;
      if (currentPath.startsWith('/app')) {
        localStorage.removeItem('framelog_token');
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
