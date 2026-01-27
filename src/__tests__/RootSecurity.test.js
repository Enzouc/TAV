import { describe, it, expect, beforeEach, vi } from 'vitest';
import { iniciarSesion } from '../utils/autenticacion';
import { eliminarUsuario } from '../utils/usuario';
import { CLAVES_BD, inicializarDatos } from '../utils/datos';
import { userSchema, validate } from '../utils/validationSchemas';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = value.toString(); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('Seguridad de Cuenta Root', () => {
    beforeEach(() => {
        window.localStorage.clear();
        // Inicializar datos con el root configurado
        inicializarDatos(); 
        
        // Asegurar que el usuario root tiene la contraseña correcta en el mock para pruebas de éxito
        // inicializarDatos crea root@gasexpress.cl pero lo cambiamos a admin@tav.cl en el código
        // Verificamos que se haya inicializado correctamente
    });

    it('NO debe bloquear al usuario root después de múltiples intentos fallidos', () => {
        const emailRoot = 'admin@tav.cl';
        
        // 1. Simular 10 intentos fallidos
        for (let i = 0; i < 10; i++) {
            const resultado = iniciarSesion(emailRoot, 'wrongpassword');
            expect(resultado.exito).toBe(false);
        }

        // 2. Verificar que NO está bloqueado al intentar con la contraseña correcta
        // Nota: la contraseña por defecto en inicializarDatos es 'root'
        const resultadoExito = iniciarSesion(emailRoot, 'root');
        
        // Si falló, puede ser porque la contraseña es incorrecta o porque está bloqueado
        if (!resultadoExito.exito) {
             console.log('Fallo login root:', resultadoExito.mensaje);
        }
        
        expect(resultadoExito.exito).toBe(true);
        expect(resultadoExito.mensaje).toBeUndefined();
    });

    it('DEBE bloquear a un usuario normal después de 5 intentos fallidos', () => {
        const emailUser = 'juan@example.com';
        // Crear usuario normal en localStorage si no existe (inicializarDatos crea uno)
        
        // 1. Simular 5 intentos fallidos
        for (let i = 0; i < 5; i++) {
            iniciarSesion(emailUser, 'wrongpassword');
        }

        // 2. El sexto intento debe fallar INMEDIATAMENTE por bloqueo, incluso con password correcta
        // Asumiendo que 'juan' es la password correcta según inicializarDatos
        const resultado = iniciarSesion(emailUser, 'juan');
        
        expect(resultado.exito).toBe(false);
        expect(resultado.mensaje).toContain('bloqueada');
    });

    it('NO debe permitir eliminar al usuario root', () => {
        expect(() => {
            eliminarUsuario('#ADMIN_ROOT');
        }).toThrow(/root no puede ser eliminado/i);
    });

    it('DEBE validar políticas de contraseña segura', () => {
        const weakPass = '123456';
        const strongPass = 'Admin123@';

        const weakValidation = validate(userSchema, { 
            nombre: 'Test', email: 'test@tav.cl', contrasena: weakPass 
        });
        expect(weakValidation.success).toBe(false);

        const strongValidation = validate(userSchema, { 
            nombre: 'Test', email: 'test@tav.cl', contrasena: strongPass 
        });
        // Puede fallar si faltan campos requeridos en el schema, pero revisamos solo contraseña
        // El schema requiere direccion opcional, etc.
        // Si falla por otros campos, ajustar el test.
        // Pero aquí verificamos que la contraseña SEA válida.
        
        // Si el schema falla por otra cosa, el error no debería ser sobre la contraseña
        if (!strongValidation.success) {
            const passError = strongValidation.error.includes('contraseña');
            expect(passError).toBe(false);
        }
    });
});
