import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

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

// Queue for pending requests while refresh token is being resolved
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response interceptor to catch 401s and silently refresh tokens
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If no response or not a 401, reject immediately
    if (!error.response || error.response.status !== 401 || !originalRequest) {
      return Promise.reject(error);
    }

    const requestUrl = originalRequest.url || '';

    // Do not attempt token refresh on auth endpoints (login, register, refresh)
    if (
      requestUrl.includes('/auth/login') ||
      requestUrl.includes('/auth/register') ||
      requestUrl.includes('/auth/refresh') ||
      originalRequest._retry
    ) {
      if (requestUrl.includes('/auth/refresh') || originalRequest._retry) {
        localStorage.removeItem('framelog_token');
      }
      return Promise.reject(error);
    }

    // If refresh is already in progress, wait in queue
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          if (token && originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return apiClient(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // Call refresh endpoint directly using clean axios instance with cookies
      const refreshResponse = await axios.post<{
        success: boolean;
        data?: { accessToken: string };
      }>(
        `${API_BASE_URL}/auth/refresh`,
        {},
        {
          withCredentials: true,
          headers: { 'Content-Type': 'application/json' },
        }
      );

      const newAccessToken = refreshResponse.data?.data?.accessToken;
      if (!newAccessToken) {
        throw new Error('No access token returned from refresh');
      }

      // Save new token
      localStorage.setItem('framelog_token', newAccessToken);
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;

      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      }

      processQueue(null, newAccessToken);
      return apiClient(originalRequest);
    } catch (refreshErr) {
      processQueue(refreshErr as Error, null);
      localStorage.removeItem('framelog_token');

      // If user is currently on an authenticated /app route, redirect to login
      if (window.location.pathname.startsWith('/app')) {
        window.location.href = '/login';
      }

      return Promise.reject(refreshErr);
    } finally {
      isRefreshing = false;
    }
  }
);

export default apiClient;
