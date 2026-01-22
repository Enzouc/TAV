import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Header from '../components/Header';
import { CLAVES_BD } from '../utils/datos';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('../utils/almacenamiento', () => ({
  obtenerUsuarioActual: vi.fn(() => ({ id: 'u1', nombre: 'Juan Pérez', rol: 'usuario' })),
  obtenerCarrito: vi.fn(() => []),
  guardarUsuarioActual: vi.fn(),
  limpiarUsuarioActual: vi.fn(),
  obtenerUsuarios: vi.fn(() => []),
  guardarUsuarios: vi.fn()
}));

vi.mock('../utils/autenticacion', () => ({ cerrarSesion: vi.fn() }));

describe('Header - Acceso rápido a perfil', () => {
  beforeEach(() => {
    localStorage.removeItem(CLAVES_BD.ACTIVITY_LOG);
    mockNavigate.mockReset();
    cleanup();
  });

  it('navega a perfil al hacer clic en el botón de usuario', () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: /ir a mi cuenta/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/perfil');
  });
});
