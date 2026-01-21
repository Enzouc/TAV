import React, { useEffect, useState } from 'react';
import { obtenerUsuarioActual } from '../utils/almacenamiento';

const VistaPerfil = () => {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    try {
      setCargando(true);
      setError('');
      const u = obtenerUsuarioActual();
      if (!u) {
        setError('No hay sesión activa. Inicia sesión para ver tu perfil.');
      } else {
        setUsuario(u);
      }
    } catch (e) {
      setError('Error al cargar el perfil: ' + e.message);
    } finally {
      setCargando(false);
    }
  }, []);

  return (
    <div className="container py-5">
      <h2 className="mb-4">Mi Perfil</h2>

      {cargando && <div className="alert alert-info">Cargando perfil...</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      {usuario && (
        <div className="card shadow-sm">
          <div className="card-body">
            <h5 className="card-title">{usuario.nombre}</h5>
            <p className="card-text text-muted">{usuario.email}</p>
            {usuario.telefono && <p className="card-text">Teléfono: {usuario.telefono}</p>}
            {usuario.direccion && (
              <p className="card-text">
                Dirección: {usuario.direccion.calle} {usuario.direccion.numero}, {usuario.direccion.comuna}, {usuario.direccion.region}
              </p>
            )}
            <span className="badge bg-info text-dark">Rol: {usuario.rol}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default VistaPerfil;
