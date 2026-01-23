import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { obtenerUsuarioActual, CLAVES_BD } from '../utils/almacenamiento';

const RutaProtegida = ({ rolesPermitidos }) => {
    const usuario = obtenerUsuarioActual();

    if (!usuario) {
        return <Navigate to="/iniciar-sesion" replace />;
    }

    if (rolesPermitidos && !rolesPermitidos.includes(usuario.rol)) {
        console.warn(`Acceso denegado a ruta protegida. Rol usuario: ${usuario.rol}, Permitidos: ${rolesPermitidos.join(', ')}`);
        
        // Registrar intento de acceso no autorizado
        try {
            const log = JSON.parse(localStorage.getItem(CLAVES_BD.ACTIVITY_LOG) || '[]');
            log.push({ 
                tipo: 'acceso_protegido_denegado', 
                fecha: new Date().toLocaleString('es-CL'), 
                detalle: { 
                    usuario: usuario.email, 
                    rol: usuario.rol, 
                    ruta: window.location.pathname,
                    rolesPermitidos
                } 
            });
            localStorage.setItem(CLAVES_BD.ACTIVITY_LOG, JSON.stringify(log));
        } catch (e) {
            console.error('Error registrando log de seguridad', e);
        }

        // Redirigir basado en rol si no está autorizado para la ruta específica
        if (usuario.rol === 'repartidor') return <Navigate to="/repartidor" replace />;
        if (usuario.rol === 'admin') return <Navigate to="/admin" replace />;
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default RutaProtegida;
