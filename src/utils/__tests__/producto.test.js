import { describe, it, expect, beforeEach } from 'vitest';
import {
  agregarProducto,
  actualizarStock,
  buscarProductosPorCategoria,
  obtenerProductoPorId,
  eliminarProducto,
  obtenerTodosLosProductos,
} from '../producto';
import { guardarProductos } from '../almacenamiento';

describe('Utilidades de Producto', () => {
  beforeEach(() => {
    localStorage.clear();
    const productosIniciales = [
      { id: 'p1', nombre: 'Gas 11kg', precio: 15000, stock: 10, categoria: 'Normal' },
      { id: 'p2', nombre: 'Gas 15kg', precio: 20000, stock: 5, categoria: 'Normal' },
      { id: 'p3', nombre: 'Gas 45kg', precio: 60000, stock: 2, categoria: 'Industrial' },
    ];
    guardarProductos(productosIniciales);
  });

  it('debería agregar un producto exitosamente', () => {
    const nuevoProducto = agregarProducto('p4', 'Gas 5kg', 8000, 20, 'Camping');
    expect(nuevoProducto).toHaveProperty('id', 'p4');
    expect(obtenerProductoPorId('p4')).toBeDefined();
  });

  it('debería lanzar error al agregar ID de producto duplicado', () => {
    expect(() => {
      agregarProducto('p1', 'Duplicado', 1000, 1, 'Normal');
    }).toThrow('El ID del producto ya existe.');
  });

  it('debería actualizar stock correctamente', () => {
    const actualizado = actualizarStock('p1', 50);
    expect(actualizado.stock).toBe(50);
    expect(obtenerProductoPorId('p1').stock).toBe(50);
  });

  it('debería filtrar productos por categoría', () => {
    const productosNormales = buscarProductosPorCategoria('Normal');
    expect(productosNormales).toHaveLength(2);

    const productosIndustriales = buscarProductosPorCategoria('Industrial');
    expect(productosIndustriales).toHaveLength(1);
  });

  it('debería obtener producto por ID', () => {
    const producto = obtenerProductoPorId('p2');
    expect(producto.nombre).toBe('Gas 15kg');
  });

  it('debería lanzar error si producto no encontrado', () => {
    expect(() => obtenerProductoPorId('no-existente')).toThrow('Producto no encontrado.');
  });

  it('debería eliminar un producto', () => {
    const resultado = eliminarProducto('p3');
    expect(resultado).toBe(true);
    expect(() => obtenerProductoPorId('p3')).toThrow('Producto no encontrado.');
  });

  it('debería ordenar los productos de menor a mayor precio', () => {
    const productosOrdenados = obtenerTodosLosProductos();
    const precios = productosOrdenados.map((p) => p.precio);
    const preciosOrdenados = [...precios].sort((a, b) => a - b);
    expect(precios).toEqual(preciosOrdenados);
  });
});
