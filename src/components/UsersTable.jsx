import React, { useEffect, useMemo, useState } from 'react';
import ControlesPaginacion from './ControlesPaginacion';
import { obtenerTodosLosUsuarios } from '../utils/usuario';
import { obtenerUsuarioActual } from '../utils/almacenamiento';

/**
 * @typedef {Object} Usuario
 * @property {string} id
 * @property {string} nombre
 * @property {string} email
 * @property {'usuario'|'repartidor'|'admin'} rol
 * @property {'activo'|'bloqueado'} estado
 */
/**
 * @typedef {Object} UsersTableProps
 * @property {Usuario[]} [data]
 * @property {string} [apiUrl]
 * @property {(u:Usuario)=>void} [onEditarUsuario]
 * @property {(u:Usuario)=>void} [onAlternarEstadoUsuario]
 * @property {(u:Usuario)=>void} [onEliminarUsuario]
 * @property {number} [pageSize]
 */
/**
 * @param {UsersTableProps} props
 */
const UsersTable = ({ data, apiUrl, onEditarUsuario, onAlternarEstadoUsuario, onEliminarUsuario, pageSize = 10 }) => {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [filtroRol, setFiltroRol] = useState('todos');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroTexto, setFiltroTexto] = useState('');
  const [sortKey, setSortKey] = useState('nombre');
  const [sortDir, setSortDir] = useState('asc');
  const [pagina, setPagina] = useState(1);
  const [tamPagina, setTamPagina] = useState(pageSize);

  useEffect(() => {
    const cargar = async () => {
      try {
        setCargando(true);
        setError('');
        if (Array.isArray(data)) {
          setUsuarios(data);
        } else if (apiUrl) {
          const r = await fetch(apiUrl);
          const json = await r.json();
          setUsuarios(Array.isArray(json?.data) ? json.data : Array.isArray(json) ? json : []);
        } else {
          setUsuarios(obtenerTodosLosUsuarios());
        }
      } catch (e) {
        setError('Error al cargar usuarios: ' + e.message);
        setUsuarios(obtenerTodosLosUsuarios());
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, [data, apiUrl]);

  const currentUserId = useMemo(() => obtenerUsuarioActual()?.id || null, []);

  const roles = useMemo(() => {
    const base = new Set(['usuario', 'repartidor', 'admin']);
    usuarios.forEach(u => base.add(u.rol));
    return ['todos', ...Array.from(base)];
  }, [usuarios]);
  const estados = ['todos', 'activo', 'bloqueado'];

  const filtrados = useMemo(() => {
    return usuarios.filter(u => {
      if (filtroRol !== 'todos' && u.rol !== filtroRol) return false;
      if (filtroEstado !== 'todos' && u.estado !== filtroEstado) return false;
      if (filtroTexto) {
        const t = filtroTexto.toLowerCase();
        if (!String(u.nombre).toLowerCase().includes(t) && !String(u.email).toLowerCase().includes(t)) return false;
      }
      return true;
    });
  }, [usuarios, filtroRol, filtroEstado, filtroTexto]);

  const ordenados = useMemo(() => {
    const arr = filtrados.slice();
    arr.sort((a, b) => {
      const va = a[sortKey];
      const vb = b[sortKey];
      if (typeof va === 'string' && typeof vb === 'string') {
        const cmp = va.localeCompare(vb, 'es');
        return sortDir === 'asc' ? cmp : -cmp;
      }
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return arr;
  }, [filtrados, sortKey, sortDir]);

  const total = ordenados.length;
  const totalPaginas = Math.max(1, Math.ceil(total / tamPagina));
  const paginaActual = Math.min(pagina, totalPaginas);
  const inicio = (paginaActual - 1) * tamPagina;
  const visibles = ordenados.slice(inicio, inicio + tamPagina);

  const toggleSort = (key) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  return (
    <div>
      <div className="bg-white rounded shadow-sm p-3 mb-3">
        <div className="row g-3">
          <div className="col-md-4">
            <label className="form-label" htmlFor="filtro-usuarios-texto">Buscar</label>
            <input id="filtro-usuarios-texto" className="form-control" placeholder="Nombre o email" value={filtroTexto} onChange={(e) => setFiltroTexto(e.target.value)} />
          </div>
          <div className="col-md-4">
            <label className="form-label" htmlFor="filtro-usuarios-rol">Rol</label>
            <select id="filtro-usuarios-rol" className="form-select" value={filtroRol} onChange={(e) => setFiltroRol(e.target.value)}>
              {roles.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="col-md-4">
            <label className="form-label" htmlFor="filtro-usuarios-estado">Estado</label>
            <select id="filtro-usuarios-estado" className="form-select" value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
              {estados.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {cargando && <div className="alert alert-info">Cargando usuarios...</div>}

      <div className="table-responsive bg-white rounded shadow-sm p-3">
        <table className="table table-hover align-middle">
          <thead>
            <tr>
              <th role="button" onClick={() => toggleSort('id')}>ID</th>
              <th role="button" onClick={() => toggleSort('nombre')}>Nombre</th>
              <th role="button" onClick={() => toggleSort('email')}>Email</th>
              <th role="button" onClick={() => toggleSort('rol')}>Rol</th>
              <th role="button" onClick={() => toggleSort('estado')}>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {visibles.map(u => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.nombre}</td>
                <td>{u.email}</td>
                <td><span className="badge bg-info text-dark">{u.rol}</span></td>
                <td>
                  <span className={`badge ${u.estado === 'bloqueado' ? 'bg-danger' : 'bg-success'}`}>
                    {u.estado === 'bloqueado' ? 'Bloqueado' : 'Activo'}
                  </span>
                </td>
                <td>
                  <button
                    className="btn btn-sm btn-outline-primary me-2"
                    disabled={u.id === '#ADMIN_ROOT' || u.id === currentUserId}
                    onClick={() => onEditarUsuario && onEditarUsuario(u)}
                  >
                    Editar
                  </button>
                  <button
                    className={`btn btn-sm ${u.estado === 'bloqueado' ? 'btn-outline-success' : 'btn-outline-warning'}`}
                    disabled={u.id === '#ADMIN_ROOT' || u.id === currentUserId}
                    onClick={() => onAlternarEstadoUsuario && onAlternarEstadoUsuario(u)}
                  >
                    {u.estado === 'bloqueado' ? 'Desbloquear' : 'Bloquear'}
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger ms-2"
                    disabled={u.id === '#ADMIN_ROOT' || u.id === currentUserId}
                    onClick={() => onEliminarUsuario && onEliminarUsuario(u)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ControlesPaginacion
        paginaActual={paginaActual}
        totalPaginas={totalPaginas}
        tamPagina={tamPagina}
        onTamPagina={(n) => { setTamPagina(n); setPagina(1); }}
        onPrev={() => setPagina(paginaActual - 1)}
        onNext={() => setPagina(paginaActual + 1)}
      />
    </div>
  );
};

export default UsersTable;
