import { describe, it, expect } from 'vitest';
import { crearDetallePedido, actualizarCantidadDetalle, obtenerDetallesPorPedido, calcularSubtotal } from '../detallePedido';

describe('Utilidades de Detalle de Pedido', () => {
    it('crearDetallePedido debería crear un objeto detalle válido', () => {
        const detalle = crearDetallePedido('p1', 'Producto 1', 2, 5000);
        
        expect(detalle).toEqual({
            productoId: 'p1',
            nombre: 'Producto 1',
            cantidad: 2,
            precio: 5000,
            subtotal: 10000
        });
    });

    it('crearDetallePedido debería lanzar error si cantidad es 0 o menor', () => {
        expect(() => crearDetallePedido('p1', 'P1', 0, 5000)).toThrow();
        expect(() => crearDetallePedido('p1', 'P1', -1, 5000)).toThrow();
    });

    it('actualizarCantidadDetalle debería devolver un nuevo detalle con cantidad actualizada', () => {
        const detalleInicial = {
            productoId: 'p1',
            nombre: 'Producto 1',
            cantidad: 2,
            precio: 5000,
            subtotal: 10000
        };

        const nuevoDetalle = actualizarCantidadDetalle(detalleInicial, 3);

        expect(nuevoDetalle.cantidad).toBe(3);
        expect(nuevoDetalle.subtotal).toBe(15000);
        // Verificar inmutabilidad (no modifica original)
        expect(detalleInicial.cantidad).toBe(2); 
    });

    it('obtenerDetallesPorPedido debería devolver items del pedido', () => {
        const pedido = { items: [1, 2, 3] };
        expect(obtenerDetallesPorPedido(pedido)).toEqual([1, 2, 3]);
    });

    it('calcularSubtotal debería multiplicar cantidad por precio', () => {
        expect(calcularSubtotal(2, 5000)).toBe(10000);
    });
});
