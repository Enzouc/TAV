import React, { useState, useEffect } from 'react';
import { obtenerUsuarioActual } from '../utils/almacenamiento';
import { obtenerPedidosPorUsuario } from '../utils/pedido';
import { aplicarFormatoMoneda } from '../utils/datos';
import { getOrders } from '../services/ordersService';

const VistaPedidos = () => {
    const [pedidos, setPedidos] = useState([]);
    const [usuario, setUsuario] = useState(obtenerUsuarioActual());

    useEffect(() => {
        const controller = new AbortController();
        const loadOrders = async () => {
            if (usuario) {
                try {
                    const res = await getOrders({ userId: usuario.id, pageSize: 50 }, controller.signal);
                    const apiOrders = Array.isArray(res.data) ? res.data : res.data.data || [];
                    // Asegurar ordenamiento si el API no lo garantiza
                    setPedidos(apiOrders.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)));
                } catch (e) {
                    if (e.name !== 'Canceled') {
                        console.warn('API orders error, fallback to local', e);
                        const misPedidos = obtenerPedidosPorUsuario(usuario.id);
                        setPedidos(misPedidos.reverse());
                    }
                }
            }
        };
        loadOrders();
        return () => controller.abort();
    }, [usuario]);

    const obtenerClaseEstado = (estado) => {
        if (estado === 'Pendiente') return 'bg-warning text-dark';
        if (estado === 'En Camino') return 'bg-info text-dark';
        if (estado === 'Entregado') return 'bg-success';
        return 'bg-secondary';
    };

    if (!usuario) return <div className="container py-5">Inicia sesión para ver tus pedidos.</div>;

    return (
        <div className="container py-5">
            <h2 className="mb-4">Mis Pedidos</h2>
            {pedidos.length === 0 ? (
                <div className="alert alert-info">No has realizado pedidos aún.</div>
            ) : (
                <div className="table-responsive">
                    <table className="table table-hover bg-white shadow-sm rounded overflow-hidden">
                        <thead className="table-light">
                            <tr>
                                <th># Pedido</th>
                                <th>Fecha</th>
                                <th>Total</th>
                                <th>Estado</th>
                                <th>Detalle</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pedidos.map(pedido => (
                                <tr key={pedido.id}>
                                    <td>{pedido.id}</td>
                                    <td>{pedido.fecha}</td>
                                    <td>{aplicarFormatoMoneda(pedido.total)}</td>
                                    <td><span className={`badge ${obtenerClaseEstado(pedido.estado)}`}>{pedido.estado}</span></td>
                                    <td>
                                        <ul className="list-unstyled mb-0 small">
                                            {pedido.items.map((item, idx) => (
                                                <li key={idx}>{item.cantidad} x {item.nombre}</li>
                                            ))}
                                        </ul>
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

export default VistaPedidos;
