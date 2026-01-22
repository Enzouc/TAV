import React, { useState, useEffect } from 'react';
import { obtenerCarrito, guardarCarrito } from '../utils/almacenamiento';
import { obtenerTodosLosProductos, obtenerImagenProducto } from '../utils/producto';
import { aplicarFormatoMoneda } from '../utils/datos';
import ProductCard from '../components/ProductCard';
import FiltrosCatalogo from '../components/FiltrosCatalogo';
import ControlesPaginacion from '../components/ControlesPaginacion';
import ProductModal from '../components/ProductModal';
import { getProducts } from '../services/productsService';

const VistaCatalogo = ({ data, apiUrl = null, initialView = 'grid', cardClassName = '', cardStyle = {} }) => {
    const [productos, setProductos] = useState([]);
    const [carrito, setCarrito] = useState([]);
    const [productoModal, setProductoModal] = useState(null);
    const [vista, setVista] = useState(initialView === 'list' ? 'list' : 'grid');
    const [filtroTexto, setFiltroTexto] = useState('');
    const [filtroCategoria, setFiltroCategoria] = useState('todas');
    const [orden, setOrden] = useState('precio_asc');
    const [pagina, setPagina] = useState(1);
    const [tamPagina, setTamPagina] = useState(12);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const controller = new AbortController();
        const cargar = async () => {
            try {
                setCargando(true);
                setError('');
                let fuente = null;
                if (Array.isArray(data?.productos)) {
                    fuente = data.productos;
                } else {
                    // Intento de carga desde API con fallback a local
                    try {
                        const res = await getProducts({}, controller.signal);
                        // Validar si es una respuesta válida (API real) o HTML/Error
                        if (typeof res === 'string' && res.trim().startsWith('<')) {
                             throw new Error('Respuesta API inválida (HTML)');
                        }
                        
                        const items = Array.isArray(res) ? res : (res.data || []);
                        if (!Array.isArray(items)) throw new Error('Formato de datos inválido');
                        
                        fuente = items;
                    } catch (apiErr) {
                        if (apiErr.name !== 'CanceledError' && apiErr.code !== 'ERR_CANCELED') {
                            console.warn('Fallo API o datos inválidos, usando datos locales:', apiErr);
                            // Fallback a datos locales
                            fuente = obtenerTodosLosProductos();
                        } else {
                            // Si es cancelación, relanzamos para que lo maneje el catch externo o simplemente retornamos
                            throw apiErr;
                        }
                    }
                }
                if (fuente) setProductos(fuente);
                setCarrito(obtenerCarrito());
            } catch (e) {
                if (e.name !== 'CanceledError' && e.code !== 'ERR_CANCELED') {
                    setError('Error al cargar catálogo: ' + e.message);
                }
            } finally {
                if (!controller.signal.aborted) setCargando(false);
            }
        };
        cargar();
        const manejarActualizacionCarrito = () => setCarrito(obtenerCarrito());
        window.addEventListener('carrito-actualizado', manejarActualizacionCarrito);
        return () => {
            window.removeEventListener('carrito-actualizado', manejarActualizacionCarrito);
            controller.abort();
        };
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
    };

    const cerrarModal = () => {
        setProductoModal(null);
    };

    const handleAddToCart = (producto, qty) => {
        const nuevoCarrito = [...carrito];
        const indiceItemExistente = nuevoCarrito.findIndex(item => item.id === producto.id);

        if (indiceItemExistente > -1) {
            nuevoCarrito[indiceItemExistente].cantidad += qty;
        } else {
            nuevoCarrito.push({
                id: producto.id,
                nombre: producto.nombre,
                precio: producto.precio,
                img: obtenerImagenProducto(producto.nombre),
                cantidad: qty
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
            <ProductModal 
                show={!!productoModal}
                onClose={cerrarModal}
                product={productoModal ? { ...productoModal, imagen: obtenerImagen(productoModal.nombre) } : null}
                onAddToCart={handleAddToCart}
            />
        </div>
    );
};

export default VistaCatalogo;
