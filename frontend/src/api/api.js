import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url.includes('/users/login/')) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => api(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await api.post("/users/token/refresh/", {}, { withCredentials: true });
        isRefreshing = false;
        processQueue(null);
        return api(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        processQueue(refreshError);
        
        // Clear auth state and redirect
        // We can't easily dispatch here without importing store, but redirecting works
        if (window.location.pathname !== '/login') {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      }
    }

    // Global error handling for other API failures
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;
      
      // Skip 401s here since they are handled for token refreshing above
      // Skip 404s to avoid annoying popups for harmless Not Found checks
      if (status !== 401 && status !== 404) {
        
        let errorMessage = "Something went wrong";
        
        // Extract useful error messages from typical Django REST framework responses
        if (typeof data === 'string') {
          errorMessage = data;
        } else if (data && typeof data === 'object') {
          // If the backend returned a specific error "detail" field
          if (data.detail) {
            errorMessage = data.detail;
          } else if (data.error) {
            errorMessage = data.error;
          } else if (data.message) {
            errorMessage = data.message;
          } else {
            // Get the first error value from field-specific errors
            const firstKey = Object.keys(data)[0];
            if (firstKey && Array.isArray(data[firstKey])) {
              // Usually DRF returns {"username": ["This field is required."]}
              errorMessage = `${firstKey}: ${data[firstKey][0]}`;
            }
          }
        }
        
        // Show the toast!
        // We prevent duplicate identical toasts with a specific toast.error id if needed, but default is fine
        toast.error(errorMessage, { id: 'global-api-error' });
      }
    } else if (error.request) {
      toast.error("Network error. Please check your connection.", { id: 'global-network-error' });
    }

    return Promise.reject(error);
  }
);

export default api;