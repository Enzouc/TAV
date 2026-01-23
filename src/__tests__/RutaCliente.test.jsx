import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import '@testing-library/jest-dom'; // Importante para toBeInTheDocument
import RutaCliente from '../components/RutaCliente';
import * as almacenamiento from '../utils/almacenamiento';

// Mock dependencies
vi.mock('../utils/almacenamiento', () => ({
    obtenerUsuarioActual: vi.fn(),
    limpiarUsuarioActual: vi.fn(),
    CLAVES_BD: { ACTIVITY_LOG: 'activity_log' }
}));

// Mock localStorage
const localStorageMock = (() => {
    let store = {};
    return {
        getItem: vi.fn((key) => store[key] || null),
        setItem: vi.fn((key, value) => { store[key] = value.toString(); }),
        clear: vi.fn(() => { store = {}; })
    };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('RutaCliente', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('permite acceso a usuario anónimo', () => {
        almacenamiento.obtenerUsuarioActual.mockReturnValue(null);

        render(
            <MemoryRouter initialEntries={['/']}>
                <Routes>
                    <Route element={<RutaCliente />}>
                        <Route path="/" element={<div>Inicio Público</div>} />
                    </Route>
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByText('Inicio Público')).toBeInTheDocument();
    });

    it('permite acceso a usuario cliente normal', () => {
        almacenamiento.obtenerUsuarioActual.mockReturnValue({ rol: 'usuario', nombre: 'Cliente' });

        render(
            <MemoryRouter initialEntries={['/']}>
                <Routes>
                    <Route element={<RutaCliente />}>
                        <Route path="/" element={<div>Inicio Público</div>} />
                    </Route>
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByText('Inicio Público')).toBeInTheDocument();
    });

    it('deniega acceso a admin y redirige', () => {
        almacenamiento.obtenerUsuarioActual.mockReturnValue({ rol: 'admin', nombre: 'Admin' });

        render(
            <MemoryRouter initialEntries={['/']}>
                <Routes>
                    <Route element={<RutaCliente />}>
                        <Route path="/" element={<div>Inicio Público</div>} />
                    </Route>
                    {/* Ruta de destino tras logout (mismo path en este caso, pero simulamos efecto) */}
                </Routes>
            </MemoryRouter>
        );

        // Verifica que se intentó limpiar sesión
        expect(almacenamiento.limpiarUsuarioActual).toHaveBeenCalled();
        
        // Verifica que se registró el log
        expect(localStorage.setItem).toHaveBeenCalledWith('activity_log', expect.stringContaining('acceso_no_autorizado'));
    });

    it('deniega acceso a repartidor y redirige', () => {
        almacenamiento.obtenerUsuarioActual.mockReturnValue({ rol: 'repartidor', nombre: 'Repartidor' });

        render(
            <MemoryRouter initialEntries={['/']}>
                <Routes>
                    <Route element={<RutaCliente />}>
                        <Route path="/" element={<div>Inicio Público</div>} />
                    </Route>
                </Routes>
            </MemoryRouter>
        );

        expect(almacenamiento.limpiarUsuarioActual).toHaveBeenCalled();
    });
});
