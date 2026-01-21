import { describe, it, expect, beforeEach } from 'vitest';
import { iniciarSesion } from '../utils/autenticacion';
import { agregarProducto, actualizarStock, obtenerProductoPorId } from '../utils/producto';
import { crearPedido, actualizarEstadoPedido, asignarRepartidor } from '../utils/pedido';
import { guardarUsuarios, guardarProductos, guardarPedidos, limpiarUsuarioActual } from '../utils/almacenamiento';

describe('Integración de Flujo de Negocio', () => {
    beforeEach(() => {
        localStorage.clear();
        limpiarUsuarioActual();
        guardarUsuarios([
            { id: 'admin', email: 'admin@test.com', contrasena: '123', rol: 'admin', nombre: 'Admin User' },
            { id: 'repartidor', email: 'driver@test.com', contrasena: '123', rol: 'repartidor', nombre: 'Driver User' },
            { id: 'usuario', email: 'user@test.com', contrasena: '123', rol: 'usuario', nombre: 'Normal User', direccion: { calle: 'Casa', numero: '123' } }
        ]);
        guardarProductos([
            { id: 'gas15', nombre: 'Gas 15kg', precio: 20000, stock: 100, categoria: 'Normal' }
        ]);
        guardarPedidos([]);
    });

    it('Ciclo de Vida Completo del Pedido: Usuario -> Admin -> Repartidor', () => {
        // 1. Usuario Inicia Sesión
        const resultadoSesion = iniciarSesion('user@test.com', '123');
        expect(resultadoSesion.exito).toBe(true);
        const usuario = resultadoSesion.usuario;

        // 2. Usuario verifica disponibilidad de producto
        const producto = obtenerProductoPorId('gas15');
        expect(producto.stock).toBeGreaterThan(0);

        // 3. Usuario realiza pedido
        const detallesPedido = [{ idProducto: producto.id, nombre: producto.nombre, cantidad: 2, precio: producto.precio }];
        const total = 40000;
        const pedido = crearPedido(
            null, usuario.id, usuario.nombre, usuario.telefono, 'Casa 123', total, 
            'Pendiente', null, null, 'Efectivo', detallesPedido
        );

        expect(pedido.estado).toBe('Pendiente');

        // 4. Stock no disminuye automáticamente en esta arquitectura (basado en análisis), 
        // usualmente se hace explícitamente. Verificamos si necesitamos hacerlo.
        // Mirando utils/pedido.js, no parece llamar a actualizarStock.
        // Así que simulamos que el sistema disminuye el stock.
        actualizarStock(producto.id, producto.stock - 2);
        expect(obtenerProductoPorId('gas15').stock).toBe(98);

        // 5. Admin asigna repartidor
        // Simular Login Admin (no estrictamente necesario para la llamada de utilidad pero lógico)
        iniciarSesion('admin@test.com', '123');
        const pedidoAsignado = asignarRepartidor(pedido.id, 'repartidor');
        expect(pedidoAsignado.idRepartidor).toBe('repartidor');

        // 6. Repartidor actualiza estado a 'En Camino'
        iniciarSesion('driver@test.com', '123');
        const pedidoEnCamino = actualizarEstadoPedido(pedido.id, 'En Camino');
        expect(pedidoEnCamino.estado).toBe('En Camino');

        // 7. Repartidor completa entrega
        const pedidoCompletado = actualizarEstadoPedido(pedido.id, 'Entregado');
        expect(pedidoCompletado.estado).toBe('Entregado');
    });
});
