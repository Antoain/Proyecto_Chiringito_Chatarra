import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { autenticarUsuario } from '../../services/data';
import { Link } from 'react-router-dom';
import './LoginsCss/LoginPage.css'; // Importa los estilos del formulario de login

export function LoginPage() {
    // Estados para almacenar el correo, la contraseña y mensajes de error
    const [correo, setCorreo] = useState('');
    const [clave, setClave] = useState('');
    const [mensaje, setMensaje] = useState('');
    const navigate = useNavigate(); // Hook para redirigir al usuario

    // Maneja el envío del formulario
    const manejarSubmit = async (e) => {
        e.preventDefault(); // Evita que el formulario recargue la página

        try {
            // Llama al servicio de autenticación
            const respuesta = await autenticarUsuario(correo, clave);
            console.log("Respuesta del servidor:", respuesta); // Verifica la respuesta del backend

            // Verifica que la respuesta incluya un usuario con ID
            if (respuesta.usuario && respuesta.usuario.idUsuario) {
                // Guarda los datos clave del usuario en localStorage
                localStorage.setItem("idUsuario", respuesta.usuario.idUsuario);
                localStorage.setItem("rol", respuesta.usuario.rol);
                localStorage.setItem("nombreUsuario", respuesta.usuario.nombre);
                localStorage.setItem("correoUsuario", respuesta.usuario.correo);

                // Redirige según el tipo de usuario
                if (respuesta.usuario.rol === 'Vendedor') {
                    localStorage.setItem("idVendedor", respuesta.usuario.idUsuario);
                    navigate('/vendedor');
                } else if (respuesta.usuario.rol === 'Cliente') {
                    navigate('/cliente');
                } else if (respuesta.usuario.rol === 'Administrador') {
                    navigate('/admin');
                }
            } else {
                throw new Error("No se recibió información del usuario correctamente.");
            }
        } catch (error) {
            // En caso de error, muestra un mensaje amigable
            setMensaje('Error en el inicio de sesión. Inténtalo nuevamente.');
            console.error('Error:', error);
        }
    };

    return (
        <div className="login-container"> {/* Contenedor general del login */}
            <div className="login-box"> {/* Caja del formulario */}
                <h1>Iniciar Sesión</h1>
                <form onSubmit={manejarSubmit}>
                    {/* Campo: Correo electrónico */}
                    <div className="form-group">
                        <label htmlFor="correo">Correo Electrónico</label>
                        <input
                            type="email"
                            id="correo"
                            value={correo}
                            onChange={(e) => setCorreo(e.target.value)}
                            placeholder="Ingresa tu correo"
                        />
                    </div>

                    {/* Campo: Contraseña */}
                    <div className="form-group">
                        <label htmlFor="clave">Contraseña</label>
                        <input
                            type="password"
                            id="clave"
                            value={clave}
                            onChange={(e) => setClave(e.target.value)}
                            placeholder="Ingresa tu contraseña"
                        />
                    </div>

                    {/* Botón para enviar el formulario */}
                    <button type="submit" className="btn-login">
                        Entrar
                    </button>
                </form>

                {/* Muestra mensajes de error si los hay */}
                {mensaje && <p className="message">{mensaje}</p>}

                {/* Enlace para redirigir a la página de registro */}
                <p className="register-link">
                    ¿No tienes una cuenta? <Link to="/register">Crea una aquí</Link>
                </p>
            </div>
        </div>
    );
}

export default LoginPage;
