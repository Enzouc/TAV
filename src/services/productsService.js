import axiosClient from './axiosClient';
import { productSchema, validate } from '../utils/validationSchemas';

export const getProducts = (params = {}, signal) => {
  return axiosClient.get('/products', { params, signal });
};

export const createProduct = (producto, signal) => {
  const { success, error, data } = validate(productSchema, producto);
  if (!success) {
    const e = new Error(error);
    e.status = 400;
    throw e;
  }
  return axiosClient.post('/products', data, { signal });
};

export const updateProduct = (id, cambios, signal) => {
  if (!id) {
    const e = new Error('ID de producto requerido');
    e.status = 400;
    throw e;
  }
  const { success, error, data } = validate(productSchema.partial(), cambios);
  if (!success) {
    const e = new Error(error);
    e.status = 400;
    throw e;
  }
  return axiosClient.put(`/products/${id}`, data, { signal });
};

export const deleteProduct = (id, signal) => {
  if (!id) {
    const e = new Error('ID de producto requerido');
    e.status = 400;
    throw e;
  }
  return axiosClient.delete(`/products/${id}`, { signal });
};
