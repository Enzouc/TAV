import axiosClient from './axiosClient';
import { orderSchema, validate } from '../utils/validationSchemas';
import { obtenerUsuarioActual } from '../utils/almacenamiento';

const validarAccesoUsuario = () => {
    const usuario = obtenerUsuarioActual();
    if (usuario && (usuario.rol === 'admin' || usuario.rol === 'repartidor')) {
        throw new Error('Acceso no autorizado: Los administradores y repartidores no pueden realizar acciones de cliente.');
    }
};

export const createOrder = (pedido, signal) => {
  validarAccesoUsuario();
  const { success, error, data } = validate(orderSchema, pedido);
  if (!success) {
    const e = new Error(error);
    e.status = 400;
    throw e;
  }
  return axiosClient.post('/orders', data, { signal });
};

export const getOrders = (opts = {}, signal) => {
  const params = {
    page: opts.page ?? 1,
    pageSize: opts.pageSize ?? 10,
    estado: opts.estado,
    repartidorId: opts.repartidor,
    userId: opts.userId,
    q: opts.q,
  };
  return axiosClient.get('/orders', { params, signal });
};

export const updateOrderStatus = (id, datos, signal) => {
  if (!id || !datos) {
    const e = new Error('ID y datos de estado requeridos');
    e.status = 400;
    throw e;
  }
  const payload = typeof datos === 'string' ? { estado: datos } : datos;
  return axiosClient.put(`/orders/${encodeURIComponent(id)}/status`, payload, { signal });
};

export const assignOrder = (id, idRepartidor, signal) => {
  if (!id || !idRepartidor) {
    const e = new Error('ID de pedido y repartidor requeridos');
    e.status = 400;
    throw e;
  }
  return axiosClient.put(`/orders/${encodeURIComponent(id)}/assign`, { idRepartidor }, { signal });
};

export const cancelOrder = (id, signal) => {
  if (!id) {
    const e = new Error('ID de pedido requerido');
    e.status = 400;
    throw e;
  }
  return axiosClient.delete(`/orders/${encodeURIComponent(id)}/cancel`, { signal });
};

export const deleteOrder = (id, signal) => {
  if (!id) {
    const e = new Error('ID de pedido requerido');
    e.status = 400;
    throw e;
  }
  return axiosClient.delete(`/orders/${encodeURIComponent(id)}`, { signal });
};
