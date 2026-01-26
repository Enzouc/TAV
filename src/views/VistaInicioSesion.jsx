import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { iniciarSesion } from '../utils/autenticacion';
import { login } from '../services/usersService';
import { guardarUsuarioActual } from '../utils/almacenamiento';

const VistaInicioSesion = () => {
    const navegar = useNavigate();
    const [email, setEmail] = useState('');
    const [contrasena, setContrasena] = useState('');
    const [error, setError] = useState('');
    const [cargando, setCargando] = useState(false);

    const manejarEnvio = async (e) => {
        e.preventDefault();
        setError('');
        setCargando(true);

        const controller = new AbortController();
        
        try {
            // Intento con servicio API
            const respuesta = await login({ email, contrasena }, controller.signal);
            // La respuesta del backend ya contiene los datos del usuario en la raíz
            const usuario = respuesta;
            
            if (usuario && usuario.token) {
                // Aseguramos que el usuario se guarde correctamente
                guardarUsuarioActual(usuario);
                
                // Pequeño delay para asegurar que el almacenamiento se complete
                setTimeout(() => {
                    if (usuario.rol === 'repartidor') navegar('/delivery/dashboard');
                    else if (usuario.rol === 'admin') navegar('/admin/dashboard');
                    else navegar('/client/dashboard');
                }, 100);
            } else {
                // Si no hay usuario/token en respuesta, algo raro pasó
                setError('Error al recibir datos de sesión');
            }
        } catch (err) {
            // Si es error de red o 404 (API no existe), usamos fallback local
            // Si es 401 (Credenciales), mostramos error
            if (!err.status || err.status === 404 || err.status >= 500) {
                console.warn('API login falló o no disponible, usando local:', err);
                const resultado = iniciarSesion(email, contrasena);
                if (resultado.exito) {
                    setTimeout(() => {
                        if (resultado.usuario.rol === 'repartidor') navegar('/delivery/dashboard');
                        else if (resultado.usuario.rol === 'admin') navegar('/admin/dashboard');
                        else navegar('/client/dashboard');
                    }, 300);
                } else {
                    setError(resultado.mensaje);
                }
            } else {
                // Error de validación o credenciales desde API
                setError(err.message || 'Error al iniciar sesión');
            }
        } finally {
            if (!controller.signal.aborted) setCargando(false);
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
