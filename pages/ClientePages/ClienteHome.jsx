import React, { useEffect, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { 
  obtenerProductos, 
  obtenerFavoritosPorCliente, 
  agregarFavorito, 
  eliminarFavorito
} from '../../services/data';
import './ClientePagesCss/ClienteHome.css';

// Normaliza un objeto favorito para usar claves consistentes
const normalizeFavorito = (fav) => ({
  idFavorito: fav.IdFavorito || fav.idFavorito,
  idProducto: fav.IdProducto || fav.idProducto,
});

export function ClienteHome() {
  const { busqueda } = useOutletContext(); // Obtiene el término de búsqueda del layout
  const [productos, setProductos] = useState([]);
  const [favoritos, setFavoritos] = useState([]);
  const [productosFiltrados, setProductosFiltrados] = useState([]);
  const [error, setError] = useState('');

  const idUsuario = localStorage.getItem("idUsuario");

  // Refresca favoritos desde la API
  const refreshFavoritos = async () => {
    try {
      const data = await obtenerFavoritosPorCliente(idUsuario);
      setFavoritos(data.map(normalizeFavorito));
    } catch (err) {
      console.error("Error al refrescar favoritos:", err);
    }
  };

  // Carga los productos y los favoritos al iniciar
  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const data = await obtenerProductos();
        setProductos(data);
        setProductosFiltrados(data);
      } catch (err) {
        setError('Error al cargar productos.');
        console.error(err);
      }
    };

    const fetchFavoritos = async () => {
      if (idUsuario) {
        await refreshFavoritos();
      }
    };

    fetchProductos();
    fetchFavoritos();
  }, [idUsuario]);

  // Aplica filtro de búsqueda
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

  // Verifica si el producto es favorito
  const isFavorito = (producto) => {
    return favoritos.some(fav => Number(fav.idProducto) === Number(producto.idProducto));
  };

  // Maneja la lógica para agregar o eliminar un favorito
  const toggleFavorito = async (producto) => {
    const productoId = Number(producto.idProducto);
    const favoritosPrevios = [...favoritos];
    const favoritoExistente = favoritos.find(fav => Number(fav.idProducto) === productoId);

    if (favoritoExistente) {
      // Eliminación optimista
      setFavoritos(prev => prev.filter(fav => Number(fav.idProducto) !== productoId));
      try {
        await eliminarFavorito(favoritoExistente.idFavorito);
        await refreshFavoritos(); // 🔄 asegura estado real
      } catch (err) {
        console.error("Error al eliminar favorito:", err);
        setFavoritos(favoritosPrevios); // Reversión
      }
    } else {
      // Agregar favorito (optimista)
      const tempFav = { idProducto: productoId, idFavorito: -1 };
      setFavoritos(prev => [...prev, tempFav]);
      try {
        const nuevoFavoritoRaw = await agregarFavorito(idUsuario, productoId);
        const nuevoFavorito = normalizeFavorito(nuevoFavoritoRaw);
        setFavoritos(prev =>
          prev.map(fav => Number(fav.idProducto) === productoId ? nuevoFavorito : fav)
        );
        await refreshFavoritos(); // 🔄 asegura estado real
      } catch (err) {
        console.error("Error al agregar favorito:", err);
        setFavoritos(favoritosPrevios); // Reversión
      }
    }
  };

  return (
    <div className="cliente-home container mt-4">
      <div className="welcome-message text-center mb-4">
        <h1>Bienvenido a Chiringuito Chatarra</h1>
        <p>Explora nuestra selección de productos y encuentra lo que buscas.</p>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row">
        {productosFiltrados.length === 0 ? (
          <p className="text-center text-danger">No se encontraron productos.</p>
        ) : (
          productosFiltrados.map(producto => (
            <div className="col-md-3 col-sm-6 mb-4" key={producto.idProducto}>
              <div className="card h-100">
                <div className="position-relative">
                  <img src={producto.rutaImagen || '/imagenes/jsjssalu2.png'} className="card-img-top" alt={producto.nombre}/>
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
                      onClick={() => toggleFavorito(producto)} >
                      <i className={isFavorito(producto) ? "bi bi-heart-fill text-danger" : "bi bi-heart"}></i>
                    </button>
                    <Link to={`/cliente/detalles/${producto.idProducto}`} className="btn btn-secondary btn-sm" title="Ver detalles">
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

export default ClienteHome;
