import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { obtenerUsuarioActual } from '../utils/almacenamiento';

const RutaProtegida = ({ rolesPermitidos }) => {
    const usuario = obtenerUsuarioActual();

    if (!usuario) {
        return <Navigate to="/iniciar-sesion" replace />;
    }

    if (rolesPermitidos && !rolesPermitidos.includes(usuario.rol)) {
        // Redirigir basado en rol si no está autorizado para la ruta específica
        if (usuario.rol === 'repartidor') return <Navigate to="/repartidor" replace />;
        if (usuario.rol === 'admin') return <Navigate to="/admin" replace />;
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default RutaProtegida;
