import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../store/auth-store';

// Set up base API URL with fallback
const API_URL = (import.meta.env.VITE_API_URL as string) || 'http://localhost:5000/api';

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Crucial for receiving/sending secure HTTP-only cookies (e.g., refresh token)
});

// CSRF token support (if present in document cookies, axios can auto-extract, but we configure it explicitly)
apiClient.defaults.xsrfCookieName = 'XSRF-TOKEN';
apiClient.defaults.xsrfHeaderName = 'X-XSRF-TOKEN';

// Queue to hold requests that failed due to 401 while refreshing the token
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: string | PromiseLike<string>) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (token) {
      prom.resolve(token);
    } else {
      prom.reject(error);
    }
  });

  failedQueue = [];
};

// Request Interceptor: Attach the in-memory access token to every request
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().accessToken;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle 401 errors, token refreshes, and automatic logout
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // Check if error is 401 (Unauthorized) and we haven't already retried this request
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If refresh is already in progress, queue this request
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Request a new access token from the backend refresh endpoint
        // In a real backend, this endpoint reads the secure HTTP-only cookie
        const response = await axios.post<{ data: { accessToken: string } }>(
          `${API_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const newAccessToken = response.data.data.accessToken;
        
        // Update store with new token (retain the current user)
        const currentUser = useAuthStore.getState().user;
        if (currentUser) {
          useAuthStore.getState().setAuth(currentUser, newAccessToken);
        }

        // Process any queued requests with the new token
        processQueue(null, newAccessToken);

        // Retry the original request
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }
        return apiClient(originalRequest);
      } catch (refreshError) {
        // If refresh fails, logout user and reject all queued requests
        processQueue(refreshError, null);
        useAuthStore.getState().clearAuth();
        
        // Trigger a custom event so the UI can redirect or display a session expired modal
        window.dispatchEvent(new CustomEvent('auth:session-expired'));
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    if (error.response?.data?.message) {
      error.message = error.response.data.message;
    }

    return Promise.reject(error);
  }
);

