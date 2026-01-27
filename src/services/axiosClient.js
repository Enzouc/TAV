import axios from 'axios';
import { CLAVES_BD } from '../utils/datos';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const axiosClient = axios.create({
  baseURL,
  timeout: 15000,
  withCredentials: true,
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(CLAVES_BD.SESSION_TOKEN);
  const csrf = localStorage.getItem(CLAVES_BD.CSRF_TOKEN);
  if (token) {
    config.headers = { ...(config.headers || {}), Authorization: `Bearer ${token}` };
  }
  if (csrf) {
    config.headers = { ...(config.headers || {}), 'X-CSRF-Token': csrf };
  }
  return config;
});

axiosClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }
    const status = error.response?.status || 0;
    const message = error.response?.data?.message || error.message || 'Error de red';
    const data = error.response?.data;
    const err = new Error(message);
    err.status = status;
    err.data = data;
    return Promise.reject(err);
  }
);

export default axiosClient;
