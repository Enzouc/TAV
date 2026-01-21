import React, { useMemo } from 'react';
import { aplicarFormatoMoneda } from '../utils/datos';
import { obtenerProductos, obtenerCarrito, guardarCarrito } from '../utils/almacenamiento';
import { usarUI } from '../components/ContextoUI';

const VistaOfertas = () => {
    const { mostrarNotificacion } = usarUI();
    const ofertas = [
        {
            id: 'oferta-15',
            badge: '-15% OFF',
            imagen: 'productos_gas/producto-gas-15-kg.png',
            titulo: 'Pack Familiar 15Kg',
            descripcion: 'Ideal para familias grandes. Incluye instalación gratuita.',
            precioOriginal: 22500,
            precioFinal: 19125,
            productoId: '#P002'
        },
        {
            id: 'oferta-5',
            badge: '2x1',
            imagen: 'productos_gas/producto-gas-5-kg.png',
            titulo: 'Camping Pack 5Kg',
            descripcion: 'Lleva 2 cilindros de 5kg y paga solo 1. Solo Concepción.',
            precioOriginal: 15000,
            precioFinal: 7500,
            productoId: '#P004'
        },
        {
            id: 'oferta-45',
            badge: 'Envío Gratis',
            imagen: 'productos_gas/producto-gas-45-kg.png',
            titulo: 'Cilindro Industrial 45Kg',
            descripcion: 'Para alto consumo. Envío gratis en todo el Gran Concepción.',
            precioOriginal: 65000,
            precioFinal: 58000,
            productoId: '#P003'
        }
    ];

    const inventario = useMemo(() => obtenerProductos(), []);

    const calcularDescuento = (oferta) => {
        const pct = Math.round((1 - oferta.precioFinal / oferta.precioOriginal) * 100);
        const ahorro = oferta.precioOriginal - oferta.precioFinal;
        return { pct: Math.max(pct, 0), ahorro };
    };

    const obtenerStock = (productoId) => {
        const p = inventario.find(x => x.id === productoId);
        return p ? p.stock : 0;
    };

    const manejarAgregar = (oferta) => {
        const stock = obtenerStock(oferta.productoId);
        if (stock <= 0) {
            mostrarNotificacion({ tipo: 'warning', titulo: 'Sin stock', mensaje: 'Este producto está agotado.' });
            return;
        }
        const carrito = obtenerCarrito();
        const idx = carrito.findIndex(i => i.id === oferta.productoId);
        if (idx > -1) {
            carrito[idx].cantidad += 1;
            carrito[idx].precio = oferta.precioFinal;
        } else {
            const producto = inventario.find(x => x.id === oferta.productoId);
            carrito.push({
                id: oferta.productoId,
                nombre: producto ? producto.nombre : oferta.titulo,
                cantidad: 1,
                precio: oferta.precioFinal
            });
        }
        guardarCarrito(carrito);
        mostrarNotificacion({ tipo: 'info', titulo: 'Añadido al carrito', mensaje: `${oferta.titulo} agregado correctamente.` });
    };

    return (
        <main className="container py-4">
            <div className="card shadow-sm border-0">
                <div className="card-body">
                    <h2 className="mb-2">Ofertas Especiales</h2>
                    <p className="text-muted mb-4">Aprovecha nuestros descuentos por tiempo limitado.</p>

                <div className="row g-4">
                    {ofertas.map(oferta => (
                        <div key={oferta.id} className="col-sm-6 col-lg-4">
                            <div className="card h-100 oferta-card">
                                <div className="position-relative">
                                    <span className="badge bg-danger position-absolute top-0 start-0 m-2">{oferta.badge}</span>
                                    <img
                                        src={oferta.imagen}
                                        alt={oferta.titulo}
                                        className="card-img-top"
                                        loading="lazy"
                                        width="400"
                                        height="300"
                                        style={{ objectFit: 'cover' }}
                                    />
                                </div>
                                <div className="card-body d-flex flex-column">
                                    <h3 className="h5 card-title">{oferta.titulo}</h3>
                                    <p className="card-text text-muted">{oferta.descripcion}</p>
                                    <div className="mt-auto">
                                        <div className="d-flex align-items-baseline gap-2">
                                            <span className="text-muted text-decoration-line-through">
                                                {aplicarFormatoMoneda(oferta.precioOriginal)}
                                            </span>
                                            <span className="h5 text-primary fw-bold">
                                                {aplicarFormatoMoneda(oferta.precioFinal)}
                                            </span>
                                        </div>
                                        <small className="text-success d-block mt-1">
                                            {(() => {
                                                const { pct, ahorro } = calcularDescuento(oferta);
                                                return `Ahorra ${aplicarFormatoMoneda(ahorro)} (${pct}% descuento)`;
                                            })()}
                                        </small>
                                        <div className="d-flex align-items-center justify-content-between mt-3">
                                            <span className={`badge ${obtenerStock(oferta.productoId) > 0 ? 'bg-success' : 'bg-secondary'}`}>
                                                {obtenerStock(oferta.productoId) > 0 ? 'Disponible' : 'Agotado'}
                                            </span>
                                            <button
                                                className="btn btn-primary btn-sm"
                                                onClick={() => manejarAgregar(oferta)}
                                                disabled={obtenerStock(oferta.productoId) <= 0}
                                            >
                                                Añadir al carrito
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            </div>
        </main>
    );
};

export default VistaOfertas;
