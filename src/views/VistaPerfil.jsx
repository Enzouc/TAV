import React, { useEffect, useState, useRef } from 'react';
import { obtenerUsuarioActual, obtenerUsuarios, guardarUsuarios, guardarUsuarioActual, limpiarUsuarioActual } from '../utils/almacenamiento';
import { getProfile, updateProfile, logout as apiLogout } from '../services/usersService';
import { validarTelefono } from '../utils/usuario';
import { CLAVES_BD } from '../utils/datos';
import Modal from '../components/Modal.jsx';
import { cerrarSesion } from '../utils/autenticacion';
import { useNavigate } from 'react-router-dom';

const VistaPerfil = () => {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');
  const [form, setForm] = useState({
    nombre: '',
    email: '',
    telefono: '',
    contrasena: '',
    confirmarContrasena: '',
    direccion_calle: '',
    direccion_numero: '',
    direccion_region: 'Biobío',
    direccion_comuna: ''
  });
  const nombreRef = useRef(null);
  const [modalLogout, setModalLogout] = useState(false);
  const navegar = useNavigate();

  useEffect(() => {
    const controller = new AbortController();
    const cargarPerfil = async () => {
      try {
        setCargando(true);
        setError('');
        
        // Intentar cargar desde API
        try {
           const uApi = await getProfile(controller.signal);
           
           // Validar si es HTML (error de API)
           if (typeof uApi === 'string' && uApi.trim().startsWith('<')) {
               throw new Error('Respuesta API inválida (HTML)');
           }

           const u = uApi.user || uApi; // Adaptar según respuesta
           if (u && typeof u === 'object') {
               setUsuario(u);
               actualizarFormulario(u);
               // Sincronizar local
               guardarUsuarioActual(u);
               setCargando(false);
               return;
           }
        } catch (apiErr) {
           if (apiErr.name !== 'CanceledError' && (!apiErr.status || apiErr.status === 404 || apiErr.status >= 500)) {
               console.warn('Fallo API perfil, usando local:', apiErr);
           } else if (apiErr.status === 401) {
               // Token invalido
               limpiarUsuarioActual();
               navegar('/iniciar-sesion');
               return;
           }
        }

        // Fallback local
        const u = obtenerUsuarioActual();
        if (!u) {
          setError('No hay sesión activa. Inicia sesión para ver tu perfil.');
        } else {
          setUsuario(u);
          actualizarFormulario(u);
        }
      } catch (e) {
        setError('Error al cargar el perfil: ' + e.message);
      } finally {
        if (!controller.signal.aborted) setCargando(false);
      }
    };
    
    cargarPerfil();
    return () => controller.abort();
  }, [navegar]);

  const actualizarFormulario = (u) => {
      setForm({
          nombre: u.nombre || '',
          email: u.email || '',
          telefono: u.telefono || '',
          contrasena: '',
          confirmarContrasena: '',
          direccion_calle: u.direccion?.calle || '',
          direccion_numero: u.direccion?.numero || '',
          direccion_region: u.direccion?.region || 'Biobío',
          direccion_comuna: u.direccion?.comuna || ''
      });
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onGuardar = async () => {
    setError('');
    setOk('');
    if (!form.nombre.trim()) return setError('El nombre es obligatorio.');
    if (!form.email.trim()) return setError('El correo es obligatorio.');
    if (!validarTelefono(form.telefono)) return setError('Formato de teléfono inválido.');
    
    if (form.contrasena || form.confirmarContrasena) {
      if (form.contrasena.length < 4) return setError('La contraseña debe tener al menos 4 caracteres.');
      if (form.contrasena !== form.confirmarContrasena) return setError('Las contraseñas no coinciden.');
    }

    const cambios = {
        nombre: form.nombre.trim(),
        email: form.email.trim(),
        telefono: form.telefono.trim(),
        direccion: {
            calle: form.direccion_calle.trim(),
            numero: form.direccion_numero.trim(),
            region: form.direccion_region.trim(),
            comuna: form.direccion_comuna.trim()
        }
    };
    if (form.contrasena) cambios.contrasena = form.contrasena;

    try {
        // Intento API
        const actualizado = await updateProfile(cambios);
        // Actualizar estado y local
        const uFinal = actualizado.user || actualizado;
        setUsuario(uFinal);
        guardarUsuarioActual(uFinal);
        setOk('Perfil actualizado correctamente.');
    } catch (apiErr) {
        // Fallback local
        if (!apiErr.status || apiErr.status === 404 || apiErr.status >= 500) {
            console.warn('Fallo API update, usando local:', apiErr);
            actualizarLocalmente(cambios);
        } else {
            setError('Error al actualizar: ' + (apiErr.message || 'Desconocido'));
        }
    }
  };

  const actualizarLocalmente = (cambios) => {
    const usuarios = obtenerUsuarios();
    const yaUsado = usuarios.find((u) => u.email === form.email && u.id !== usuario.id);
    if (yaUsado) {
      setError('El correo ya está registrado por otro usuario.');
      return;
    }
    
    const actualizado = { ...usuario, ...cambios };
    const idx = usuarios.findIndex((u) => u.id === usuario.id);
    if (idx !== -1) {
      usuarios[idx] = actualizado;
      guardarUsuarios(usuarios);
    }
    guardarUsuarioActual(actualizado);
    setUsuario(actualizado);
    setOk('Perfil actualizado correctamente (Local).');
    
    try {
      const log = JSON.parse(localStorage.getItem(CLAVES_BD.ACTIVITY_LOG) || '[]');
      log.push({
        tipo: 'usuario_self_update',
        fecha: new Date().toLocaleString('es-CL'),
        detalle: { usuarioId: actualizado.id }
      });
      localStorage.setItem(CLAVES_BD.ACTIVITY_LOG, JSON.stringify(log));
    } catch {}
  };

  const handleLogout = async () => {
      try {
          await apiLogout();
      } catch (e) {
          console.warn('Error en logout API', e);
      }
      cerrarSesion(); // Limpieza local y navegación
      navegar('/iniciar-sesion');
  };

  return (
    <div className="container py-5">
      <h2 className="mb-4">Mi Perfil</h2>

      {cargando && <div className="alert alert-info">Cargando perfil...</div>}
      {error && <div className="alert alert-danger" role="alert" aria-live="polite">{error}</div>}
      {ok && <div className="alert alert-success" role="alert" aria-live="polite">{ok}</div>}

      {usuario && (
        <>
        <form className="card shadow-sm border-0 p-4">
          <div className="card-body">
            <div className="row g-3">
              <div className="col-12">
                <label className="form-label" htmlFor="nombre">Nombre Completo</label>
                <input ref={nombreRef} id="nombre" name="nombre" type="text" className="form-control" value={form.nombre} onChange={onChange} placeholder="Juan Pérez" required minLength={3} autoComplete="name" />
              </div>
              <div className="col-md-6">
                <label className="form-label" htmlFor="email">Correo Electrónico</label>
                <input id="email" name="email" type="email" className="form-control" value={form.email} onChange={onChange} placeholder="juan@ejemplo.com" required autoComplete="email" />
              </div>
              <div className="col-md-6">
                <label className="form-label" htmlFor="telefono">Teléfono</label>
                <input id="telefono" name="telefono" type="tel" className="form-control" value={form.telefono} onChange={onChange} placeholder="+56 9 1234 5678" required autoComplete="tel" />
              </div>
              <div className="col-md-6">
                <label className="form-label" htmlFor="contrasena">Contraseña</label>
                <input id="contrasena" name="contrasena" type="password" className="form-control" value={form.contrasena} onChange={onChange} minLength={4} autoComplete="new-password" />
              </div>
              <div className="col-md-6">
                <label className="form-label" htmlFor="confirmarContrasena">Confirmar Contraseña</label>
                <input id="confirmarContrasena" name="confirmarContrasena" type="password" className="form-control" value={form.confirmarContrasena} onChange={onChange} minLength={4} autoComplete="new-password" />
              </div>
              <div className="col-12">
                <h5 className="mt-3">Dirección</h5>
              </div>
              <div className="col-md-8">
                <label className="form-label" htmlFor="direccion_calle">Calle</label>
                <input id="direccion_calle" name="direccion_calle" type="text" className="form-control" value={form.direccion_calle} onChange={onChange} required autoComplete="address-line1" />
              </div>
              <div className="col-md-4">
                <label className="form-label" htmlFor="direccion_numero">Número</label>
                <input id="direccion_numero" name="direccion_numero" type="text" className="form-control" value={form.direccion_numero} onChange={onChange} required autoComplete="address-line2" />
              </div>
              <div className="col-md-6">
                <label className="form-label" htmlFor="direccion_region">Región</label>
                <select id="direccion_region" name="direccion_region" className="form-select" value={form.direccion_region} onChange={onChange}>
                  <option value="Biobío">Biobío</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label" htmlFor="direccion_comuna">Comuna</label>
                <select id="direccion_comuna" name="direccion_comuna" className="form-select" value={form.direccion_comuna} onChange={onChange} required>
                  <option value="">Seleccionar...</option>
                  <option value="Concepción">Concepción</option>
                  <option value="Hualpén">Hualpén</option>
                  <option value="Talcahuano">Talcahuano</option>
                  <option value="San Pedro">San Pedro</option>
                  <option value="Chiguayante">Chiguayante</option>
                </select>
              </div>
              <div className="col-12 mt-3 d-flex align-items-center gap-2">
                <span className="badge bg-info text-dark">Rol: {usuario.rol}</span>
                <button type="button" className="btn btn-primary ms-auto" onClick={onGuardar} aria-label="Guardar cambios">Guardar cambios</button>
              </div>
            </div>
          </div>
        </form>
        <div className="card border-0 shadow-sm mt-4">
          <div className="card-body d-flex align-items-center">
            <div className="me-auto">
              <h5 className="card-title mb-1">Cerrar sesión</h5>
              <p className="text-muted mb-0">Salir de tu cuenta y volver al inicio.</p>
            </div>
            <button type="button" className="btn btn-outline-danger" onClick={() => setModalLogout(true)} aria-label="Cerrar sesión">Cerrar sesión</button>
          </div>
        </div>
        </>
      )}

      {modalLogout && (
        <Modal 
          abierto={true}
          titulo="Cerrar Sesión" 
          mensaje="¿Estás seguro de que deseas cerrar sesión?" 
          alConfirmar={handleLogout}
          alCancelar={() => setModalLogout(false)} 
          etiquetaConfirmar="Sí, cerrar sesión"
          etiquetaCancelar="Cancelar"
          severidad="warning"
        />
      )}
    </div>
  );
};

export default VistaPerfil;
