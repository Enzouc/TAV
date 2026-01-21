import React, { useState, useEffect } from 'react';
import { obtenerCarrito, guardarCarrito } from '../utils/almacenamiento';
import { obtenerTodosLosProductos } from '../utils/producto';
import { aplicarFormatoMoneda } from '../utils/datos';
import ProductCard from '../components/ProductCard';
import FiltrosCatalogo from '../components/FiltrosCatalogo';
import ControlesPaginacion from '../components/ControlesPaginacion';
import { fetchProducts } from '../services/productService';

const VistaCatalogo = ({ data, apiUrl = null, initialView = 'grid', cardClassName = '', cardStyle = {} }) => {
    const [productos, setProductos] = useState([]);
    const [carrito, setCarrito] = useState([]);
    const [productoModal, setProductoModal] = useState(null);
    const [cantidad, setCantidad] = useState(1);
    const [vista, setVista] = useState(initialView === 'list' ? 'list' : 'grid');
    const [filtroTexto, setFiltroTexto] = useState('');
    const [filtroCategoria, setFiltroCategoria] = useState('todas');
    const [orden, setOrden] = useState('precio_asc');
    const [pagina, setPagina] = useState(1);
    const [tamPagina, setTamPagina] = useState(12);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const cargar = async () => {
            try {
                setCargando(true);
                setError('');
                let fuente = null;
                if (Array.isArray(data?.productos)) {
                    fuente = data.productos;
                } else if (apiUrl) {
                    const r = await fetchProducts(apiUrl);
                    if (r.status === 'success') {
                        fuente = r.data;
                    } else {
                        setError('Error al obtener productos: ' + (r.error?.message || 'desconocido'));
                        fuente = obtenerTodosLosProductos();
                    }
                } else {
                    fuente = obtenerTodosLosProductos();
                }
                setProductos(fuente);
                setCarrito(obtenerCarrito());
            } catch (e) {
                setError('Error al cargar catálogo: ' + e.message);
            } finally {
                setCargando(false);
            }
        };
        cargar();
        const manejarActualizacionCarrito = () => setCarrito(obtenerCarrito());
        window.addEventListener('carrito-actualizado', manejarActualizacionCarrito);
        return () => window.removeEventListener('carrito-actualizado', manejarActualizacionCarrito);
    }, []);

    const obtenerImagen = (nombre) => {
        if (!nombre) return 'productos_gas/producto-gas-15-kg.png';
        const nm = String(nombre).toLowerCase();
        
        if (nm.includes('catalítico') || nm.includes('catalitico')) {
            return 'productos_gas/producto-gas-catalitico-11-kg.jpg';
        }
        
        const match = nm.match(/(\d+)\s*kg/);
        const peso = match ? parseInt(match[1], 10) : null;
        
        if (peso === 5) return 'productos_gas/producto-gas-5-kg.png';
        if (peso === 11) return 'productos_gas/producto-gas-11-kg.png';
        if (peso === 15) return 'productos_gas/producto-gas-15-kg.png';
        if (peso === 45) return 'productos_gas/producto-gas-45-kg.png';
        
        return 'productos_gas/producto-gas-15-kg.png';
    };

    const abrirModal = (producto) => {
        if (producto.stock <= 0) return;
        setProductoModal(producto);
        setCantidad(1);
    };

    const cerrarModal = () => {
        setProductoModal(null);
    };

    const agregarAlCarrito = () => {
        if (!productoModal) return;

        const nuevoCarrito = [...carrito];
        const indiceItemExistente = nuevoCarrito.findIndex(item => item.id === productoModal.id);

        if (indiceItemExistente > -1) {
            nuevoCarrito[indiceItemExistente].cantidad += cantidad;
        } else {
            nuevoCarrito.push({
                id: productoModal.id,
                nombre: productoModal.nombre,
                precio: productoModal.precio,
                img: obtenerImagen(productoModal.nombre),
                cantidad: cantidad
            });
        }

        guardarCarrito(nuevoCarrito);
        cerrarModal();
    };

    const obtenerColorBadge = (categoria) => {
        switch(categoria) {
            case 'Industrial': return 'bg-dark';
            case 'Camping': return 'bg-info text-dark';
            case 'Catalítico': return 'bg-warning text-dark';
            default: return 'bg-primary';
        }
    };

    const categoriasUnicas = ['todas', ...Array.from(new Set(productos.map(p => p.categoria)))];
    const aplicaFiltroTexto = (p) => {
        const q = filtroTexto.trim().toLowerCase();
        if (!q) return true;
        return (p.nombre?.toLowerCase().includes(q) || p.descripcion?.toLowerCase().includes(q) || p.categoria?.toLowerCase().includes(q));
    };
    const aplicaFiltroCategoria = (p) => filtroCategoria === 'todas' || p.categoria === filtroCategoria;
    const ordenadores = {
        precio_asc: (a, b) => a.precio - b.precio,
        precio_desc: (a, b) => b.precio - a.precio,
        stock_desc: (a, b) => b.stock - a.stock,
        nombre_asc: (a, b) => String(a.nombre).localeCompare(String(b.nombre), 'es'),
    };
    const filtrados = productos.filter(p => aplicaFiltroTexto(p) && aplicaFiltroCategoria(p)).sort(ordenadores[orden]);
    const total = filtrados.length;
    const totalPaginas = Math.max(1, Math.ceil(total / tamPagina));
    const paginaActual = Math.min(pagina, totalPaginas);
    const inicio = (paginaActual - 1) * tamPagina;
    const visibles = filtrados.slice(inicio, inicio + tamPagina);

    return (
        <div className="layout">
            <main>
                <div className="banner banner-catalogo">
                    <h1>¡Nuestros productos!</h1>
                    <p className="lead">Calidad y seguridad garantizada en cada cilindro</p>
                </div>

                <div className="container py-5">
                    <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
                        <h2 className="text-primary">Catálogo de Productos</h2>
                        <span className="text-muted">{total} productos</span>
                    </div>
                    
                    <FiltrosCatalogo
                        categorias={categoriasUnicas}
                        filtroTexto={filtroTexto}
                        onFiltroTexto={(v) => { setFiltroTexto(v); setPagina(1); }}
                        filtroCategoria={filtroCategoria}
                        onFiltroCategoria={(v) => { setFiltroCategoria(v); setPagina(1); }}
                        orden={orden}
                        onOrden={setOrden}
                        vista={vista}
                        onVista={setVista}
                    />
                    
                    {cargando && <div className="alert alert-info">Cargando catálogo...</div>}
                    {error && <div className="alert alert-danger">{error}</div>}
                    
                    {visibles.length === 0 && !cargando && (
                        <div className="alert alert-secondary">No hay productos que coincidan con el filtro.</div>
                    )}

                    {vista === 'grid' ? (
                        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4">
                            {visibles.map(p => (
                                <div key={p.id} className="col">
                                    <ProductCard product={p} view="grid" onClick={abrirModal} className={cardClassName} style={cardStyle} />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="list-group">
                            {visibles.map(p => (
                                <div key={p.id} className="list-group-item">
                                    <div className="row align-items-center">
                                        <div className="col-12 col-md-4">
                                            <ProductCard product={p} view="list" onClick={abrirModal} className={cardClassName} style={cardStyle} />
                                        </div>
                                        <div className="col-12 col-md-8 d-flex justify-content-between align-items-center">
                                            <div>
                                                <h5 className="mb-1">{p.nombre}</h5>
                                                <p className="mb-1 text-muted">{p.descripcion}</p>
                                            </div>
                                            <span className="h5 mb-0 text-primary fw-bold">{aplicarFormatoMoneda(p.precio)}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <ControlesPaginacion
                        paginaActual={paginaActual}
                        totalPaginas={totalPaginas}
                        tamPagina={tamPagina}
                        onTamPagina={(n) => { setTamPagina(n); setPagina(1); }}
                        onPrev={() => setPagina(paginaActual - 1)}
                        onNext={() => setPagina(paginaActual + 1)}
                    />
                </div>
            </main>

            {/* Modal de Detalle */}
            {productoModal && (
                <div className="modal show d-block fade-in" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(2px)' }} tabIndex="-1">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow-lg">
                            <div className="modal-header border-0 pb-0">
                                <h5 className="modal-title fw-bold text-primary">{productoModal.nombre}</h5>
                                <button type="button" className="btn-close" onClick={cerrarModal} aria-label="Close"></button>
                            </div>
                            <div className="modal-body text-center px-4 py-2">
                                <div className="bg-light rounded-3 p-3 mb-3">
                                    <img 
                                        src={obtenerImagen(productoModal.nombre)} 
                                        alt={productoModal.nombre} 
                                        className="img-fluid" 
                                        style={{ maxHeight: '250px', mixBlendMode: 'multiply' }} 
                                        loading="lazy"
                                    />
                                </div>
                                <p className="text-muted">{productoModal.descripcion}</p>
                                
                                <div className="d-flex justify-content-center align-items-center mb-3">
                                    <span className="badge bg-secondary me-2">{productoModal.categoria}</span>
                                    <span className={`badge ${productoModal.stock > 10 ? 'bg-success' : 'bg-warning text-dark'}`}>
                                        Stock: {productoModal.stock} un.
                                    </span>
                                </div>

                                <h3 className="text-primary fw-bold my-3">{aplicarFormatoMoneda(productoModal.precio)}</h3>
                                
                                <div className="d-flex justify-content-center align-items-center gap-3 p-2 border rounded bg-light d-inline-flex">
                                    <button 
                                        className="btn btn-sm btn-outline-secondary rounded-circle" 
                                        onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                                        disabled={cantidad <= 1}
                                        style={{ width: '32px', height: '32px' }}
                                    >
                                        -
                                    </button>
                                    <span className="fw-bold fs-5" style={{ minWidth: '30px' }}>{cantidad}</span>
                                    <button 
                                        className="btn btn-sm btn-outline-secondary rounded-circle" 
                                        onClick={() => setCantidad(cantidad + 1)}
                                        disabled={cantidad >= productoModal.stock}
                                        style={{ width: '32px', height: '32px' }}
                                    >
                                        +
                                    </button>
                                </div>
                                <div className="mt-2 text-muted small">
                                    Total a pagar: <strong>{aplicarFormatoMoneda(productoModal.precio * cantidad)}</strong>
                                </div>
                            </div>
                            <div className="modal-footer border-0 pt-0 justify-content-center pb-4">
                                <button type="button" className="btn btn-outline-secondary px-4" onClick={cerrarModal}>Seguir mirando</button>
                                <button type="button" className="btn btn-primary px-5 fw-bold" onClick={agregarAlCarrito}>
                                    Agregar al Carrito
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VistaCatalogo;
