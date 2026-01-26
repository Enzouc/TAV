import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { obtenerCarrito, guardarCarrito, obtenerUsuarioActual } from '../utils/almacenamiento';
import { crearPedido as crearPedidoLocal } from '../utils/pedido'; // Renamed for fallback
import { createOrder } from '../services/ordersService'; // Import service
import { crearDetallePedido } from '../utils/detallePedido';
import { usarUI } from '../components/ContextoUI';
import Modal from '../components/Modal.jsx';

const VistaCarrito = () => {
    const navegar = useNavigate();
    const [carrito, setCarrito] = useState([]);
    const [usuario, setUsuario] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');
    const { mostrarNotificacion } = usarUI();
    const [modalPagoAbierto, setModalPagoAbierto] = useState(false);
    const [metodoPago, setMetodoPago] = useState('');

    useEffect(() => {
        try {
            setError('');
            setCarrito(obtenerCarrito());
            setUsuario(obtenerUsuarioActual());
        } catch (e) {
            setError('No se pudo cargar el carrito');
        } finally {
            setCargando(false);
        }
        const manejarActualizacionCarrito = () => setCarrito(obtenerCarrito());
        window.addEventListener('carrito-actualizado', manejarActualizacionCarrito);
        return () => window.removeEventListener('carrito-actualizado', manejarActualizacionCarrito);
    }, []);

    const actualizarCantidad = (idProducto, cambio) => {
        const nuevoCarrito = [...carrito];
        const indice = nuevoCarrito.findIndex(item => item.id === idProducto);
        if (indice > -1) {
            nuevoCarrito[indice].cantidad += cambio;
            if (nuevoCarrito[indice].cantidad <= 0) {
                nuevoCarrito.splice(indice, 1);
            }
            guardarCarrito(nuevoCarrito);
        }
    };

    const eliminarDelCarrito = (idProducto) => {
        const nuevoCarrito = carrito.filter(item => item.id !== idProducto);
        guardarCarrito(nuevoCarrito);
    };

    const manejarPago = () => {
        if (!usuario) {
            mostrarNotificacion({ tipo: 'warning', titulo: 'Inicia sesión', mensaje: 'Debes iniciar sesión para realizar el pedido.', autoCierreMs: 4000 });
            navegar('/iniciar-sesion');
            return;
        }

        if (carrito.length === 0) return;

        setMetodoPago('');
        setModalPagoAbierto(true);
    };

    const confirmarPago = async () => {
        if (!metodoPago) return;
        try {
            const elementos = carrito.map(item =>
                crearDetallePedido(item.id, item.nombre, item.cantidad, item.precio)
            );
            const total = elementos.reduce((suma, item) => suma + item.subtotal, 0);
            const direccionStr = usuario.direccion ? `${usuario.direccion.calle} ${usuario.direccion.numero}, ${usuario.direccion.comuna}` : 'Dirección no registrada';
            
            // Prepare data for API
            const orderData = {
                id_usuario: usuario.id,
                nombre_usuario: usuario.nombre,
                direccion_envio: direccionStr,
                metodo_pago: metodoPago,
                total: total,
                items: carrito.map(item => ({
                    id_producto: item.id,
                    cantidad: item.cantidad,
                    precio_unitario: item.precio,
                    nombre_producto: item.nombre
                }))
            };

            try {
                // Try API first
                await createOrder(orderData);
                mostrarNotificacion({ tipo: 'info', titulo: 'Pedido realizado', mensaje: 'Tu pedido fue creado con éxito.' });
            } catch (apiError) {
                console.warn('API createOrder failed:', apiError);

                // Check for Client Errors (400 Bad Request, 404 Not Found)
                // These indicate invalid data (e.g., insufficient stock), so we should NOT fallback to local.
                const status = apiError.response?.status || apiError.status;
                if (status === 400 || status === 404) {
                    const mensajeError = apiError.response?.data?.message || apiError.message || 'Error en los datos del pedido.';
                    mostrarNotificacion({ tipo: 'error', titulo: 'Error al procesar', mensaje: mensajeError });
                    // Close modal but keep cart so user can fix it (e.g. reduce quantity)
                    setModalPagoAbierto(false);
                    return; 
                }

                console.warn('Falling back to local storage due to network/server error.');
                // Fallback to local storage only for Network/Server errors
                const idPedido = '#ORD-' + Date.now().toString().slice(-6);
                crearPedidoLocal(
                    idPedido,
                    usuario.id,
                    usuario.nombre,
                    usuario.telefono || '',
                    direccionStr,
                    total,
                    'Pendiente',
                    null,
                    null,
                    metodoPago,
                    elementos
                );
                mostrarNotificacion({ tipo: 'warning', titulo: 'Modo Offline', mensaje: 'Tu pedido se guardó localmente debido a problemas de conexión.' });
            }

            guardarCarrito([]);
            setModalPagoAbierto(false);
            navegar('/pedidos');
        } catch (error) {
            console.error(error);
            mostrarNotificacion({ tipo: 'error', titulo: 'Error', mensaje: 'Hubo un error al procesar tu pedido. Inténtalo de nuevo.' });
        }
    };

    const total = carrito.reduce((suma, item) => suma + (item.precio * item.cantidad), 0);


    return (
        <div className="container py-5">
            <h2 className="mb-4">Tu Carrito de Compras</h2>
            {cargando && <div className="alert alert-info">Cargando carrito...</div>}
            {error && <div className="alert alert-danger">{error}</div>}
            
            {carrito.length === 0 ? (
                <div className="text-center py-5">
                    <p className="lead">Tu carrito está vacío</p>
                    <button onClick={() => navegar('/')} className="btn btn-primary">Ir a comprar</button>
                </div>
            ) : (
                <div className="row">
                    <div className="col-lg-8">
                        <div className="card shadow-sm border-0">
                            <div className="card-body">
                                {carrito.map((item) => (
                                    <div key={item.id} className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-3">
                                        <div>
                                            <h5 className="mb-1">{item.nombre}</h5>
                                            <p className="text-muted mb-0">${item.precio.toLocaleString('es-CL')}</p>
                                        </div>
                                        <div className="d-flex align-items-center">
                                            <div className="btn-group me-3" role="group">
                                                <button 
                                                    type="button" 
                                                    className="btn btn-outline-secondary btn-sm"
                                                    onClick={() => actualizarCantidad(item.id, -1)}
                                                >
                                                    -
                                                </button>
                                                <span className="btn btn-outline-secondary btn-sm disabled" style={{width: '40px'}}>{item.cantidad}</span>
                                                <button 
                                                    type="button" 
                                                    className="btn btn-outline-secondary btn-sm"
                                                    onClick={() => actualizarCantidad(item.id, 1)}
                                                >
                                                    +
                                                </button>
                                            </div>
                                            <button 
                                                className="btn btn-outline-danger btn-sm"
                                                onClick={() => eliminarDelCarrito(item.id)}
                                            >
                                                <i className="bi bi-trash"></i> Eliminar
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-4">
                        <div className="card shadow-sm border-0">
                            <div className="card-body">
                                <h5 className="card-title mb-4">Resumen del Pedido</h5>
                                <div className="d-flex justify-content-between mb-3">
                                    <span>Subtotal</span>
                                    <span>${total.toLocaleString('es-CL')}</span>
                                </div>
                                <div className="d-flex justify-content-between mb-4 fw-bold">
                                    <span>Total</span>
                                    <span>${total.toLocaleString('es-CL')}</span>
                                </div>
                                <button 
                                    className="btn btn-primary w-100 py-2"
                                    onClick={manejarPago}
                                >
                                    Proceder al Pago
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <Modal
                abierto={modalPagoAbierto}
                titulo="Selecciona método de pago"
                mensaje=""
                severidad="info"
                etiquetaConfirmar="Continuar"
                etiquetaCancelar="Cancelar"
                alCancelar={() => setModalPagoAbierto(false)}
                alConfirmar={confirmarPago}
            >
                <div className="list-group">
                    <label className={`list-group-item d-flex align-items-center ${metodoPago === 'Efectivo' ? 'active' : ''}`} style={{ cursor: 'pointer' }}>
                        <input
                            type="radio"
                            name="metodo-pago"
                            className="form-check-input me-3"
                            checked={metodoPago === 'Efectivo'}
                            onChange={() => setMetodoPago('Efectivo')}
                            aria-label="Efectivo"
                        />
                        <span className="me-2">💵</span>
                        <div>
                            <div className="fw-bold">Efectivo</div>
                            <div className="text-muted small">Pago al recibir el pedido.</div>
                        </div>
                    </label>
                    <label className={`list-group-item d-flex align-items-center ${metodoPago === 'Tarjeta' ? 'active' : ''}`} style={{ cursor: 'pointer' }}>
                        <input
                            type="radio"
                            name="metodo-pago"
                            className="form-check-input me-3"
                            checked={metodoPago === 'Tarjeta'}
                            onChange={() => setMetodoPago('Tarjeta')}
                            aria-label="Tarjeta"
                        />
                        <span className="me-2">💳</span>
                        <div>
                            <div className="fw-bold">Tarjeta</div>
                            <div className="text-muted small">Crédito o débito vía lector móvil.</div>
                        </div>
                    </label>
                    <label className={`list-group-item d-flex align-items-center ${metodoPago === 'Transferencia' ? 'active' : ''}`} style={{ cursor: 'pointer' }}>
                        <input
                            type="radio"
                            name="metodo-pago"
                            className="form-check-input me-3"
                            checked={metodoPago === 'Transferencia'}
                            onChange={() => setMetodoPago('Transferencia')}
                            aria-label="Transferencia"
                        />
                        <span className="me-2">🔁</span>
                        <div>
                            <div className="fw-bold">Transferencia</div>
                            <div className="text-muted small">Transferencia bancaria previa a la entrega.</div>
                        </div>
                    </label>
                </div>
            </Modal>
        </div>
    );
};

export default VistaCarrito;
