import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { obtenerUsuarioActual, limpiarUsuarioActual, CLAVES_BD } from '../utils/almacenamiento';

const RutaCliente = () => {
    const usuario = obtenerUsuarioActual();

    // Si hay usuario y tiene rol restringido (admin o repartidor)
    if (usuario && (usuario.rol === 'admin' || usuario.rol === 'repartidor')) {
        console.warn(`Acceso denegado a ruta de cliente. Rol: ${usuario.rol}. Cerrando sesión y redirigiendo.`);
        
        // Registrar intento de acceso no autorizado
        try {
            const log = JSON.parse(localStorage.getItem(CLAVES_BD.ACTIVITY_LOG) || '[]');
            log.push({ 
                tipo: 'acceso_no_autorizado', 
                fecha: new Date().toLocaleString('es-CL'), 
                detalle: { 
                    usuario: usuario.email, 
                    rol: usuario.rol, 
                    ruta: window.location.pathname 
                } 
            });
            localStorage.setItem(CLAVES_BD.ACTIVITY_LOG, JSON.stringify(log));
        } catch (e) {
            console.error('Error registrando log de seguridad', e);
        }

        // Limpiar sesión (Logout forzado)
        limpiarUsuarioActual();
        
        // Redirigir al inicio como usuario anónimo
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default RutaCliente;
