import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import VistaInicio from '../views/VistaInicio';
import { MemoryRouter } from 'react-router-dom';
import * as almacenamiento from '../utils/almacenamiento';
import * as contextoUI from '../components/ContextoUI';

// Mock dependencies
vi.mock('../utils/almacenamiento', () => ({
    obtenerCarrito: vi.fn(() => []),
    guardarCarrito: vi.fn(),
    guardarUsuarioActual: vi.fn(),
}));

vi.mock('../components/ContextoUI', () => ({
    usarUI: vi.fn()
}));

// Mock bootstrap Carousel
vi.mock('bootstrap', () => ({
    Carousel: vi.fn(),
}));

describe('VistaInicio - Interacción con Modal', () => {
    let mockCarrito;
    let mockMostrarNotificacion;

    beforeEach(() => {
        vi.clearAllMocks();
        mockCarrito = [];
        almacenamiento.obtenerCarrito.mockReturnValue(mockCarrito);
        
        mockMostrarNotificacion = vi.fn();
        contextoUI.usarUI.mockImplementation(() => ({
            mostrarNotificacion: mockMostrarNotificacion
        }));
        
        // Mock almacenamiento.guardarCarrito to update local mockCarrito
        almacenamiento.guardarCarrito.mockImplementation((nuevoCarrito) => {
            mockCarrito.length = 0;
            mockCarrito.push(...nuevoCarrito);
        });
    });

    it('abre el modal al hacer clic en la card', async () => {
        render(
            <MemoryRouter>
                <VistaInicio />
            </MemoryRouter>
        );

        // Find the card element
        const cards = screen.getAllByLabelText('Ver detalle de Pack Familiar 15Kg');
        const card = cards[0];
        fireEvent.click(card);

        // Check if modal content appears
        // Using waitFor because modal has transition
        await waitFor(() => {
            expect(screen.getByText('Pack Familiar 15Kg', { selector: '.modal-title' })).toBeInTheDocument();
            expect(screen.getByText('Ideal para el hogar. Incluye revisión de seguridad gratuita.')).toBeInTheDocument();
        });
    });

    it('permite modificar cantidad y agregar al carrito desde el modal', async () => {
        render(
            <MemoryRouter>
                <VistaInicio />
            </MemoryRouter>
        );

        // Open modal
        const cards = screen.getAllByLabelText('Ver detalle de Pack Familiar 15Kg');
        const card = cards[0];
        fireEvent.click(card);

        await waitFor(() => {
            expect(screen.getByText('Pack Familiar 15Kg', { selector: '.modal-title' })).toBeInTheDocument();
        });

        // Increase quantity
        const btnMas = screen.getByText('+');
        fireEvent.click(btnMas);
        fireEvent.click(btnMas); // Quantity should be 3

        // Check quantity display
        expect(screen.getByText('3')).toBeInTheDocument();

        // Add to cart
        const btnAgregar = screen.getAllByText('Agregar al Carrito').find(btn => btn.closest('.modal-footer'));
        fireEvent.click(btnAgregar);

        await waitFor(() => {
            expect(almacenamiento.obtenerCarrito).toHaveBeenCalled();
            expect(mockCarrito).toHaveLength(1);
            expect(mockCarrito[0]).toEqual(expect.objectContaining({
                id: '#P002',
                nombre: 'Pack Familiar 15Kg',
                cantidad: 3
            }));
            expect(almacenamiento.guardarCarrito).toHaveBeenCalled();
            expect(mockMostrarNotificacion).toHaveBeenCalledWith(expect.objectContaining({
                titulo: 'Agregado al carrito'
            }));
        });
    });
});
