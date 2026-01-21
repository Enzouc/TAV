import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { iniciarSesion } from '../utils/autenticacion';

const VistaInicioSesion = () => {
    const navegar = useNavigate();
    const [email, setEmail] = useState('');
    const [contrasena, setContrasena] = useState('');
    const [error, setError] = useState('');
    const [cargando, setCargando] = useState(false);

    const manejarEnvio = (e) => {
        e.preventDefault();
        setError('');
        setCargando(true);
        const resultado = iniciarSesion(email, contrasena);
        if (resultado.exito) {
            setTimeout(() => {
                if (resultado.usuario.rol === 'repartidor') {
                    navegar('/repartidor');
                } else if (resultado.usuario.rol === 'admin') {
                    navegar('/admin');
                } else {
                    navegar('/');
                }
            }, 300);
        } else {
            setError(resultado.mensaje);
            setCargando(false);
        }
    };

    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-md-5">
                    <div className="card shadow-sm border-0">
                        <div className="card-body p-4">
                            <h2 className="text-center mb-4">Iniciar Sesión</h2>
                            {error && <div className="alert alert-danger">{error}</div>}
                            {cargando && <div className="alert alert-info">Validando credenciales...</div>}
                            <form onSubmit={manejarEnvio}>
                                <div className="mb-3">
                                    <label className="form-label">Correo Electrónico</label>
                                    <input 
                                        type="email" 
                                        className="form-control" 
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required 
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="form-label">Contraseña</label>
                                    <input 
                                        type="password" 
                                        className="form-control" 
                                        value={contrasena}
                                        onChange={(e) => setContrasena(e.target.value)}
                                        required 
                                    />
                                </div>
                                <button type="submit" className="btn btn-primary w-100 py-2" disabled={cargando}>
                                    {cargando ? 'Ingresando...' : 'Ingresar'}
                                </button>
                            </form>
                            <div className="text-center mt-3">
                                <p className="text-muted">¿No tienes cuenta? <Link to="/registro" className="text-primary">Regístrate aquí</Link></p>
                                <div className="mt-2">
                                    <Link to="/" className="btn btn-outline-secondary btn-sm">Volver al inicio</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VistaInicioSesion;
