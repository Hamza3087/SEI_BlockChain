import axios from 'axios';
import { API_BASE_URL } from './constant';
import LoadingService from '../pages/components/LoadingService';

// Create an Axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true // Essential for cookies
});

function getCookie(name) {
  const cookies = document.cookie.split('; ');
  const cookie = cookies.find((c) => c.startsWith(`${name}=`));
  return cookie ? decodeURIComponent(cookie.split('=')[1]) : null;
}

let activeRequests = 0;

const updateLoaderState = () => {
  LoadingService.setLoading(activeRequests > 0);
};
api.interceptors.request.use(
  (config) => {
    activeRequests++;
    updateLoaderState();
    // Skip modification for specific requests
    if (config.skipAuth) return config;
    const csrfToken = getCookie('csrftoken');
    // Apply headers conditionally
    const headers = {
      'Content-Type': config.headers['Content-Type'] || 'application/json',
      ...(csrfToken && { 'X-CSRFToken': csrfToken })
    };

    return {
      ...config,
      headers: {
        ...config.headers,
        ...headers
      }
    };
  },
  (error) => {
    activeRequests--;
    updateLoaderState();
    console.error('Request Interceptor Error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    // Decrement active requests counter on success
    activeRequests--;
    updateLoaderState();
    return response.data;
  },
  (error) => {
    activeRequests--;
    updateLoaderState();

    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error.message);
  }
);

export default api;
