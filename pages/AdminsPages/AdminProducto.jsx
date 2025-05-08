import React, { useState, useEffect } from 'react';
// Importamos funciones para interactuar con el backend
import {
  obtenerProductos,
  crearProductos,
  actualizarProductos,
  eliminarProductos,
  obtenerCategorias,
  obtenerTiendas,
} from '../../services/data';
import './AdminPagesCss/AdministrarUsuarios.css';

export default function AdministrarProductos() {
  // Estados para gestionar productos, categorías y tiendas
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [tiendas, setTiendas] = useState([]);

  // Estado para el producto que se está creando o editando
  const [productoActual, setProductoActual] = useState({
    idProducto: '',
    nombre: '',
    descripcion: '',
    idTienda: '',
    idCategoria: '',
    precio: '',
    stock: '',
    sku: '',
    rutaImagen: '',
    activo: true,
  });

  // Estados para mensajes de éxito o error
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  // Estados para mostrar el modal y manejar si estamos en modo edición
  const [showModal, setShowModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);

  // Cargar los datos al montar el componente
  useEffect(() => {
    const fetchDatos = async () => {
      try {
        const dataProductos = await obtenerProductos();
        setProductos(dataProductos);
        const dataCategorias = await obtenerCategorias();
        setCategorias(dataCategorias);
        const dataTiendas = await obtenerTiendas();
        setTiendas(dataTiendas);
      } catch (err) {
        setError('Error al cargar los datos.');
      }
    };
    fetchDatos();
  }, []);

  // Limpia el formulario del producto actual
  const limpiarFormulario = () => {
    setProductoActual({
      idProducto: '',
      nombre: '',
      descripcion: '',
      idTienda: '',
      idCategoria: '',
      precio: '',
      stock: '',
      sku: '',
      rutaImagen: '',
      activo: true,
    });
  };

  // Abre el modal para crear un nuevo producto
  const manejarAbrirModalCrear = () => {
    setModoEdicion(false);
    limpiarFormulario();
    setShowModal(true);
  };

  // Abre el modal con los datos del producto a editar
  const manejarEditarProducto = (producto) => {
    setModoEdicion(true);
    setProductoActual(producto);
    setShowModal(true);
  };

  // Guarda un nuevo producto o actualiza uno existente
  const manejarGuardarCambios = async () => {
    const { nombre, precio, stock, idTienda, idCategoria } = productoActual;

    // Validaciones básicas
    if (!nombre || precio === '' || stock === '' || !idTienda || !idCategoria) {
      setError('Por favor complete todos los campos requeridos.');
      setTimeout(() => setError(''), 3000);
      return;
    }

    if (precio < 0 || stock < 0) {
      setError('Precio y stock no pueden ser negativos.');
      setTimeout(() => setError(''), 3000);
      return;
    }

    const productoParaEnviar = { ...productoActual };
    if (!modoEdicion) {
      delete productoParaEnviar.idProducto; // ID no se envía al crear
    }

    try {
      if (modoEdicion) {
        await actualizarProductos(productoActual.idProducto, productoParaEnviar);
      } else {
        await crearProductos(productoParaEnviar);
      }

      // Recargamos los productos desde la base de datos
      const data = await obtenerProductos();
      setProductos(data);

      // Mostramos mensaje de éxito
      setMensaje(modoEdicion ? 'Producto actualizado' : 'Producto creado');
      setTimeout(() => setMensaje(''), 3000);

      // Cerramos el modal y limpiamos el formulario
      setShowModal(false);
      limpiarFormulario();
    } catch (err) {
      console.error("Error al guardar el producto:", err);
      setError('Error al guardar el producto.');
      setTimeout(() => setError(''), 3000);
    }
  };

  // Elimina un producto con confirmación
  const manejarEliminarProducto = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este producto?')) return;
    try {
      await eliminarProductos(id);
      setProductos(productos.filter(p => p.idProducto !== id));
      setMensaje('Producto eliminado.');
      setTimeout(() => setMensaje(''), 3000);
    } catch (err) {
      setError('Error al eliminar el producto.');
      setTimeout(() => setError(''), 3000);
    }
  };

  return (
    <div className="administrar-background">
      <div className="administrar-container">
        <h1>Administración de Productos</h1>

        {/* Mensajes de éxito o error */}
        {mensaje && <p className="mensaje-exito">{mensaje}</p>}
        {error && <p className="mensaje-error">{error}</p>}

        {/* Botón para abrir el modal de creación */}
        <button onClick={manejarAbrirModalCrear} className="btn-crear">
          Crear Producto
        </button>

        {/* Tabla de productos */}
        <table className="administrar-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>Tienda</th>
              <th>Categoría</th>
              <th>Activo</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productos.map((producto) => (
              <tr key={producto.idProducto}>
                <td>{producto.idProducto}</td>
                <td>{producto.nombre}</td>
                <td>{producto.descripcion}</td>
                <td>${Number(producto.precio).toFixed(2)}</td>
                <td>{producto.stock}</td>
                {/* Mostramos el nombre de tienda y categoría en lugar del ID */}
                <td>{tiendas.find(t => t.idTienda === producto.idTienda)?.nombreNegocio || producto.idTienda}</td>
                <td>{categorias.find(c => c.idCategoria === producto.idCategoria)?.descripcion || producto.idCategoria}</td>
                <td>{producto.activo ? 'Sí' : 'No'}</td>
                <td>
                  <button onClick={() => manejarEditarProducto(producto)} className="btn-editar">Editar</button>
                  <button onClick={() => manejarEliminarProducto(producto.idProducto)} className="btn-eliminar">Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Modal para crear o editar productos */}
        {showModal && (
          <div className="modal">
            <div className="modal-content">
              <h2>{modoEdicion ? 'Editar Producto' : 'Crear Producto'}</h2>

              {/* Formulario de producto */}
              <label>Nombre:</label>
              <input type="text" value={productoActual.nombre || ''} onChange={(e) => setProductoActual({ ...productoActual, nombre: e.target.value })} />

              <label>Descripción:</label>
              <input type="text" value={productoActual.descripcion || ''} onChange={(e) => setProductoActual({ ...productoActual, descripcion: e.target.value })} />

              <label>SKU:</label>
              <input type="text" value={productoActual.sku || ''} onChange={(e) => setProductoActual({ ...productoActual, sku: e.target.value })} />

              <label>URL Imagen:</label>
              <input type="text" value={productoActual.rutaImagen || ''} onChange={(e) => setProductoActual({ ...productoActual, rutaImagen: e.target.value })} />

              <label>Precio:</label>
              <input type="number" step="0.01" value={productoActual.precio} onChange={(e) => setProductoActual({ ...productoActual, precio: parseFloat(e.target.value) || 0 })} />

              <label>Stock:</label>
              <input type="number" value={productoActual.stock} onChange={(e) => setProductoActual({ ...productoActual, stock: parseInt(e.target.value) || 0 })} />

              <label>Tienda:</label>
              <select value={productoActual.idTienda} onChange={(e) => setProductoActual({ ...productoActual, idTienda: parseInt(e.target.value) })}>
                <option value="">Seleccione una tienda</option>
                {tiendas.map(tienda => (
                  <option key={tienda.idTienda} value={tienda.idTienda}>{tienda.nombreNegocio}</option>
                ))}
              </select>

              <label>Categoría:</label>
              <select value={productoActual.idCategoria} onChange={(e) => setProductoActual({ ...productoActual, idCategoria: parseInt(e.target.value) })}>
                <option value="">Seleccione una categoría</option>
                {categorias.map(categoria => (
                  <option key={categoria.idCategoria} value={categoria.idCategoria}>{categoria.descripcion}</option>
                ))}
              </select>

              <label>Activo:</label>
              <input type="checkbox" checked={productoActual.activo} onChange={(e) => setProductoActual({ ...productoActual, activo: e.target.checked })} />

              {/* Botones de acción del modal */}
              <div className="modal-actions">
                <button onClick={manejarGuardarCambios}>
                  {modoEdicion ? 'Guardar Cambios' : 'Crear Producto'}
                </button>
                <button onClick={() => { setShowModal(false); limpiarFormulario(); }}>
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
