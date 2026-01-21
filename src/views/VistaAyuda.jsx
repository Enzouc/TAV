import React from 'react';
import { Link } from 'react-router-dom';

const VistaAyuda = () => {
    return (
        <main>
            <div className="card">
                <h2>Ayuda</h2>
                <p>¿Tienes alguna duda o problema? Escríbenos.</p>
                <div className="support-textarea-container">
                    <textarea
                        className="support-textarea"
                        placeholder="Describe tu problema..."
                    />
                </div>
                <div className="form-actions">
                    <button className="btn-danger">
                        Enviar mensaje
                    </button>
                </div>
            </div>

            <div className="card">
                <h2>Preguntas Frecuentes</h2>
                <details className="faq-item">
                    <summary className="faq-summary">¿Cuánto tarda el despacho?</summary>
                    <p className="faq-answer">
                        El tiempo estimado de entrega es de 60 a 120 minutos dependiendo de la demanda.
                    </p>
                </details>
                <details className="faq-item">
                    <summary className="faq-summary">¿Qué medios de pago aceptan?</summary>
                    <p className="faq-answer">
                        Aceptamos efectivo, tarjetas de débito/crédito y transferencias bancarias.
                    </p>
                </details>
                <details className="faq-item">
                    <summary className="faq-summary">¿Cuáles son las zonas de entrega?</summary>
                    <p className="faq-answer">
                        Cubrimos principalmente Zona Norte, Centro y Oriente de Santiago. Puedes ver el
                        detalle completo en nuestra sección de{' '}
                        <Link to="/zonas">Zonas de Reparto</Link>.
                    </p>
                </details>
            </div>
        </main>
    );
};

export default VistaAyuda;

