import { obtenerPedidos, guardarPedidos, obtenerUsuarioActual } from './almacenamiento';
import { CLAVES_BD } from './datos';

const registrarLog = (entrada) => {
    const log = JSON.parse(localStorage.getItem(CLAVES_BD.ACTIVITY_LOG) || '[]');
    log.push({ ts: Date.now(), ...entrada });
    localStorage.setItem(CLAVES_BD.ACTIVITY_LOG, JSON.stringify(log));
};
import { calcularSubtotal } from './detallePedido';

// 1. Crear Pedido
export const crearPedido = (id, idUsuario, nombreUsuario, telefonoUsuario, direccion, total, estado, idRepartidor, fecha, metodoPago, detalles = []) => {
    const pedidos = obtenerPedidos();
    
    const nuevoPedido = {
        id: id || '#ORD-' + Date.now(),
        idUsuario: idUsuario,
        nombreUsuario: nombreUsuario,
        telefonoUsuario: telefonoUsuario,
        direccion: direccion,
        total: total,
        estado: estado || 'Pendiente',
        idRepartidor: idRepartidor || null,
        fecha: fecha || new Date().toLocaleString('es-CL'),
        metodoPago: metodoPago || 'Efectivo',
        items: detalles
    };
    
    pedidos.push(nuevoPedido);
    guardarPedidos(pedidos);
    const actor = obtenerUsuarioActual();
    registrarLog({
        tipo: 'pedido_create',
        fecha: new Date().toLocaleString('es-CL'),
        detalle: {
            actorId: actor?.id || 'sistema',
            pedidoId: nuevoPedido.id,
            campos: { ...nuevoPedido }
        }
    });
    return nuevoPedido;
};

// 2. Actualizar Estado Pedido
export const actualizarEstadoPedido = (id, nuevoEstado) => {
    const pedidos = obtenerPedidos();
    const indice = pedidos.findIndex(o => o.id === id);
    
    if (indice === -1) {
        throw new Error('Pedido no encontrado.');
    }
    
    const previo = { ...pedidos[indice] };
    pedidos[indice].estado = nuevoEstado;
    guardarPedidos(pedidos);
    const actor = obtenerUsuarioActual();
    registrarLog({
        tipo: 'pedido_change',
        fecha: new Date().toLocaleString('es-CL'),
        detalle: {
            actorId: actor?.id || 'sistema',
            pedidoId: id,
            cambios: [{ campo: 'estado', anterior: previo.estado, nuevo: nuevoEstado }]
        }
    });
    return pedidos[indice];
};

// 3. Asignar Repartidor
export const asignarRepartidor = (idPedido, idRepartidor) => {
    const pedidos = obtenerPedidos();
    const indice = pedidos.findIndex(o => o.id === idPedido);
    
    if (indice === -1) {
        throw new Error('Pedido no encontrado.');
    }
    
    const previo = { ...pedidos[indice] };
    pedidos[indice].idRepartidor = idRepartidor;
    guardarPedidos(pedidos);
    const actor = obtenerUsuarioActual();
    registrarLog({
        tipo: 'pedido_change',
        fecha: new Date().toLocaleString('es-CL'),
        detalle: {
            actorId: actor?.id || 'sistema',
            pedidoId: idPedido,
            cambios: [{ campo: 'idRepartidor', anterior: previo.idRepartidor, nuevo: idRepartidor }]
        }
    });
    return pedidos[indice];
};

export const actualizarPedidoCampos = (id, camposActualizados) => {
    const pedidos = obtenerPedidos();
    const indice = pedidos.findIndex(o => o.id === id);
    if (indice === -1) throw new Error('Pedido no encontrado.');
    const previo = { ...pedidos[indice] };
    pedidos[indice] = { ...pedidos[indice], ...camposActualizados };
    guardarPedidos(pedidos);
    const actor = obtenerUsuarioActual();
    const actualizado = pedidos[indice];
    const cambios = Object.keys(camposActualizados).map(campo => ({
        campo,
        anterior: previo[campo],
        nuevo: actualizado[campo]
    })).filter(c => c.anterior !== c.nuevo);
    if (cambios.length > 0) {
        registrarLog({
            tipo: 'pedido_change',
            fecha: new Date().toLocaleString('es-CL'),
            detalle: {
                actorId: actor?.id || 'sistema',
                pedidoId: actualizado.id,
                cambios
            }
        });
    }
    return actualizado;
};

// 4. Obtener Pedidos por Usuario
export const obtenerPedidosPorUsuario = (idUsuario) => {
    const pedidos = obtenerPedidos();
    return pedidos.filter(o => o.idUsuario === idUsuario);
};

// 5. Calcular Total Pedido
export const calcularTotalPedido = (detalles) => {
    if (!Array.isArray(detalles)) return 0;
    return detalles.reduce((suma, item) => suma + calcularSubtotal(item.cantidad, item.precio), 0);
};

// Extra: Obtener todos los pedidos
export const obtenerTodosLosPedidos = () => {
    return obtenerPedidos();
};

// Extra: Obtener pedidos por repartidor
export const obtenerPedidosPorRepartidor = (idRepartidor) => {
    const pedidos = obtenerPedidos();
    return pedidos.filter(o => o.idRepartidor === idRepartidor);
};
