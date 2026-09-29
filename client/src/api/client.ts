import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  const userId = localStorage.getItem('demo_user_id') || 'demo-judge-1';
  const role = localStorage.getItem('demo_user_role') || 'judge';

  config.headers['Authorization'] = `Bearer ${userId}`;
  config.headers['x-user-id'] = userId;
  config.headers['x-user-role'] = role;

  return config;
});

apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    return Promise.reject(error.response?.data?.error || error);
  }
);

