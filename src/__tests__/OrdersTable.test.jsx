import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import OrdersTable from '../components/OrdersTable';

describe('OrdersTable', () => {
  const mockOrders = [
    { id: '#ORD-1', nombreUsuario: 'Juan', direccion: 'Dir', total: 10000, estado: 'Pendiente', idRepartidor: null, fecha: '2023-10-10' },
    { id: '#ORD-2', nombreUsuario: 'Maria', direccion: 'Dir', total: 20000, estado: 'En Camino', idRepartidor: '#R1', fecha: '2023-10-09' },
  ];

  it('renderiza y muestra formato de moneda', () => {
    render(<OrdersTable data={mockOrders} pageSize={10} />);
    const montos = screen.getAllByText(/\$\s*\d/);
    expect(montos.length).toBeGreaterThan(0);
  });

  it('filtra por estado y dispara asignación', () => {
    const onAsignar = vi.fn();
    const { container } = render(<OrdersTable data={mockOrders} onAsignar={onAsignar} pageSize={10} />);
    fireEvent.change(screen.getByLabelText('Estado'), { target: { value: 'Pendiente' } });
    const tabla = container.querySelector('table');
    const botones = within(tabla).getAllByRole('button', { name: 'Asignar' });
    const btnHabilitado = botones.find((b) => !b.disabled);
    fireEvent.click(btnHabilitado);
    expect(onAsignar).toHaveBeenCalled();
  });
});
