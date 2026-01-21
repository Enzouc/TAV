import React from 'react';
import '../styles/footer.css';

const Footer = () => {
    return (
        <footer>
            <div className="container">
                <div className="footer-section">
                    <h3>GasExpress</h3>
                    <p>Distribuyendo gas de forma segura y confiable en Concepción.</p>
                </div>
                <div className="footer-section">
                    <h3>Servicios</h3>
                    <ul>
                        <li>Venta de cilindros</li>
                        <li>Recambio de gas</li>
                        <li>Despacho a domicilio</li>
                        <li>Ayuda al cliente</li>
                    </ul>
                </div>
                <div className="footer-section">
                    <h3>Contacto</h3>
                    <p>Email: contacto@gasexpress.cl</p>
                    <p>Teléfono: +56 41 2000 1234</p>
                </div>
            </div>
            <div className="copyright">
                <p>&copy; 2026 GasExpress. Todos los derechos reservados.</p>
            </div>
        </footer>
    );
};

export default Footer;
