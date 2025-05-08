import React, { useState, useEffect } from 'react';
import {
  obtenerCategorias,
  obtenerTiendasPorVendedor,
  crearTienda,
  actualizarTienda,
  eliminarTienda
} from '../../services/data';
import './VendedorPagesCss/VendedorTiendas.css';

export default function VendedorTiendas() {
  // ID del vendedor obtenido desde localStorage
  const vendedorId = localStorage.getItem("idVendedor") || '';

  // Estados principales para la lógica de la vista
  const [tiendas, setTiendas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [tiendaActual, setTiendaActual] = useState({
    nombreNegocio: '',
    horario: '',
    fotoFachadaUrl: '',
    idCategoria: '',
    eslogan: '',
    numeroContacto: '',
    cuentaEnvio: false,
    facebookUrl: '',
    paginaWebUrl: '',
    fechaRegistro: new Date().toISOString().split("T")[0],
    idVendedor: vendedorId,
  });
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);

  // Carga inicial de datos: tiendas del vendedor y categorías disponibles
  useEffect(() => {
    if (!vendedorId) {
      setError("No se encontró el vendedor activo.");
      return;
    }

    const fetchDatos = async () => {
      try {
        const [dataTiendas, dataCategorias] = await Promise.all([
          obtenerTiendasPorVendedor(vendedorId),
          obtenerCategorias()
        ]);

        setTiendas(dataTiendas);
        setCategorias(dataCategorias);
      } catch (err) {
        setError('Error al cargar los datos.');
      }
    };

    fetchDatos();
  }, [vendedorId]);

  // Abre el modal para crear una nueva tienda
  const manejarAbrirModalCrear = () => {
    setModoEdicion(false);
    setTiendaActual({
      nombreNegocio: '',
      horario: '',
      fotoFachadaUrl: '',
      idCategoria: '',
      eslogan: '',
      numeroContacto: '',
      cuentaEnvio: false,
      facebookUrl: '',
      paginaWebUrl: '',
      fechaRegistro: new Date().toISOString().split("T")[0],
      idVendedor: vendedorId,
    });
    setShowModal(true);
  };

  // Guarda los cambios de una tienda nueva o editada
  const manejarGuardarCambios = async () => {
    const { nombreNegocio, idCategoria, idVendedor } = tiendaActual;
    if (!nombreNegocio || !idCategoria || !idVendedor) {
      setError('Todos los campos obligatorios deben ser completados.');
      return;
    }

    const tiendaProcesada = {
      ...tiendaActual,
      idCategoria: parseInt(tiendaActual.idCategoria),
      cuentaEnvio: Boolean(tiendaActual.cuentaEnvio),
    };

    try {
      if (modoEdicion) {
        await actualizarTienda(tiendaActual.idTienda, tiendaProcesada);
        setMensaje('Tienda actualizada exitosamente.');
      } else {
        await crearTienda(tiendaProcesada);
        setMensaje('Tienda creada exitosamente.');
      }

      // Recarga la lista de tiendas después de guardar
      const dataTiendas = await obtenerTiendasPorVendedor(vendedorId);
      setTiendas(dataTiendas);
      setShowModal(false);
      setTimeout(() => setMensaje(''), 3000);
    } catch (err) {
      setError('Error al guardar la tienda.');
      setTimeout(() => setError(''), 3000);
    }
  };

  // Elimina una tienda tras confirmación
  const manejarEliminarTienda = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta tienda?')) return;
    try {
      await eliminarTienda(id);
      setTiendas(prev => prev.filter(t => t.idTienda !== id));
      setMensaje('Tienda eliminada.');
      setTimeout(() => setMensaje(''), 3000);
    } catch (err) {
      setError('Error al eliminar la tienda.');
      setTimeout(() => setError(''), 3000);
    }
  };

  // Abre el modal y carga los datos de la tienda seleccionada para edición
  const manejarEditarTienda = (tienda) => {
    setModoEdicion(true);
    setTiendaActual(tienda);
    setShowModal(true);
  };

  return (
    <div className="vendedor-background">
      <div className="vendedor-container">
        <h1>Mis Tiendas</h1>

        {mensaje && <p className="mensaje-exito">{mensaje}</p>}
        {error && <p className="mensaje-error">{error}</p>}

        <button onClick={manejarAbrirModalCrear} className="btn-crear-tienda">
          Crear Tienda
        </button>

        {/* Tabla de tiendas con datos principales */}
        <table className="vendedor-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Horario</th>
              <th>Eslogan</th>
              <th>Teléfono</th>
              <th>Categoría</th>
              <th>Foto</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {tiendas.map((tienda) => (
              <tr key={tienda.idTienda}>
                <td>{tienda.idTienda}</td>
                <td>{tienda.nombreNegocio}</td>
                <td>{tienda.horario}</td>
                <td>{tienda.eslogan}</td>
                <td>{tienda.numeroContacto}</td>
                <td>{categorias.find(c => c.idCategoria === tienda.idCategoria)?.descripcion || 'Sin categoría'}</td>
                <td>
                  {tienda.fotoFachadaUrl && (
                    <img src={tienda.fotoFachadaUrl} alt="Fachada" width={50} />
                  )}
                </td>
                <td>
                  <button onClick={() => manejarEditarTienda(tienda)} className="btn-editar">Editar</button>
                  <button onClick={() => manejarEliminarTienda(tienda.idTienda)} className="btn-eliminar">Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Modal para creación/edición de tienda */}
        {showModal && (
          <div className="modal">
            <div className="modal-content">
              <h2>{modoEdicion ? 'Editar Tienda' : 'Crear Tienda'}</h2>

              {/* Formulario con campos de la tienda */}
              <label>Nombre del Negocio:</label>
              <input type="text" value={tiendaActual.nombreNegocio} onChange={(e) => setTiendaActual({ ...tiendaActual, nombreNegocio: e.target.value })}/>

              <label>Horario:</label>
              <input type="text" value={tiendaActual.horario} onChange={(e) => setTiendaActual({ ...tiendaActual, horario: e.target.value })}/>

              <label>Foto Fachada URL:</label>
              <input type="text" value={tiendaActual.fotoFachadaUrl} onChange={(e) => setTiendaActual({ ...tiendaActual, fotoFachadaUrl: e.target.value })} />

              <label>Categoría:</label>
              <select value={tiendaActual.idCategoria} onChange={(e) => setTiendaActual({ ...tiendaActual, idCategoria: e.target.value })}>
                <option value="">Seleccione una categoría</option>
                {categorias.map((cat) => (
                  <option key={cat.idCategoria} value={cat.idCategoria}>{cat.descripcion}</option>
                ))}
              </select>

              <label>Eslogan:</label>
              <input type="text" value={tiendaActual.eslogan} onChange={(e) => setTiendaActual({ ...tiendaActual, eslogan: e.target.value })} />

              <label>Número de Contacto:</label>
              <input type="text" value={tiendaActual.numeroContacto} onChange={(e) => setTiendaActual({ ...tiendaActual, numeroContacto: e.target.value })}/>

              <label>Facebook URL:</label>
              <input type="text" value={tiendaActual.facebookUrl} onChange={(e) => setTiendaActual({ ...tiendaActual, facebookUrl: e.target.value })}/>

              <label>Página Web URL:</label>
              <input type="text" value={tiendaActual.paginaWebUrl} onChange={(e) => setTiendaActual({ ...tiendaActual, paginaWebUrl: e.target.value })}/>

              <label>Cuenta Envío:</label>
              <input type="checkbox" checked={tiendaActual.cuentaEnvio} onChange={(e) => setTiendaActual({ ...tiendaActual, cuentaEnvio: e.target.checked })}/>

              <label>Fecha de Registro:</label>
              <input type="date" value={tiendaActual.fechaRegistro} onChange={(e) => setTiendaActual({ ...tiendaActual, fechaRegistro: e.target.value })}/>

              <div className="modal-actions">
                <button onClick={manejarGuardarCambios}>
                  {modoEdicion ? 'Guardar Cambios' : 'Crear Tienda'}
                </button>
                <button onClick={() => setShowModal(false)}>Cancelar</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}