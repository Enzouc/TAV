import React, { useEffect, useRef } from 'react';

const Modal = ({
  abierto,
  titulo,
  mensaje,
  severidad = 'info',
  alConfirmar,
  alCancelar,
  etiquetaConfirmar = 'Confirmar',
  etiquetaCancelar = 'Cancelar',
  cerrarEnFondo = true,
  cerrarEnEsc = true,
  autoCierreMs,
  children,
}) => {
  const refSuperposicion = useRef(null);
  const refConfirmar = useRef(null);

  useEffect(() => {
    if (!abierto) return;
    if (refConfirmar.current) refConfirmar.current.focus();
    const alPresionarTecla = (e) => {
      if (e.key === 'Escape' && cerrarEnEsc) {
        alCancelar && alCancelar();
      }
    };
    document.addEventListener('keydown', alPresionarTecla);
    return () => document.removeEventListener('keydown', alPresionarTecla);
  }, [abierto, cerrarEnEsc, alCancelar]);

  useEffect(() => {
    if (!abierto || !autoCierreMs) return;
    const t = setTimeout(() => {
      alCancelar && alCancelar();
    }, autoCierreMs);
    return () => clearTimeout(t);
  }, [abierto, autoCierreMs, alCancelar]);

  const manejarFondo = (e) => {
    if (!cerrarEnFondo) return;
    if (e.target === refSuperposicion.current) {
      alCancelar && alCancelar();
    }
  };

  if (!abierto) return null;

  const claseSeveridad =
    severidad === 'error'
      ? 'mc-modal-error'
      : severidad === 'warning'
      ? 'mc-modal-warning'
      : 'mc-modal-info';

  return (
    <div
      ref={refSuperposicion}
      className="mc-modal-superposicion mc-aparicion"
      onMouseDown={manejarFondo}
      aria-hidden={!abierto}
    >
      <div
        className={`mc-modal-dialogo mc-deslizar-arriba ${claseSeveridad}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="mc-modal-titulo"
      >
        <div className="mc-modal-encabezado">
          <h5 id="mc-modal-titulo" className="mc-modal-titulo">
            {titulo}
          </h5>
          <button
            aria-label="Cerrar"
            className="btn-close"
            onClick={() => alCancelar && alCancelar()}
          />
        </div>
        <div className="mc-modal-cuerpo">
          {mensaje && <p className="mc-modal-mensaje">{mensaje}</p>}
          {children}
        </div>
        <div className="mc-modal-pie">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => alCancelar && alCancelar()}
          >
            {etiquetaCancelar}
          </button>
          <button
            type="button"
            className="btn btn-primary"
            ref={refConfirmar}
            onClick={() => alConfirmar && alConfirmar()}
          >
            {etiquetaConfirmar}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
