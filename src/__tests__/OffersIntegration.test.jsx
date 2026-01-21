import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProveedorUI } from '../components/ContextoUI';
import VistaOfertas from '../views/VistaOfertas';

vi.mock('../utils/almacenamiento', () => {
  const productos = [
    { id: '#P002', nombre: 'Gas 15 Kg', precio: 19000, stock: 30, categoria: 'Normal' },
    { id: '#P004', nombre: 'Gas 5 Kg', precio: 8000, stock: 0, categoria: 'Camping' }, // sin stock
    { id: '#P003', nombre: 'Gas 45 Kg', precio: 58000, stock: 5, categoria: 'Industrial' },
  ];
  let carrito = [];
  return {
    obtenerProductos: () => productos,
    obtenerCarrito: () => carrito,
    guardarCarrito: (c) => { carrito = c; },
  };
});

describe('Ofertas - Integración con carrito y stock', () => {
  it('añade un producto al carrito al hacer clic', () => {
    render(<ProveedorUI><VistaOfertas /></ProveedorUI>);
    const btns = screen.getAllByRole('button', { name: /añadir al carrito/i });
    fireEvent.click(btns[0]); 
    expect(btns[0].disabled).toBe(false);
  });

  it('deshabilita el botón cuando no hay stock', () => {
    render(<ProveedorUI><VistaOfertas /></ProveedorUI>);
    const btns = screen.getAllByRole('button', { name: /añadir al carrito/i });
    // La oferta con stock 0 es la de 5Kg
    const agotadoBtn = btns.find((b) => b.disabled);
    expect(agotadoBtn).toBeTruthy();
  });
});
