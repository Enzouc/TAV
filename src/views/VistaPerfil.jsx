import React, { useEffect, useState } from 'react';
import { obtenerUsuarioActual, guardarUsuarioActual } from '../utils/almacenamiento';
import { obtenerPedidosPorUsuario } from '../utils/pedido';
import { aplicarFormatoMoneda } from '../utils/datos';
import { updateProfile } from '../services/usersService';
import { getOrders } from '../services/ordersService';
import { userSchema, validate } from '../utils/validationSchemas';
import { usarUI } from '../components/ContextoUI';

const COMUNAS_PERMITIDAS = ['Concepción', 'Talcahuano', 'Hualpén', 'San Pedro de la Paz', 'Chiguayante'];
const REGIONES_PERMITIDAS = ['Biobío'];

const VistaPerfil = () => {
  const { mostrarNotificacion } = usarUI();
  const [usuario, setUsuario] = useState(null);
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [modoEdicion, setModoEdicion] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  
  // Estados para edición
  const [formData, setFormData] = useState({});

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      setError('');
      const u = obtenerUsuarioActual();
      if (!u) {
        setError('No hay sesión activa. Inicia sesión para ver tu perfil.');
      } else {
        // Normalizar dirección si viene como string JSON
        let direccionNormalizada = u.direccion;
        if (typeof u.direccion === 'string' && u.direccion.trim().startsWith('{')) {
          try {
            direccionNormalizada = JSON.parse(u.direccion);
          } catch (e) {
            console.warn('Error parseando dirección:', e);
          }
        }
        
        const usuarioNormalizado = { ...u, direccion: direccionNormalizada };
        setUsuario(usuarioNormalizado);
        setFormData(usuarioNormalizado);
        
        // Cargar pedidos
        const data = await getOrders({ userId: u.id });
        const misPedidos = Array.isArray(data) ? data : (data.data || []);
        
        // Ordenar por ID descendente (proxy de fecha para IDs generados por tiempo) o simplemente invertir
        // Si hay fecha_pedido (backend), usar eso.
        misPedidos.sort((a, b) => {
          const fa = a.fecha_pedido ? new Date(a.fecha_pedido).getTime() : 0;
          const fb = b.fecha_pedido ? new Date(b.fecha_pedido).getTime() : 0;
          if (fa && fb) return fb - fa;
          // Fallback a ID string compare (asumiendo formato timestamp o secuencial)
          return String(b.id).localeCompare(String(a.id));
        });
        setPedidos(misPedidos);
      }
    } catch (e) {
      setError('Error al cargar el perfil: ' + e.message);
    } finally {
      setCargando(false);
    }
  };

  const renderDireccion = (direccion) => {
    if (!direccion) return <div className="text-muted fst-italic p-2 bg-light rounded">📭 No registrada</div>;
    
    // Si sigue siendo string plano (no JSON)
    if (typeof direccion === 'string') {
        return (
            <div className="d-flex align-items-center p-3 bg-light rounded border-start border-4 border-warning shadow-sm">
                <span className="fs-4 me-3">📍</span>
                <span className="text-dark">{direccion}</span>
            </div>
        );
    }
    
    const { calle, numero, comuna, region } = direccion;
    
    return (
        <div className="address-card p-3 bg-white rounded border-start border-4 border-primary shadow-sm">
            <div className="d-flex align-items-start">
                <div className="bg-primary bg-opacity-10 p-2 rounded-circle me-3 text-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-geo-alt-fill" viewBox="0 0 16 16">
                        <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/>
                    </svg>
                </div>
                <div>
                    <h6 className="fw-bold text-dark mb-1">
                        {calle || 'Calle sin nombre'} {numero ? `#${numero}` : ''}
                    </h6>
                    <div className="text-secondary small">
                        {[comuna, region].filter(Boolean).join(', ')}
                    </div>
                </div>
            </div>
        </div>
    );
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('direccion.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        direccion: {
          ...(typeof prev.direccion === 'object' ? prev.direccion : {}),
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const guardarCambios = async (e) => {
    e.preventDefault();
    setError('');
    
    // 1. Validar datos (Frontend)
    const { success, error: validationError, data, fieldErrors } = validate(userSchema, formData);
    if (!success) {
      setError(validationError);
      setValidationErrors(fieldErrors || {});
      return;
    }
    setValidationErrors({});

    try {
      setCargando(true);
      // 2. Enviar al Backend
      const updatedUser = await updateProfile(data);
      
      // 3. Actualizar estado local y almacenamiento
      guardarUsuarioActual(updatedUser); // Actualizar localStorage
      setUsuario(updatedUser);
      setFormData(updatedUser);
      setModoEdicion(false);
      mostrarNotificacion({ tipo: 'success', titulo: 'Perfil actualizado', mensaje: 'Tus datos han sido guardados correctamente.' });
    } catch (err) {
      // Manejar error del backend (incluyendo validaciones de unicidad)
      const msg = err.response?.data?.message || err.message || 'Error al actualizar perfil';
      setError(msg);
    } finally {
      setCargando(false);
    }
  };

  if (cargando) return <div className="container py-5"><div className="alert alert-info">Cargando perfil...</div></div>;
  if (error) return <div className="container py-5"><div className="alert alert-danger">{error}</div></div>;
  if (!usuario) return null;

  return (
    <div className="container py-5">
      <div className="row">
        {/* Columna Izquierda: Información del Usuario */}
        <div className="col-lg-4 mb-4">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Mi Información</h5>
              {!modoEdicion && (
                <button className="btn btn-sm btn-light" onClick={() => setModoEdicion(true)}>
                  ✏️ Editar
                </button>
              )}
            </div>
            <div className="card-body">
              {modoEdicion ? (
                <form onSubmit={guardarCambios}>
                  <div className="mb-3">
                    <label className="form-label">Nombre</label>
                    <input 
                      type="text" 
                      className={`form-control ${validationErrors.nombre ? 'is-invalid' : ''}`} 
                      name="nombre" 
                      value={formData.nombre || ''} 
                      onChange={handleInputChange} 
                      required 
                    />
                    {validationErrors.nombre && <div className="invalid-feedback">{validationErrors.nombre}</div>}
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input type="email" className="form-control" name="email" value={formData.email || ''} onChange={handleInputChange} disabled title="El email no se puede cambiar" />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Teléfono</label>
                    <input 
                      type="text" 
                      className={`form-control ${validationErrors.telefono ? 'is-invalid' : ''}`} 
                      name="telefono" 
                      value={formData.telefono || ''} 
                      onChange={handleInputChange} 
                    />
                    {validationErrors.telefono && <div className="invalid-feedback">{validationErrors.telefono}</div>}
                  </div>
                  <h6 className="mt-3">Dirección</h6>
                  <div className="mb-2">
                    <input 
                      type="text" 
                      className={`form-control mb-1 ${validationErrors['direccion.calle'] ? 'is-invalid' : ''}`} 
                      placeholder="Calle" 
                      name="direccion.calle" 
                      value={formData.direccion?.calle || ''} 
                      onChange={handleInputChange} 
                    />
                    <input 
                      type="text" 
                      className={`form-control mb-1 ${validationErrors['direccion.numero'] ? 'is-invalid' : ''}`} 
                      placeholder="Número" 
                      name="direccion.numero" 
                      value={formData.direccion?.numero || ''} 
                      onChange={handleInputChange} 
                    />
                    
                    <select 
                      className={`form-select mb-1 ${validationErrors['direccion.comuna'] ? 'is-invalid' : ''}`} 
                      name="direccion.comuna" 
                      value={formData.direccion?.comuna || ''} 
                      onChange={handleInputChange}
                    >
                      <option value="">Seleccione Comuna</option>
                      {COMUNAS_PERMITIDAS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    {validationErrors['direccion.comuna'] && <div className="invalid-feedback">{validationErrors['direccion.comuna']}</div>}
                    
                    <select 
                      className={`form-select ${validationErrors['direccion.region'] ? 'is-invalid' : ''}`} 
                      name="direccion.region" 
                      value={formData.direccion?.region || ''} 
                      onChange={handleInputChange}
                    >
                      <option value="">Seleccione Región</option>
                      {REGIONES_PERMITIDAS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                    {validationErrors['direccion.region'] && <div className="invalid-feedback">{validationErrors['direccion.region']}</div>}
                  </div>
                  <div className="d-grid gap-2 mt-4">
                    <button type="submit" className="btn btn-success">Guardar Cambios</button>
                    <button type="button" className="btn btn-outline-secondary" onClick={() => { setModoEdicion(false); setFormData(usuario); }}>Cancelar</button>
                  </div>
                </form>
              ) : (
                <div className="text-center text-md-start">
                  <div className="mb-4 text-center">
                    <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center" style={{ width: '100px', height: '100px' }}>
                      <span className="display-4">👤</span>
                    </div>
                  </div>
                  <h4 className="card-title text-center mb-1">{usuario.nombre}</h4>
                  <p className="text-muted text-center mb-4">{usuario.email}</p>
                  
                  <hr />
                  
                  <div className="mb-3">
                    <strong>📱 Teléfono:</strong>
                    <p className="mb-0 text-muted">{usuario.telefono || 'No registrado'}</p>
                  </div>
                  
                  <div className="mb-3">
                    <strong className="d-block mb-2">📍 Dirección:</strong>
                    {renderDireccion(usuario.direccion)}
                  </div>

                  <div className="mb-3">
                    <strong>🆔 Rol:</strong>
                    <p className="mb-0">
                      <span className="badge bg-info text-dark text-capitalize">{usuario.rol}</span>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Columna Derecha: Historial de Pedidos */}
        <div className="col-lg-8">
          <div className="card shadow-sm">
            <div className="card-header bg-white">
              <h5 className="mb-0">Historial de Pedidos</h5>
            </div>
            <div className="card-body p-0">
              {pedidos.length === 0 ? (
                <div className="p-4 text-center text-muted">
                  <p>No has realizado pedidos aún.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover mb-0 align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>ID</th>
                        <th>Fecha</th>
                        <th>Estado</th>
                        <th>Total</th>
                        <th>Detalles</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pedidos.map(p => (
                        <tr key={p.id}>
                          <td><small className="font-monospace">{p.id}</small></td>
                          <td>{p.fecha || new Date(p.fecha_pedido).toLocaleDateString()}</td>
                          <td>
                            <span className={`badge ${
                              p.estado === 'Entregado' ? 'bg-success' : 
                              p.estado === 'Pendiente' ? 'bg-warning text-dark' : 
                              p.estado === 'Cancelado' ? 'bg-danger' : 'bg-primary'
                            }`}>
                              {p.estado}
                            </span>
                          </td>
                          <td className="fw-bold">{aplicarFormatoMoneda(p.total)}</td>
                          <td>
                            <small className="text-muted">
                              {p.items && p.items.length > 0 
                                ? `${p.items.length} productos` 
                                : 'Ver detalle'}
                            </small>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VistaPerfil;
