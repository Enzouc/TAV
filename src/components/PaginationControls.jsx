import React from 'react';

/**
 * @typedef {Object} PaginationControlsProps
 * @property {number} paginaActual
 * @property {number} totalPaginas
 * @property {number} tamPagina
 * @property {(n: number) => void} onTamPagina
 * @property {() => void} onPrev
 * @property {() => void} onNext
 */

/**
 * @param {PaginationControlsProps} props
 */
const PaginationControls = ({ paginaActual, totalPaginas, tamPagina, onTamPagina, onPrev, onNext }) => {
  return (
    <div className="d-flex justify-content-between align-items-center mt-4">
      <div className="d-flex align-items-center gap-2">
        <span className="text-muted">Página {paginaActual} de {totalPaginas}</span>
        <select className="form-select form-select-sm w-auto" value={String(tamPagina)} onChange={(e) => onTamPagina(Number(e.target.value))}>
          {[8, 12, 16, 24].map(n => <option key={n} value={String(n)}>{n}</option>)}
        </select>
      </div>
      <div className="btn-group">
        <button className="btn btn-outline-secondary" disabled={paginaActual <= 1} onClick={onPrev}>Anterior</button>
        <button className="btn btn-outline-secondary" disabled={paginaActual >= totalPaginas} onClick={onNext}>Siguiente</button>
      </div>
    </div>
  );
};

export default PaginationControls;
