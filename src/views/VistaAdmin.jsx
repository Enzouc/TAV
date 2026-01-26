import React, { useState, useEffect } from 'react';
import { aplicarFormatoMoneda, CLAVES_BD } from '../utils/datos';
import { cerrarSesion } from '../utils/autenticacion';
import { obtenerTodosLosUsuarios, adminCrearUsuario, adminActualizarUsuario, validarFormatoIdPorRol, generarIdPorRol, adminEliminarUsuario } from '../utils/usuario';
import { obtenerTodosLosProductos, agregarProducto, eliminarProducto, actualizarProducto } from '../utils/producto';
import { obtenerTodosLosPedidos, asignarRepartidor } from '../utils/pedido';
import { usarUI } from '../components/ContextoUI';
import { obtenerUsuarioActual } from '../utils/almacenamiento';
import { getProducts, createProduct as apiCreateProduct, updateProduct as apiUpdateProduct, deleteProduct as apiDeleteProduct } from '../services/productsService';
import { getUsers, createUser as apiCreateUser, updateUser as apiUpdateUser, deleteUser as apiDeleteUser } from '../services/usersService';
import { getOrders, assignOrder as apiAssignOrder, cancelOrder as apiCancelOrder } from '../services/ordersService';

const VistaAdmin = () => {
    const [seccionActiva, setSeccionActiva] = useState('dashboard');
    const { abrirConfirmacion, mostrarNotificacion } = usarUI();
    const [estadisticas, setEstadisticas] = useState({ ventas: 0, pedidosActivos: 0, repartidores: 0, bajoStock: 0 });
    const [productos, setProductos] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [pedidos, setPedidos] = useState([]); // Nuevo estado para pedidos
    
    const [mostrarModalProducto, setMostrarModalProducto] = useState(false);
    const [mostrarModalUsuario, setMostrarModalUsuario] = useState(false);
    const [creandoUsuario, setCreandoUsuario] = useState(false);
    const [idUsuarioEdit, setIdUsuarioEdit] = useState('');
    const [errorIdUsuario, setErrorIdUsuario] = useState('');
    const [editandoProducto, setEditandoProducto] = useState(null);
    const [editandoUsuario, setEditandoUsuario] = useState(null);
    const [errorProducto, setErrorProducto] = useState('');
    const [errorUsuario, setErrorUsuario] = useState('');
    const [mostrarModalAsignacion, setMostrarModalAsignacion] = useState(false);
    const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
    const [idRepartidorSeleccionado, setIdRepartidorSeleccionado] = useState('');
    const [errorAsignacion, setErrorAsignacion] = useState('');
    
    // Estados para Cancelación
    const [mostrarModalCancelacion, setMostrarModalCancelacion] = useState(false);
    const [pedidoCancelacion, setPedidoCancelacion] = useState(null);
    const [cargandoCancelacion, setCargandoCancelacion] = useState(false);
    const [filtroTipo, setFiltroTipo] = useState('todos');
    const [filtroActor, setFiltroActor] = useState('');
    const [filtroDesde, setFiltroDesde] = useState('');
    const [filtroHasta, setFiltroHasta] = useState('');
    const [filtroAccionUsuario, setFiltroAccionUsuario] = useState('');
    const [filtroAdminUsuario, setFiltroAdminUsuario] = useState('');
    const [filtroDesdeUsuario, setFiltroDesdeUsuario] = useState('');
    const [filtroHastaUsuario, setFiltroHastaUsuario] = useState('');
    const [paginaUsuarioHistorial, setPaginaUsuarioHistorial] = useState(1);

    // Cargar datos iniciales
    useEffect(() => {
        cargarDatos();
    }, []);

    const [errorGeneral, setErrorGeneral] = useState('');
    const [cargando, setCargando] = useState(false);

    const cargarDatos = async () => {
        setCargando(true);
        setErrorGeneral('');
        try {
            // Intentar cargar desde API
            const [prodRes, userRes, orderRes] = await Promise.allSettled([
                getProducts(),
                getUsers(),
                getOrders({ pageSize: 1000 }) // Intentar traer todos para estadisticas
            ]);

            let todosLosProductos = [];
            let todosLosUsuarios = [];
            let todosLosPedidos = [];

            // Log para diagnóstico
            console.log('Carga Admin:', { prodRes, userRes, orderRes });

            if (prodRes.status === 'fulfilled') {
                const val = prodRes.value;
                // Extracción robusta: array directo, obj.data array, o obj.data.data array
                if (Array.isArray(val)) {
                    todosLosProductos = val;
                } else if (val?.data && Array.isArray(val.data)) {
                    todosLosProductos = val.data;
                } else if (val?.data?.data && Array.isArray(val.data.data)) {
                    todosLosProductos = val.data.data;
                } else {
                    console.warn('Formato inesperado en productos:', val);
                }
            } else {
                console.warn('Fallo carga API productos, usando local:', prodRes.reason);
                todosLosProductos = obtenerTodosLosProductos();
            }

            if (userRes.status === 'fulfilled') {
                const val = userRes.value;
                if (Array.isArray(val)) {
                    todosLosUsuarios = val;
                } else if (val?.data && Array.isArray(val.data)) {
                    todosLosUsuarios = val.data;
                } else if (val?.data?.data && Array.isArray(val.data.data)) {
                    todosLosUsuarios = val.data.data;
                } else if (val?.user) { // Caso especial perfil único
                     todosLosUsuarios = [val.user];
                } else {
                    console.warn('Formato inesperado en usuarios:', val);
                }
            } else {
                console.warn('Fallo carga API usuarios, usando local:', userRes.reason);
                todosLosUsuarios = obtenerTodosLosUsuarios();
            }

            if (orderRes.status === 'fulfilled') {
                 const val = orderRes.value;
                 if (Array.isArray(val)) {
                    todosLosPedidos = val;
                } else if (val?.data && Array.isArray(val.data)) {
                    todosLosPedidos = val.data;
                } else if (val?.data?.data && Array.isArray(val.data.data)) {
                    todosLosPedidos = val.data.data;
                } else {
                    console.warn('Formato inesperado en pedidos:', val);
                }
            } else {
                console.warn('Fallo carga API pedidos, usando local:', orderRes.reason);
                todosLosPedidos = obtenerTodosLosPedidos();
            }

            setProductos(todosLosProductos);
            setUsuarios(todosLosUsuarios);
            setPedidos(todosLosPedidos);

            // Calcular Estadísticas
            const ventasTotales = todosLosPedidos.reduce((suma, pedido) => suma + (pedido.total || 0), 0);
            const pedidosActivos = todosLosPedidos.filter(p => p.estado !== 'Entregado' && p.estado !== 'Cancelado').length;
            const cantidadRepartidores = todosLosUsuarios.filter(u => u.rol === 'repartidor').length;
            const stockBajo = todosLosProductos.filter(p => p.stock < 10).length;

            setEstadisticas({
                ventas: ventasTotales,
                pedidosActivos: pedidosActivos,
                repartidores: cantidadRepartidores,
                bajoStock: stockBajo
            });
        } catch (err) {
            setErrorGeneral('Error cargando datos del panel: ' + err.message);
            // Fallback total
            try {
                const todosLosPedidos = obtenerTodosLosPedidos();
                const todosLosUsuarios = obtenerTodosLosUsuarios();
                const todosLosProductos = obtenerTodosLosProductos();
                setUsuarios(todosLosUsuarios);
                setProductos(todosLosProductos);
                setPedidos(todosLosPedidos);
            } catch (localErr) {
                console.error('Error fatal en fallback local', localErr);
            }
        } finally {
            setCargando(false);
        }
    };

    // --- Acciones de Productos ---
    const manejarGuardarProducto = async (e) => {
        e.preventDefault();
        setErrorProducto('');
        const datosFormulario = new FormData(e.target);
        
        const id = datosFormulario.get('id');
        const nombre = datosFormulario.get('nombre');
        const precio = parseInt(datosFormulario.get('precio'));
        const categoria = datosFormulario.get('categoria');
        const stock = 100; // Stock por defecto

        try {
            if (editandoProducto) {
                try {
                    await apiUpdateProduct(editandoProducto.id, { nombre, precio, categoria });
                } catch (apiErr) {
                    console.warn('API update failed, using local', apiErr);
                    actualizarProducto(editandoProducto.id, {
                        id,
                        nombre: nombre,
                        precio: precio,
                        categoria: categoria
                    });
                }
            } else {
                try {
                    await apiCreateProduct({ id, nombre, precio, stock, categoria });
                } catch (apiErr) {
                    console.warn('API create failed, using local', apiErr);
                    agregarProducto(id, nombre, precio, stock, categoria);
                }
            }
            setMostrarModalProducto(false);
            setEditandoProducto(null);
            cargarDatos();
        } catch (err) {
            setErrorProducto(err.message);
        }
    };

    const manejarEliminarProducto = (id) => {
        const prod = productos.find(p => p.id === id);
        abrirConfirmacion({
            titulo: 'Eliminar Producto',
            mensaje: `¿Eliminar el producto ${prod ? `"${prod.nombre}"` : id}? Esta acción no se puede deshacer.`,
            severidad: 'warning',
            alConfirmar: async () => {
                try {
                    try {
                        await apiDeleteProduct(id);
                    } catch (apiErr) {
                        console.warn('API delete failed, using local', apiErr);
                        eliminarProducto(id);
                    }
                    cargarDatos();
                    mostrarNotificacion({ tipo: 'info', titulo: 'Producto eliminado', mensaje: 'Se eliminó correctamente.' });
                } catch (err) {
                    mostrarNotificacion({ tipo: 'error', titulo: 'Error', mensaje: err.message });
                }
            }
        });
    };

    // --- Acciones de Usuario ---
    const manejarGuardarUsuario = async (e) => {
        e.preventDefault();
        setErrorUsuario('');
        const datosFormulario = new FormData(e.target);
        
        try {
            const csrf = localStorage.getItem(CLAVES_BD.CSRF_TOKEN) || '';
            const admin = obtenerUsuarioActual();
            if (creandoUsuario) {
                const id = datosFormulario.get('id') || null;
                const nombre = datosFormulario.get('nombre');
                const email = datosFormulario.get('email');
                const contrasena = datosFormulario.get('contrasena');
                const rol = datosFormulario.get('rol');
                const estado = datosFormulario.get('estado');
                const telefono = datosFormulario.get('telefono');
                
                try {
                    await apiCreateUser({ id, nombre, email, contrasena, rol, estado, telefono });
                } catch (apiErr) {
                    console.warn('API create user failed, using local', apiErr);
                    adminCrearUsuario(admin.id, csrf, id, nombre, email, contrasena, rol, estado, telefono);
                }
            } else {
                const nuevoId = datosFormulario.get('id');
                const nombre = datosFormulario.get('nombre');
                const email = datosFormulario.get('email');
                const rol = datosFormulario.get('rol');
                const campos = { id: nuevoId, nombre, email, rol };
                
                try {
                    await apiUpdateUser(editandoUsuario.id, campos);
                } catch (apiErr) {
                    console.warn('API update user failed, using local', apiErr);
                    adminActualizarUsuario(admin.id, csrf, editandoUsuario.id, campos);
                }
            }
            setMostrarModalUsuario(false);
            setEditandoUsuario(null);
            setCreandoUsuario(false);
            cargarDatos();
        } catch (err) {
            setErrorUsuario(err.message);
        }
    };

    const alternarEstadoUsuario = (usuario) => {
        const nuevoEstadoEsp = usuario.estado === 'bloqueado' ? 'activo' : 'bloqueado';
        
        abrirConfirmacion({
            titulo: 'Cambiar Estado de Usuario',
            mensaje: `¿Cambiar estado de ${usuario.nombre} a "${nuevoEstadoEsp}"?`,
            severidad: 'warning',
            alConfirmar: async () => {
                try {
                    const csrf = localStorage.getItem(CLAVES_BD.CSRF_TOKEN) || '';
                    const admin = obtenerUsuarioActual();
                    
                    try {
                        await apiUpdateUser(usuario.id, { estado: nuevoEstadoEsp });
                    } catch (apiErr) {
                        console.warn('API user status update failed, using local', apiErr);
                        adminActualizarUsuario(admin.id, csrf, usuario.id, { estado: nuevoEstadoEsp });
                    }

                    cargarDatos();
                    mostrarNotificacion({ tipo: 'info', titulo: 'Estado actualizado', mensaje: 'El usuario fue actualizado.' });
                } catch (err) {
                    mostrarNotificacion({ tipo: 'error', titulo: 'Error', mensaje: err.message });
                }
            }
        });
    };
    
    const manejarEliminarUsuario = (usuario) => {
        abrirConfirmacion({
            titulo: 'Eliminar Usuario',
            mensaje: `¿Eliminar al usuario "${usuario.nombre}"? Esta acción no se puede deshacer.`,
            severidad: 'warning',
            alConfirmar: async () => {
                try {
                    const csrf = localStorage.getItem(CLAVES_BD.CSRF_TOKEN) || '';
                    const admin = obtenerUsuarioActual();
                    
                    try {
                        await apiDeleteUser(usuario.id);
                    } catch (apiErr) {
                        console.warn('API delete user failed, using local', apiErr);
                        adminEliminarUsuario(admin.id, csrf, usuario.id);
                    }

                    cargarDatos();
                    mostrarNotificacion({ tipo: 'info', titulo: 'Usuario eliminado', mensaje: 'Se eliminó correctamente.' });
                } catch (err) {
                    mostrarNotificacion({ tipo: 'error', titulo: 'Error', mensaje: err.message });
                }
            }
        });
    };
    
    const manejarClickCerrarSesion = () => {
        abrirConfirmacion({
            titulo: 'Cerrar Sesión',
            mensaje: '¿Deseas cerrar sesión?',
            severidad: 'info',
            alConfirmar: () => cerrarSesion()
        });
    };
    
    const abrirModalAsignacionRepartidor = (pedido) => {
        setErrorAsignacion('');
        setPedidoSeleccionado(pedido);
        setIdRepartidorSeleccionado('');
        setMostrarModalAsignacion(true);
    };
    
    const manejarAsignarRepartidor = async (e) => {
        e.preventDefault();
        setErrorAsignacion('');
        if (!idRepartidorSeleccionado) {
            setErrorAsignacion('Selecciona un repartidor.');
            return;
        }
        try {
            try {
                await apiAssignOrder(pedidoSeleccionado.id, idRepartidorSeleccionado);
            } catch (apiErr) {
                console.warn('API assign order failed, using local', apiErr);
                asignarRepartidor(pedidoSeleccionado.id, idRepartidorSeleccionado);
            }

            setMostrarModalAsignacion(false);
            setPedidoSeleccionado(null);
            setIdRepartidorSeleccionado('');
            cargarDatos();
        } catch (err) {
            setErrorAsignacion(err.message);
        }
    };

    // Funciones Cancelación
    const abrirModalCancelacion = (pedido) => {
        setPedidoCancelacion(pedido);
        setMostrarModalCancelacion(true);
    };

    const manejarConfirmarCancelacion = async () => {
        if (!pedidoCancelacion) return;
        setCargandoCancelacion(true);
        try {
             await apiCancelOrder(pedidoCancelacion.id);
             mostrarNotificacion({ tipo: 'success', titulo: 'Éxito', mensaje: `Pedido ${pedidoCancelacion.id} cancelado correctamente.` });
             setMostrarModalCancelacion(false);
             setPedidoCancelacion(null);
             cargarDatos();
        } catch (err) {
            mostrarNotificacion({ tipo: 'error', titulo: 'Error', mensaje: err.message || 'Error al cancelar el pedido.' });
        } finally {
            setCargandoCancelacion(false);
        }
    };

    return (
        <div className="container-fluid">
            <div className="row">
                {/* Sidebar */}
                <nav className="col-md-3 col-lg-2 d-md-block bg-dark text-white min-vh-100 p-3">
                    <h4 className="text-center mb-4">GasExpress <span className="badge bg-warning text-dark" style={{ fontSize: '0.6em', verticalAlign: 'top' }}>ADMIN</span></h4>
                    <div className="d-grid gap-2">
                        <button className={`btn text-start ${seccionActiva === 'dashboard' ? 'btn-secondary' : 'btn-dark'}`} onClick={() => setSeccionActiva('dashboard')}>📊 Dashboard</button>
                        <button className={`btn text-start ${seccionActiva === 'productos' ? 'btn-secondary' : 'btn-dark'}`} onClick={() => setSeccionActiva('productos')}>🔥 Productos</button>
                        <button className={`btn text-start ${seccionActiva === 'usuarios' ? 'btn-secondary' : 'btn-dark'}`} onClick={() => setSeccionActiva('usuarios')}>👥 Usuarios</button>
                        <button className={`btn text-start ${seccionActiva === 'pedidos' ? 'btn-secondary' : 'btn-dark'}`} onClick={() => setSeccionActiva('pedidos')}>🚚 Pedidos</button>
                        <hr className="border-white opacity-25 my-2" />
                        <button className="btn btn-danger text-start" onClick={manejarClickCerrarSesion}>🚪 Cerrar Sesión</button>
                    </div>
                </nav>

                {/* Main Content */}
                <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4 py-4">
                    
                    {errorGeneral && (
                        <div className="alert alert-danger">{errorGeneral}</div>
                    )}
                    {cargando && (
                        <div className="alert alert-info">Cargando datos...</div>
                    )}

                    {/* Header */}
                    <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-4 border-bottom">
                        <h1 className="h2 text-primary">Panel de Control</h1>
                        <div className="d-flex align-items-center">
                            <span className="me-3 text-muted">Admin</span>
                        </div>
                    </div>

                    {/* Dashboard */}
                    {seccionActiva === 'dashboard' && (
                        <div className="row g-4 mb-4">
                            <div className="col-md-3">
                                <div className="card text-white bg-primary p-3 h-100">
                                    <h6 className="text-uppercase mb-2">Ventas Totales</h6>
                                    <h3 className="fw-bold mb-0">{aplicarFormatoMoneda(estadisticas.ventas)}</h3>
                                </div>
                            </div>
                            <div className="col-md-3">
                                <div className="card text-white bg-success p-3 h-100">
                                    <h6 className="text-uppercase mb-2">Pedidos Activos</h6>
                                    <h3 className="fw-bold mb-0">{estadisticas.pedidosActivos}</h3>
                                </div>
                            </div>
                            <div className="col-md-3">
                                <div className="card text-dark bg-warning p-3 h-100">
                                    <h6 className="text-uppercase mb-2">Repartidores</h6>
                                    <h3 className="fw-bold mb-0">{estadisticas.repartidores}</h3>
                                </div>
                            </div>
                            <div className="col-md-3">
                                <div className="card text-white bg-danger p-3 h-100">
                                    <h6 className="text-uppercase mb-2">Alertas Stock</h6>
                                    <h3 className="fw-bold mb-0">{estadisticas.bajoStock}</h3>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {seccionActiva === 'dashboard' && (
                        <div className="mt-4">
                            <h4>Historial Consolidado de Cambios</h4>
                            <div className="bg-white rounded shadow-sm p-3 mb-3">
                                <div className="row g-3">
                                    <div className="col-md-3">
                                        <label className="form-label">Tipo de entidad</label>
                                        <select className="form-select" value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}>
                                            <option value="todos">Todos</option>
                                            <option value="usuario">Usuarios</option>
                                            <option value="producto">Productos</option>
                                            <option value="pedido">Pedidos</option>
                                        </select>
                                    </div>
                                    <div className="col-md-3">
                                        <label className="form-label">Usuario responsable</label>
                                        <input className="form-control" placeholder="ID actor" value={filtroActor} onChange={(e) => setFiltroActor(e.target.value)} />
                                    </div>
                                    <div className="col-md-3">
                                        <label className="form-label">Desde</label>
                                        <input type="date" className="form-control" value={filtroDesde} onChange={(e) => setFiltroDesde(e.target.value)} />
                                    </div>
                                    <div className="col-md-3">
                                        <label className="form-label">Hasta</label>
                                        <input type="date" className="form-control" value={filtroHasta} onChange={(e) => setFiltroHasta(e.target.value)} />
                                    </div>
                                </div>
                            </div>
                            <div className="table-responsive bg-white rounded shadow-sm p-3">
                                <table className="table table-sm table-hover">
                                    <thead>
                                        <tr>
                                            <th>Fecha</th>
                                            <th>Entidad</th>
                                            <th>ID</th>
                                            <th>Usuario</th>
                                            <th>Resumen</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(() => {
                                            const logs = JSON.parse(localStorage.getItem(CLAVES_BD.ACTIVITY_LOG) || '[]')
                                                .slice()
                                                .sort((a, b) => (b.ts || 0) - (a.ts || 0));
                                            const inicio = filtroDesde ? new Date(filtroDesde).getTime() : null;
                                            const fin = filtroHasta ? new Date(filtroHasta).getTime() + 86399999 : null; // fin del día
                                            const filtrados = logs.filter(l => {
                                                const tipo = String(l.tipo || '');
                                                const entidad = tipo.split('_')[0];
                                                if (filtroTipo !== 'todos' && entidad !== filtroTipo) return false;
                                                const actor = l.detalle?.adminId || l.detalle?.actorId || '';
                                                if (filtroActor && actor !== filtroActor) return false;
                                                const ts = l.ts || null;
                                                if (inicio && ts && ts < inicio) return false;
                                                if (fin && ts && ts > fin) return false;
                                                return ['usuario_change','producto_change','pedido_change','usuario_create','producto_create','pedido_create','producto_delete'].includes(tipo);
                                            }).slice(0, 20);
                                            return filtrados.map((l, idx) => {
                                                const tipo = String(l.tipo || '');
                                                const entidad = tipo.split('_')[0];
                                                const actor = l.detalle?.adminId || l.detalle?.actorId || '';
                                                const entidadId = l.detalle?.usuarioId || l.detalle?.productoId || l.detalle?.pedidoId || '';
                                                let resumen = '';
                                                if (l.detalle?.cambios && Array.isArray(l.detalle.cambios)) {
                                                    resumen = l.detalle.cambios.slice(0, 2).map(c => `${c.campo}: ${c.anterior ?? '—'} → ${c.nuevo ?? '—'}`).join(' | ');
                                                } else if (tipo.endsWith('_create')) {
                                                    resumen = 'Creación';
                                                } else if (tipo.endsWith('_delete')) {
                                                    resumen = 'Eliminación';
                                                }
                                                return (
                                                    <tr key={idx}>
                                                        <td>{l.fecha}</td>
                                                        <td><span className="badge bg-light text-dark">{entidad}</span></td>
                                                        <td>{entidadId}</td>
                                                        <td>{actor}</td>
                                                        <td className="text-muted">{resumen}</td>
                                                    </tr>
                                                );
                                            });
                                        })()}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                    
                    {/* Usuarios */}

                    {/* Productos */}
                    {seccionActiva === 'productos' && (
                        <div>
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h3>Inventario de Gas</h3>
                                <button className="btn btn-primary" onClick={() => { setEditandoProducto(null); setMostrarModalProducto(true); }}>+ Nuevo Producto</button>
                            </div>
                            <div className="table-responsive bg-white rounded shadow-sm p-3">
                                <table className="table table-hover align-middle">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Producto</th>
                                            <th>Precio</th>
                                            <th>Estado</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {productos.map(p => (
                                            <tr key={p.id}>
                                                <td>{p.id}</td>
                                                <td>{p.nombre}</td>
                                                <td>{aplicarFormatoMoneda(p.precio)}</td>
                                                <td>
                                                    <span className={`badge ${p.stock > 0 ? 'bg-success' : 'bg-danger'}`}>
                                                        {p.stock > 0 ? 'En Stock' : 'Agotado'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <button className="btn btn-sm btn-outline-primary me-2" onClick={() => { setEditandoProducto(p); setMostrarModalProducto(true); }}>Editar</button>
                                                    <button className="btn btn-sm btn-outline-danger" onClick={() => manejarEliminarProducto(p.id)}>Eliminar</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="mt-4">
                                <h5>Historial de Productos</h5>
                                {(() => {
                                    const entries = (JSON.parse(localStorage.getItem(CLAVES_BD.ACTIVITY_LOG) || '[]')
                                        .filter(l => l.tipo === 'producto_change' || l.tipo === 'producto_create' || l.tipo === 'producto_delete')
                                        .slice(-10)
                                        .reverse());
                                    const TablaRegistroActividades = React.lazy(() => import('../components/TablaRegistroActividades'));
                                    return (
                                        <React.Suspense fallback={<div className="alert alert-info">Cargando historial...</div>}>
                                            <TablaRegistroActividades entries={entries} modo="producto" />
                                        </React.Suspense>
                                    );
                                })()}
                            </div>
                        </div>
                    )}

                    {seccionActiva === 'usuarios' && (
                        <div>
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h3 className="mb-0">Gestión de Usuarios</h3>
                                <button className="btn btn-primary" onClick={() => { setCreandoUsuario(true); setEditandoUsuario({}); setMostrarModalUsuario(true); }}>+ Nuevo Usuario</button>
                            </div>
                            <div className="card border-0 shadow-sm mb-5">
                                <div className="card-body p-4">
                                    {(() => {
                                        const UsersTable = React.lazy(() => import('../components/UsersTable'));
                                        return (
                                            <React.Suspense fallback={<div className="alert alert-info">Cargando usuarios...</div>}>
                                                <UsersTable
                                                    data={usuarios}
                                                    onEditarUsuario={(u) => { setEditandoUsuario(u); setCreandoUsuario(false); setMostrarModalUsuario(true); }}
                                                    onAlternarEstadoUsuario={(u) => alternarEstadoUsuario(u)}
                                                    onEliminarUsuario={(u) => manejarEliminarUsuario(u)}
                                                />
                                            </React.Suspense>
                                        );
                                    })()}
                                </div>
                            </div>
                            <h5 className="mt-2">Historial de Usuarios</h5>
                            <div className="bg-white rounded shadow-sm p-4 mb-4">
                                <div className="row g-3">
                                    <div className="col-md-3">
                                        <label className="form-label">Acción</label>
                                        <select className="form-select" value={filtroAccionUsuario || ''} onChange={(e) => setFiltroAccionUsuario(e.target.value)}>
                                            <option value="">Todas</option>
                                            <option value="usuario_create">Creación</option>
                                            <option value="usuario_change">Edición</option>
                                            <option value="usuario_delete">Eliminación</option>
                                        </select>
                                    </div>
                                    <div className="col-md-3">
                                        <label className="form-label">Admin</label>
                                        <input className="form-control" placeholder="ID admin" value={filtroAdminUsuario || ''} onChange={(e) => setFiltroAdminUsuario(e.target.value)} />
                                    </div>
                                    <div className="col-md-3">
                                        <label className="form-label">Desde</label>
                                        <input type="date" className="form-control" value={filtroDesdeUsuario || ''} onChange={(e) => setFiltroDesdeUsuario(e.target.value)} />
                                    </div>
                                    <div className="col-md-3">
                                        <label className="form-label">Hasta</label>
                                        <input type="date" className="form-control" value={filtroHastaUsuario || ''} onChange={(e) => setFiltroHastaUsuario(e.target.value)} />
                                    </div>
                                </div>
                            </div>
                            <div className="table-responsive bg-white rounded shadow-sm p-4">
                                <table className="table table-sm align-middle">
                                    <thead>
                                        <tr>
                                            <th>Fecha</th>
                                            <th>Acción</th>
                                            <th>Admin</th> 
                                            <th>Usuario</th>
                                            <th>Cambios</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(() => {
                                            const PAGE_SIZE = 10;
                                            const logs = JSON.parse(localStorage.getItem(CLAVES_BD.ACTIVITY_LOG) || '[]')
                                                .filter(l => ['usuario_change','usuario_create','usuario_delete'].includes(l.tipo))
                                                .sort((a, b) => (b.ts || 0) - (a.ts || 0));
                                            const inicio = filtroDesdeUsuario ? new Date(filtroDesdeUsuario).getTime() : null;
                                            const fin = filtroHastaUsuario ? new Date(filtroHastaUsuario).getTime() + 86399999 : null;
                                            const filtrados = logs.filter(l => {
                                                if (filtroAccionUsuario && l.tipo !== filtroAccionUsuario) return false;
                                                const actor = l.detalle?.adminId || '';
                                                if (filtroAdminUsuario && actor !== filtroAdminUsuario) return false;
                                                const ts = l.ts || null;
                                                if (inicio && ts && ts < inicio) return false;
                                                if (fin && ts && ts > fin) return false;
                                                return true;
                                            });
                                            const total = filtrados.length;
                                            const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
                                            const page = Math.min(paginaUsuarioHistorial, pageCount);
                                            const inicioIdx = (page - 1) * PAGE_SIZE;
                                            const pagina = filtrados.slice(inicioIdx, inicioIdx + PAGE_SIZE);
                                            return pagina.map((l, idx) => (
                                                <tr key={`${l.ts}-${idx}`}>
                                                    <td>{l.fecha}</td>
                                                    <td>{l.tipo.replace('usuario_', '')}</td>
                                                    <td>{l.detalle.adminId}</td>
                                                    <td>{l.detalle.usuarioId}</td>
                                                    <td className="text-muted">
                                                        {l.detalle.cambios
                                                            ? l.detalle.cambios.map(c => `${c.campo}: ${c.anterior ?? '—'} → ${c.nuevo ?? '—'}`).join(' | ')
                                                            : (l.tipo === 'usuario_create' ? 'Creación' : (l.tipo === 'usuario_delete' ? 'Eliminación' : ''))}
                                                    </td>
                                                </tr>
                                            ));
                                        })()}
                                    </tbody>
                                </table>
                                {(() => {
                                    const PAGE_SIZE = 10;
                                    const logs = JSON.parse(localStorage.getItem(CLAVES_BD.ACTIVITY_LOG) || '[]')
                                        .filter(l => ['usuario_change','usuario_create','usuario_delete'].includes(l.tipo))
                                        .sort((a, b) => (b.ts || 0) - (a.ts || 0));
                                    const inicio = filtroDesdeUsuario ? new Date(filtroDesdeUsuario).getTime() : null;
                                    const fin = filtroHastaUsuario ? new Date(filtroHastaUsuario).getTime() + 86399999 : null;
                                    const filtrados = logs.filter(l => {
                                        if (filtroAccionUsuario && l.tipo !== filtroAccionUsuario) return false;
                                        const actor = l.detalle?.adminId || '';
                                        if (filtroAdminUsuario && actor !== filtroAdminUsuario) return false;
                                        const ts = l.ts || null;
                                        if (inicio && ts && ts < inicio) return false;
                                        if (fin && ts && ts > fin) return false;
                                        return true;
                                    });
                                    const total = filtrados.length;
                                    const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
                                    const page = Math.min(paginaUsuarioHistorial, pageCount);
                                    return (
                                        <div className="d-flex justify-content-between align-items-center mt-3">
                                            <div className="text-muted">Total: {total} registros • Página {page} de {pageCount}</div>
                                            <div className="btn-group">
                                                <button className="btn btn-sm btn-outline-secondary" disabled={page <= 1} onClick={() => setPaginaUsuarioHistorial(page - 1)}>Anterior</button>
                                                <button className="btn btn-sm btn-outline-secondary" disabled={page >= pageCount} onClick={() => setPaginaUsuarioHistorial(page + 1)}>Siguiente</button>
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>
                    )}

                    {/* Pedidos */}
                    {seccionActiva === 'pedidos' && (
                        <div>
                            <div className="mb-4">
                                <h3>Pedidos Recientes</h3>
                            </div>
                            {(() => {
                                const OrdersTable = React.lazy(() => import('../components/OrdersTable'));
                                return (
                                    <React.Suspense fallback={<div className="alert alert-info">Cargando pedidos...</div>}>
                                        <OrdersTable 
                                            data={pedidos} 
                                            onAsignar={(p) => abrirModalAsignacionRepartidor(p)} 
                                            onCancelar={(p) => abrirModalCancelacion(p)}
                                        />
                                    </React.Suspense>
                                );
                            })()}
                            <div className="mt-4">
                                <h5>Historial de Pedidos</h5>
                                {(() => {
                                    const entries = (JSON.parse(localStorage.getItem(CLAVES_BD.ACTIVITY_LOG) || '[]')
                                        .filter(l => l.tipo === 'pedido_change' || l.tipo === 'pedido_create')
                                        .slice(-10)
                                        .reverse());
                                    const TablaRegistroActividades = React.lazy(() => import('../components/TablaRegistroActividades'));
                                    return (
                                        <React.Suspense fallback={<div className="alert alert-info">Cargando historial...</div>}>
                                            <TablaRegistroActividades entries={entries} modo="pedido" />
                                        </React.Suspense>
                                    );
                                })()}
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/* Modal Producto */}
            {mostrarModalProducto && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">{editandoProducto ? 'Editar Producto' : 'Nuevo Producto'}</h5>
                                <button type="button" className="btn-close" onClick={() => setMostrarModalProducto(false)}></button>
                            </div>
                            <form onSubmit={manejarGuardarProducto}>
                                <div className="modal-body">
                                    {errorProducto && <div className="alert alert-danger">{errorProducto}</div>}
                                    <div className="mb-3">
                                        <label className="form-label">ID</label>
                                        <input type="text" name="id" className="form-control" defaultValue={editandoProducto?.id || ''} required />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Nombre</label>
                                        <input type="text" name="nombre" className="form-control" defaultValue={editandoProducto?.nombre || ''} required />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Precio</label>
                                        <input type="number" name="precio" className="form-control" defaultValue={editandoProducto?.precio || ''} required />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Categoría</label>
                                        <select name="categoria" className="form-select" defaultValue={editandoProducto?.categoria || 'Normal'}>
                                            <option value="Normal">Normal</option>
                                            <option value="Catalítico">Catalítico</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setMostrarModalProducto(false)}>Cancelar</button>
                                    <button type="submit" className="btn btn-primary">Guardar</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Usuario */}
            {mostrarModalUsuario && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">{creandoUsuario ? 'Nuevo Usuario' : 'Editar Usuario'}</h5>
                                <button type="button" className="btn-close" onClick={() => setMostrarModalUsuario(false)}></button>
                            </div>
                            <form onSubmit={manejarGuardarUsuario}>
                                <div className="modal-body">
                                    {errorUsuario && <div className="alert alert-danger">{errorUsuario}</div>}
                                    <div className="mb-3">
                                        <label className="form-label">ID</label>
                                        <input 
                                            type="text" 
                                            name="id" 
                                            className={`form-control ${errorIdUsuario ? 'is-invalid' : ''}`} 
                                            value={creandoUsuario ? idUsuarioEdit : (idUsuarioEdit || editandoUsuario?.id || '')}
                                            onChange={(e) => {
                                                const nuevo = e.target.value;
                                                setIdUsuarioEdit(nuevo);
                                                let err = '';
                                                const rolSel = creandoUsuario ? 'usuario' : (editandoUsuario?.rol || 'usuario');
                                                if (!validarFormatoIdPorRol(rolSel, nuevo)) err = 'Formato de ID inválido para el rol.';
                                                if (usuarios.some(u => u.id === nuevo) && (!editandoUsuario || nuevo !== editandoUsuario.id)) err = 'El ID ya existe.';
                                                setErrorIdUsuario(err);
                                            }}
                                            disabled={editandoUsuario?.id === '#ADMIN_ROOT'}
                                            required
                                        />
                                        {errorIdUsuario && <div className="invalid-feedback">{errorIdUsuario}</div>}
                                        <div className="mt-2">
                                            <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => {
                                                const rolSel = creandoUsuario ? 'usuario' : (editandoUsuario?.rol || 'usuario');
                                                const generado = generarIdPorRol(rolSel);
                                                setIdUsuarioEdit(generado);
                                                setErrorIdUsuario('');
                                            }}>Generar ID</button>
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Nombre</label>
                                        <input type="text" name="nombre" className="form-control" defaultValue={creandoUsuario ? '' : editandoUsuario?.nombre} required />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Email</label>
                                        <input type="email" name="email" className="form-control" defaultValue={creandoUsuario ? '' : editandoUsuario?.email} required />
                                    </div>
                                    {creandoUsuario && (
                                        <div className="mb-3">
                                            <label className="form-label">Contraseña</label>
                                            <input type="password" name="contrasena" className="form-control" required />
                                        </div>
                                    )}
                                    <div className="mb-3">
                                        <label className="form-label">Rol</label>
                                        <select name="rol" className="form-select" defaultValue={creandoUsuario ? 'usuario' : editandoUsuario?.rol} onChange={(e) => {
                                            const rolSel = e.target.value;
                                            if (idUsuarioEdit) {
                                                let err = '';
                                                if (!validarFormatoIdPorRol(rolSel, idUsuarioEdit)) err = 'Formato de ID inválido para el rol.';
                                                setErrorIdUsuario(err);
                                            }
                                        }}>
                                            <option value="usuario">Usuario</option>
                                            <option value="repartidor">Repartidor</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Estado</label>
                                        <select name="estado" className="form-select" defaultValue={creandoUsuario ? 'activo' : editandoUsuario?.estado}>
                                            <option value="activo">Activo</option>
                                            <option value="bloqueado">Bloqueado</option>
                                        </select>
                                    </div>
                                    {creandoUsuario && (
                                        <div className="mb-3">
                                            <label className="form-label">Teléfono (opcional)</label>
                                            <input type="text" name="telefono" className="form-control" placeholder="Ej: +56 9 1234 5678" />
                                            <small className="text-muted">Este campo es opcional. Se validará el formato si lo completas.</small>
                                        </div>
                                    )}
                                    <input type="hidden" name="csrf" value={localStorage.getItem(CLAVES_BD.CSRF_TOKEN) || ''} />
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setMostrarModalUsuario(false)}>Cancelar</button>
                                    <button type="submit" className="btn btn-primary" disabled={!!errorIdUsuario}>Guardar</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Modal Asignar Repartidor */}
            {mostrarModalAsignacion && pedidoSeleccionado && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Asignar Repartidor</h5>
                                <button type="button" className="btn-close" onClick={() => setMostrarModalAsignacion(false)}></button>
                            </div>
                            <form onSubmit={manejarAsignarRepartidor}>
                                <div className="modal-body">
                                    {errorAsignacion && <div className="alert alert-danger">{errorAsignacion}</div>}
                                    <div className="mb-3">
                                        <label className="form-label">Pedido</label>
                                        <input type="text" className="form-control" value={pedidoSeleccionado.id} readOnly />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Repartidor</label>
                                        <select className="form-select" value={idRepartidorSeleccionado} onChange={(e) => setIdRepartidorSeleccionado(e.target.value)} required>
                                            <option value="">Selecciona un repartidor</option>
                                            {usuarios.filter(u => u.rol === 'repartidor').map(d => (
                                                <option key={d.id} value={d.id}>
                                                    {`${d.nombre} (${d.id}) – ${d.estado} – ${d.fechaRegistro || 'sin fecha'}`}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setMostrarModalAsignacion(false)}>Cancelar</button>
                                    <button type="submit" className="btn btn-primary">Asignar</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Cancelar Pedido */}
            {mostrarModalCancelacion && pedidoCancelacion && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={() => setMostrarModalCancelacion(false)}>
                    <div className="modal-dialog modal-dialog-centered" onClick={e => e.stopPropagation()}>
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Confirmar Cancelación</h5>
                                <button type="button" className="btn-close" onClick={() => setMostrarModalCancelacion(false)}></button>
                            </div>
                            <div className="modal-body">
                                <p className="fw-bold mb-3">¿Está seguro de que desea cancelar este pedido?</p>
                                <div className="alert alert-warning">
                                    <ul className="mb-0">
                                        <li><strong>ID Pedido:</strong> {pedidoCancelacion.id}</li>
                                        <li><strong>Cliente:</strong> {pedidoCancelacion.nombreUsuario}</li>
                                        <li><strong>Fecha:</strong> {new Date(pedidoCancelacion.fecha || Date.now()).toLocaleDateString()}</li>
                                        <li><strong>Total:</strong> {aplicarFormatoMoneda(pedidoCancelacion.total)}</li>
                                    </ul>
                                </div>
                                <p className="text-muted small mb-0 mt-3">Esta acción cambiará el estado del pedido a "Cancelado" y revertirá el stock de los productos asociados.</p>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setMostrarModalCancelacion(false)} disabled={cargandoCancelacion}>
                                    Volver
                                </button>
                                <button type="button" className="btn btn-danger" onClick={manejarConfirmarCancelacion} disabled={cargandoCancelacion}>
                                    {cargandoCancelacion ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                            Cancelando...
                                        </>
                                    ) : (
                                        'Sí, Cancelar Pedido'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VistaAdmin;
