import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { guardarUsuarioActual } from '../utils/almacenamiento';
import { Carousel } from 'bootstrap';

const VistaInicio = () => {
    const navegar = useNavigate();

    const loginTemporal = (rol) => {
        let usuario;
        if (rol === 'admin') {
            usuario = { id: '#ADMIN', nombre: 'Administrador', email: 'admin@gasexpress.cl', rol: 'admin' };
        } else if (rol === 'repartidor') {
            usuario = { id: '#R050', nombre: 'Pedro El Rayo', email: 'pedro@gasexpress.cl', rol: 'repartidor' };
        }
        
        if (usuario) {
            guardarUsuarioActual(usuario);
            if (rol === 'admin') navegar('/admin');
            if (rol === 'repartidor') navegar('/repartidor');
        }
    };

    useEffect(() => {
        const el = document.getElementById('carruselHero');
        if (!el) return;
        new Carousel(el, { interval: 5000, pause: 'hover', ride: 'carousel', touch: true, wrap: true });
    }, []);

    return (
        <main>
            {/* Control de Acceso Temporal */}
            <div className="container mt-3 text-end">
                <span className="me-2 badge bg-warning text-dark">Acceso Temporal (Debug)</span>
                <div className="btn-group">
                    <button className="btn btn-sm btn-outline-dark" onClick={() => loginTemporal('admin')}>Acceso Admin</button>
                    <button className="btn btn-sm btn-outline-dark" onClick={() => loginTemporal('repartidor')}>Acceso Repartidor</button>
                </div>
            </div>

            <div className="card p-0 overflow-hidden border-0 shadow-sm">
                <div id="carruselHero" className="carousel slide" data-bs-ride="carousel">
                    <div className="carousel-indicators">
                        <button type="button" data-bs-target="#carruselHero" data-bs-slide-to="0" className="active" aria-current="true" aria-label="Slide 1"></button>
                        <button type="button" data-bs-target="#carruselHero" data-bs-slide-to="1" aria-label="Slide 2"></button>
                        <button type="button" data-bs-target="#carruselHero" data-bs-slide-to="2" aria-label="Slide 3"></button>
                    </div>
                    <div className="carousel-inner">
                        <div className="carousel-item active">
                            <div className="hero-slide hero-slide-1">
                                <h1 className="display-4 fw-bold">Gas a domicilio en Concepción</h1>
                                <p className="lead">Compra cilindros de gas y recíbelos en tu hogar en minutos.</p>
                                <Link to="/catalogo" className="btn btn-light btn-lg mt-3 fw-bold hero-cta">
                                    Comprar ahora
                                </Link>
                            </div>
                        </div>
                        <div className="carousel-item">
                            <div className="hero-slide hero-slide-2">
                                <h1 className="display-4 fw-bold">Despacho Express en Gran Concepción</h1>
                                <p className="lead">Llegamos a donde estés en menos de 60 minutos garantizado.</p>
                                <Link to="/zonas" className="btn btn-light btn-lg mt-3 fw-bold text-danger hero-cta">
                                    Ver zonas
                                </Link>
                            </div>
                        </div>
                        <div className="carousel-item">
                            <div className="hero-slide hero-slide-3">
                                <h1 className="display-4 fw-bold">Precios Bajos</h1>
                                <p className="lead">Las mejores ofertas en cilindros de 5kg, 11kg, 15kg y 45kg.</p>
                                <Link to="/ofertas" className="btn btn-light btn-lg mt-3 fw-bold text-success hero-cta">
                                    Ver ofertas
                                </Link>
                            </div>
                        </div>
                    </div>
                    <button className="carousel-control-prev" type="button" data-bs-target="#carruselHero" data-bs-slide="prev">
                        <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                        <span className="visually-hidden">Anterior</span>
                    </button>
                    <button className="carousel-control-next" type="button" data-bs-target="#carruselHero" data-bs-slide="next">
                        <span className="carousel-control-next-icon" aria-hidden="true"></span>
                        <span className="visually-hidden">Siguiente</span>
                    </button>
                </div>
            </div>

            <div className="card mt-4">
                <div className="features-grid">
                    <div className="feature-item">
                        <h4>Despacho rápido</h4>
                        <p>Entregamos gas en todo el Gran Concepción.</p>
                    </div>
                    <div className="feature-item">
                        <h4>Recambio de cilindros</h4>
                        <p>Trae tu cilindro vacío y lo cambiamos.</p>
                    </div>
                    <div className="feature-item">
                        <h4>Soporte 24/7</h4>
                        <p>Atención al cliente siempre disponible.</p>
                    </div>
                </div>
            </div>

            <div className="card mt-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h2 className="m-0">🔥 Ofertas y Packs del Mes</h2>
                    <Link to="/ofertas" className="btn btn-outline-danger fw-semibold">
                        Ver todas las ofertas
                    </Link>
                </div>
                <div className="row row-cols-1 row-cols-md-3 g-4">
                    {/* Productos destacados harcoded para Inicio, o obtener de BD */}
                    <div className="col">
                        <div className="card h-100 border-0 shadow-sm">
                            <img
                                src="productos_gas/producto-gas-15-kg.png"
                                className="card-img-top p-3"
                                alt="Pack Familiar"
                                style={{ height: '200px', objectFit: 'contain' }}
                                loading="lazy"
                            />
                            <div className="card-body text-center">
                                <span className="badge bg-danger mb-2">-15% OFF</span>
                                <h5 className="card-title">Pack Familiar 15Kg</h5>
                                <p className="card-text text-muted">Ideal para el hogar. Incluye revisión de seguridad gratuita.</p>
                                <div className="mb-3">
                                    <span className="text-decoration-line-through text-muted">$22.500</span>
                                    <span className="fs-4 fw-bold text-primary ms-2">$19.125</span>
                                </div>
                                <Link to="/ofertas" className="btn btn-primary w-100">
                                    Ver en ofertas
                                </Link>
                            </div>
                        </div>
                    </div>
                    <div className="col">
                        <div className="card h-100 border-0 shadow-sm">
                            <img
                                src="productos_gas/producto-gas-5-kg.png"
                                className="card-img-top p-3"
                                alt="Pack Camping"
                                style={{ height: '200px', objectFit: 'contain' }}
                                loading="lazy"
                            />
                            <div className="card-body text-center">
                                <span className="badge bg-warning text-dark mb-2">2x1</span>
                                <h5 className="card-title">Camping Pack 5Kg</h5>
                                <p className="card-text text-muted">Lleva 2 cilindros pequeños perfectos para tus salidas.</p>
                                <div className="mb-3">
                                    <span className="text-decoration-line-through text-muted">$15.000</span>
                                    <span className="fs-4 fw-bold text-primary ms-2">$7.500</span>
                                </div>
                                <Link to="/ofertas" className="btn btn-primary w-100">
                                    Ver en ofertas
                                </Link>
                            </div>
                        </div>
                    </div>
                    <div className="col">
                        <div className="card h-100 border-0 shadow-sm">
                            <img
                                src="productos_gas/producto-gas-45-kg.png"
                                className="card-img-top p-3"
                                alt="Pack Industrial"
                                style={{ height: '200px', objectFit: 'contain' }}
                                loading="lazy"
                            />
                            <div className="card-body text-center">
                                <span className="badge bg-success mb-2">Envío Gratis</span>
                                <h5 className="card-title">Cilindro Industrial 45Kg</h5>
                                <p className="card-text text-muted">Máxima duración para tu negocio o calefacción central.</p>
                                <div className="mb-3">
                                    <span className="text-decoration-line-through text-muted">$65.000</span>
                                    <span className="fs-4 fw-bold text-primary ms-2">$58.000</span>
                                </div>
                                <Link to="/ofertas" className="btn btn-primary w-100">
                                    Ver en ofertas
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default VistaInicio;
