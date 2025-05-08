import React, { useEffect, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import {
  obtenerFavoritosPorCliente,
  eliminarFavorito,
  agregarFavorito
} from '../../services/data';

export function ClienteFavoritos() {
  const { busqueda } = useOutletContext() || {};
  const [favoritos, setFavoritos] = useState([]);
  const [favoritosFiltrados, setFavoritosFiltrados] = useState([]);
  const [error, setError] = useState('');
  const idUsuario = localStorage.getItem("idUsuario");

  // Cargar favoritos desde la API
  useEffect(() => {
    const fetchFavoritos = async () => {
      try {
        const data = await obtenerFavoritosPorCliente(idUsuario);
        setFavoritos(data);
        setFavoritosFiltrados(data);
      } catch (err) {
        setError('Error al cargar favoritos.');
        console.error(err);
      }
    };

    if (idUsuario) {
      fetchFavoritos();
    } else {
      setError("Usuario no autenticado.");
    }
  }, [idUsuario]);

  // Aplicar filtro de búsqueda
  useEffect(() => {
    if (!busqueda) {
      setFavoritosFiltrados(favoritos);
    } else {
      const filtrados = favoritos.filter(fav =>
        fav.producto &&
        fav.producto.nombre.toLowerCase().includes(busqueda.toLowerCase())
      );
      setFavoritosFiltrados(filtrados);
    }
  }, [busqueda, favoritos]);

  // Eliminar o agregar a favoritos (si por alguna razón no está)
  const toggleFavorito = async (favorito) => {
    const producto = favorito?.producto;
    if (!producto) {
      console.error("Error: producto no definido en favorito", favorito);
      return;
    }

    try {
      await eliminarFavorito(favorito.idFavorito);
      setFavoritos(prev =>
        prev.filter(fav => fav.idProducto !== producto.idProducto)
      );
    } catch (error) {
      console.error("Error al eliminar favorito:", error);
    }
  };

  return (
    <div className="cliente-favoritos container mt-4">
      <div className="welcome-message text-center mb-4">
        <h1>Tus productos favoritos</h1>
        <p>Aquí están los productos que has guardado como favoritos.</p>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row">
        {favoritosFiltrados.length === 0 ? (
          <p className="text-center text-danger">
            Aún no has agregado productos a la lista. ¡Ve y agrega!
          </p>
        ) : (
          favoritosFiltrados.map(favorito => (
            favorito.producto && (
              <div className="col-md-3 col-sm-6 mb-4" key={favorito.idFavorito}>
                <div className="card h-100">
                  <div className="position-relative">

                    <img src={favorito.producto.rutaImagen || '/imageness/jajasalu2.png'} className="card-img-top" alt={favorito.producto.nombre}/>

                    {favorito.producto.descuento && (
                      <span className="badge bg-danger discount-badge">
                        -{favorito.producto.descuento}%
                      </span>
                    )}
                  </div>
                  <div className="card-body d-flex flex-column">
                    <h5 className="card-title">{favorito.producto.nombre}</h5>
                    <p className="card-text small text-truncate">
                      {favorito.producto.descripcion}
                    </p>
                    <p className="h6 text-success">
                      {favorito.producto.precio ? `$${favorito.producto.precio.toFixed(2)}` : "Precio no disponible"}
                    </p>
                    <div className="button-group mt-auto d-flex justify-content-around"> 
                      <button className="btn btn-outline-danger btn-sm"
                        title="Eliminar de favoritos"
                        onClick={() => toggleFavorito(favorito)}>
                        <i className="bi bi-heart-fill text-danger"></i>
                      </button>
                      <Link to={`/cliente/detalles/${favorito.producto.idProducto}`} className="btn btn-secondary btn-sm"
                        title="Ver detalles">
                        Detalles
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )
          ))
        )}
      </div>
    </div>
  );
}

export default ClienteFavoritos;
