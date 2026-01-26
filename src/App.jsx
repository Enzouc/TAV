import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import RutaProtegida from './components/RutaProtegida';
import RutaCliente from './components/RutaCliente';
import { ProveedorUI } from './components/ContextoUI';

const VistaInicio = lazy(() => import('./views/VistaInicio'));
const VistaCatalogo = lazy(() => import('./views/VistaCatalogo'));
const VistaInicioSesion = lazy(() => import('./views/VistaInicioSesion'));
const VistaRegistro = lazy(() => import('./views/VistaRegistro'));
const VistaCarrito = lazy(() => import('./views/VistaCarrito'));
const VistaPedidos = lazy(() => import('./views/VistaPedidos'));
const VistaRepartidor = lazy(() => import('./views/VistaRepartidor'));
const VistaAdmin = lazy(() => import('./views/VistaAdmin'));
const VistaOfertas = lazy(() => import('./views/VistaOfertas'));
const VistaAyuda = lazy(() => import('./views/VistaAyuda'));
const LayoutPublico = lazy(() => import('./layouts/LayoutPublico'));

const VistaPerfil = lazy(() => import('./views/VistaPerfil'));
const VistaZonas = () => <div className="container py-5"><h2>Zonas de Reparto</h2><p>Cobertura en todo Concepción...</p></div>;

const App = () => {
    return (
        <ProveedorUI>
            <Suspense fallback={<div className="container py-5 text-center">Cargando...</div>}>
                <Routes>
                    {/* Rutas Públicas / Cliente (Restringidas para Admin/Repartidor) */}
                    <Route element={<RutaCliente />}>
                        <Route element={<LayoutPublico />}>
                            <Route path="/" element={<VistaInicio />} />
                            <Route path="/catalogo" element={<VistaCatalogo />} />
                            <Route path="/carrito" element={<VistaCarrito />} />
                            <Route path="/ofertas" element={<VistaOfertas />} />
                            <Route path="/ayuda" element={<VistaAyuda />} />
                            <Route path="/zonas" element={<VistaZonas />} />
                        </Route>
                        <Route path="/registro" element={<VistaRegistro />} />
                    </Route>

                    <Route path="/iniciar-sesion" element={<VistaInicioSesion />} />

                    {/* Rutas Protegidas de Cliente (Usuario Autenticado) */}
                    <Route element={<RutaProtegida rolesPermitidos={['usuario']} />}>
                        <Route element={<LayoutPublico />}>
                            <Route path="/pedidos" element={<VistaPedidos />} />
                            <Route path="/perfil" element={<VistaPerfil />} />
                            <Route path="/client/dashboard" element={<Navigate to="/perfil" replace />} />
                        </Route>
                    </Route>

                    {/* Dashboard Repartidor */}
                    <Route element={<RutaProtegida rolesPermitidos={['repartidor', 'admin']} />}>
                        <Route path="/delivery/dashboard" element={<VistaRepartidor />} />
                        <Route path="/repartidor" element={<Navigate to="/delivery/dashboard" replace />} />
                    </Route>

                    <Route element={<RutaProtegida rolesPermitidos={['admin']} />}>
                        <Route path="/admin/dashboard" element={<VistaAdmin />} />
                        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
                    </Route>

                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Suspense>
        </ProveedorUI>
    );
};

export default App;
