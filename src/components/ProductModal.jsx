import React, { useState, useEffect } from 'react';
import { aplicarFormatoMoneda } from '../utils/datos';

const ProductModal = ({ show, onClose, product, onAddToCart }) => {
    const [cantidad, setCantidad] = useState(1);
    const [animar, setAnimar] = useState(false);

    useEffect(() => {
        if (show) {
            setCantidad(1);
            // Pequeño delay para activar la animación
            setTimeout(() => setAnimar(true), 10);
        } else {
            setAnimar(false);
        }
    }, [show]);

    if (!show || !product) return null;

    // Calcular total
    const total = product.precio * cantidad;

    // Manejar cierre con animación
    const handleClose = () => {
        setAnimar(false);
        setTimeout(onClose, 300); // Esperar a que termine la animación
    };

    return (
        <div 
            className={`modal show d-block`} 
            style={{ 
                backgroundColor: `rgba(0,0,0,${animar ? '0.6' : '0'})`, 
                backdropFilter: animar ? 'blur(2px)' : 'none',
                transition: 'all 0.3s ease-in-out',
                zIndex: 1050
            }} 
            tabIndex="-1"
            onClick={handleClose}
        >
            <div 
                className="modal-dialog modal-dialog-centered" 
                onClick={e => e.stopPropagation()}
                style={{
                    transform: animar ? 'scale(1)' : 'scale(0.9)',
                    opacity: animar ? 1 : 0,
                    transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
                }}
            >
                <div className="modal-content border-0 shadow-lg">
                    <div className="modal-header border-0 pb-0">
                        <h5 className="modal-title fw-bold text-primary">{product.nombre}</h5>
                        <button type="button" className="btn-close" onClick={handleClose} aria-label="Close"></button>
                    </div>
                    <div className="modal-body text-center px-4 py-2">
                        <div className="bg-light rounded-3 p-3 mb-3">
                            <img 
                                src={product.imagen || 'productos_gas/producto-gas-15-kg.png'} 
                                alt={product.nombre} 
                                className="img-fluid" 
                                style={{ maxHeight: '250px', mixBlendMode: 'multiply', objectFit: 'contain' }} 
                                loading="lazy"
                            />
                        </div>
                        <p className="text-muted">{product.descripcion}</p>
                        
                        <div className="d-flex justify-content-center align-items-center mb-3 gap-2">
                            {product.categoria && (
                                <span className="badge bg-secondary">{product.categoria}</span>
                            )}
                            <span className={`badge ${product.stock > 10 ? 'bg-success' : (product.stock > 0 ? 'bg-warning text-dark' : 'bg-danger')}`}>
                                {product.stock > 0 ? `Stock: ${product.stock} un.` : 'Agotado'}
                            </span>
                        </div>

                        <h3 className="text-primary fw-bold my-3">{aplicarFormatoMoneda(product.precio)}</h3>
                        
                        {product.stock > 0 && (
                            <>
                                <div className="d-flex justify-content-center align-items-center gap-3 p-2 border rounded bg-light d-inline-flex mb-2">
                                    <button 
                                        className="btn btn-sm btn-outline-secondary rounded-circle" 
                                        onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                                        disabled={cantidad <= 1}
                                        style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                    >
                                        -
                                    </button>
                                    <span className="fw-bold fs-5" style={{ minWidth: '30px' }}>{cantidad}</span>
                                    <button 
                                        className="btn btn-sm btn-outline-secondary rounded-circle" 
                                        onClick={() => setCantidad(Math.min(cantidad + 1, product.stock))}
                                        disabled={cantidad >= product.stock}
                                        style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                    >
                                        +
                                    </button>
                                </div>
                                <div className="mt-2 text-muted small">
                                    Total a pagar: <strong>{aplicarFormatoMoneda(total)}</strong>
                                </div>
                            </>
                        )}
                    </div>
                    <div className="modal-footer border-0 pt-0 justify-content-center pb-4">
                        <button type="button" className="btn btn-outline-secondary px-4" onClick={handleClose}>Seguir mirando</button>
                        <button 
                            type="button" 
                            className="btn btn-primary px-5 fw-bold" 
                            onClick={() => onAddToCart(product, cantidad)}
                            disabled={product.stock <= 0}
                        >
                            Agregar al Carrito
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductModal;
