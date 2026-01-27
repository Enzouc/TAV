import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { obtenerUsuarioActual, obtenerCarrito } from '../utils/almacenamiento';
import { cerrarSesion as cerrarSesionLocal } from '../utils/autenticacion';
import { logout } from '../services/usersService';
import { CLAVES_BD } from '../utils/datos';
import '../styles/header.css';

const Header = () => {
    const navegar = useNavigate();
    const [usuario, setUsuario] = useState(obtenerUsuarioActual());
    const [cantidadCarrito, setCantidadCarrito] = useState(0);
    const [mostrarMenu, setMostrarMenu] = useState(false);

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

    // Cerrar menú al hacer click fuera
    useEffect(() => {
        const clickFuera = (e) => {
            if (mostrarMenu && !e.target.closest('.dropdown')) {
                setMostrarMenu(false);
            }
        };
        document.addEventListener('click', clickFuera);
        return () => document.removeEventListener('click', clickFuera);
    }, [mostrarMenu]);

    const trackEvent = (tipo, detalle = {}) => {
        try {
            const log = JSON.parse(localStorage.getItem(CLAVES_BD.ACTIVITY_LOG) || '[]');
            log.push({ tipo, fecha: new Date().toLocaleString('es-CL'), detalle });
            localStorage.setItem(CLAVES_BD.ACTIVITY_LOG, JSON.stringify(log));
        } catch {}
    };

    const manejarCierreSesion = async () => {
        trackEvent('menu_logout_click', { idUsuario: usuario?.id });
        try {
            await logout();
        } catch (error) {
            console.error('Error al cerrar sesión en servidor:', error);
        } finally {
            cerrarSesionLocal();
        }
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
                            className={`btn-nav btn-outline dropdown-toggle ${mostrarMenu ? 'show' : ''}`}
                            type="button"
                            onClick={() => setMostrarMenu(!mostrarMenu)}
                            aria-expanded={mostrarMenu}
                            aria-haspopup="true"
                        >
                            👤 {usuario.nombre.split(' ')[0]}
                        </button>
                        <ul
                            className={`dropdown-menu dropdown-menu-end fade-soft ${mostrarMenu ? 'show' : ''}`}
                            style={{ display: mostrarMenu ? 'block' : 'none', position: 'absolute', right: 0, left: 'auto' }}
                            role="menu"
                        >
                            <li>
                                <button className="dropdown-item" role="menuitem" onClick={() => { manejarMiCuenta(); setMostrarMenu(false); }}>
                                    👤 Mi cuenta
                                </button>
                            </li>
                            {usuario.rol === 'repartidor' && (
                                <li><Link className="dropdown-item" role="menuitem" to="/repartidor" onClick={() => setMostrarMenu(false)}>🚚 Panel Repartidor</Link></li>
                            )}
                            {usuario.rol === 'admin' && (
                                <li><Link className="dropdown-item" role="menuitem" to="/admin" onClick={() => setMostrarMenu(false)}>🛠️ Panel Admin</Link></li>
                            )}
                            <li><hr className="dropdown-divider" /></li>
                            <li>
                                <button className="dropdown-item text-danger" role="menuitem" onClick={() => { manejarCierreSesion(); setMostrarMenu(false); }}>
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
