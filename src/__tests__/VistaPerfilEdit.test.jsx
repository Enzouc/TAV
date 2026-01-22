import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import VistaPerfil from '../views/VistaPerfil.jsx';
import { CLAVES_BD } from '../utils/datos';

describe('VistaPerfil - edición de perfil', () => {
  beforeEach(() => {
    localStorage.clear();
    const usuario = {
      id: '#U200',
      nombre: 'Cliente Demo',
      email: 'cliente@demo.com',
      rol: 'usuario',
      contrasena: 'demo',
      estado: 'activo',
      telefono: '+56 9 1234 5678',
      direccion: { calle: 'Calle 1', numero: '10', comuna: 'Concepción', region: 'Biobío' }
    };
    const otros = [{
      id: '#U201',
      nombre: 'Otro',
      email: 'otro@demo.com',
      rol: 'usuario',
      contrasena: 'otro',
      estado: 'activo'
    }];
    localStorage.setItem(CLAVES_BD.USUARIOS, JSON.stringify([usuario, ...otros]));
    localStorage.setItem(CLAVES_BD.USUARIO_ACTUAL, JSON.stringify(usuario));
  });

  it('permite editar y guardar cambios del perfil', () => {
    render(
      <MemoryRouter>
        <VistaPerfil />
      </MemoryRouter>
    );

    const nombreInput = screen.getByLabelText('Nombre Completo');
    const telefonoInput = screen.getByLabelText('Teléfono');
    const comunaInput = screen.getByLabelText('Comuna');
    fireEvent.change(nombreInput, { target: { value: 'Cliente Actualizado' } });
    fireEvent.change(telefonoInput, { target: { value: '+56 9 9999 9999' } });
    fireEvent.change(comunaInput, { target: { value: 'Talcahuano' } });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    const usuarios = JSON.parse(localStorage.getItem(CLAVES_BD.USUARIOS));
    const actual = JSON.parse(localStorage.getItem(CLAVES_BD.USUARIO_ACTUAL));
    expect(actual.nombre).toBe('Cliente Actualizado');
    expect(actual.telefono).toBe('+56 9 9999 9999');
    expect(actual.direccion.comuna).toBe('Talcahuano');
    expect(usuarios.find(u => u.id === actual.id).nombre).toBe('Cliente Actualizado');
    expect(screen.getByText('Perfil actualizado correctamente.')).toBeTruthy();
  });
});
