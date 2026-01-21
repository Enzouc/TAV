import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { crearUsuario, autenticarUsuario } from '../utils/usuario';
import { guardarUsuarioActual } from '../utils/almacenamiento';
import { usarUI } from '../components/ContextoUI';

const VistaRegistro = () => {
    const navegar = useNavigate();
    const { mostrarNotificacion } = usarUI();
    const [datosFormulario, setDatosFormulario] = useState({
        nombre: '',
        email: '',
        telefono: '',
        contrasena: '',
        confirmarContrasena: '',
        calle: '',
        numero: '',
        region: 'Biobío',
        comuna: ''
    });
    const [error, setError] = useState('');

    const manejarCambio = (e) => {
        setDatosFormulario({
            ...datosFormulario,
            [e.target.id]: e.target.value
        });
    };

    const manejarEnvio = (e) => {
        e.preventDefault();
        setError('');

        if (datosFormulario.contrasena !== datosFormulario.confirmarContrasena) {
            setError('Las contraseñas no coinciden');
            return;
        }

        try {
            // Crear usuario
            const direccion = {
                calle: datosFormulario.calle,
                numero: datosFormulario.numero,
                region: datosFormulario.region,
                comuna: datosFormulario.comuna
            };

            crearUsuario(
                null, 
                datosFormulario.nombre, 
                datosFormulario.email, 
                datosFormulario.contrasena, 
                'usuario', 
                'activo', 
                datosFormulario.telefono, 
                direccion
            );

            // Auto iniciar sesión
            const usuario = autenticarUsuario(datosFormulario.email, datosFormulario.contrasena);
            guardarUsuarioActual(usuario);

            mostrarNotificacion({ tipo: 'info', titulo: 'Registro exitoso', mensaje: '¡Cuenta creada con éxito!' });
            navegar('/');
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="estructura">
            <main>
                <div className="container py-5">
                    <div className="row justify-content-center">
                        <div className="col-lg-8">
                            <div className="card shadow-sm border-0 p-4">
                                <h2 className="mb-4 text-center">Crear Cuenta</h2>
                                
                                <form onSubmit={manejarEnvio}>
                                    <div className="row g-3">
                                        <div className="col-12">
                                            <label className="form-label">Nombre Completo</label>
                                            <input type="text" className="form-control" id="nombre" value={datosFormulario.nombre} onChange={manejarCambio} placeholder="Juan Pérez" required minLength="3" />
                                        </div>

                                        <div className="col-md-6">
                                            <label className="form-label">Correo Electrónico</label>
                                            <input type="email" className="form-control" id="email" value={datosFormulario.email} onChange={manejarCambio} placeholder="juan@ejemplo.com" required />
                                        </div>

                                        <div className="col-md-6">
                                            <label className="form-label">Teléfono</label>
                                            <input type="tel" className="form-control" id="telefono" value={datosFormulario.telefono} onChange={manejarCambio} placeholder="+56 9 1234 5678" required />
                                        </div>

                                        <div className="col-md-6">
                                            <label className="form-label">Contraseña</label>
                                            <input type="password" className="form-control" id="contrasena" value={datosFormulario.contrasena} onChange={manejarCambio} required minLength="4" />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Confirmar Contraseña</label>
                                            <input type="password" className="form-control" id="confirmarContrasena" value={datosFormulario.confirmarContrasena} onChange={manejarCambio} required minLength="4" />
                                        </div>

                                        <div className="col-12">
                                            <h5 className="mt-3">Dirección</h5>
                                        </div>

                                        <div className="col-md-8">
                                            <label className="form-label">Calle</label>
                                            <input type="text" className="form-control" id="calle" value={datosFormulario.calle} onChange={manejarCambio} required />
                                        </div>
                                        <div className="col-md-4">
                                            <label className="form-label">Número</label>
                                            <input type="text" className="form-control" id="numero" value={datosFormulario.numero} onChange={manejarCambio} required />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Región</label>
                                            <select className="form-select" id="region" value={datosFormulario.region} onChange={manejarCambio}>
                                                <option value="Biobío">Biobío</option>
                                            </select>
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Comuna</label>
                                            <select className="form-select" id="comuna" value={datosFormulario.comuna} onChange={manejarCambio} required>
                                                <option value="">Seleccionar...</option>
                                                <option value="Concepción">Concepción</option>
                                                <option value="Hualpén">Hualpén</option>
                                                <option value="Talcahuano">Talcahuano</option>
                                                <option value="San Pedro">San Pedro</option>
                                                <option value="Chiguayante">Chiguayante</option>
                                            </select>
                                        </div>

                                        {error && <div className="col-12 text-danger">{error}</div>}

                                        <div className="col-12 mt-4">
                                            <button type="submit" className="btn btn-primary w-100 py-2">Registrarse</button>
                                        </div>
                                <div className="col-12 mt-2">
                                    <Link to="/" className="btn btn-outline-primary w-100 py-2">Volver al inicio</Link>
                                </div>
                                        <div className="col-12 text-center">
                                            <p className="mb-0">¿Ya tienes cuenta? <Link to="/iniciar-sesion">Inicia sesión aquí</Link></p>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default VistaRegistro;
