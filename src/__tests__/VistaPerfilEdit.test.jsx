import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import VistaPerfil from '../views/VistaPerfil.jsx';
import { CLAVES_BD } from '../utils/datos';
import * as usersService from '../services/usersService';

// Mock ContextoUI
vi.mock('../components/ContextoUI', () => ({
  usarUI: () => ({
    mostrarNotificacion: vi.fn(),
  }),
}));

// Mock usersService
vi.mock('../services/usersService', () => ({
  updateProfile: vi.fn(),
  getProfile: vi.fn() // If needed
}));

describe('VistaPerfil - edición de perfil', () => {
  beforeEach(() => {
    localStorage.clear();
    const usuario = {
      id: '#U200',
      nombre: 'Cliente Demo',
      email: 'cliente@demo.com',
      rol: 'usuario',
      contrasena: 'password123',
      estado: 'activo',
      telefono: '+56 9 1234 5678',
      direccion: { calle: 'Calle 1', numero: '10', comuna: 'Concepción', region: 'Biobío' }
    };
    localStorage.setItem(CLAVES_BD.USUARIOS, JSON.stringify([usuario]));
    localStorage.setItem(CLAVES_BD.USUARIO_ACTUAL, JSON.stringify(usuario));
    
    // Mock updateProfile implementation
    usersService.updateProfile.mockResolvedValue({
      ...usuario,
      nombre: 'Cliente Actualizado',
      telefono: '+56 9 9999 9999',
      direccion: { ...usuario.direccion, comuna: 'Talcahuano' }
    });
  });

  it('permite editar y guardar cambios del perfil', async () => {
    const { container } = render(
      <MemoryRouter>
        <VistaPerfil />
      </MemoryRouter>
    );

    // Enter edit mode
    fireEvent.click(screen.getByText('✏️ Editar'));

    const nombreInput = container.querySelector('input[name="nombre"]');
    const telefonoInput = container.querySelector('input[name="telefono"]');
    const comunaSelect = container.querySelector('select[name="direccion.comuna"]');
    
    fireEvent.change(nombreInput, { target: { value: 'Cliente Actualizado' } });
    fireEvent.change(telefonoInput, { target: { value: '+56 9 9999 9999' } });
    fireEvent.change(comunaSelect, { target: { value: 'Talcahuano' } });
    
    fireEvent.click(screen.getByText('Guardar Cambios'));

    await waitFor(() => {
        expect(usersService.updateProfile).toHaveBeenCalled();
    });

    // Check localStorage update (VistaPerfil updates it on success)
    const actual = JSON.parse(localStorage.getItem(CLAVES_BD.USUARIO_ACTUAL));
    expect(actual.nombre).toBe('Cliente Actualizado');
    expect(actual.telefono).toBe('+56 9 9999 9999');
    expect(actual.direccion.comuna).toBe('Talcahuano');
  });
});
