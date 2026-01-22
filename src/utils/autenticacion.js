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

const b64u = (str) => {
    const b64 = typeof btoa !== 'undefined' ? btoa(str) : Buffer.from(str).toString('base64');
    return b64.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
};
const toJsonB64u = (obj) => b64u(JSON.stringify(obj));
const hmacSHA256 = async (secret, data) => {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
        const enc = new TextEncoder();
        const key = await window.crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
        const sig = await window.crypto.subtle.sign('HMAC', key, enc.encode(data));
        const bytes = new Uint8Array(sig);
        let bin = '';
        bytes.forEach((b) => (bin += String.fromCharCode(b)));
        return b64u(bin);
    }
    // Fallback simple para entornos sin crypto.subtle (no seguro, solo para dev)
    console.warn('Crypto API no disponible, usando fallback inseguro');
    return b64u(data + secret); 
};
const crearJWT = async (payload, secret) => {
    const header = { alg: 'HS256', typ: 'JWT' };
    const p1 = toJsonB64u(header);
    const p2 = toJsonB64u(payload);
    const firma = await hmacSHA256(secret, `${p1}.${p2}`);
    return `${p1}.${p2}.${firma}`;
};
const decodePayload = (p2) => {
    try {
        const b64 = p2.replace(/-/g, '+').replace(/_/g, '/');
        const json = typeof atob !== 'undefined' ? atob(b64) : Buffer.from(b64, 'base64').toString();
        return JSON.parse(json);
    } catch {
        return null;
    }
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

        const csrfToken = generarToken();
        const payload = { sub: usuario.id, role: usuario.rol, exp: Date.now() + 30 * 60000 };
        (async () => {
            const jwt = await crearJWT(payload, csrfToken);
            localStorage.setItem(CLAVES_BD.SESSION_TOKEN, jwt);
        })();
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
    const partes = token.split('.');
    if (partes.length === 3) {
        const payload = decodePayload(partes[1]);
        if (!payload) return false;
        if (payload.exp && Date.now() > payload.exp) return false;
        if (payload.sub && payload.sub !== usuario.id) return false;
        if (rolRequerido && usuario.rol !== rolRequerido && usuario.rol !== 'admin') {
            return false;
        }
        return usuario;
    }
    if (rolRequerido && usuario.rol !== rolRequerido && usuario.rol !== 'admin') {
        return false;
    }
    return usuario;
};
