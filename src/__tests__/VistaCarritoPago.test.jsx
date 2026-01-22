import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ProveedorUI } from '../components/ContextoUI';
import VistaCarrito from '../views/VistaCarrito.jsx';
import * as almacenamientoUtils from '../utils/almacenamiento';
import * as pedidoUtils from '../utils/pedido';
import * as detalleUtils from '../utils/detallePedido';

vi.mock('../utils/almacenamiento', () => ({
  obtenerCarrito: vi.fn(),
  guardarCarrito: vi.fn(),
  obtenerUsuarioActual: vi.fn(),
}));

vi.mock('../utils/pedido', () => ({
  crearPedido: vi.fn(),
}));

vi.mock('../utils/detallePedido', () => ({
  crearDetallePedido: vi.fn(),
}));

describe('VistaCarrito - selección de método de pago', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    almacenamientoUtils.obtenerUsuarioActual.mockReturnValue({
      id: '#U1',
      nombre: 'Cliente Demo',
      telefono: '+56 9 1111 1111',
      direccion: { calle: 'Calle', numero: '1', comuna: 'Concepción', region: 'Biobío' },
    });
    almacenamientoUtils.obtenerCarrito.mockReturnValue([
      { id: 'p1', nombre: 'Gas 11 Kg', precio: 15000, cantidad: 2 },
    ]);
    detalleUtils.crearDetallePedido.mockImplementation((id, nombre, cantidad, precio) => ({
      productoId: id,
      nombre,
      cantidad,
      precio,
      subtotal: cantidad * precio,
    }));
    pedidoUtils.crearPedido.mockReturnValue({ id: '#ORD-TEST' });
  });

  afterEach(() => {
    cleanup();
  });

  it('abre modal, permite seleccionar método y crea pedido con ese método', () => {
    render(
      <MemoryRouter>
        <ProveedorUI>
          <VistaCarrito />
        </ProveedorUI>
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText('Proceder al Pago'));
    const dialog = screen.getByRole('dialog');
    const radioTarjeta = screen.getByLabelText('Tarjeta');
    fireEvent.click(radioTarjeta);

    const btnContinuar = screen.getByText('Continuar');
    fireEvent.click(btnContinuar);

    expect(pedidoUtils.crearPedido).toHaveBeenCalledTimes(1);
    const args = pedidoUtils.crearPedido.mock.calls[0];
    expect(args[7]).toBeNull();
    expect(args[9]).toBe('Tarjeta');
    expect(almacenamientoUtils.guardarCarrito).toHaveBeenCalledWith([]);
  });
});
