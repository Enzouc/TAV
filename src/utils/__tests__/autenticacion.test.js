import { describe, it, expect, beforeEach, vi } from 'vitest';
import { iniciarSesion, registrar, verificarAutenticacion, cerrarSesion } from '../autenticacion';
import { CLAVES_BD } from '../datos';
import { guardarUsuarios, guardarUsuarioActual } from '../almacenamiento';

describe('Utilidades de Autenticación', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
        
        // Configurar usuario inicial para pruebas de inicio de sesión
        const usuarioMock = {
            id: 'test-user',
            nombre: 'Usuario Prueba',
            email: 'test@example.com',
            contrasena: 'password123',
            rol: 'usuario',
            estado: 'activo'
        };
        guardarUsuarios([usuarioMock]);
    });

    it('debería iniciar sesión exitosamente con credenciales correctas', () => {
        const resultado = iniciarSesion('test@example.com', 'password123');
        expect(resultado.exito).toBe(true);
        expect(resultado.usuario).toHaveProperty('email', 'test@example.com');
        
        const usuarioAlmacenado = JSON.parse(localStorage.getItem(CLAVES_BD.USUARIO_ACTUAL));
        expect(usuarioAlmacenado.email).toBe('test@example.com');
    });

    it('debería fallar inicio de sesión con credenciales incorrectas', () => {
        const resultado = iniciarSesion('test@example.com', 'claveincorrecta');
        expect(resultado.exito).toBe(false);
        expect(resultado.mensaje).toBe('Credenciales inválidas.');
    });

    it('debería registrar un nuevo usuario exitosamente', () => {
        const nuevoUsuario = {
            nombre: 'Nuevo Usuario',
            email: 'nuevo@example.com',
            contrasena: 'nuevaclave',
            telefono: '123456789',
            direccion: { calle: 'Calle Prueba' }
        };

        const resultado = registrar(nuevoUsuario);
        expect(resultado.exito).toBe(true);
        expect(resultado.usuario.email).toBe('nuevo@example.com');
        
        const usuarios = JSON.parse(localStorage.getItem(CLAVES_BD.USUARIOS));
        expect(usuarios).toHaveLength(2); // Inicial + Nuevo
    });

    it('debería fallar registro si el correo ya existe', () => {
        const usuarioExistente = {
            nombre: 'Usuario Existente',
            email: 'test@example.com', // Mismo que usuario inicial
            contrasena: 'password123'
        };

        const resultado = registrar(usuarioExistente);
        expect(resultado.exito).toBe(false);
        expect(resultado.mensaje).toBe('El correo ya está registrado.');
    });

    it('debería verificar autenticación correctamente', () => {
        expect(verificarAutenticacion()).toBe(false);

        const usuario = { id: '1', rol: 'usuario', nombre: 'Usuario Logueado' };
        guardarUsuarioActual(usuario);
        localStorage.setItem(CLAVES_BD.SESSION_TOKEN, 'token-test');
        localStorage.setItem(CLAVES_BD.SESSION_EXP, String(Date.now() + 60000));

        expect(verificarAutenticacion()).toEqual(usuario);
    });

    it('debería validar roles correctamente en verificarAutenticacion', () => {
        const usuario = { id: '1', rol: 'usuario', nombre: 'Usuario' };
        guardarUsuarioActual(usuario);
        localStorage.setItem(CLAVES_BD.SESSION_TOKEN, 'token-test');
        localStorage.setItem(CLAVES_BD.SESSION_EXP, String(Date.now() + 60000));

        expect(verificarAutenticacion('usuario')).toEqual(usuario);
        expect(verificarAutenticacion('admin')).toBe(false);
    });

    it('debería permitir a admin acceder a cualquier ruta protegida por rol', () => {
        const admin = { id: '2', rol: 'admin', nombre: 'Admin' };
        guardarUsuarioActual(admin);
        localStorage.setItem(CLAVES_BD.SESSION_TOKEN, 'token-test');
        localStorage.setItem(CLAVES_BD.SESSION_EXP, String(Date.now() + 60000));

        expect(verificarAutenticacion('usuario')).toEqual(admin); // Admin pasa chequeo user
        expect(verificarAutenticacion('repartidor')).toEqual(admin); // Admin pasa chequeo repartidor
    });

    it('debería cerrar sesión correctamente', () => {
        const usuario = { id: '1', nombre: 'Usuario' };
        guardarUsuarioActual(usuario);
        
        // Mock window.location.href
        Object.defineProperty(window, 'location', {
            writable: true,
            value: { href: '' }
        });

        cerrarSesion();
        
        expect(localStorage.getItem(CLAVES_BD.USUARIO_ACTUAL)).toBeNull();
        expect(window.location.href).toBe('/iniciar-sesion');
    });
});
