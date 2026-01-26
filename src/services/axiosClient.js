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
  async (error) => {
    const originalRequest = error.config;

    // Evitar bucle infinito si el refresh falla
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url.includes('/auth/refresh')) {
      originalRequest._retry = true;
      try {
        // Intentar refrescar token (endpoint hipotético)
        // Se asume que el backend devuelve { token: 'nuevo_token' }
        const { token } = await axiosClient.post('/auth/refresh');
        
        if (token) {
          localStorage.setItem(CLAVES_BD.SESSION_TOKEN, token);
          axiosClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          originalRequest.headers['Authorization'] = `Bearer ${token}`;
          return axiosClient(originalRequest);
        }
      } catch (refreshError) {
        // Si falla el refresh, limpiar sesión y redirigir
        console.warn('Sesión expirada o inválida');
        localStorage.removeItem(CLAVES_BD.SESSION_TOKEN);
        localStorage.removeItem(CLAVES_BD.CSRF_TOKEN);
        localStorage.removeItem(CLAVES_BD.USUARIO_ACTUAL);
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/iniciar-sesion')) {
          window.location.href = '/iniciar-sesion';
        }
        return Promise.reject(refreshError);
      }
    }

    // Validar si el error es por cancelación, en cuyo caso lo propagamos tal cual
    if (axios.isCancel(error)) {
        return Promise.reject(error);
    }

    const status = error.response?.status || 0;
    const message = error.response?.data?.message || error.message || 'Error de red';
    const data = error.response?.data;
    const err = new Error(message);
    err.status = status;
    err.data = data;
    throw err;
  }
);

export default axiosClient;
