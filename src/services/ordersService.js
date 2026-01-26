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
    repartidor: opts.repartidor,
    userId: opts.userId,
    q: opts.q,
  };
  return axiosClient.get('/orders', { params, signal });
};

export const updateOrderStatus = (id, estado, signal) => {
  if (!id || !estado) {
    const e = new Error('ID y estado requeridos');
    e.status = 400;
    throw e;
  }
  return axiosClient.put(`/orders/${encodeURIComponent(id)}/status`, { estado }, { signal });
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
