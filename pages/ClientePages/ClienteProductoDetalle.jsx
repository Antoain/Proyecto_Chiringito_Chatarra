import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import {
  obtenerProductosPorId,
  obtenerFavoritosPorCliente,
  agregarFavorito,
  eliminarFavorito,
  obtenerResenasPorProducto,
  agregarResena,
  obtenerTiendaPorId,
  agregarCarrito
} from '../../services/data';
import './ClientePagesCss/ClienteProductoDetail.css';

export function ClienteProductoDetalles() {
  const { idProducto } = useParams();
  const [producto, setProducto] = useState(null);
  const [error, setError] = useState('');
  const [favorito, setFavorito] = useState(false);
  const [resenas, setResenas] = useState([]);
  const [tienda, setTienda] = useState(null);
  const [nuevoRating, setNuevoRating] = useState(5);
  const [nuevoComentario, setNuevoComentario] = useState('');
  const [agregandoResena, setAgregandoResena] = useState(false);
  const [mensajeCarrito, setMensajeCarrito] = useState('');
  const idUsuario = localStorage.getItem("idUsuario");

  const resenasRef = useRef(null); // Referencia al contenedor de reseñas

  // Función utilitaria para normalizar favoritos
  const normalizarFavoritos = (favData) =>
    favData.map(fav => ({
      idProducto: fav.IdProducto || fav.idProducto,
      idFavorito: fav.IdFavorito || fav.idFavorito
    }));

  // Carga el producto al montar el componente
  useEffect(() => {
    async function fetchProducto() {
      try {
        const data = await obtenerProductosPorId(idProducto);
        setProducto(data);
      } catch (err) {
        setError('Error al cargar el producto.');
        console.error(err);
      }
    }
    fetchProducto();
  }, [idProducto]);

  // Carga los datos de la tienda una vez que se obtiene el producto
  useEffect(() => {
    async function fetchTienda() {
      try {
        if (producto?.idTienda) {
          const dataTienda = await obtenerTiendaPorId(producto.idTienda);
          setTienda(dataTienda);
        }
      } catch (err) {
        console.error("Error al obtener la tienda:", err);
      }
    }
    fetchTienda();
  }, [producto]);

  // Verifica si el producto ya está en favoritos
  useEffect(() => {
    async function fetchFavoritos() {
      try {
        if (idUsuario && producto) {
          const favData = await obtenerFavoritosPorCliente(idUsuario);
          const normalized = normalizarFavoritos(favData);
          const exists = normalized.some(
            fav => Number(fav.idProducto) === Number(producto.idProducto)
          );
          setFavorito(exists);
        }
      } catch (err) {
        console.error("Error al verificar favoritos:", err);
      }
    }
    fetchFavoritos();
  }, [idUsuario, producto]);

  // Carga las reseñas del producto
  useEffect(() => {
    async function fetchResenas() {
      try {
        if (idProducto) {
          const data = await obtenerResenasPorProducto(idProducto);
          setResenas(data);
        }
      } catch (err) {
        console.error("Error al obtener reseñas:", err);
      }
    }
    fetchResenas();
  }, [idProducto]);

  // Calcula el promedio de las calificaciones
  const promedioCalificacion = resenas.length > 0
    ? (resenas.reduce((sum, r) => sum + r.calificacion, 0) / resenas.length).toFixed(1)
    : null;

  // Agrega o elimina el producto de favoritos
  const toggleFavorito = async () => {
    if (!producto || !idUsuario) return;
    const productoId = Number(producto.idProducto);
    try {
      const favData = await obtenerFavoritosPorCliente(idUsuario);
      const normalized = normalizarFavoritos(favData);
      const favFound = normalized.find(fav => Number(fav.idProducto) === productoId);

      if (favorito && favFound?.idFavorito) {
        await eliminarFavorito(favFound.idFavorito);
        setFavorito(false);
      } else {
        await agregarFavorito(idUsuario, productoId);
        setFavorito(true);
      }
    } catch (err) {
      console.error("Error al manejar el favorito:", err);
    }
  };

  // Hace scroll a la sección de reseñas
  const handleScrollToResenas = () => {
    resenasRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Maneja el envío de una nueva reseña
  const handleAgregarResena = async (e) => {
    e.preventDefault();
    if (!idUsuario || !nuevoComentario.trim()) return;
    setAgregandoResena(true);
    try {
      const resenaObj = {
        IdUsuario: Number(idUsuario),
        IdProducto: Number(producto.idProducto),
        Calificacion: Number(nuevoRating),
        Comentario: nuevoComentario.trim()
      };
      await agregarResena(resenaObj);
      const data = await obtenerResenasPorProducto(idProducto);
      setResenas(data);
      setNuevoRating(5);
      setNuevoComentario('');
    } catch (err) {
      console.error("Error al agregar la reseña:", err);
    } finally {
      setAgregandoResena(false);
    }
  };

  // Agrega el producto al carrito
  const handleAgregarCarrito = async () => {
    if (!idUsuario) return;
    const carritoItem = {
      IdUsuario: Number(idUsuario),
      IdProducto: Number(producto.idProducto),
      Cantidad: 1,
    };

    try {
      await agregarCarrito(carritoItem);
      setMensajeCarrito("Producto agregado al carrito.");
    } catch (error) {
      console.error("No se pudo agregar al carrito:", error);
      setMensajeCarrito("Error al agregar el producto. Intenta nuevamente.");
    } finally {
      setTimeout(() => setMensajeCarrito(""), 3000);
    }
  };

  if (error) return <div className="alert alert-danger container mt-4">{error}</div>;
  if (!producto) return <div className="container mt-4">Cargando...</div>;

  return (
    <div className="container mt-4 cliente-producto-detail">
      <div className="row">
        {/* Imagen del producto */}
        <div className="col-md-4">
          <div className="mi-borde">
            <div className="img-container position-relative">
              <img
                src={producto.rutaImagen || 'https://via.placeholder.com/400'}
                alt={`Imagen de ${producto.nombre}`}
                className="img-fluid"
              />
              {producto.descuento && (
                <span className="badge bg-danger discount-badge">
                  -{producto.descuento}%
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Detalles del producto */}
        <div className="col-md-4">
          <div className="mi-borde">
            <h2 className="producto-nombre">{producto.nombre}</h2>
            <p className="producto-descripcion">{producto.descripcion}</p>
            <h4 className="text-success producto-precio">
              ${producto.precio.toFixed(2)}
            </h4>
            <p className="producto-stock"><strong>Stock:</strong> {producto.stock}</p>
            <div className="mt-4 d-flex align-items-center">
              <div className="star-rating me-3" onClick={handleScrollToResenas} style={{ cursor: "pointer" }}>
                {[...Array(5)].map((_, index) => (
                  <span key={index} className="star">&#9733;</span>
                ))}
              </div>
              {promedioCalificacion && (
                <div className="me-3">Promedio: {promedioCalificacion}/5</div>
              )}
              <button
                className="btn btn-link p-0 ms-3"
                title={favorito ? "Eliminar de favoritos" : "Agregar a favoritos"}
                onClick={toggleFavorito}
              >
                <i className={favorito ? "bi bi-heart-fill text-danger" : "bi bi-heart"}></i>
              </button>
            </div>
          </div>
        </div>

        {/* Información de la tienda */}
        <div className="col-md-4">
          <div className="mi-borde">
            <h3>Información de la tienda</h3>
            {tienda?.fotoFachadaUrl ? (
              <div className="text-center mb-3">
                <img src={tienda.fotoFachadaUrl} alt={tienda.nombreNegocio} className="img-fluid tienda-logo" style={{ maxWidth: "150px", borderRadius: "8px" }} />
              </div>
            ) : (
              <p className="text-muted text-center">No hay imagen disponible</p>
            )}
            <p><strong>Tienda:</strong> {tienda?.nombreNegocio || "No definido"}</p>
            {tienda?.paginaWebUrl && (
              <p><strong>Página Web:</strong> <a href={tienda.paginaWebUrl} target="_blank" rel="noopener noreferrer">Visitar sitio</a></p>
            )}
            {tienda?.facebookUrl && (
              <p><strong>Facebook:</strong> <a href={tienda.facebookUrl} target="_blank" rel="noopener noreferrer">Página de Facebook</a></p>
            )}
            <p><strong>Cuenta con envío:</strong> {tienda?.cuentaEnvio ? "Sí" : "No"}</p>
            <p><strong>Horario:</strong> {tienda?.horario || "No definido"}</p>
            <p><strong>Número:</strong> {tienda?.numeroContacto || "No definido"}</p>
            <div className="d-grid gap-2 mt-4">
              <button className="btn btn-outline-primary btn-lg" onClick={handleAgregarCarrito}>
                Agregar al carrito
              </button>
              {mensajeCarrito && <p className="mt-2 alert alert-info">{mensajeCarrito}</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Sección de Reseñas */}
      <div ref={resenasRef} className="mt-5 mi-borde">
        <h3>Reseñas del producto</h3>
        {resenas.length === 0 ? (
          <p>Aún no hay reseñas para este producto. Sé el primero en dejar una reseña.</p>
        ) : (
          resenas.map((resena, index) => (
            <div className="resena-item" key={resena.idResena || index}>
              <p><strong>{resena.usuario || "Usuario desconocido"}:</strong> {resena.calificacion} &#9733;</p>
              {resena.comentario && <p>{resena.comentario}</p>}
            </div>
          ))
        )}
      </div>

      {/* Formulario de Nueva Reseña */}
      <div className="mt-5 mi-borde">
        <h3>Agregar tu reseña</h3>
        <form onSubmit={handleAgregarResena}>
          <div className="mb-3">
            <label htmlFor="calificacion" className="form-label">Calificación (1-5):</label>
            <select
              id="calificacion"
              className="form-select"
              value={nuevoRating}
              onChange={(e) => setNuevoRating(Number(e.target.value))}
            >
              {[1, 2, 3, 4, 5].map(num => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
          </div>
          <div className="mb-3">
            <label htmlFor="comentario" className="form-label">Comentario:</label>
            <textarea
              id="comentario"
              className="form-control"
              rows="3"
              value={nuevoComentario}
              onChange={(e) => setNuevoComentario(e.target.value)}
            ></textarea>
          </div>
          <button
            type="submit"
            className="btn btn-success"
            disabled={agregandoResena || !nuevoComentario.trim()}
          >
            {agregandoResena ? "Agregando reseña..." : "Enviar reseña"}
          </button>
        </form>
      </div>
    </div>
  );
}
// Exportar el componente para usarlo en otras partes de la app
export default ClienteProductoDetalles;
