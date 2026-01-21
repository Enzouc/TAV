import React, { useEffect, useRef } from 'react';

const Notificacion = ({
  tipo = 'info',
  titulo,
  mensaje,
  autoCierreMs = 3000,
  alCerrar,
}) => {
  const refTemporizador = useRef(null);

  useEffect(() => {
    if (!autoCierreMs) return;
    refTemporizador.current = setTimeout(() => {
      alCerrar && alCerrar();
    }, autoCierreMs);
    return () => {
      if (refTemporizador.current) clearTimeout(refTemporizador.current);
    };
  }, [autoCierreMs, alCerrar]);

  const cls =
    tipo === 'error'
      ? 'mc-aviso mc-aviso-error'
      : tipo === 'warning'
      ? 'mc-aviso mc-aviso-warning'
      : 'mc-aviso mc-aviso-info';

  return (
    <div className={cls} role="status" aria-live="polite">
      <div className="mc-aviso-encabezado">
        <strong className="mc-aviso-titulo">{titulo}</strong>
        <button
          className="btn-close btn-close-sm"
          aria-label="Cerrar"
          onClick={() => alCerrar && alCerrar()}
        />
      </div>
      <div className="mc-aviso-cuerpo">{mensaje}</div>
    </div>
  );
};

export default Notificacion;
