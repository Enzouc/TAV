import React, { useEffect, useMemo, useState } from 'react';
import ControlesPaginacion from './ControlesPaginacion';
import { obtenerTodosLosPedidos } from '../utils/pedido';
import { obtenerTodosLosUsuarios } from '../utils/usuario';
import { aplicarFormatoMoneda } from '../utils/datos';

/**
 * @typedef {Object} Pedido
 * @property {string} id
 * @property {string} nombreUsuario
 * @property {string} direccion
 * @property {number} total
 * @property {'Pendiente'|'En Camino'|'Entregado'} estado
 * @property {string|null} idRepartidor
 * @property {string} fecha
 */
/**
 * @typedef {Object} OrdersTableProps
 * @property {Pedido[]} [data]
 * @property {string} [apiUrl]
 * @property {(p:Pedido)=>void} [onAsignar]
 * @property {(p:Pedido)=>void} [onVerDetalles]
 * @property {number} [pageSize]
 */
/**
 * @param {OrdersTableProps} props
 */
const OrdersTable = ({ data, apiUrl, onAsignar, onVerDetalles, pageSize = 10 }) => {
  const [pedidos, setPedidos] = useState([]);
  const [repartidores, setRepartidores] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroRepartidor, setFiltroRepartidor] = useState('todos');
  const [filtroTexto, setFiltroTexto] = useState('');
  const [sortKey, setSortKey] = useState('fecha');
  const [sortDir, setSortDir] = useState('desc');
  const [pagina, setPagina] = useState(1);
  const [tamPagina, setTamPagina] = useState(pageSize);

  useEffect(() => {
    const cargar = async () => {
      try {
        setCargando(true);
        setError('');
        if (Array.isArray(data)) {
          setPedidos(data);
        } else if (apiUrl) {
          const r = await fetch(apiUrl);
          const json = await r.json();
          setPedidos(Array.isArray(json?.data) ? json.data : Array.isArray(json) ? json : []);
        } else {
          setPedidos(obtenerTodosLosPedidos());
        }
        // cargar repartidores para etiquetas
        const usuarios = obtenerTodosLosUsuarios();
        setRepartidores(usuarios.filter(u => u.rol === 'repartidor'));
      } catch (e) {
        setError('Error al cargar pedidos: ' + e.message);
        setPedidos(obtenerTodosLosPedidos());
        const usuarios = obtenerTodosLosUsuarios();
        setRepartidores(usuarios.filter(u => u.rol === 'repartidor'));
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, [data, apiUrl]);

  const estados = ['todos', 'Pendiente', 'Confirmado', 'En Preparación', 'En Camino', 'Entregado', 'Cancelado', 'Reembolsado'];
  const repartidorOptions = useMemo(() => {
    const base = repartidores.map(d => ({ id: d.id, nombre: d.nombre }));
    return [{ id: 'todos', nombre: 'todos' }, ...base];
  }, [repartidores]);

  const filtrados = useMemo(() => {
    return pedidos.filter(p => {
      if (filtroEstado !== 'todos' && p.estado !== filtroEstado) return false;
      if (filtroRepartidor !== 'todos') {
        if (!p.idRepartidor || p.idRepartidor !== filtroRepartidor) return false;
      }
      if (filtroTexto) {
        const t = filtroTexto.toLowerCase();
        const nombre = String(p.nombreUsuario || p.nombre_usuario || '').toLowerCase();
        if (!String(p.id).toLowerCase().includes(t) && !nombre.includes(t)) return false;
      }
      return true;
    });
  }, [pedidos, filtroEstado, filtroRepartidor, filtroTexto]);

  const ordenados = useMemo(() => {
    const arr = filtrados.slice();
    arr.sort((a, b) => {
      const va = a[sortKey];
      const vb = b[sortKey];
      if (sortKey === 'total') {
        return sortDir === 'asc' ? va - vb : vb - va;
      }
      const sa = String(va);
      const sb = String(vb);
      const cmp = sa.localeCompare(sb, 'es');
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return arr;
  }, [filtrados, sortKey, sortDir]);

  const total = ordenados.length;
  const totalPaginas = Math.max(1, Math.ceil(total / tamPagina));
  const paginaActual = Math.min(pagina, totalPaginas);
  const inicio = (paginaActual - 1) * tamPagina;
  const visibles = ordenados.slice(inicio, inicio + tamPagina);

  const nombreRepartidor = (id) => {
    if (!id) return null;
    const d = repartidores.find(r => r.id === id);
    return d ? d.nombre : null;
  };

  const toggleSort = (key) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir(key === 'total' ? 'desc' : 'asc');
    }
  };

  return (
    <div>
      <div className="bg-white rounded shadow-sm p-3 mb-3">
        <div className="row g-3">
          <div className="col-md-4">
            <label className="form-label" htmlFor="filtro-pedidos-texto">Buscar</label>
            <input id="filtro-pedidos-texto" className="form-control" placeholder="ID o cliente" value={filtroTexto} onChange={(e) => setFiltroTexto(e.target.value)} />
          </div>
          <div className="col-md-4">
            <label className="form-label" htmlFor="filtro-pedidos-estado">Estado</label>
            <select id="filtro-pedidos-estado" className="form-select" value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
              {estados.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="col-md-4">
            <label className="form-label" htmlFor="filtro-pedidos-repartidor">Repartidor</label>
            <select id="filtro-pedidos-repartidor" className="form-select" value={filtroRepartidor} onChange={(e) => setFiltroRepartidor(e.target.value)}>
              {repartidorOptions.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
            </select>
          </div>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {cargando && <div className="alert alert-info">Cargando pedidos...</div>}

      <div className="table-responsive bg-white rounded shadow-sm p-3">
        <table className="table table-hover align-middle">
          <thead>
            <tr>
              <th role="button" onClick={() => toggleSort('id')}>ID</th>
              <th role="button" onClick={() => toggleSort('fecha')}>Fecha</th>
              <th role="button" onClick={() => toggleSort('nombreUsuario')}>Cliente</th>
              <th>Productos</th>
              <th role="button" onClick={() => toggleSort('total')}>Total</th>
              <th role="button" onClick={() => toggleSort('estado')}>Estado</th>
              <th role="button" onClick={() => toggleSort('idRepartidor')}>Repartidor</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {visibles.map(p => {
              const fecha = p.fecha || p.fecha_pedido ? new Date(p.fecha || p.fecha_pedido).toLocaleString('es-CL') : 'N/A';
              const cliente = p.nombreUsuario || p.nombre_usuario || 'Desconocido';
              const productos = p.items && p.items.length > 0 
                ? p.items.map(i => `${i.cantidad}x ${i.nombre_producto || 'Producto'}`).join(', ')
                : 'Sin productos';

              return (
                <tr key={p.id}>
                  <td><small>{p.id}</small></td>
                  <td><small>{fecha}</small></td>
                  <td>{cliente}</td>
                  <td><small className="text-muted">{productos}</small></td>
                  <td>{aplicarFormatoMoneda(p.total)}</td>
                  <td>
                    <span className={`badge ${p.estado === 'Entregado' ? 'bg-success' : p.estado === 'Pendiente' ? 'bg-warning text-dark' : 'bg-info text-dark'}`}>
                      {p.estado}
                    </span>
                  </td>
                  <td>
                    {p.idRepartidor || p.id_repartidor
                      ? <span className="badge bg-success">{nombreRepartidor(p.idRepartidor || p.id_repartidor) || 'Asignado'}</span>
                      : <span className="badge bg-secondary">Sin asignar</span>}
                  </td>
                  <td>
                    <div className="d-flex gap-1">
                      <button className="btn btn-sm btn-info text-white" onClick={() => onVerDetalles && onVerDetalles(p)} title="Ver detalles y notas">📝</button>
                      {(!p.idRepartidor && !p.id_repartidor) && (
                        <button className="btn btn-sm btn-outline-primary" onClick={() => onAsignar && onAsignar(p)}>Asignar</button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
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

export default OrdersTable;
