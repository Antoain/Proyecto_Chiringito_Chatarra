import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registrarUsuario } from '../../services/data';
import './LoginsCss/LoginPage.css'; // Reutiliza el mismo CSS que el login

export default function CrearCuenta() {
    // Estados para los campos del formulario
    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('');
    const [correo, setCorreo] = useState('');
    const [clave, setClave] = useState('');
    const [tipoUsuario, setTipoUsuario] = useState('Cliente'); // Valor por defecto
    const [mensaje, setMensaje] = useState('');
    const navigate = useNavigate(); // Hook para redireccionar

    // Maneja el envío del formulario de registro
    const manejarSubmit = async (e) => {
        e.preventDefault(); // Evita recarga de página

        // Validación básica de campos vacíos
        if (!nombre || !apellido || !correo || !clave) {
            setMensaje('Todos los campos son obligatorios');
            return;
        }

        try {
            // Llama al servicio que registra al usuario
            const respuesta = await registrarUsuario({
                nombre,
                apellido,
                correo,
                clave,
                rol: tipoUsuario
            });

            // Verifica que se haya recibido el ID del usuario
            if (respuesta && respuesta.idUsuario) {
                // ✅ Guardar los datos del usuario en localStorage para usar en otras páginas
                localStorage.setItem("idUsuario", respuesta.idUsuario);
                localStorage.setItem("rol", respuesta.rol);
                localStorage.setItem("nombreUsuario", nombre); // Usa el valor del formulario
                localStorage.setItem("correoUsuario", correo);

                // Redirigir según el tipo de usuario
                if (respuesta.rol === 'Vendedor') {
                    localStorage.setItem("idVendedor", respuesta.idUsuario);
                    navigate('/vendedor');
                } else if (respuesta.rol === 'Cliente') {
                    navigate('/cliente');
                }
            } else {
                throw new Error("No se recibió el ID del usuario correctamente.");
            }
        } catch (error) {
            // Mostrar mensaje de error si algo falla
            setMensaje(error.message || 'Error al registrar');
            console.error('Error:', error);
        }
    };

    return (
        <div className="login-container"> {/* Estilo reutilizado del login */}
            <div className="login-box">
                <h1>Crear nueva cuenta</h1>
                <form onSubmit={manejarSubmit}>
                    {/* Campo: Nombre */}
                    <div className="form-group">
                        <label>Nombre</label>
                        <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej: paquito"/>
                    </div>

                    {/* Campo: Apellido */}
                    <div className="form-group">
                        <label>Apellido</label>
                        <input type="text" value={apellido} onChange={(e) => setApellido(e.target.value)} placeholder="Ej: Rodriguez"/>
                    </div>

                    {/* Campo: Correo */}
                    <div className="form-group">
                        <label>Correo electrónico</label>
                        <input type="email"  value={correo} onChange={(e) => setCorreo(e.target.value)} placeholder="Ej: paco@correo.com"/>
                    </div>

                    {/* Campo: Contraseña */}
                    <div className="form-group">
                        <label>Contraseña</label>
                        <input type="password" value={clave} onChange={(e) => setClave(e.target.value)} placeholder="Mínimo 6 caracteres" />
                    </div>

                    {/* Campo: Tipo de usuario (select) */}
                    <div className="form-group">
                        <label>Tipo de usuario</label>
                        <select value={tipoUsuario} onChange={(e) => setTipoUsuario(e.target.value)} className="form-select" >
                            <option value="Cliente">Cliente</option>
                            <option value="Vendedor">Vendedor</option>
                        </select>
                    </div>

                    {/* Botón de registro */}
                    <button type="submit" className="btn-login">Registrarse</button>
                </form>

                {/* Muestra mensaje de error o advertencia */}
                {mensaje && <p className="message">{mensaje}</p>}

                {/* Enlace para volver al login */}
                <p className="register-link">
                    ¿Ya tienes una cuenta? <a href="/">Inicia sesión</a>
                </p>
            </div>
        </div>
    );
}
