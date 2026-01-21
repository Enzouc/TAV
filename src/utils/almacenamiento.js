import { CLAVES_BD, construirPrefijo, PREFIXES } from './datos';

const safeParse = (v, fallback) => {
    try { return JSON.parse(v || ''); } catch { return fallback; }
};
const safeSetItem = (key, value) => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (e) {
        try {
            localStorage.removeItem(CLAVES_BD.CARRITO);
            localStorage.removeItem(CLAVES_BD.ACTIVITY_LOG);
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (err) {
            return false;
        }
    }
};

export const obtenerProductos = () => safeParse(localStorage.getItem(CLAVES_BD.PRODUCTOS), []);
export const obtenerUsuarios = () => safeParse(localStorage.getItem(CLAVES_BD.USUARIOS), []);
export const obtenerPedidos = () => safeParse(localStorage.getItem(CLAVES_BD.PEDIDOS), []);
export const obtenerCarrito = () => safeParse(localStorage.getItem(CLAVES_BD.CARRITO), []);
export const obtenerUsuarioActual = () => safeParse(localStorage.getItem(CLAVES_BD.USUARIO_ACTUAL), null);

export const guardarProductos = (productos) => {
    safeSetItem(CLAVES_BD.PRODUCTOS, productos);
    productos.forEach(p => safeSetItem(construirPrefijo(PREFIXES.PRODUCT, p.id), p));
};
export const guardarUsuarios = (usuarios) => {
    safeSetItem(CLAVES_BD.USUARIOS, usuarios);
    usuarios.forEach(u => safeSetItem(construirPrefijo(PREFIXES.USER, u.id), u));
};
export const guardarPedidos = (pedidos) => {
    safeSetItem(CLAVES_BD.PEDIDOS, pedidos);
    pedidos.forEach(o => safeSetItem(construirPrefijo(PREFIXES.ORDER, o.id), o));
};
export const guardarCarrito = (carrito) => {
    safeSetItem(CLAVES_BD.CARRITO, carrito);
    window.dispatchEvent(new Event('carrito-actualizado'));
};

export const guardarUsuarioActual = (usuario) => {
    safeSetItem(CLAVES_BD.USUARIO_ACTUAL, usuario);
    window.dispatchEvent(new Event('auth-cambiado'));
};

export const limpiarUsuarioActual = () => {
    localStorage.removeItem(CLAVES_BD.USUARIO_ACTUAL);
    localStorage.removeItem(CLAVES_BD.CARRITO);
    window.dispatchEvent(new Event('auth-cambiado'));
    window.dispatchEvent(new Event('carrito-actualizado'));
};
