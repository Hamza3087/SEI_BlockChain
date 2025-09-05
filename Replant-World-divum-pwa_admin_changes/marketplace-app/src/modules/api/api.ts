import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

export let apiBaseURL = import.meta.env.VITE_API_URL;
if (!apiBaseURL) {
  // if port is given in origin, assume it's local dev env, and replace app port with api port
  const baseURL = window.location.origin.replace(/:\d+/, ':8001');
  apiBaseURL = baseURL + '/api';
}

export const api = axios.create({
  baseURL: apiBaseURL,
});

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
