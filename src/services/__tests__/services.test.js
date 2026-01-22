import { describe, it, expect, vi, beforeEach } from 'vitest';
import axiosClient from '../axiosClient';
import { getProducts, createProduct } from '../productsService';
import { getOrders, updateOrderStatus } from '../ordersService';
import { login, getProfile } from '../usersService';
import { CLAVES_BD } from '../../utils/datos';

describe('Servicios con Axios', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('adjunta Authorization cuando hay token', async () => {
    localStorage.setItem(CLAVES_BD.SESSION_TOKEN, 'tok');
    const spy = vi.spyOn(axiosClient, 'get').mockResolvedValue([{ id: 'p1' }]);
    await getProducts();
    expect(spy).toHaveBeenCalledWith('/products', expect.any(Object));
  });

  it('crea producto y retorna respuesta', async () => {
    const spy = vi.spyOn(axiosClient, 'post').mockResolvedValue({ id: 'pX' });
    const r = await createProduct({ nombre: 'Gas 11kg', precio: 15000, stock: 10 });
    expect(spy).toHaveBeenCalledWith('/products', expect.any(Object), expect.any(Object));
    expect(r.id).toBe('pX');
  });

  it('obtiene pedidos con paginación y actualiza estado', async () => {
    const getSpy = vi.spyOn(axiosClient, 'get').mockResolvedValue({ items: [], total: 0 });
    const putSpy = vi.spyOn(axiosClient, 'put').mockResolvedValue({ id: 'o1', estado: 'En Camino' });
    const r = await getOrders({ page: 2, pageSize: 20, estado: 'Pendiente' });
    expect(r.items).toBeDefined();
    const u = await updateOrderStatus('o1', 'En Camino');
    expect(u.estado).toBe('En Camino');
    expect(getSpy).toHaveBeenCalledWith('/orders', expect.any(Object));
    expect(putSpy).toHaveBeenCalledWith('/orders/o1/status', { estado: 'En Camino' }, expect.any(Object));
  });

  it('login guarda token y obtiene perfil', async () => {
    const postSpy = vi.spyOn(axiosClient, 'post').mockResolvedValue({ token: 'abc', usuario: { id: 'u1' } });
    const getSpy = vi.spyOn(axiosClient, 'get').mockResolvedValue({ id: 'u1' });
    const r = await login({ email: 'e@x.com', contrasena: '123' });
    expect(r.token).toBe('abc');
    expect(localStorage.getItem(CLAVES_BD.SESSION_TOKEN)).toBe('abc');
    const me = await getProfile();
    expect(me.id).toBe('u1');
    expect(postSpy).toHaveBeenCalledWith('/users/login', { email: 'e@x.com', contrasena: '123' }, expect.any(Object));
    expect(getSpy).toHaveBeenCalledWith('/users/me', expect.any(Object));
  });
});
