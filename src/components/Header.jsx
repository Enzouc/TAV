import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { obtenerUsuarioActual, obtenerCarrito } from '../utils/almacenamiento';
import { CLAVES_BD } from '../utils/datos';
import '../styles/header.css';

const Header = () => {
    const navegar = useNavigate();
    const [usuario, setUsuario] = useState(obtenerUsuarioActual());
    const [cantidadCarrito, setCantidadCarrito] = useState(0);

    const actualizarAutenticacion = () => setUsuario(obtenerUsuarioActual());
    const actualizarCarrito = () => {
        const carrito = obtenerCarrito();
        const cantidad = carrito.reduce((acc, item) => acc + item.cantidad, 0);
        setCantidadCarrito(cantidad);
    };

    useEffect(() => {
        actualizarCarrito();
        actualizarAutenticacion();

        window.addEventListener('auth-cambiado', actualizarAutenticacion);
        window.addEventListener('carrito-actualizado', actualizarCarrito);

        return () => {
            window.removeEventListener('auth-cambiado', actualizarAutenticacion);
            window.removeEventListener('carrito-actualizado', actualizarCarrito);
        };
    }, []);

    const trackEvent = (tipo, detalle = {}) => {
        try {
            const log = JSON.parse(localStorage.getItem(CLAVES_BD.ACTIVITY_LOG) || '[]');
            log.push({ tipo, fecha: new Date().toLocaleString('es-CL'), detalle });
            localStorage.setItem(CLAVES_BD.ACTIVITY_LOG, JSON.stringify(log));
        } catch {}
    };

    const manejarMiCuenta = () => {
        trackEvent('menu_profile_click', { idUsuario: usuario?.id });
        navegar('/perfil');
    };

    return (
        <header>
            <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                <h2>🔥 GasExpress</h2>
            </Link>
            <div className="main-nav">
                <Link to="/" className="nav-link">Inicio</Link>
                <Link to="/catalogo" className="nav-link">Catálogo</Link>
                {usuario && <Link to="/pedidos" className="nav-link">Mis pedidos</Link>}
                <Link to="/ofertas" className="nav-link">Ofertas</Link>
                <Link to="/ayuda" className="nav-link">Ayuda</Link>
            </div>

            <div className="nav-actions">
                <button className="btn-nav" onClick={() => navegar('/carrito')}>
                    🛒 Carrito ({cantidadCarrito})
                </button>
                
                {usuario && usuario.nombre ? (
                    <button
                        className="btn-nav btn-outline"
                        type="button"
                        onClick={manejarMiCuenta}
                        aria-label="Ir a mi cuenta"
                    >
                        👤 {usuario.nombre.split(' ')[0]}
                    </button>
                ) : usuario ? (
                    <button
                        className="btn-nav btn-outline"
                        type="button"
                        onClick={manejarMiCuenta}
                        aria-label="Ir a mi cuenta"
                    >
                        👤 Usuario
                    </button>
                ) : (
                    <button className="btn-nav btn-outline" onClick={() => navegar('/iniciar-sesion')}>
                        👤 Iniciar Sesión
                    </button>
                )}
            </div>
        </header>
    );
};

export default Header;
