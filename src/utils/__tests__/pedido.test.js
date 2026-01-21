import { describe, it, expect, beforeEach } from 'vitest';
import { 
    crearPedido, 
    actualizarEstadoPedido, 
    asignarRepartidor, 
    obtenerPedidosPorUsuario,
    calcularTotalPedido
} from '../pedido';
import { guardarPedidos } from '../almacenamiento';

describe('Utilidades de Pedido', () => {
    beforeEach(() => {
        localStorage.clear();
        const pedidosIniciales = [
            { id: 'ord1', idUsuario: 'u1', estado: 'Pendiente', total: 15000, idRepartidor: null },
            { id: 'ord2', idUsuario: 'u1', estado: 'Entregado', total: 20000, idRepartidor: 'd1' },
            { id: 'ord3', idUsuario: 'u2', estado: 'Pendiente', total: 60000, idRepartidor: null }
        ];
        guardarPedidos(pedidosIniciales);
    });

    it('debería crear un nuevo pedido', () => {
        const detalles = [{ cantidad: 1, precio: 10000 }];
        const nuevoPedido = crearPedido(
            'ord4', 
            'u1', 
            'Usuario 1', 
            '123', 
            'Direccion', 
            10000, 
            'Pendiente', 
            null, 
            null, 
            'Efectivo', 
            detalles
        );
        
        expect(nuevoPedido.id).toBe('ord4');
        expect(nuevoPedido.total).toBe(10000);
        expect(obtenerPedidosPorUsuario('u1')).toHaveLength(3);
    });

    it('debería actualizar estado del pedido', () => {
        const actualizado = actualizarEstadoPedido('ord1', 'En Camino');
        expect(actualizado.estado).toBe('En Camino');
    });

    it('debería asignar repartidor al pedido', () => {
        const actualizado = asignarRepartidor('ord1', 'd2');
        expect(actualizado.idRepartidor).toBe('d2');
    });

    it('debería obtener pedidos por usuario', () => {
        const pedidosUsuario = obtenerPedidosPorUsuario('u1');
        expect(pedidosUsuario).toHaveLength(2);
    });

    it('debería calcular total del pedido correctamente', () => {
        const detalles = [
            { cantidad: 2, precio: 15000 }, // 30000
            { cantidad: 1, precio: 5000 }   // 5000
        ];
        // Nota: calcularSubtotal se importa en pedido.js, asumimos que funciona o lo probamos implícitamente
        const total = calcularTotalPedido(detalles);
        expect(total).toBe(35000);
    });
});
