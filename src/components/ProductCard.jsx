import React from 'react';
import { aplicarFormatoMoneda } from '../utils/datos';

const obtenerImagen = (nombre) => {
  if (!nombre) return 'productos_gas/producto-gas-15-kg.png';
  const nm = String(nombre).toLowerCase();
  if (nm.includes('catalítico') || nm.includes('catalitico')) {
    return 'productos_gas/producto-gas-catalitico-11-kg.jpg';
  }
  const match = nm.match(/(\d+)\s*kg/);
  const peso = match ? parseInt(match[1], 10) : null;
  if (peso === 5) return 'productos_gas/producto-gas-5-kg.png';
  if (peso === 11) return 'productos_gas/producto-gas-11-kg.png';
  if (peso === 15) return 'productos_gas/producto-gas-15-kg.png';
  if (peso === 45) return 'productos_gas/producto-gas-45-kg.png';
  return 'productos_gas/producto-gas-15-kg.png';
};

const badgeColor = (categoria) => {
  switch (categoria) {
    case 'Industrial': return 'bg-dark';
    case 'Camping': return 'bg-info text-dark';
    case 'Catalítico': return 'bg-warning text-dark';
    default: return 'bg-primary';
  }
};

const ProductCard = ({ product, view = 'grid', onClick, className = '', style = {} }) => {
  const clickable = product.stock > 0 && typeof onClick === 'function';
  const handleClick = () => clickable && onClick(product);
  const imagenSrc = product.imagen || obtenerImagen(product.nombre);

  return (
    <div
      className={`card h-100 shadow-sm border-0 hover-effect ${className}`}
      onClick={handleClick}
      style={{ cursor: clickable ? 'pointer' : 'default', transition: 'all 0.3s ease', ...style }}
      role={clickable ? 'button' : undefined}
      aria-disabled={product.stock <= 0}
    >
      <div className="position-relative overflow-hidden rounded-top">
        <div className="d-flex justify-content-between position-absolute top-0 w-100 p-2">
          <span className={`badge ${badgeColor(product.categoria)} shadow-sm`}>{product.categoria}</span>
          <span className={`badge ${product.stock > 0 ? 'bg-success' : 'bg-danger'} shadow-sm`}>
            {product.stock > 0 ? 'Disponible' : 'Agotado'}
          </span>
        </div>
        <div className={`text-center p-${view === 'list' ? 3 : 4} bg-light`}>
          <img
            src={imagenSrc}
            className="card-img-top"
            alt={product.nombre}
            style={{ height: view === 'list' ? '160px' : '220px', objectFit: 'contain', mixBlendMode: 'multiply' }}
            loading="lazy"
          />
        </div>
      </div>
      <div className="card-body d-flex flex-column">
        <h5 className="card-title fw-bold text-dark">{product.nombre}</h5>
        <p className="card-text text-muted small flex-grow-1">
          {product.descripcion
            ? (product.descripcion.length > 80 ? product.descripcion.substring(0, 80) + '...' : product.descripcion)
            : 'Cilindro de alta calidad.'}
        </p>
        {view === 'grid' && (
          <div className="d-flex align-items-center justify-content-between mt-2">
            <span className="h5 mb-0 text-primary fw-bold">{aplicarFormatoMoneda(product.precio)}</span>
          </div>
        )}
        <div className="mt-3 pt-3 border-top d-flex align-items-center justify-content-between">
          <span className="h6 mb-0">{product.stock} un.</span>
          {product.stock > 0 && (
            <button className="btn btn-sm btn-outline-primary rounded-circle" title="Ver detalle" type="button" onClick={handleClick}>
              <span aria-hidden="true">+</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
