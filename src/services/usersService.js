import axiosClient from './axiosClient';
import { CLAVES_BD } from '../utils/datos';
import { userSchema, loginSchema, validate } from '../utils/validationSchemas';

export const register = (datos, signal) => {
  const { success, error, data } = validate(userSchema, datos);
  if (!success) {
    const e = new Error(error);
    e.status = 400;
    throw e;
  }
  return axiosClient.post('/users/register', data, { signal });
};

export const login = async (credenciales, signal) => {
  const { success, error, data } = validate(loginSchema, credenciales);
  if (!success) {
    const e = new Error(error);
    e.status = 400;
    throw e;
  }
  const r = await axiosClient.post('/users/login', data, { signal });
  const token = r?.token;
  if (token) {
    localStorage.setItem(CLAVES_BD.SESSION_TOKEN, token);
  }
  return r;
};

export const logout = async (signal) => {
  try {
    await axiosClient.post('/users/logout', {}, { signal });
  } finally {
    localStorage.removeItem(CLAVES_BD.SESSION_TOKEN);
  }
};

export const getProfile = (signal) => {
  return axiosClient.get('/users/me', { signal });
};

export const updateProfile = (cambios, signal) => {
  const { success, error, data } = validate(userSchema.partial(), cambios);
  if (!success) {
    const e = new Error(error);
    e.status = 400;
    throw e;
  }
  return axiosClient.put('/users/me', data, { signal });
};

// Admin functions
export const getUsers = (params, signal) => {
  return axiosClient.get('/users', { params, signal });
};

export const createUser = (user, signal) => {
  const { success, error, data } = validate(userSchema, user);
  if (!success) {
    const e = new Error(error);
    e.status = 400;
    throw e;
  }
  return axiosClient.post('/users', data, { signal });
};

export const updateUser = (id, changes, signal) => {
  const { success, error, data } = validate(userSchema.partial(), changes);
  if (!success) {
    const e = new Error(error);
    e.status = 400;
    throw e;
  }
  return axiosClient.put(`/users/${id}`, data, { signal });
};

export const deleteUser = (id, signal) => {
  return axiosClient.delete(`/users/${id}`, { signal });
};
