import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import VistaInicio from '../views/VistaInicio';
import * as almacenamiento from '../utils/almacenamiento';
import * as contextoUI from '../components/ContextoUI';

vi.mock('../utils/almacenamiento', () => ({
    guardarUsuarioActual: vi.fn(),
    obtenerCarrito: vi.fn(),
    guardarCarrito: vi.fn()
}));

vi.mock('../components/ContextoUI', () => ({
    usarUI: vi.fn()
}));

describe('VistaInicio - Agregar al carrito', () => {
    let mockMostrarNotificacion;
    let mockCarrito;

    beforeEach(() => {
        vi.clearAllMocks();
        mockMostrarNotificacion = vi.fn();
        contextoUI.usarUI.mockImplementation(() => ({ mostrarNotificacion: mockMostrarNotificacion }));
        
        mockCarrito = [];
        almacenamiento.obtenerCarrito.mockReturnValue(mockCarrito);
        almacenamiento.guardarCarrito.mockImplementation((c) => { mockCarrito = c; });
    });

    it('agrega Pack Familiar 15Kg al carrito al hacer clic', async () => {
        render(
            <MemoryRouter>
                <VistaInicio />
            </MemoryRouter>
        );

        const botonesAgregar = screen.getAllByText('Agregar al carrito');
        // El primero debería ser el de 15Kg según el orden en el código
        fireEvent.click(botonesAgregar[0]);

        // Esperar a que aparezca el modal
        await waitFor(() => {
             expect(screen.getByText('Pack Familiar 15Kg', { selector: '.modal-title' })).toBeInTheDocument();
        });

        // Hacer clic en confirmar en el modal
        const botonConfirmar = screen.getByText('Agregar al Carrito');
        fireEvent.click(botonConfirmar);

        await waitFor(() => {
            expect(almacenamiento.obtenerCarrito).toHaveBeenCalled();
            expect(mockCarrito).toHaveLength(1);
            expect(mockCarrito[0]).toEqual({
                id: '#P002',
                nombre: 'Pack Familiar 15Kg',
                precio: 19125,
                cantidad: 1,
                imagen: 'productos_gas/producto-gas-15-kg.png'
            });
            expect(almacenamiento.guardarCarrito).toHaveBeenCalledWith(mockCarrito);
            expect(mockMostrarNotificacion).toHaveBeenCalledWith(expect.objectContaining({
                tipo: 'success',
                titulo: 'Agregado al carrito'
            }));
        });
    });

    it('agrega Camping Pack 5Kg al carrito al hacer clic en el segundo botón', async () => {
        render(
            <MemoryRouter>
                <VistaInicio />
            </MemoryRouter>
        );

        const botonesAgregar = screen.getAllByText('Agregar al carrito');
        // El segundo debería ser el de 5Kg
        fireEvent.click(botonesAgregar[1]);

        // Usamos findByText que espera a que aparezca el elemento
        const modalTitle = await screen.findByText('Camping Pack 5Kg', { selector: '.modal-title' });
        expect(modalTitle).toBeInTheDocument();
        expect(modalTitle).toHaveClass('modal-title');

       const botonConfirmar = screen.getByText('Agregar al Carrito');
       fireEvent.click(botonConfirmar);

        await waitFor(() => {
            expect(almacenamiento.obtenerCarrito).toHaveBeenCalled();
            expect(mockCarrito).toHaveLength(1);
            expect(mockCarrito[0]).toEqual({
                id: '#P004',
                nombre: 'Camping Pack 5Kg',
                precio: 7500,
                cantidad: 1,
                imagen: 'productos_gas/producto-gas-5-kg.png'
            });
            expect(almacenamiento.guardarCarrito).toHaveBeenCalledWith(mockCarrito);
        });
    });

    it('incrementa cantidad si el producto ya está en el carrito', async () => {
        mockCarrito = [{
            id: '#P002',
            nombre: 'Pack Familiar 15Kg',
            precio: 19125,
            cantidad: 1,
            imagen: 'productos_gas/producto-gas-15-kg.png'
        }];
        almacenamiento.obtenerCarrito.mockReturnValue(mockCarrito);

        render(
            <MemoryRouter>
                <VistaInicio />
            </MemoryRouter>
        );

        const botonesAgregar = screen.getAllByText('Agregar al carrito');
        fireEvent.click(botonesAgregar[0]);

        const botonConfirmar = await screen.findByText('Agregar al Carrito');
        fireEvent.click(botonConfirmar);

       await waitFor(() => {
        expect(mockCarrito).toHaveLength(1);
        expect(mockCarrito[0].cantidad).toBe(2);
       });
        // La notificación se verifica en el primer test y comparte la misma lógica
    });
});
