import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import VistaCatalogo from '../views/VistaCatalogo';
import * as productoUtils from '../utils/producto';
import * as almacenamientoUtils from '../utils/almacenamiento';

// Mock de las dependencias
vi.mock('../utils/producto', () => ({
    obtenerTodosLosProductos: vi.fn()
}));

vi.mock('../utils/almacenamiento', () => ({
    obtenerCarrito: vi.fn(),
    guardarCarrito: vi.fn()
}));

describe('VistaCatalogo', () => {
    const productosMock = [
        { 
            id: 'p1', 
            nombre: 'Gas 5 Kg', 
            precio: 8000, 
            stock: 10, 
            categoria: 'Camping', 
            descripcion: 'Desc 5kg' 
        },
        { 
            id: 'p2', 
            nombre: 'Gas 11 Kg', 
            precio: 15000, 
            stock: 10, 
            categoria: 'Normal', 
            descripcion: 'Desc 11kg' 
        },
        { 
            id: 'p3', 
            nombre: 'Gas 45 Kg', 
            precio: 60000, 
            stock: 0, 
            categoria: 'Industrial', 
            descripcion: 'Desc 45kg' 
        }
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        productoUtils.obtenerTodosLosProductos.mockReturnValue(productosMock);
        almacenamientoUtils.obtenerCarrito.mockReturnValue([]);
    });

    afterEach(() => {
        cleanup();
    });

    it('renderiza correctamente los productos', () => {
        render(<VistaCatalogo />);
        
        expect(screen.getByText('Gas 5 Kg')).toBeTruthy();
        expect(screen.getByText('Gas 11 Kg')).toBeTruthy();
        expect(screen.getByText('Desc 11kg')).toBeTruthy();
        
        // Verificar precio formateado (asumiendo formato chileno aproximado o que contiene el número)
        expect(screen.getByText((content) => content.includes('15.000'))).toBeTruthy();
    });

    it('abre el modal al hacer clic en un producto con stock', () => {
        render(<VistaCatalogo />);
        
        const headings = screen.getAllByRole('heading', { name: 'Gas 5 Kg' });
        const cardProducto = headings[0].closest('.card');
        fireEvent.click(cardProducto);
        
        // Verificar que el modal se abre (busca texto del modal)
        expect(screen.getByText('Total a pagar:')).toBeTruthy();
    });

    it('no abre el modal si no hay stock', () => {
        render(<VistaCatalogo />);
        
        // Verificar que inicialmente no está abierto
        expect(screen.queryByText('Total a pagar:')).toBeNull();

        const cardProducto = screen.getAllByText('Desc 45kg')[0].closest('.card');
        fireEvent.click(cardProducto);
        
        // No debería haber texto de "Total a pagar" que está en el modal
        expect(screen.queryByText('Total a pagar:')).toBeNull();
    });

    it('agrega producto al carrito', () => {
        render(<VistaCatalogo />);
        
        // Abrir modal
        const cardProducto = screen.getAllByText('Desc 5kg')[0].closest('.card');
        fireEvent.click(cardProducto);
        
        // Click en confirmar
        const btnAgregar = screen.getByText('Agregar al Carrito');
        fireEvent.click(btnAgregar);
        
        expect(almacenamientoUtils.guardarCarrito).toHaveBeenCalledWith(expect.arrayContaining([
            expect.objectContaining({
                id: 'p1',
                nombre: 'Gas 5 Kg',
                cantidad: 1
            })
        ]));
    });

    it('muestra los productos ordenados de menor a mayor precio', () => {
        render(<VistaCatalogo />);

        const titulos = screen.getAllByRole('heading', { level: 5 }).map(h => h.textContent);
        expect(titulos[0]).toBe('Gas 5 Kg');
        expect(titulos[1]).toBe('Gas 11 Kg');
        expect(titulos[2]).toBe('Gas 45 Kg');
    });

    it('usa imágenes específicas para cada tipo de producto', () => {
        render(<VistaCatalogo />);

        const img5 = screen.getByAltText('Gas 5 Kg');
        const img11 = screen.getByAltText('Gas 11 Kg');
        const img45 = screen.getByAltText('Gas 45 Kg');

        expect(img5.getAttribute('src')).toContain('producto-gas-5-kg.png');
        expect(img11.getAttribute('src')).toContain('producto-gas-11-kg.png');
        expect(img45.getAttribute('src')).toContain('producto-gas-45-kg.png');
    });
});
