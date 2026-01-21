import { obtenerUsuarioActual, guardarUsuarioActual, limpiarUsuarioActual, obtenerUsuarios, guardarUsuarios } from './almacenamiento';
import { autenticarUsuario, crearUsuario } from './usuario';
import { CLAVES_BD } from './datos';

const generarToken = () => Math.random().toString(36).slice(2) + Date.now().toString(36);
const registrarActividad = (tipo, detalle = {}) => {
    const log = JSON.parse(localStorage.getItem(CLAVES_BD.ACTIVITY_LOG) || '[]');
    log.push({ tipo, fecha: new Date().toLocaleString('es-CL'), detalle });
    localStorage.setItem(CLAVES_BD.ACTIVITY_LOG, JSON.stringify(log));
};
export const configurarTiempoSesion = (minutos = 30) => {
    const exp = Date.now() + minutos * 60000;
    localStorage.setItem(CLAVES_BD.SESSION_EXP, String(exp));
};
const sesionActiva = () => {
    const exp = parseInt(localStorage.getItem(CLAVES_BD.SESSION_EXP) || '0', 10);
    return exp && Date.now() < exp;
};

export const iniciarSesion = (email, contrasena) => {
    try {
        const intentos = JSON.parse(localStorage.getItem(CLAVES_BD.LOGIN_ATTEMPTS) || '{}');
        const cantidad = intentos[email] || 0;
        if (cantidad >= 5) {
            const usuarios = obtenerUsuarios();
            const u = usuarios.find(x => x.email === email);
            if (u && u.id !== '#ADMIN_ROOT') {
                u.estado = 'bloqueado';
                guardarUsuarios(usuarios);
            }
            return { exito: false, mensaje: 'Cuenta bloqueada por múltiples intentos.' };
        }

        const usuario = autenticarUsuario(email, contrasena);
        guardarUsuarioActual(usuario);
        intentos[email] = 0;
        localStorage.setItem(CLAVES_BD.LOGIN_ATTEMPTS, JSON.stringify(intentos));

        const sessionToken = generarToken();
        const csrfToken = generarToken();
        localStorage.setItem(CLAVES_BD.SESSION_TOKEN, sessionToken);
        localStorage.setItem(CLAVES_BD.CSRF_TOKEN, csrfToken);
        configurarTiempoSesion(30);
        registrarActividad('login', { idUsuario: usuario.id, email });
        return { exito: true, usuario: usuario };
    } catch (error) {
        const intentos = JSON.parse(localStorage.getItem(CLAVES_BD.LOGIN_ATTEMPTS) || '{}');
        const prev = intentos[email] || 0;
        const nuevo = prev + 1;
        intentos[email] = nuevo;
        localStorage.setItem(CLAVES_BD.LOGIN_ATTEMPTS, JSON.stringify(intentos));
        if (nuevo >= 5) {
            const usuarios = obtenerUsuarios();
            const u = usuarios.find(x => x.email === email);
            if (u && u.id !== '#ADMIN_ROOT') {
                u.estado = 'bloqueado';
                guardarUsuarios(usuarios);
            }
        }
        return { exito: false, mensaje: error.message };
    }
};

export const registrar = (datosUsuario) => {
    try {
        const nuevoUsuario = crearUsuario(
            null, // ID auto
            datosUsuario.nombre,
            datosUsuario.email,
            datosUsuario.contrasena,
            'usuario', // rol default
            'activo', // estado default
            datosUsuario.telefono,
            datosUsuario.direccion
        );
        guardarUsuarioActual(nuevoUsuario);
        return { exito: true, usuario: nuevoUsuario };
    } catch (error) {
        return { exito: false, mensaje: error.message };
    }
};

export const cerrarSesion = () => {
    limpiarUsuarioActual();
    localStorage.removeItem(CLAVES_BD.SESSION_TOKEN);
    localStorage.removeItem(CLAVES_BD.CSRF_TOKEN);
    localStorage.removeItem(CLAVES_BD.SESSION_EXP);
    registrarActividad('logout', {});
    window.location.href = '/iniciar-sesion';
};

export const verificarAutenticacion = (rolRequerido = null) => {
    const usuario = obtenerUsuarioActual();
    if (!usuario) return false;
    const token = localStorage.getItem(CLAVES_BD.SESSION_TOKEN);
    if (!token || !sesionActiva()) {
        limpiarUsuarioActual();
        return false;
    }
    
    if (rolRequerido && usuario.rol !== rolRequerido && usuario.rol !== 'admin') {
        return false;
    }
    return usuario;
};
