import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import VistaPerfil from '../views/VistaPerfil.jsx';
import { CLAVES_BD } from '../utils/datos';

describe('VistaPerfil - cierre de sesión desde perfil', () => {
  beforeEach(() => {
    localStorage.clear();
    const usuario = {
      id: '#U300',
      nombre: 'Cliente Demo',
      email: 'cliente@demo.com',
      rol: 'usuario',
      contrasena: 'demo',
      estado: 'activo',
      telefono: '+56 9 1234 5678',
      direccion: { calle: 'Calle 1', numero: '10', comuna: 'Concepción', region: 'Biobío' }
    };
    localStorage.setItem(CLAVES_BD.USUARIO_ACTUAL, JSON.stringify(usuario));
    localStorage.setItem(CLAVES_BD.SESSION_TOKEN, 'tok.test.jwt');
    localStorage.setItem(CLAVES_BD.CSRF_TOKEN, 'csrf');
    localStorage.setItem(CLAVES_BD.SESSION_EXP, String(Date.now() + 60000));
    Object.defineProperty(window, 'location', { writable: true, value: { href: '' } });
  });

  it('muestra modal de confirmación y cierra sesión al confirmar', () => {
    render(
      <MemoryRouter>
        <VistaPerfil />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: /cerrar sesión/i }));
    const dialog = screen.getByRole('dialog');
    const confirmBtn = dialog.querySelector('button.btn.btn-primary');
    fireEvent.click(confirmBtn);

    expect(localStorage.getItem(CLAVES_BD.USUARIO_ACTUAL)).toBeNull();
    expect(window.location.href).toBe('/iniciar-sesion');
  });
});
