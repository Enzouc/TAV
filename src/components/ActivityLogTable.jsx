import React from 'react';

/**
 * @typedef {Object} Cambio
 * @property {string} campo
 * @property {any} anterior
 * @property {any} nuevo
 */
/**
 * @typedef {Object} EntradaLog
 * @property {string} tipo
 * @property {string} fecha
 * @property {{ actorId: string, productoId?: string, pedidoId?: string, cambios?: Cambio[] }} detalle
 */
/**
 * @typedef {Object} ActivityLogTableProps
 * @property {EntradaLog[]} entries
 * @property {'producto'|'pedido'} modo
 */

/**
 * @param {ActivityLogTableProps} props
 */
const ActivityLogTable = ({ entries, modo }) => {
  const headers =
    modo === 'producto'
      ? ['Fecha', 'Usuario', 'Producto', 'Cambios']
      : ['Fecha', 'Usuario', 'Pedido', 'Cambios'];

  const renderCambios = (l) => {
    if (l.detalle?.cambios && l.detalle.cambios.length > 0) {
      return l.detalle.cambios.map(c => `${c.campo}: ${c.anterior ?? '—'} → ${c.nuevo ?? '—'}`).join(' | ');
    }
    if (modo === 'producto') {
      return l.tipo === 'producto_create' ? 'Creación' : 'Eliminación';
    }
    return 'Creación';
  };

  return (
    <div className="table-responsive bg-white rounded shadow-sm p-3">
      <table className="table table-sm">
        <thead>
          <tr>
            {headers.map(h => <th key={h}>{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {entries.map((l, idx) => (
            <tr key={idx}>
              <td>{l.fecha}</td>
              <td>{l.detalle?.actorId}</td>
              {modo === 'producto' ? (
                <td>{l.detalle?.productoId}</td>
              ) : (
                <td>{l.detalle?.pedidoId}</td>
              )}
              <td className="text-muted">{renderCambios(l)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ActivityLogTable;

