// Importaciones de React y hooks
import React, { useState, useEffect } from 'react';

// Importación de funciones de servicios para manejar productos, tiendas y categorías
import { obtenerProductosPorVendedor, crearProductos, actualizarProductos, eliminarProductos } from '../../services/data';
import { obtenerCategorias, obtenerTiendasPorVendedor } from '../../services/data';

// Estilos del componente
import './VendedorPagesCss/VendedorTiendas.css';

// Componente principal
export default function VendedorProductos() {
  // Estados para productos, tiendas y categorías
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [tiendas, setTiendas] = useState([]);

  // Estado del producto en edición o creación
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
    idVendedor: localStorage.getItem("idVendedor") || '',
  });

  // Estados para mensajes y control de UI
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false); // true si se está editando, false si se está creando

  // Cargar datos al iniciar el componente
  useEffect(() => {
    const fetchDatos = async () => {
      try {
        const vendedorId = localStorage.getItem("idVendedor");

        // Carga las tiendas del vendedor
        const dataTiendas = await obtenerTiendasPorVendedor(vendedorId);
        
        // Carga las categorías disponibles
        const dataCategorias = await obtenerCategorias();

        // Carga los productos registrados por el vendedor
        const dataProductos = await obtenerProductosPorVendedor(vendedorId);

        // Actualiza los estados
        setTiendas(dataTiendas);
        setCategorias(dataCategorias);
        setProductos(dataProductos);
      } catch (err) {
        console.error("Error al cargar tiendas/categorías:", err);
      }
    };

    fetchDatos();
  }, []);

  // Abre el modal para crear un nuevo producto
  const manejarAbrirModalCrear = () => {
    setModoEdicion(false);
    setProductoActual({
      idProducto: '',
      nombre: '',
      descripcion: '',
      idTienda: tiendas.length > 0 ? tiendas[0].idTienda : '',
      idCategoria: '',
      precio: '',
      stock: '',
      sku: '',
      rutaImagen: '',
      activo: true,
      idVendedor: localStorage.getItem("idVendedor"),
    });
    setShowModal(true);
  };

  // Abre el modal para editar un producto existente
  const manejarEditarProducto = (producto) => {
    setModoEdicion(true);
    setProductoActual(producto);
    setShowModal(true);
  };

  // Guarda los cambios del producto (crear o actualizar)
  const manejarGuardarCambios = async () => {
    // Validación básica
    if (!productoActual.nombre || !productoActual.idTienda || !productoActual.precio) {
      setError('Todos los campos son obligatorios.');
      return;
    }

    // Preparar datos antes de enviar al servidor
    const productoProcesado = {
      ...productoActual,
      idTienda: parseInt(productoActual.idTienda),
      idCategoria: parseInt(productoActual.idCategoria),
      precio: parseFloat(productoActual.precio),
      stock: parseInt(productoActual.stock),
      sku: productoActual.sku.trim() !== '' ? productoActual.sku : `SKU-${Date.now()}`, // SKU generado automáticamente si está vacío
      rutaImagen: productoActual.rutaImagen.trim() !== '' ? productoActual.rutaImagen : 'https://nomamesjajasalu2', // Imagen por defecto (esto podrías mejorarlo luego)
      activo: Boolean(productoActual.activo),
    };

    try {
      if (modoEdicion) {
        await actualizarProductos(productoActual.idProducto, productoProcesado);
        setMensaje('Producto actualizado exitosamente.');
      } else {
        await crearProductos(productoProcesado);
        setMensaje('Producto creado exitosamente.');
      }

      // Refrescar lista de productos
      const vendedorId = localStorage.getItem("idVendedor");
      const dataProductos = await obtenerProductosPorVendedor(vendedorId);
      setProductos(dataProductos);

      // Limpiar y cerrar modal
      setTimeout(() => setMensaje(''), 3000);
      setShowModal(false);
    } catch (err) {
      setError('Error al guardar el producto.');
      setTimeout(() => setError(''), 3000);
    }
  };

  // Eliminar un producto por ID
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

  // Renderizado del componente
  return (
    <div className="vendedor-background">
      <div className="vendedor-container">
        <h1>Mis Productos</h1>
        {mensaje && <p className="mensaje-exito">{mensaje}</p>}
        {error && <p className="mensaje-error">{error}</p>}

        <button onClick={manejarAbrirModalCrear} className="btn-crear">
          Crear Producto
        </button>

        <table className="vendedor-table">
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
                <td>${producto.precio.toFixed(2)}</td>
                <td>{producto.stock}</td>
                <td>{producto.idTienda}</td>
                <td>{producto.idCategoria}</td>
                <td>{producto.activo ? 'Sí' : 'No'}</td>
                <td>
                  <button onClick={() => manejarEditarProducto(producto)} className="btn-editar">Editar</button>
                  <button onClick={() => manejarEliminarProducto(producto.idProducto)} className="btn-eliminar">Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Modal de creación/edición de producto */}
        {showModal && (
          <div className="modal">
            <div className="modal-content">
              <h2>{modoEdicion ? 'Editar Producto' : 'Crear Producto'}</h2>

              <label>Nombre:</label>
              <input type="text" value={productoActual.nombre || ''} onChange={(e) => setProductoActual({...productoActual, nombre: e.target.value})} />

              <label>Descripción:</label>
              <input type="text" value={productoActual.descripcion || ''} onChange={(e) => setProductoActual({...productoActual, descripcion: e.target.value})} />

              <label>SKU:</label>
              <input type="text" value={productoActual.sku || ''} onChange={(e) => setProductoActual({...productoActual, sku: e.target.value})} />

              <label>URL Imagen:</label>
              <input type="text" value={productoActual.rutaImagen || ''} onChange={(e) => setProductoActual({...productoActual, rutaImagen: e.target.value})} />

              <label>Precio:</label>
              <input type="number" step="0.01" value={productoActual.precio || ''} onChange={(e) => setProductoActual({...productoActual, precio: e.target.value})} />

              <label>Stock:</label>
              <input type="number" value={productoActual.stock || ''} onChange={(e) => setProductoActual({...productoActual, stock: e.target.value})} />

              <label>Tienda:</label>
              <select value={productoActual.idTienda} onChange={(e) => setProductoActual({...productoActual, idTienda: e.target.value})}>
                <option value="">Seleccione una tienda</option>
                {tiendas.map((tienda) => (
                  <option key={tienda.idTienda} value={tienda.idTienda}>{tienda.nombreNegocio}</option>
                ))}
              </select>

              <label>Categoría:</label>
              <select value={productoActual.idCategoria} onChange={(e) => setProductoActual({...productoActual, idCategoria: e.target.value})}>
                <option value="">Seleccione una categoría</option>
                {categorias.map((categoria) => (
                  <option key={categoria.idCategoria} value={categoria.idCategoria}>{categoria.descripcion}</option>
                ))}
              </select>

              <label>Activo:</label>
              <input type="checkbox" checked={productoActual.activo} onChange={(e) => setProductoActual({...productoActual, activo: e.target.checked})} />

              <div className="modal-actions">
                <button onClick={manejarGuardarCambios}>
                  {modoEdicion ? 'Guardar Cambios' : 'Crear Producto'}
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