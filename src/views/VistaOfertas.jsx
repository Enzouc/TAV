import React, { useMemo, useState, useEffect } from 'react';
import { aplicarFormatoMoneda } from '../utils/datos';
import { obtenerProductos, obtenerCarrito, guardarCarrito } from '../utils/almacenamiento';
import { usarUI } from '../components/ContextoUI';
import ProductModal from '../components/ProductModal';
import { getProducts } from '../services/productsService';

const VistaOfertas = () => {
    const { mostrarNotificacion } = usarUI();
    const [modalAbierto, setModalAbierto] = useState(false);
    const [seleccion, setSeleccion] = useState(null);
    const [inventario, setInventario] = useState([]);
    
    useEffect(() => {
        const controller = new AbortController();
        const cargarInventario = async () => {
            try {
                const res = await getProducts({}, controller.signal);
                
                // Validación robusta de la respuesta
                if (res && typeof res === 'object') {
                    const prods = Array.isArray(res) ? res : (Array.isArray(res.data) ? res.data : (res.data?.data || []));
                    setInventario(prods);
                } else {
                    throw new Error('Formato de respuesta inválido');
                }
            } catch (e) {
                if (e.name !== 'CanceledError' && e.code !== 'ERR_CANCELED') {
                    console.warn('API error en ofertas, usando local fallback:', e);
                    setInventario(obtenerProductos());
                }
            }
        };
        cargarInventario();
        return () => controller.abort();
    }, []);

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

    const calcularDescuento = (oferta) => {
        const pct = Math.round((1 - oferta.precioFinal / oferta.precioOriginal) * 100);
        const ahorro = oferta.precioOriginal - oferta.precioFinal;
        return { pct: Math.max(pct, 0), ahorro };
    };

    const obtenerStock = (productoId) => {
        const p = inventario.find(x => x.id === productoId);
        return p ? p.stock : 0;
    };

    const abrirSelector = (oferta) => {
        const stock = obtenerStock(oferta.productoId);
        if (stock <= 0) {
            mostrarNotificacion({ tipo: 'warning', titulo: 'Sin stock', mensaje: 'Este producto está agotado.' });
            return;
        }
        setSeleccion(oferta);
        setModalAbierto(true);
    };

    const manejarAgregar = (oferta, cant = 1) => {
        const stock = obtenerStock(oferta.productoId);
        if (stock <= 0) {
            mostrarNotificacion({ tipo: 'warning', titulo: 'Sin stock', mensaje: 'Este producto está agotado.' });
            return;
        }
        if (cant < 1) {
            mostrarNotificacion({ tipo: 'warning', titulo: 'Cantidad inválida', mensaje: 'Debe ser al menos 1.' });
            return;
        }
        if (cant > stock) {
            mostrarNotificacion({ tipo: 'warning', titulo: 'Sin stock suficiente', mensaje: `Máximo disponible: ${stock}.` });
            return;
        }
        const carrito = obtenerCarrito();
        const idx = carrito.findIndex(i => i.id === oferta.productoId);
        if (idx > -1) {
            carrito[idx].cantidad += cant;
            carrito[idx].precio = oferta.precioFinal;
        } else {
            const producto = inventario.find(x => x.id === oferta.productoId);
            carrito.push({
                id: oferta.productoId,
                nombre: producto ? producto.nombre : oferta.titulo,
                cantidad: cant,
                precio: oferta.precioFinal
            });
        }
        guardarCarrito(carrito);
        mostrarNotificacion({ tipo: 'info', titulo: 'Añadido al carrito', mensaje: `${oferta.titulo} agregado correctamente.` });
        setModalAbierto(false);
        setSeleccion(null);
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
                            <div
                                className="card h-100 oferta-card"
                                role="button"
                                tabIndex={0}
                                onClick={() => abrirSelector(oferta)}
                                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') abrirSelector(oferta); }}
                                aria-label={`Seleccionar ${oferta.titulo}`}
                                style={{ cursor: 'pointer' }}
                            >
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
                                                onClick={(e) => { e.stopPropagation(); abrirSelector(oferta); }}
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
            <ProductModal 
                show={modalAbierto}
                onClose={() => { setModalAbierto(false); setSeleccion(null); }}
                product={seleccion ? {
                    ...seleccion,
                    nombre: seleccion.titulo,
                    precio: seleccion.precioFinal,
                    stock: obtenerStock(seleccion.productoId),
                    categoria: 'Oferta'
                } : null}
                onAddToCart={(p, qty) => manejarAgregar(seleccion, qty)}
            />
        </main>
    );
};

export default VistaOfertas;
