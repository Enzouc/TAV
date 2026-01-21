import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ActivityLogTable from '../components/ActivityLogTable';

describe('ActivityLogTable', () => {
  const entries = [
    { tipo: 'producto_create', fecha: '2025-01-01 10:00', detalle: { actorId: '#ADMIN', productoId: '#P001' } },
    { tipo: 'producto_change', fecha: '2025-01-02 09:00', detalle: { actorId: '#ADMIN', productoId: '#P001', cambios: [{ campo: 'stock', anterior: 10, nuevo: 20 }] } },
  ];

  it('renderiza tabla de producto con entries', () => {
    render(<ActivityLogTable entries={entries} modo="producto" />);
    expect(screen.getByText('Fecha')).toBeTruthy();
    expect(screen.getAllByText('#P001').length).toBeGreaterThan(0);
    expect(screen.getByText(/stock: 10 → 20/)).toBeTruthy();
  });

  it('renderiza tabla de pedido con entries', () => {
    const pedidos = [
      { tipo: 'pedido_create', fecha: '2025-01-03', detalle: { actorId: '#U101', pedidoId: '#ORD-001' } }
    ];
    render(<ActivityLogTable entries={pedidos} modo="pedido" />);
    expect(screen.getByText('Pedido')).toBeTruthy();
    expect(screen.getByText('#ORD-001')).toBeTruthy();
  });
});
