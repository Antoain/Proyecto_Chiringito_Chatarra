import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { autenticarUsuario } from '../../services/data';
import { Link } from 'react-router-dom';
import './LoginsCss/LoginPage.css';

export function LoginPage() {
    const [correo, setCorreo] = useState('');
    const [clave, setClave] = useState('');
    const [mensaje, setMensaje] = useState('');
    const navigate = useNavigate();

    const manejarSubmit = async (e) => {
        e.preventDefault();

        try {
            const respuesta = await autenticarUsuario(correo, clave);

            if (respuesta.usuario && respuesta.usuario.idUsuario) {
                localStorage.setItem("idUsuario", respuesta.usuario.idUsuario);
                localStorage.setItem("rol", respuesta.usuario.rol);
                localStorage.setItem("nombreUsuario", respuesta.usuario.nombre);
                localStorage.setItem("correoUsuario", respuesta.usuario.correo);
                localStorage.setItem("token", respuesta.token);

                if (respuesta.usuario.rol === 'Vendedor') {
                    localStorage.setItem("idVendedor", respuesta.usuario.idUsuario);
                    navigate('/vendedor');
                } else if (respuesta.usuario.rol === 'Cliente') {
                    navigate('/cliente');
                } else if (respuesta.usuario.rol === 'Administrador') {
                    navigate('/admin');
                }
            } else {
                throw new Error(
                    "No se recibió información del usuario correctamente."
                );
            }
        } catch (error) {
            setMensaje(
                'Error en el inicio de sesión. Inténtalo nuevamente.'
            );
            console.error('Error:', error);
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <h1>Iniciar Sesión</h1>

                <form onSubmit={manejarSubmit}>
                    <div className="form-group">
                        <label htmlFor="correo">
                            Correo Electrónico
                        </label>

                        <input
                            type="email"
                            id="correo"
                            value={correo}
                            onChange={(e) => setCorreo(e.target.value)}
                            placeholder="Ingresa tu correo"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="clave">
                            Contraseña
                        </label>

                        <input
                            type="password"
                            id="clave"
                            value={clave}
                            onChange={(e) => setClave(e.target.value)}
                            placeholder="Ingresa tu contraseña"
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn-login"
                    >
                        Entrar
                    </button>
                </form>

                {mensaje && (
                    <p className="message">
                        {mensaje}
                    </p>
                )}

                <p className="register-link">
                    ¿No tienes una cuenta?{' '}
                    <Link to="/register">
                        Crea una aquí
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default LoginPage;