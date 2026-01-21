import { obtenerUsuarios, guardarUsuarios, obtenerUsuarioActual } from './almacenamiento';
import { CLAVES_BD } from './datos';

// 1. Crear Usuario
export const crearUsuario = (id, nombre, correo, contrasena, rol, estado, telefono, direccion) => {
    const usuarios = obtenerUsuarios();
    if (usuarios.find(u => u.email === correo)) {
        throw new Error('El correo ya está registrado.');
    }
    
    const nuevoId = id || generarIdPorRol(rol || 'usuario');
    
    const nuevoUsuario = {
        id: nuevoId,
        nombre: nombre,
        email: correo,
        rol: rol || 'usuario',
        contrasena: contrasena,
        estado: estado || 'activo',
        telefono: telefono || '',
        direccion: direccion || {}
    };
    
    usuarios.push(nuevoUsuario);
    guardarUsuarios(usuarios);
    return nuevoUsuario;
};

export const validarTelefono = (telefono) => {
    if (!telefono) return true;
    const regex = /^(\+56\s?9\s?\d{4}\s?\d{4}|\+?\d{8,12})$/;
    return regex.test(telefono);
};

export const validarFormatoId = (id) => {
    if (!id) return false;
    const regex = /^#[A-Z0-9-]{3,16}$/;
    return regex.test(id);
};

export const generarIdPorRol = (rol) => {
    const rand = (len, charset) => Array.from({ length: len }, () => charset[Math.floor(Math.random() * charset.length)]).join('');
    if (rol === 'usuario') return '#U' + rand(8, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789');
    if (rol === 'repartidor') return '#R' + rand(6, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789');
    if (rol === 'admin') return '#ADMIN' + rand(4, '0123456789');
    return '#' + rand(6, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789');
};

export const validarFormatoIdPorRol = (rol, id) => {
    if (!id) return false;
    if (id === '#ADMIN_ROOT') return true;
    if (rol === 'usuario') {
        const nuevo = /^#U[A-Z0-9]{8}$/;
        return nuevo.test(id) || validarFormatoId(id);
    }
    if (rol === 'repartidor') {
        const nuevo = /^#R[A-Z0-9]{6}$/;
        const legado = /^#R\d{3,}$/;
        return nuevo.test(id) || legado.test(id) || validarFormatoId(id);
    }
    if (rol === 'admin') {
        const nuevo = /^#ADMIN\d{4}$/;
        const legado = /^#ADMIN$/;
        return nuevo.test(id) || legado.test(id) || validarFormatoId(id);
    }
    return validarFormatoId(id);
};

// 2. Actualizar Usuario
export const actualizarUsuario = (id, camposActualizados) => {
    const usuarios = obtenerUsuarios();
    const indice = usuarios.findIndex(u => u.id === id);
    
    if (indice === -1) {
        throw new Error('Usuario no encontrado.');
    }
    if (usuarios[indice].id === '#ADMIN_ROOT') {
        throw new Error('El usuario root no puede ser modificado.');
    }
    const actual = obtenerUsuarioActual();
    if (actual && actual.id === id) {
        throw new Error('No puedes editar tu propia cuenta desde el panel.');
    }
    // Cambio de ID con verificación de unicidad
    if (camposActualizados.id && camposActualizados.id !== id) {
        if (usuarios.some(u => u.id === camposActualizados.id)) {
            throw new Error('El nuevo ID de usuario ya existe.');
        }
        const rolDestino = camposActualizados.rol || usuarios[indice].rol;
        if (!validarFormatoIdPorRol(rolDestino, camposActualizados.id)) {
            throw new Error('El nuevo ID no cumple el formato requerido.');
        }
    }
    
    const usuarioActualizado = { ...usuarios[indice], ...camposActualizados };
    usuarios[indice] = usuarioActualizado;
    guardarUsuarios(usuarios);
    
    return usuarioActualizado;
};

// 3. Obtener Usuario por ID
export const obtenerUsuarioPorId = (id) => {
    const usuarios = obtenerUsuarios();
    const usuario = usuarios.find(u => u.id === id);
    if (!usuario) throw new Error('Usuario no encontrado.');
    return usuario;
};

// 4. Autenticar Usuario
export const autenticarUsuario = (correo, contrasena) => {
    const usuarios = obtenerUsuarios();
    const usuario = usuarios.find(u => u.email === correo && u.contrasena === contrasena);
    
    if (!usuario) {
        throw new Error('Credenciales inválidas.');
    }
    
    if (usuario.estado === 'bloqueado') {
        throw new Error('Su cuenta está bloqueada. Contacte soporte.');
    }
    
    return usuario;
};

// 5. Cambiar Estado Usuario
export const cambiarEstadoUsuario = (id, nuevoEstado) => {
    if (id === '#ADMIN_ROOT') throw new Error('El usuario root no puede ser modificado.');
    return actualizarUsuario(id, { estado: nuevoEstado });
};

// Extra: Obtener todos los usuarios (para Admin)
export const obtenerTodosLosUsuarios = () => {
    return obtenerUsuarios();
};

// Eliminar Usuario
export const eliminarUsuario = (id) => {
    const usuarios = obtenerUsuarios();
    const indice = usuarios.findIndex(u => u.id === id);
    if (indice === -1) throw new Error('Usuario no encontrado.');
    if (usuarios[indice].id === '#ADMIN_ROOT') throw new Error('El usuario root no puede ser eliminado.');
    const actual = obtenerUsuarioActual();
    if (actual && actual.id === id) throw new Error('No puedes eliminar tu propia cuenta desde el panel.');
    usuarios.splice(indice, 1);
    guardarUsuarios(usuarios);
    return true;
};

// Admin wrappers con validación CSRF y logging
export const adminCrearUsuario = (adminId, csrfToken, id, nombre, email, contrasena, rol, estado, telefono) => {
    const token = localStorage.getItem(CLAVES_BD.CSRF_TOKEN);
    if (!token || token !== csrfToken) throw new Error('CSRF inválido.');
    const actual = obtenerUsuarioActual();
    if (!actual || actual.id !== adminId || actual.rol !== 'admin') throw new Error('Permisos insuficientes.');
    if (!validarTelefono(telefono)) throw new Error('Formato de teléfono inválido.');
    const userId = id || generarIdPorRol(rol);
    if (!validarFormatoIdPorRol(rol, userId)) throw new Error('ID inválido para el rol seleccionado.');
    const nuevo = crearUsuario(userId, nombre, email, contrasena, rol, estado, telefono, {});
    const log = JSON.parse(localStorage.getItem(CLAVES_BD.ACTIVITY_LOG) || '[]');
    log.push({
        tipo: 'usuario_create',
        ts: Date.now(),
        fecha: new Date().toLocaleString('es-CL'),
        detalle: {
            adminId,
            usuarioId: nuevo.id,
            campos: {
                nombre: nuevo.nombre,
                email: nuevo.email,
                rol: nuevo.rol,
                estado: nuevo.estado,
                telefono: nuevo.telefono
            }
        }
    });
    localStorage.setItem(CLAVES_BD.ACTIVITY_LOG, JSON.stringify(log));
    return nuevo;
};

export const adminActualizarUsuario = (adminId, csrfToken, id, camposActualizados) => {
    const token = localStorage.getItem(CLAVES_BD.CSRF_TOKEN);
    if (!token || token !== csrfToken) throw new Error('CSRF inválido.');
    const actual = obtenerUsuarioActual();
    if (!actual || actual.id !== adminId || actual.rol !== 'admin') throw new Error('Permisos insuficientes.');
    const previo = obtenerUsuarioPorId(id);
    if (camposActualizados.id && camposActualizados.id !== id) {
        const rolDestino = camposActualizados.rol || previo.rol;
        if (!validarFormatoIdPorRol(rolDestino, camposActualizados.id)) {
            throw new Error('ID inválido para el rol seleccionado.');
        }
    }
    const actualizado = actualizarUsuario(id, camposActualizados);
    const cambios = Object.keys(camposActualizados).map(campo => ({
        campo,
        anterior: previo[campo],
        nuevo: actualizado[campo]
    })).filter(c => c.anterior !== c.nuevo);
    if (cambios.length > 0) {
        const log = JSON.parse(localStorage.getItem(CLAVES_BD.ACTIVITY_LOG) || '[]');
        log.push({
            tipo: 'usuario_change',
            ts: Date.now(),
            fecha: new Date().toLocaleString('es-CL'),
            detalle: {
                adminId,
                usuarioId: actualizado.id,
                cambios
            }
        });
        localStorage.setItem(CLAVES_BD.ACTIVITY_LOG, JSON.stringify(log));
    }
    return actualizado;
};

export const adminEliminarUsuario = (adminId, csrfToken, id) => {
    const token = localStorage.getItem(CLAVES_BD.CSRF_TOKEN);
    if (!token || token !== csrfToken) throw new Error('CSRF inválido.');
    const actual = obtenerUsuarioActual();
    if (!actual || actual.id !== adminId || actual.rol !== 'admin') throw new Error('Permisos insuficientes.');
    const previo = obtenerUsuarioPorId(id);
    eliminarUsuario(id);
    const log = JSON.parse(localStorage.getItem(CLAVES_BD.ACTIVITY_LOG) || '[]');
    log.push({
        tipo: 'usuario_delete',
        ts: Date.now(),
        fecha: new Date().toLocaleString('es-CL'),
        detalle: {
            adminId,
            usuarioId: id,
            camposPrevios: { ...previo }
        }
    });
    localStorage.setItem(CLAVES_BD.ACTIVITY_LOG, JSON.stringify(log));
    return true;
};
