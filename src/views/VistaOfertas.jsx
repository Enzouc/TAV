import React, { useMemo, useState, useEffect } from 'react';
import { aplicarFormatoMoneda } from '../utils/datos';
import { obtenerCarrito, guardarCarrito } from '../utils/almacenamiento';
import { usarUI } from '../components/ContextoUI';
import { getProducts } from '../services/productsService';

const VistaOfertas = () => {
    const { mostrarNotificacion } = usarUI();
    const [ofertas, setOfertas] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const cargarOfertas = async () => {
            try {
                const res = await getProducts();
                const productos = Array.isArray(res) ? res : (res.data || []);
                
                // Simular ofertas basadas en productos reales
                const ofertasGeneradas = productos.map((prod, index) => {
                    const descuento = [0.10, 0.15, 0.05, 0.20][index % 4]; // Descuentos variados
                    const precioOriginal = Math.round(prod.precio * (1 + descuento));
                    return {
                        id: `oferta-${prod.id}`,
                        badge: `-${Math.round(descuento * 100)}% OFF`,
                        imagen: prod.imagen || 'productos_gas/producto-gas-15-kg.png',
                        titulo: prod.nombre,
                        descripcion: prod.descripcion,
                        precioOriginal: precioOriginal,
                        precioFinal: prod.precio,
                        productoId: prod.id,
                        stock: prod.stock
                    };
                });
                setOfertas(ofertasGeneradas);
            } catch (error) {
                console.error("Error cargando ofertas", error);
                mostrarNotificacion({ tipo: 'error', titulo: 'Error', mensaje: 'No se pudieron cargar las ofertas.' });
            } finally {
                setLoading(false);
            }
        };
        cargarOfertas();
    }, [mostrarNotificacion]);

    const manejarAgregar = (oferta) => {
        if (oferta.stock <= 0) {
            mostrarNotificacion({ tipo: 'warning', titulo: 'Sin stock', mensaje: 'Este producto está agotado.' });
            return;
        }
        const carrito = obtenerCarrito();
        const idx = carrito.findIndex(i => i.id === oferta.productoId);
        if (idx > -1) {
            carrito[idx].cantidad += 1;
            // carrito[idx].precio = oferta.precioFinal; // Usamos el precio actual
        } else {
            carrito.push({
                id: oferta.productoId,
                nombre: oferta.titulo,
                cantidad: 1,
                precio: oferta.precioFinal,
                img: oferta.imagen
            });
        }
        guardarCarrito(carrito);
        mostrarNotificacion({ tipo: 'info', titulo: 'Añadido al carrito', mensaje: `${oferta.titulo} agregado correctamente.` });
        window.dispatchEvent(new Event('carrito-actualizado'));
    };

    if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>;

    return (
        <main className="container py-4">
            <div className="card shadow-sm border-0">
                <div className="card-body">
                    <h2 className="mb-2">Ofertas Especiales</h2>
                    <p className="text-muted mb-4">Aprovecha nuestros descuentos por tiempo limitado.</p>

                <div className="row g-4">
                    {ofertas.length > 0 ? ofertas.map(oferta => (
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
                                        style={{ objectFit: 'contain', maxHeight: '200px', padding: '1rem' }}
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
                                            Ahorra {aplicarFormatoMoneda(oferta.precioOriginal - oferta.precioFinal)}
                                        </small>
                                        <div className="d-flex align-items-center justify-content-between mt-3">
                                            <span className={`badge ${oferta.stock > 0 ? 'bg-success' : 'bg-secondary'}`}>
                                                {oferta.stock > 0 ? 'Disponible' : 'Agotado'}
                                            </span>
                                            <button
                                                className="btn btn-primary btn-sm"
                                                onClick={() => manejarAgregar(oferta)}
                                                disabled={oferta.stock <= 0}
                                            >
                                                Añadir al carrito
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="col-12 text-center">No hay ofertas disponibles en este momento.</div>
                    )}
                </div>
            </div>
            </div>
        </main>
    );
};

export default VistaOfertas;
