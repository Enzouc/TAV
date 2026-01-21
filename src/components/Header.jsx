import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { obtenerUsuarioActual, obtenerCarrito } from '../utils/almacenamiento';
import { cerrarSesion } from '../utils/autenticacion';
import { CLAVES_BD } from '../utils/datos';
import '../styles/header.css';

const Header = () => {
    const navegar = useNavigate();
    const [usuario, setUsuario] = useState(obtenerUsuarioActual());
    const [cantidadCarrito, setCantidadCarrito] = useState(0);
    const toggleRef = useRef(null);
    const menuRef = useRef(null);

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
    useEffect(() => {
        const btn = toggleRef.current;
        if (!btn) return;
        const handleShown = () => {
            const firstItem = menuRef.current?.querySelector('a,button');
            firstItem?.focus();
        };
        const handleHidden = () => {
            btn.focus();
        };
        btn.addEventListener('shown.bs.dropdown', handleShown);
        btn.addEventListener('hidden.bs.dropdown', handleHidden);
        return () => {
            btn.removeEventListener('shown.bs.dropdown', handleShown);
            btn.removeEventListener('hidden.bs.dropdown', handleHidden);
        };
    }, []);

    const trackEvent = (tipo, detalle = {}) => {
        try {
            const log = JSON.parse(localStorage.getItem(CLAVES_BD.ACTIVITY_LOG) || '[]');
            log.push({ tipo, fecha: new Date().toLocaleString('es-CL'), detalle });
            localStorage.setItem(CLAVES_BD.ACTIVITY_LOG, JSON.stringify(log));
        } catch {}
    };

    const manejarCierreSesion = () => {
        trackEvent('menu_logout_click', { idUsuario: usuario?.id });
        cerrarSesion();
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
                
                {usuario ? (
                    <div className="dropdown d-inline-block">
                        <button
                            ref={toggleRef}
                            className="btn-nav btn-outline dropdown-toggle"
                            type="button"
                            data-bs-toggle="dropdown"
                            aria-haspopup="menu"
                            aria-controls="menu-usuario"
                        >
                            👤 {usuario.nombre.split(' ')[0]}
                        </button>
                        <ul
                            id="menu-usuario"
                            ref={menuRef}
                            className="dropdown-menu dropdown-menu-end fade-soft"
                            role="menu"
                            aria-label="Menú de usuario"
                        >
                            <li>
                                <button className="dropdown-item" role="menuitem" onClick={manejarMiCuenta}>
                                    👤 Mi cuenta
                                </button>
                            </li>
                            {usuario.rol === 'repartidor' && (
                                <li><Link className="dropdown-item" role="menuitem" to="/repartidor">🚚 Panel Repartidor</Link></li>
                            )}
                            {usuario.rol === 'admin' && (
                                <li><Link className="dropdown-item" role="menuitem" to="/admin">🛠️ Panel Admin</Link></li>
                            )}
                            <li><hr className="dropdown-divider" /></li>
                            <li>
                                <button className="dropdown-item text-danger" role="menuitem" onClick={manejarCierreSesion}>
                                    🚪 Cerrar sesión
                                </button>
                            </li>
                        </ul>
                    </div>
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
