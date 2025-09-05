import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

// Utility function to get the CSRF token from the cookie
function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

const apiOrigin = window.location.origin.includes('localhost')
  ? 'http://localhost:8001'
  : window.location.origin;


export const apiBaseURL = apiOrigin + '/api';

export const api = axios.create({
  baseURL: apiBaseURL,
  xsrfCookieName: 'csrftoken',
  xsrfHeaderName: 'X-CSRFToken',
  withXSRFToken: true,
  withCredentials: true,
});

// Add a request interceptor to dynamically set the CSRF token in the headers
api.interceptors.request.use(
  (config) => {
    const csrfToken = getCookie('csrftoken'); // Extract CSRF token from the cookie
    if (csrfToken) {
      config.headers['X-CSRFToken'] = csrfToken; // Set the CSRF token in the headers
    }
    config.headers['Content-Type'] = 'application/json'; // Set Content-Type for all requests
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function patch<TResponseData = any, TPayload = any>(
  url: string,
  payload?: TPayload,
  config?: AxiosRequestConfig<TPayload>
) {
  return api.patch<
    TResponseData,
    AxiosResponse<TResponseData, TPayload>,
    TPayload
  >(url, payload, config);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function post<TResponseData = any, TPayload = any>(
  url: string,
  payload?: TPayload,
  config?: AxiosRequestConfig<TPayload>
) {
  return api.post<
    TResponseData,
    AxiosResponse<TResponseData, TPayload>,
    TPayload
  >(url, payload, config);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function get<TResponseData = any, TPayload = any>(
  url: string,
  config?: AxiosRequestConfig<TPayload>
) {
  return api.get<
    TResponseData,
    AxiosResponse<TResponseData, TPayload>,
    TPayload
  >(url, config);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function remove<TResponseData = any, TPayload = any>(
  url: string,
  config?: AxiosRequestConfig<TPayload>
) {
  return api.delete<
    TResponseData,
    AxiosResponse<TResponseData, TPayload>,
    TPayload
  >(url, config);
}
