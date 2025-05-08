// Importaciones necesarias
import React, { useEffect, useState } from 'react';
import {
  obtenerUsuarios,
  eliminarUsuario,
  actualizarUsuario,
  registrarUsuario
} from '../../services/data';

import './AdminPagesCss/AdministrarUsuarios.css'; 

export default function AdministrarUsuarios() {
  // Estado para lista de usuarios
  const [usuarios, setUsuarios] = useState([]);
  // Mensajes de error o éxito
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  // Usuario que se está creando o editando
  const [usuarioActual, setUsuarioActual] = useState({
    idUsuario: '',
    nombres: '',
    apellidos: '',
    correo: '',
    rol: '', 
    clave: "",
  });
  // Mostrar/ocultar modal
  const [showModal, setShowModal] = useState(false); 

  // Cargar usuarios al iniciar el componente
  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const data = await obtenerUsuarios();
        console.log(data); 
        setUsuarios(data);
      } catch (error) {
        setError('Hubo un problema al cargar los usuarios.');
        console.error(error);
      }
    };

    fetchUsuarios();
  }, []);

  // Eliminar un usuario
  const manejarEliminar = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este usuario?')) return;

    try {
      await eliminarUsuario(id);
      setUsuarios((prevUsuarios) =>
        prevUsuarios.filter((usuario) => usuario.idUsuario !== id)
      );
      setMensaje('Usuario eliminado exitosamente.');
      setTimeout(() => setMensaje(''), 3000);
    } catch (error) {
      setError('Hubo un problema al eliminar el usuario.');
      console.error(error);
      setTimeout(() => setError(''), 3000);
    }
  };

  // Preparar la edición de un usuario
  const manejarEditar = (usuario) => {
    console.log('Usuario seleccionado:', usuario);
    setUsuarioActual({
      idUsuario: usuario.idUsuario,
      nombres: usuario.nombres,
      apellidos: usuario.apellidos,
      correo: usuario.correo,
      rol: usuario.rol,
      clave: usuario.clave || '',
    });
    setShowModal(true);
  };

  // Guardar cambios en un usuario ya existente
  const manejarGuardarCambios = async () => {
    if (!usuarioActual.nombres || !usuarioActual.apellidos || !usuarioActual.correo || !usuarioActual.rol || !usuarioActual.clave) {
      setError('Todos los campos son obligatorios.');
      return;
    }

    const datosActualizados = { ...usuarioActual };

    try {
      const respuesta = await actualizarUsuario(datosActualizados);
      console.log('Respuesta del servidor:', respuesta);

      setUsuarios((prevUsuarios) =>
        prevUsuarios.map((u) =>
          u.idUsuario === usuarioActual.idUsuario ? { ...u, ...datosActualizados } : u
        )
      );

      setMensaje('Usuario actualizado exitosamente.');
      setTimeout(() => setMensaje(''), 3000);
      setShowModal(false);
    } catch (error) {
      setError('Hubo un problema al actualizar el usuario.');
      console.error(error);
      setTimeout(() => setError(''), 3000);
    }
  };

  // Preparar el formulario para crear un nuevo usuario
  const manejarCrearUsuario = () => {
    setUsuarioActual({
      idUsuario: '',
      nombres: '',
      apellidos: '',
      correo: '',
      rol: 'Cliente',
      clave: '',
    });
    setShowModal(true);
  };

  // Crear un nuevo usuario desde el modal
  const manejarCrearNuevoUsuario = async () => {
    try {
      const nuevoUsuario = {
        nombre: usuarioActual.nombres,
        apellido: usuarioActual.apellidos,
        correo: usuarioActual.correo,
        clave: usuarioActual.clave,
        rol: usuarioActual.rol,
      };

      const respuesta = await registrarUsuario(nuevoUsuario);

      const usuarioConClave = {
        ...respuesta,
        clave: usuarioActual.clave, // Agrega clave manualmente si backend no la devuelve
      };

      setUsuarios((prevUsuarios) => [...prevUsuarios, usuarioConClave]);
      setMensaje('Usuario creado exitosamente.');
      setTimeout(() => setMensaje(''), 3000);
      manejarCerrarModal();
    } catch (error) {
      setError(error.message || 'Hubo un problema al crear el usuario.');
      console.error('Error al registrar el usuario:', error);
      setTimeout(() => setError(''), 3000);
    }
  };

  // Cerrar modal y resetear el formulario
  const manejarCerrarModal = () => {
    setUsuarioActual({
      idUsuario: '',
      nombres: '',
      apellidos: '',
      correo: '',
      rol: '',
      clave: '',
    });
    setShowModal(false);
  };

  // Renderizado del componente
  return (
    <div className="administrar-background">
      <div className="administrar-container">
        <h1>Administración de Usuarios</h1>

        {mensaje && <p className="mensaje-exito">{mensaje}</p>}
        {error && <p className="mensaje-error">{error}</p>}

        <button onClick={manejarCrearUsuario} className="btn-crear">
          Crear Usuario
        </button>

        {/* Tabla con lista de usuarios */}
        <table className="administrar-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Rol</th>
              <th>Clave</th>
              <th>Fecha de Registro</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((usuario) => (
              <tr key={usuario.idUsuario}>
                <td>{usuario.idUsuario}</td>
                <td>{usuario.nombres} {usuario.apellidos}</td>
                <td>{usuario.correo}</td>
                <td>{usuario.rol}</td>
                <td>{usuario.clave}</td>
                <td>{new Date(usuario.fechaRegistro).toLocaleDateString('es-ES')}</td>
                <td>
                  <button onClick={() => manejarEliminar(usuario.idUsuario)} className="btn-eliminar">Eliminar</button>
                  <button onClick={() => manejarEditar(usuario)} className="btn-editar">Editar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Modal para crear/editar usuario */}
        {showModal && (
          <div className="modal">
            <div className="modal-content">
              <h2>{usuarioActual.idUsuario ? 'Editar Usuario' : 'Crear Usuario'}</h2>

              <label>Nombre:</label>
              <input type="text" value={usuarioActual.nombres || ''} onChange={(e) => setUsuarioActual({ ...usuarioActual, nombres: e.target.value })} />

              <label>Apellido:</label>
              <input type="text" value={usuarioActual.apellidos || ''} onChange={(e) => setUsuarioActual({ ...usuarioActual, apellidos: e.target.value })} />

              <label>Correo:</label>
              <input type="email" value={usuarioActual.correo || ''} onChange={(e) => setUsuarioActual({ ...usuarioActual, correo: e.target.value })} />

              <label>Rol:</label>
              <select value={usuarioActual.rol || ''} onChange={(e) => setUsuarioActual({ ...usuarioActual, rol: e.target.value })}>
                <option value="Cliente">Cliente</option>
                <option value="Vendedor">Vendedor</option>
                <option value="Administrador">Administrador</option>
              </select>

              <label>Clave:</label>
              <input type="text" value={usuarioActual.clave || ''} onChange={(e) => setUsuarioActual({ ...usuarioActual, clave: e.target.value })} />

              <div className="modal-actions">
                <button onClick={() => usuarioActual.idUsuario ? manejarGuardarCambios() : manejarCrearNuevoUsuario()}>
                  {usuarioActual.idUsuario ? 'Guardar Cambios' : 'Crear Usuario'}
                </button>
                <button onClick={manejarCerrarModal}>Cancelar</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
