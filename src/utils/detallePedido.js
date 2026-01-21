// 1. Agregar Detalle Pedido
// Nota: Como no tenemos una tabla separada de detalles en localStorage (están anidados en Orders),
// esta función devuelve el objeto detalle formateado correctamente.
export const crearDetallePedido = (productoId, nombre, cantidad, precio) => {
    if (cantidad <= 0) throw new Error('La cantidad debe ser mayor a 0');
    
    return {
        productoId: productoId,
        nombre: nombre,
        cantidad: cantidad,
        precio: precio,
        subtotal: calcularSubtotal(cantidad, precio)
    };
};

// 2. Actualizar Cantidad Detalle
export const actualizarCantidadDetalle = (detalle, nuevaCantidad) => {
    if (nuevaCantidad < 0) throw new Error('La cantidad no puede ser negativa');
    
    return {
        ...detalle,
        cantidad: nuevaCantidad,
        subtotal: calcularSubtotal(nuevaCantidad, detalle.precio)
    };
};

// 3. Obtener Detalles por Pedido
// Helper para extraer items de un pedido
export const obtenerDetallesPorPedido = (pedido) => {
    if (!pedido || !pedido.items) return [];
    return pedido.items;
};

// 4. Calcular Subtotal
export const calcularSubtotal = (cantidad, precio) => {
    return cantidad * precio;
};
