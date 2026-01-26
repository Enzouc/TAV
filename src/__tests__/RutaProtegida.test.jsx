import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import RutaProtegida from '../components/RutaProtegida';
import * as almacenamiento from '../utils/almacenamiento';

describe('RutaProtegida', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it('redirige a login si no está autenticado', () => {
        vi.spyOn(almacenamiento, 'obtenerUsuarioActual').mockReturnValue(null);

        render(
            <MemoryRouter initialEntries={['/protegida']}>
                <Routes>
                    <Route path="/iniciar-sesion" element={<div>Pagina Inicio Sesion</div>} />
                    <Route element={<RutaProtegida rolesPermitidos={['usuario']} />}>
                        <Route path="/protegida" element={<div>Contenido Protegido</div>} />
                    </Route>
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByText('Pagina Inicio Sesion')).toBeTruthy();
        expect(screen.queryByText('Contenido Protegido')).toBeNull();
    });

    it('renderiza contenido si está autenticado y rol permitido', () => {
        vi.spyOn(almacenamiento, 'obtenerUsuarioActual').mockReturnValue({ rol: 'usuario' });

        render(
            <MemoryRouter initialEntries={['/protegida']}>
                <Routes>
                    <Route element={<RutaProtegida rolesPermitidos={['usuario']} />}>
                        <Route path="/protegida" element={<div>Contenido Protegido</div>} />
                    </Route>
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByText('Contenido Protegido')).toBeTruthy();
    });

    it('redirige a inicio si está autenticado pero rol no permitido (usuario)', () => {
        vi.spyOn(almacenamiento, 'obtenerUsuarioActual').mockReturnValue({ rol: 'usuario' });

        render(
            <MemoryRouter initialEntries={['/solo-admin']}>
                <Routes>
                    <Route path="/client/dashboard" element={<div>Panel Cliente</div>} />
                    <Route element={<RutaProtegida rolesPermitidos={['admin']} />}>
                        <Route path="/solo-admin" element={<div>Contenido Admin</div>} />
                    </Route>
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByText('Panel Cliente')).toBeTruthy();
        expect(screen.queryByText('Contenido Admin')).toBeNull();
    });

    it('redirige a panel repartidor si rol es repartidor pero accede ruta no autorizada', () => {
        vi.spyOn(almacenamiento, 'obtenerUsuarioActual').mockReturnValue({ rol: 'repartidor' });

        render(
            <MemoryRouter initialEntries={['/solo-admin']}>
                <Routes>
                    <Route path="/delivery/dashboard" element={<div>Panel Repartidor</div>} />
                    <Route element={<RutaProtegida rolesPermitidos={['admin']} />}>
                        <Route path="/solo-admin" element={<div>Contenido Admin</div>} />
                    </Route>
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByText('Panel Repartidor')).toBeTruthy();
    });
});
