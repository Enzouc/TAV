import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { obtenerUsuarioActual } from '../utils/almacenamiento';
import { CLAVES_BD } from '../utils/datos';
import { obtenerPedidosPorRepartidor, actualizarEstadoPedido } from '../utils/pedido';
import { aplicarFormatoMoneda } from '../utils/datos';
import { usarUI } from '../components/ContextoUI';
import { getOrders, updateOrderStatus } from '../services/ordersService';

const VistaRepartidor = () => {
    const [pedidos, setPedidos] = useState([]);
    const [estadisticas, setEstadisticas] = useState({ enRuta: 0, entregados: 0, pendientes: 0 });
    const usuario = obtenerUsuarioActual();
    const { abrirConfirmacion, mostrarNotificacion } = usarUI();
    const navegar = useNavigate();

    useEffect(() => {
        const controller = new AbortController();
        cargarPedidos(controller.signal);
        return () => controller.abort();
    }, []);

    const cargarPedidos = async (signal) => {
        if (!usuario) return;
        
        try {
            // Intentar cargar desde API
            const res = await getOrders({ repartidor: usuario.id, pageSize: 100 }, signal);
            const apiOrders = Array.isArray(res.data) ? res.data : res.data.data || [];
            procesarPedidos(apiOrders);
        } catch (e) {
            if (e.name !== 'Canceled') {
                console.warn('API orders error, fallback to local', e);
                const misPedidos = obtenerPedidosPorRepartidor(usuario.id);
                procesarPedidos(misPedidos);
            }
        }
    };

    const procesarPedidos = (listaPedidos) => {
        const misPedidos = listaPedidos.filter(p => p.estado !== 'Cancelado');
        
        // Estadísticas
        const conteoEnRuta = misPedidos.filter(p => p.estado === 'En Camino').length;
        const conteoEntregados = misPedidos.filter(p => p.estado === 'Entregado').length;
        const conteoPendientes = misPedidos.filter(p => p.estado === 'Pendiente').length;
        
        setEstadisticas({ enRuta: conteoEnRuta, entregados: conteoEntregados, pendientes: conteoPendientes });
        
        // Mostrar pedidos activos (no entregados)
        const pedidosActivos = misPedidos.filter(p => p.estado !== 'Entregado');
        setPedidos(pedidosActivos);
    };

    const actualizarEstado = (idPedido, nuevoEstado) => {
        abrirConfirmacion({
            titulo: 'Cambiar estado',
            mensaje: `¿Cambiar estado del pedido a "${nuevoEstado}"?`,
            severidad: 'warning',
            alConfirmar: async () => {
                try {
                    try {
                        await updateOrderStatus(idPedido, nuevoEstado);
                    } catch (apiErr) {
                         console.warn('API update status failed, using local', apiErr);
                         actualizarEstadoPedido(idPedido, nuevoEstado);
                    }
                    
                    cargarPedidos();
                    mostrarNotificacion({ tipo: 'info', titulo: 'Estado actualizado', mensaje: `El pedido ahora está "${nuevoEstado}".` });
                } catch (error) {
                    mostrarNotificacion({ tipo: 'error', titulo: 'Error', mensaje: 'Error al actualizar estado: ' + error.message });
                }
            }
        });
    };

    const obtenerClaseEstado = (estado) => {
        if (estado === 'Pendiente') return 'bg-warning text-dark';
        if (estado === 'En Camino') return 'bg-info text-dark';
        if (estado === 'Entregado') return 'bg-success';
        return 'bg-secondary';
    };

    return (
        <div className="container py-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>🚚 Panel Repartidor</h2>
                <div className="d-flex align-items-center gap-2">
                    <span className="badge bg-dark fs-6">{usuario ? usuario.nombre : 'Repartidor'}</span>
                    <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => {
                            try {
                                localStorage.removeItem(CLAVES_BD.SESSION_TOKEN);
                                localStorage.removeItem(CLAVES_BD.CSRF_TOKEN);
                                localStorage.removeItem(CLAVES_BD.SESSION_EXP);
                                localStorage.removeItem(CLAVES_BD.USUARIO_ACTUAL);
                                localStorage.removeItem(CLAVES_BD.CARRITO);
                            } finally {
                                navegar('/');
                            }
                        }}
                    >
                        Cerrar sesión
                    </button>
                </div>
            </div>

            <div className="row mb-4">
                <div className="col-md-4">
                    <div className="card text-center text-white bg-primary mb-3">
                        <div className="card-body">
                            <h5 className="card-title">En Ruta</h5>
                            <p className="display-4 fw-bold mb-0">{estadisticas.enRuta}</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card text-center text-white bg-success mb-3">
                        <div className="card-body">
                            <h5 className="card-title">Entregados Hoy</h5>
                            <p className="display-4 fw-bold mb-0">{estadisticas.entregados}</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card text-center text-dark bg-warning mb-3">
                        <div className="card-body">
                            <h5 className="card-title">Pendientes</h5>
                            <p className="display-4 fw-bold mb-0">{estadisticas.pendientes}</p>
                        </div>
                    </div>
                </div>
            </div>

            <h3 className="mb-3">Pedidos Asignados Activos</h3>
            {pedidos.length === 0 ? (
                <div className="alert alert-secondary text-center">No tienes pedidos activos asignados.</div>
            ) : (
                <div className="table-responsive bg-white rounded shadow-sm p-3">
                    <table className="table table-hover">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Cliente</th>
                                <th>Dirección</th>
                                <th>Total</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pedidos.map(pedido => (
                                <tr key={pedido.id}>
                                    <td>{pedido.id}</td>
                                    <td>{pedido.nombreUsuario}<br/><small className="text-muted">{pedido.telefonoUsuario}</small></td>
                                    <td>{pedido.direccion}</td>
                                    <td>{aplicarFormatoMoneda(pedido.total)}</td>
                                    <td><span className={`badge ${obtenerClaseEstado(pedido.estado)}`}>{pedido.estado}</span></td>
                                    <td>
                                        {pedido.estado === 'Pendiente' && (
                                            <button className="btn btn-sm btn-primary" onClick={() => actualizarEstado(pedido.id, 'En Camino')}>
                                                Iniciar Ruta
                                            </button>
                                        )}
                                        {pedido.estado === 'En Camino' && (
                                            <button className="btn btn-sm btn-success" onClick={() => actualizarEstado(pedido.id, 'Entregado')}>
                                                Confirmar Entrega
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default VistaRepartidor;
