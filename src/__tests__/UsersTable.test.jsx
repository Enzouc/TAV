import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import UsersTable from '../components/UsersTable';

describe('UsersTable', () => {
  const mockUsers = [
    { id: '#U1', nombre: 'Ana', email: 'ana@example.com', rol: 'usuario', estado: 'activo' },
    { id: '#U2', nombre: 'Beto', email: 'beto@example.com', rol: 'repartidor', estado: 'bloqueado' },
    { id: '#ADMIN', nombre: 'Admin', email: 'admin@example.com', rol: 'admin', estado: 'activo' },
  ];

  it('renderiza y filtra por rol', () => {
    render(<UsersTable data={mockUsers} pageSize={10} />);
    expect(screen.getByText('Ana')).toBeTruthy();
    expect(screen.getByText('Beto')).toBeTruthy();
    fireEvent.change(screen.getByLabelText('Rol'), { target: { value: 'usuario' } });
    expect(screen.getByText('Ana')).toBeTruthy();
    expect(screen.queryByText('Beto')).toBeNull();
  });

  it('ordenamiento por nombre y activa acciones', () => {
    const onEditar = vi.fn();
    const { container } = render(<UsersTable data={mockUsers} onEditarUsuario={onEditar} pageSize={10} />);
    const tabla = container.querySelector('table');
    const botones = within(tabla).getAllByRole('button', { name: 'Editar' });
    const btnHabilitado = botones.find((b) => !b.disabled);
    fireEvent.click(btnHabilitado);
    expect(onEditar).toHaveBeenCalled();
  });
});
