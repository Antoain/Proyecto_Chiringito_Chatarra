import React, { useEffect, useState } from 'react';
import { useParams, Link, useOutletContext } from 'react-router-dom'; 
import {
  obtenerProductosPorCategoria,
  obtenerCategoriaPorId,
  obtenerFavoritosPorCliente,
  agregarFavorito,
  eliminarFavorito,
  agregarCarrito
} from '../../services/data';

export function ProductosPorCategoria() {
  const { idCategoria } = useParams();
  const { busqueda } = useOutletContext(); 

  const [productos, setProductos] = useState([]);
  const [favoritos, setFavoritos] = useState([]);
  const [productosFiltrados, setProductosFiltrados] = useState([]); 
  const [categoriaNombre, setCategoriaNombre] = useState("");

  const idUsuario = localStorage.getItem("idUsuario");

  // Cargar categoría y productos al montar o cuando cambia la categoría
  useEffect(() => {
    const fetchDatos = async () => {
      try {
        // Obtener nombre de categoría
        const categoria = await obtenerCategoriaPorId(idCategoria);
        if (categoria) setCategoriaNombre(categoria.descripcion);

        // Obtener productos de la categoría
        const productosData = await obtenerProductosPorCategoria(idCategoria);
        setProductos(productosData);
        setProductosFiltrados(productosData); // Inicialmente no hay filtro
      } catch (error) {
        console.error("Error al obtener datos:", error);
      }
    };
    fetchDatos();
  }, [idCategoria]);

  // Cargar favoritos del usuario
  useEffect(() => {
    const fetchFavoritos = async () => {
      try {
        const data = await obtenerFavoritosPorCliente(idUsuario);
        // Normalizar estructura de datos
        setFavoritos(data.map(fav => ({
          idProducto: fav.IdProducto || fav.idProducto,
          idFavorito: fav.IdFavorito || fav.idFavorito
        })));
      } catch (error) {
        console.error("Error al obtener favoritos:", error);
      }
    };  

    if (idUsuario) fetchFavoritos();
  }, [idUsuario]);

  // Filtrar productos por término de búsqueda
  useEffect(() => {
    if (!busqueda) {
      setProductosFiltrados(productos);
    } else {
      const filtrados = productos.filter(producto =>
        producto.nombre.toLowerCase().includes(busqueda.toLowerCase())
      );
      setProductosFiltrados(filtrados);
    }
  }, [busqueda, productos]);
  
  // Verifica si un producto está en la lista de favoritos
  const isFavorito = (producto) =>
    favoritos.some(fav => Number(fav.idProducto) === Number(producto.idProducto));
  
  // Agrega o elimina un producto de favoritos
  const toggleFavorito = async (producto) => {
    const productoId = Number(producto.idProducto);
    const favoritoEncontrado = favoritos.find(fav => Number(fav.idProducto) === productoId);

    try {
      if (favoritoEncontrado && favoritoEncontrado.idFavorito) {
        await eliminarFavorito(favoritoEncontrado.idFavorito);
      } else {
        await agregarFavorito(idUsuario, productoId);
      }

       // Actualizar lista de favoritos
      const data = await obtenerFavoritosPorCliente(idUsuario);
      setFavoritos(data.map(fav => ({
        idProducto: fav.IdProducto || fav.idProducto,
        idFavorito: fav.IdFavorito || fav.idFavorito
      })));
    } catch (error) {
      console.error("Error en toggleFavorito:", error);
    }
  };

  return (
    <div className="container mt-4">
      <h2>Productos de la categoría: {categoriaNombre || "Desconocida"}</h2>

      <div className="row">
        {productosFiltrados.length === 0 ? (
          <p className="text-center text-danger">No se encontraron productos.</p>
        ) : (
          productosFiltrados.map(producto => (
            <div className="col-md-3" key={producto.idProducto}>
              <div className="card h-100">
                <div className="position-relative">
                  <img src={producto.rutaImagen || '/imagenes/default-producto.png'} className="card-img-top" alt={producto.nombre}/>

                  {/* Agregar en un futuro!!!!!!*/}
                  {producto.descuento && (
                    <span className="badge bg-danger discount-badge">
                      -{producto.descuento}%
                    </span>
                  )}
                </div>
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">{producto.nombre}</h5>
                  <p className="card-text small text-truncate">{producto.descripcion}</p>
                  <p className="h6 text-success">${producto.precio.toFixed(2)}</p>

                  <div className="button-group mt-auto d-flex justify-content-around">
                    <button className="btn btn-outline-danger btn-sm" title={isFavorito(producto) ? "Eliminar de favoritos" : "Agregar a favoritos"}
                      onClick={() => toggleFavorito(producto)}>

                      <i className={isFavorito(producto) ? "bi bi-heart-fill text-danger" : "bi bi-heart"}></i>
                    </button>
                    
                    <Link to={`/cliente/detalles/${producto.idProducto}`} className="btn btn-secondary btn-sm" title="Ver detalles" >
                      Detalles
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// Exportar el componente para usarlo en otras partes de la app
export default ProductosPorCategoria;
