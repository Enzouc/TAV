import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { guardarUsuarioActual, obtenerCarrito, guardarCarrito } from '../utils/almacenamiento';
import { usarUI } from '../components/ContextoUI';
import { Carousel } from 'bootstrap';
import ProductModal from '../components/ProductModal';

const VistaInicio = () => {
    const navegar = useNavigate();
    const { mostrarNotificacion } = usarUI();
    const [productoModal, setProductoModal] = useState(null);

    // Datos de productos en oferta para renderizado dinámico y consistente
    const PRODUCTOS_OFERTA = [
        {
            id: '#P002',
            nombre: 'Pack Familiar 15Kg',
            precio: 19125,
            precioOriginal: 22500,
            imagen: 'productos_gas/producto-gas-15-kg.png',
            descripcion: 'Ideal para el hogar. Incluye revisión de seguridad gratuita.',
            categoria: 'Normal',
            badge: { text: '-15% OFF', color: 'bg-danger' },
            badgeTextClass: 'text-white'
        },
        {
            id: '#P004',
            nombre: 'Camping Pack 5Kg',
            precio: 7500,
            precioOriginal: 15000,
            imagen: 'productos_gas/producto-gas-5-kg.png',
            descripcion: 'Lleva 2 cilindros pequeños perfectos para tus salidas.',
            categoria: 'Camping',
            badge: { text: '2x1', color: 'bg-warning text-dark' },
            badgeTextClass: 'text-dark'
        },
        {
            id: '#P003',
            nombre: 'Cilindro Industrial 45Kg',
            precio: 58000,
            precioOriginal: 65000,
            imagen: 'productos_gas/producto-gas-45-kg.png',
            descripcion: 'Máxima duración para tu negocio o calefacción central.',
            categoria: 'Industrial',
            badge: { text: 'Envío Gratis', color: 'bg-success' },
            badgeTextClass: 'text-white'
        }
    ];

    const handleAddToCart = (producto, cantidad = 1) => {
        const carrito = obtenerCarrito();
        const itemIndex = carrito.findIndex((item) => item.id === producto.id);

        if (itemIndex > -1) {
            carrito[itemIndex].cantidad += cantidad;
            // Actualizar precio al de la oferta si ya existe
            carrito[itemIndex].precio = producto.precio;
        } else {
            carrito.push({
                id: producto.id,
                nombre: producto.nombre,
                precio: producto.precio,
                cantidad: cantidad,
                imagen: producto.imagen
            });
        }
        guardarCarrito(carrito);
        mostrarNotificacion({
            tipo: 'success',
            titulo: 'Agregado al carrito',
            mensaje: `${producto.nombre} agregado correctamente.`,
        });
        setProductoModal(null);
    };

    const abrirModalDesdeBoton = (e, producto) => {
        e.stopPropagation();
        e.preventDefault();
        abrirModal(producto);
    };

    const abrirModal = (producto) => {
        setProductoModal({ ...producto, stock: 50 }); // Stock simulado para ofertas
    };

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
        try {
            new Carousel(el, { interval: 5000, pause: 'hover', ride: 'carousel', touch: true, wrap: true });
        } catch (e) {
            console.error('Error inicializando carrusel', e);
        }
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
                    {PRODUCTOS_OFERTA.map((producto) => (
                        <div className="col" key={producto.id}>
                            <div
                                className="card h-100 border-0 shadow-sm"
                                role="link"
                                tabIndex={0}
                                onClick={() => abrirModal(producto)}
                                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') abrirModal(producto); }}
                                style={{ cursor: 'pointer' }}
                                aria-label={`Ver detalle de ${producto.nombre}`}
                            >
                                <img
                                    src={producto.imagen}
                                    className="card-img-top p-3"
                                    alt={producto.nombre}
                                    style={{ height: '200px', objectFit: 'contain' }}
                                    loading="lazy"
                                />
                                <div className="card-body text-center">
                                    <span className={`badge ${producto.badge.color} mb-2`}>{producto.badge.text}</span>
                                    <h5 className="card-title">{producto.nombre}</h5>
                                    <p className="card-text text-muted">{producto.descripcion}</p>
                                    <div className="mb-3">
                                        <span className="text-decoration-line-through text-muted">${producto.precioOriginal.toLocaleString('es-CL')}</span>
                                        <span className="fs-4 fw-bold text-primary ms-2">${producto.precio.toLocaleString('es-CL')}</span>
                                    </div>
                                    <button 
                                        className="btn btn-primary w-100"
                                        onClick={(e) => abrirModalDesdeBoton(e, producto)}
                                        type="button"
                                    >
                                        Agregar al carrito
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <ProductModal  
                show={!!productoModal}
                onClose={() => setProductoModal(null)}
                product={productoModal}
                onAddToCart={handleAddToCart}
            />
        </main>
    );
};

export default VistaInicio;
