// utils/axiosConfig.js
import axios from 'axios';
import { getAccessToken, getRefreshToken, removeToken } from './auth';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_DJANGO_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = getRefreshToken();
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        const response = await axios.post(
          `${import.meta.env.VITE_DJANGO_BASE_URL}/api/token/refresh/`,
          { refresh: refreshToken },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        if (response.data.access) {
          // Save the new access token
          localStorage.setItem('access_token', response.data.access);
          
          // If your backend returns a new refresh token (when ROTATE_REFRESH_TOKENS=True)
          if (response.data.refresh) {
            localStorage.setItem('refresh_token', response.data.refresh);
          }

          // Update the authorization header
          originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
          
          // Dispatch auth change event
          window.dispatchEvent(new CustomEvent('auth-change'));
          
          // Retry the original request
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed - logout user
        console.error('Token refresh failed:', refreshError);
        removeToken();
        window.dispatchEvent(new CustomEvent('unauthorized'));
        
        // Only redirect to login if not already on login page
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;