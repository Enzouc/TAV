import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { obtenerCarrito, guardarCarrito, obtenerUsuarioActual } from '../utils/almacenamiento';
import { createOrder } from '../services/ordersService';
import { crearDetallePedido } from '../utils/detallePedido';
import { usarUI } from '../components/ContextoUI';

const VistaCarrito = () => {
    const navegar = useNavigate();
    const [carrito, setCarrito] = useState([]);
    const [usuario, setUsuario] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');
    const { mostrarNotificacion } = usarUI();

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

    const manejarPago = async () => {
        if (!usuario) {
            mostrarNotificacion({ tipo: 'warning', titulo: 'Inicia sesión', mensaje: 'Debes iniciar sesión para realizar el pedido.', autoCierreMs: 4000 });
            navegar('/iniciar-sesion');
            return;
        }

        if (carrito.length === 0) return;

        try {
            // Preparar detalles usando lógica de detallePedido
            const elementos = carrito.map(item => 
                crearDetallePedido(item.id, item.nombre, item.cantidad, item.precio)
            );

            // Calcular total
            const total = elementos.reduce((suma, item) => suma + item.subtotal, 0);

            // Determinar repartidor (lógica simplificada conservada)
            let idRepartidor = null;
            if (usuario.direccion && usuario.direccion.comuna === 'Concepción') {
                idRepartidor = '#R050'; 
            }

            const direccionStr = usuario.direccion ? (typeof usuario.direccion === 'string' ? usuario.direccion : `${usuario.direccion.calle} ${usuario.direccion.numero}, ${usuario.direccion.comuna}`) : 'Dirección no registrada';
            
            // Construir objeto de pedido para la API
            const itemsAPI = elementos.map(item => ({
                id_producto: item.productoId,
                nombre_producto: item.nombre,
                precio_unitario: item.precio,
                cantidad: item.cantidad
            }));

            const nuevoPedido = {
                id_usuario: usuario.id,
                nombre_usuario: usuario.nombre,
                telefono_usuario: usuario.telefono || '',
                direccion_envio: direccionStr,
                total: total,
                metodo_pago: 'Efectivo', // O el que seleccione el usuario si implementas selector
                items: itemsAPI
                // estado y repartidorId se manejan en backend o por defecto
            };

            // Crear pedido usando servicio API
            await createOrder(nuevoPedido);

            guardarCarrito([]); // Limpiar carrito
            mostrarNotificacion({ tipo: 'info', titulo: 'Pedido realizado', mensaje: 'Tu pedido fue creado con éxito.' });
            navegar('/pedidos');
        } catch (error) {
            console.error('Error al crear el pedido:', error);
            mostrarNotificacion({ tipo: 'error', titulo: 'Error', mensaje: 'Hubo un error al procesar tu pedido. Inténtalo de nuevo. ' + (error.message || '') });
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
        </div>
    );
};

export default VistaCarrito;
