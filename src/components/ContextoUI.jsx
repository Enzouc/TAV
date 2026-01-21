import React, { createContext, useContext, useMemo, useState } from 'react';
import Modal from './Modal';
import Notificacion from './Notificacion';

const ContextoUI = createContext(null);

export const ProveedorUI = ({ children, local = 'es', etiquetas }) => {
  const [estadoConfirmacion, setEstadoConfirmacion] = useState({
    abierto: false,
    titulo: '',
    mensaje: '',
    severidad: 'info',
    etiquetaConfirmar: etiquetas?.confirmar || (local === 'en' ? 'Confirm' : 'Confirmar'),
    etiquetaCancelar: etiquetas?.cancelar || (local === 'en' ? 'Cancel' : 'Cancelar'),
    alConfirmar: null,
    alCancelar: null,
    autoCierreMs: null,
  });
  const [notificaciones, setNotificaciones] = useState([]);

  const abrirConfirmacion = (opciones) => {
    setEstadoConfirmacion({
      abierto: true,
      titulo: opciones.titulo || '',
      mensaje: opciones.mensaje || '',
      severidad: opciones.severidad || 'info',
      etiquetaConfirmar: opciones.etiquetaConfirmar || (etiquetas?.confirmar || (local === 'en' ? 'Confirm' : 'Confirmar')),
      etiquetaCancelar: opciones.etiquetaCancelar || (etiquetas?.cancelar || (local === 'en' ? 'Cancel' : 'Cancelar')),
      alConfirmar: () => {
        if (opciones.alConfirmar) opciones.alConfirmar();
        setEstadoConfirmacion((s) => ({ ...s, abierto: false }));
      },
      alCancelar: () => {
        if (opciones.alCancelar) opciones.alCancelar();
        setEstadoConfirmacion((s) => ({ ...s, abierto: false }));
      },
      autoCierreMs: opciones.autoCierreMs || null,
    });
  };

  const cerrarConfirmacion = () => {
    setEstadoConfirmacion((s) => ({ ...s, abierto: false }));
  };

  const mostrarNotificacion = (aviso) => {
    const id = aviso.id || Date.now().toString();
    const n = {
      id,
      tipo: aviso.tipo || 'info',
      titulo: aviso.titulo || '',
      mensaje: aviso.mensaje || '',
      autoCierreMs: aviso.autoCierreMs ?? (aviso.tipo === 'error' ? 5000 : aviso.tipo === 'warning' ? 4000 : 3000),
    };
    setNotificaciones((prev) => [...prev, n]);
    return id;
  };

  const cerrarNotificacion = (id) => {
    setNotificaciones((prev) => prev.filter((n) => n.id !== id));
  };

  const valor = useMemo(
    () => ({ abrirConfirmacion, cerrarConfirmacion, mostrarNotificacion, cerrarNotificacion }),
    []
  );

  return (
    <ContextoUI.Provider value={valor}>
      {children}
      <Modal
        abierto={estadoConfirmacion.abierto}
        titulo={estadoConfirmacion.titulo}
        mensaje={estadoConfirmacion.mensaje}
        severidad={estadoConfirmacion.severidad}
        alConfirmar={estadoConfirmacion.alConfirmar}
        alCancelar={estadoConfirmacion.alCancelar}
        etiquetaConfirmar={estadoConfirmacion.etiquetaConfirmar}
        etiquetaCancelar={estadoConfirmacion.etiquetaCancelar}
        autoCierreMs={estadoConfirmacion.autoCierreMs}
      />
      <div className="mc-aviso-contenedor" aria-live="polite">
        {notificaciones.map((n) => (
          <Notificacion
            key={n.id}
            tipo={n.tipo}
            titulo={n.titulo}
            mensaje={n.mensaje}
            autoCierreMs={n.autoCierreMs}
            alCerrar={() => cerrarNotificacion(n.id)}
          />
        ))}
      </div>
    </ContextoUI.Provider>
  );
};

export const usarUI = () => useContext(ContextoUI);
