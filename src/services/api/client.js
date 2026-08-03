import axios from 'axios';
import { config, ENDPOINTS } from '../constants/config';

const apiClient = axios.create({
  baseURL: config.apiBaseUrl,
  timeout: config.apiTimeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (request) => request,
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Something went wrong. Please try again.';
    return Promise.reject(new Error(message));
  },
);

export const setAuthToken = (token) => {
  if (token) {
    apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common.Authorization;
  }
};

export const api = {
  login: (payload) => apiClient.post(ENDPOINTS.login, payload),
  register: (payload) => apiClient.post(ENDPOINTS.register, payload),
  getContacts: () => apiClient.get(ENDPOINTS.contacts),
  getHistory: () => apiClient.get(ENDPOINTS.history),
  getProfile: () => apiClient.get(ENDPOINTS.profile),
  getNotifications: () => apiClient.get(ENDPOINTS.notifications),
};

export default apiClient;
