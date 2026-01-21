import React from 'react';

/**
 * @typedef {Object} FiltrosCatalogoProps
 * @property {string[]} categorias
 * @property {string} filtroTexto
 * @property {(v: string) => void} onFiltroTexto
 * @property {string} filtroCategoria
 * @property {(v: string) => void} onFiltroCategoria
 * @property {string} orden
 * @property {(v: string) => void} onOrden
 * @property {'grid'|'list'} vista
 * @property {(v: 'grid'|'list') => void} onVista
 */

/**
 * @param {FiltrosCatalogoProps} props
 */
const FiltrosCatalogo = ({ categorias, filtroTexto, onFiltroTexto, filtroCategoria, onFiltroCategoria, orden, onOrden, vista, onVista }) => {
  return (
    <div className="row g-3 align-items-end mb-4">
      <div className="col-12 col-md-4">
        <label className="form-label">Buscar</label>
        <input
          type="text"
          className="form-control"
          placeholder="Nombre, descripción o categoría"
          value={filtroTexto}
          onChange={(e) => onFiltroTexto(e.target.value)}
        />
      </div>
      <div className="col-6 col-md-3">
        <label className="form-label" htmlFor="catalogo-categoria">Categoría</label>
        <select id="catalogo-categoria" className="form-select" value={filtroCategoria} onChange={(e) => onFiltroCategoria(e.target.value)}>
          {categorias.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div className="col-6 col-md-3">
        <label className="form-label" htmlFor="catalogo-orden">Orden</label>
        <select id="catalogo-orden" className="form-select" value={orden} onChange={(e) => onOrden(e.target.value)}>
          <option value="precio_asc">Precio: menor a mayor</option>
          <option value="precio_desc">Precio: mayor a menor</option>
          <option value="stock_desc">Stock: mayor a menor</option>
          <option value="nombre_asc">Nombre: A → Z</option>
        </select>
      </div>
      <div className="col-12 col-md-2 d-flex gap-2">
        <button className={`btn ${vista === 'grid' ? 'btn-primary' : 'btn-outline-primary'} w-50`} onClick={() => onVista('grid')}>Grid</button>
        <button className={`btn ${vista === 'list' ? 'btn-primary' : 'btn-outline-primary'} w-50`} onClick={() => onVista('list')}>Lista</button>
      </div>
    </div>
  );
};

export default FiltrosCatalogo;

