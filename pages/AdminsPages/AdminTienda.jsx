import React, { useState, useEffect } from 'react';
import { obtenerCategorias } from '../../services/data'; 
import { obtenerTiendas, crearTienda, actualizarTienda, eliminarTienda } from '../../services/data';
import { obtenerVendedores } from '../../services/data'; 
import './AdminPagesCss/AdministrarUsuarios.css';

export default function AdministrarTiendas() {
  // Estado para las tiendas y el formulario modal
  const [tiendas, setTiendas] = useState([]);

  // Objeto "tiendaActual" con todos los campos definidos en el modelo
  const [tiendaActual, setTiendaActual] = useState({ 
    idTienda: '', 
    IdVendedor: '', 
    NombreNegocio: '',
    RegistroNegocio: '',
    Horario: '',
    FotoFachadaUrl: '',
    IdCategoria: '', 
    Eslogan: '',
    NumeroContacto: '',
    FacebookUrl: '',
    PaginaWebUrl: '',
    CuentaEnvio: false,
    FechaRegistro: '' 
  });
  const [vendedores, setVendedores] = useState([]); // Estado para la lista de vendedores
  const [categorias, setCategorias] = useState([]); // Lista de categorías
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);

  // Cargar tiendas y vendedores al montar el componente
  useEffect(() => {
    const fetchDatos = async () => {
      try {
        const dataTiendas = await obtenerTiendas();
        setTiendas(dataTiendas);
      } catch (err) {
        setError('Error al cargar las tiendas.');
      }
      try {
        const dataVendedores = await obtenerVendedores();
        setVendedores(dataVendedores);
      } catch (err) {
        setError('Error al cargar los vendedores.');
      }
      try {
        const dataCategorias = await obtenerCategorias();
        setCategorias(dataCategorias);
        console.log('Categorías cargadas:', dataCategorias); // Log para verificar el contenido
      } catch (err) {
        setError('Error al cargar las categorías.');
      }
    };
    fetchDatos();
  }, []);
  

  // Abre el modal para crear una nueva tienda (resetea el formulario)
  const manejarAbrirModalCrear = () => {
    
    setTiendaActual({  
      IdVendedor: '', 
      NombreNegocio: '',
      Horario: '',
      FotoFachadaUrl: '',
      IdCategoria: '',
      Eslogan: '',
      NumeroContacto: '',
      FacebookUrl: '',
      PaginaWebUrl: '',
      CuentaEnvio: '',
      FechaRegistro: ''
    });
    

    setShowModal(true);
    console.log("Estado de tiendaActual al abrir el modal:", tiendaActual);

  };

  // Función para crear una nueva tienda el cual se invoca desde el modal en modo creación
  const manejarCrearNuevaTienda = async () => {
    // Validación del nombre y el vendedor son obligatorios
    if (!tiendaActual.NombreNegocio || !tiendaActual.IdVendedor) {
      setError('El nombre del negocio y el vendedor son obligatorios.');
      return;
    }
    console.log("Datos enviados a la API:", tiendaActual);


    // Preparamos la información, convirtiendo al vendedor y categoría en números si es necesario
    const nuevaTienda = {
      ...tiendaActual,
      IdVendedor: parseInt(tiendaActual.IdVendedor),
      IdCategoria: tiendaActual.IdCategoria ? parseInt(tiendaActual.IdCategoria) : 0,
      CuentaEnvio: Boolean(tiendaActual.CuentaEnvio)
    };

    try {
      const respuesta = await crearTienda(nuevaTienda);
      setTiendas([...tiendas, respuesta]);
      setMensaje('Tienda creada exitosamente.');
      setTimeout(() => setMensaje(''), 3000);
      manejarCerrarModal();
    } catch (err) {
      setError('Error al crear la tienda.');
      setTimeout(() => setError(''), 3000);
    }
  };

  // Función para actualizar una tienda la cual se invoca desde el modal en modo edición
  const manejarGuardarCambios = async () => {
    if (!tiendaActual.IdTienda || !tiendaActual.NombreNegocio || !tiendaActual.IdVendedor) {
      setError('Todos los campos son obligatorios.');
      return;
    }
  
    const tiendaActualizada = {
      ...tiendaActual,
      IdVendedor: parseInt(tiendaActual.IdVendedor),
      IdCategoria: tiendaActual.IdCategoria ? parseInt(tiendaActual.IdCategoria) : 0,
      CuentaEnvio: Boolean(tiendaActual.CuentaEnvio),
      FechaRegistro: tiendaActual.FechaRegistro
    };
  
    try {
      await actualizarTienda(tiendaActualizada.IdTienda, tiendaActualizada);
  
      // 🔄 Recargar lista de tiendas después de editar
      const tiendasActualizadas = await obtenerTiendas();
      setTiendas(tiendasActualizadas);
  
      setMensaje('Tienda actualizada exitosamente.');
      setTimeout(() => setMensaje(''), 3000);
      manejarCerrarModal();
    } catch (err) {
      setError('Error al actualizar la tienda.');
    }
  };
  
  

  // Al momento de editar se carga la tienda seleccionada en el formulario y se abre el modal
  const manejarEditarTienda = (tienda) => {
    console.log("Editando tienda:", tienda); // comprobar los datos recibidos
  
    setTiendaActual({
      IdTienda: tienda.idTienda, 
      IdVendedor: tienda.idVendedor.toString(), 
      NombreNegocio: tienda.nombreNegocio, 
      Horario: tienda.horario, 
      FotoFachadaUrl: tienda.fotoFachadaUrl, 
      IdCategoria: tienda.idCategoria ? tienda.idCategoria.toString() : '',
      Eslogan: tienda.eslogan, 
      NumeroContacto: tienda.numeroContacto, 
      FacebookUrl: tienda.facebookUrl, 
      PaginaWebUrl: tienda.paginaWebUrl, 
      CuentaEnvio: tienda.cuentaEnvio, 
      FechaRegistro: tienda.fechaRegistro 
    });
  
    setShowModal(true);
  };
  
  const manejarEliminarTienda = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar la tienda?')) return;
    try {
      await eliminarTienda(id); 
      setTiendas(prevTiendas => prevTiendas.filter(t => t.idTienda !== id)); 
      setMensaje('Tienda eliminada.');
      setTimeout(() => setMensaje(''), 3000);
    } catch (err) {
      setError('Error al eliminar la tienda.');
      setTimeout(() => setError(''), 3000);
    }
  };
  // Resetea el formulario y oculta el modal
  const manejarCerrarModal = () => {
    
    setTiendaActual({ 
      idTienda: '', 
      idVendedor: '', 
      nombreNegocio: '',
      horario: '',
      fotoFachadaUrl: '',
      idCategoria: '',
      eslogan: '',
      numeroContacto: '',
      facebookUrl: '',
      paginaWebUrl: '',
      cuentaEnvio: '',
      fechaRegistro: ''
    });
    setShowModal(false);
  };

  return (
    <div className="administrar-background">
      <div className="administrar-container">
        <h1>Administración de Tiendas</h1>
        {mensaje && <p className="mensaje-exito">{mensaje}</p>}
        {error && <p className="mensaje-error">{error}</p>}
        
        {/* Botón para abrir el modal en modo "crear" */}
        <button onClick={manejarAbrirModalCrear} className="btn-crear">
          Crear Tienda
        </button>
        
        <table className="administrar-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre del Negocio</th>
              <th>Vendedor</th>
              <th>Horario</th>
              <th>ID Categoría</th>  
              <th>Eslogan</th>          
              <th>Número de Contacto</th> 
              <th>Cuenta Envío</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {tiendas.map((tienda) => (
              <tr key={tienda.idTienda}>
                <td>{tienda.idTienda}</td>
                <td>{tienda.nombreNegocio}</td>
                <td>{tienda.idVendedor}</td>
                <td>{tienda.horario}</td>
                <td>{tienda.idCategoria}</td> 
                <td>{tienda.eslogan}</td>      
                <td>{tienda.numeroContacto}</td>
                <td>{tienda.cuentaEnvio ? 'Sí' : 'No'}</td>
                <td>
                  <button onClick={() => manejarEditarTienda(tienda)} className="btn-editar">Editar</button>
                  <button onClick={() => manejarEliminarTienda(tienda.idTienda)} className="btn-eliminar">Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {showModal && (
          
          <div className="modal">
            <div className="modal-content">
              <h2>{tiendaActual.idTienda ? 'Editar Tienda' : 'Crear Tienda'}</h2>
              
              <label>Nombre del Negocio:</label>
              <input type="text" value={tiendaActual.NombreNegocio || ''}  onChange={(e) => setTiendaActual({ ...tiendaActual, NombreNegocio: e.target.value })}/>
              
              <label>Vendedor:</label>
              <select value={tiendaActual.IdVendedor} onChange={(e) => setTiendaActual({ ...tiendaActual, IdVendedor: e.target.value })} >

                <option value="">Seleccione un vendedor</option>
                {vendedores.map((vendedor) => (
                  <option key={vendedor.idUsuario} value={vendedor.idUsuario}>
                    {vendedor.IdUsuarioNavigation?.nombre || `ID: ${vendedor.idUsuario}`}
                  </option>
                ))}
              </select>
              
              
              <label>Horario:</label>
              <input type="text" value={tiendaActual.Horario || ''} onChange={(e) => setTiendaActual({ ...tiendaActual, Horario: e.target.value })}/>

              <label>Foto Fachada URL:</label>
              <input type="text" value={tiendaActual.FotoFachadaUrl || ''} onChange={(e) => setTiendaActual({ ...tiendaActual, FotoFachadaUrl: e.target.value })} />

              <label>ID Categoría:</label>
              <select value={tiendaActual.IdCategoria} onChange={(e) => setTiendaActual({ ...tiendaActual, IdCategoria: e.target.value })}>

                <option value="">Seleccione una categoría</option>
                {categorias.map((categoria) => (
                  <option key={categoria.idCategoria} value={categoria.idCategoria}>
                    {categoria.descripcion} 
                  </option>
                ))}
              </select>


              <label>Eslogan:</label>
              <input type="text" value={tiendaActual.Eslogan || ''} onChange={(e) => setTiendaActual({ ...tiendaActual, Eslogan: e.target.value })}/>

              <label>Número de Contacto:</label>
              <input type="text" value={tiendaActual.NumeroContacto || ''} onChange={(e) => setTiendaActual({ ...tiendaActual, NumeroContacto: e.target.value })}/>

              <label>Facebook URL:</label>
              <input type="text" value={tiendaActual.FacebookUrl || ''} onChange={(e) => setTiendaActual({ ...tiendaActual, FacebookUrl: e.target.value })}/>

              <label>Página Web URL:</label>
              <input type="text" value={tiendaActual.PaginaWebUrl || ''} onChange={(e) => setTiendaActual({ ...tiendaActual, PaginaWebUrl: e.target.value })}/>

              <label>Cuenta Envío:</label>
              <input type="checkbox" checked={tiendaActual.CuentaEnvio} onChange={(e) => setTiendaActual({ ...tiendaActual, CuentaEnvio: e.target.checked })} />

              <label>Fecha de Registro:</label>
              <input type="date" value={tiendaActual.FechaRegistro || ''} onChange={(e) => setTiendaActual({ ...tiendaActual, FechaRegistro: e.target.value })} />

              <div className="modal-actions">
                <button onClick={() => tiendaActual.IdTienda ? manejarGuardarCambios() : manejarCrearNuevaTienda()}>
                  {tiendaActual.IdTienda ? 'Guardar Cambios' : 'Crear Tienda'}
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


