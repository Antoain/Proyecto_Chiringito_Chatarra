import React, { useEffect, useState } from "react";
import {
  obtenerCarritoPorUsuario,
  eliminarDelCarrito,
  actualizarCantidadEnBackend,
  agregarFavorito,
  eliminarFavorito,
  obtenerFavoritosPorCliente,
  realizarVenta
} from "../../services/data";
import ModalProcesarVenta from "./ModalProcesarVenta";
import "./ClientePagesCss/ClienteCarrito.css";

export function ClienteCarrito() {
  const [carrito, setCarrito] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [favoritos, setFavoritos] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const idUsuario = localStorage.getItem("idUsuario");

  // Función de utilidad para mostrar mensajes temporales
  const mostrarMensajeTemporal = (texto, tiempo = 3000) => {
    setMensaje(texto);
    setTimeout(() => setMensaje(""), tiempo);
  };

  // Obtener carrito al cargar el componente
  useEffect(() => {
    async function fetchCarrito() {
      try {
        const data = await obtenerCarritoPorUsuario(Number(idUsuario));
        setCarrito(data);
      } catch (err) {
        console.error("Error al obtener el carrito:", err);
        setError("Error al cargar el carrito.");
      } finally {
        setLoading(false);
      }
    }
    fetchCarrito();
  }, [idUsuario]);

  // Calcular el total cada vez que cambia el carrito
  useEffect(() => {
    const totalCalculado = carrito.reduce((sum, item) => {
      const precio = item?.idProductoNavigation?.precio ?? 0;
      return sum + precio * (item.cantidad || 1);
    }, 0);
    setTotal(totalCalculado);
  }, [carrito]);

  // Obtener favoritos del usuario
  useEffect(() => {
    async function fetchFavoritos() {
      try {
        if (idUsuario) {
          const favData = await obtenerFavoritosPorCliente(idUsuario);
          setFavoritos(
            favData.map(fav => ({
              IdProducto: fav.idProducto ?? fav.IdProducto,
              IdFavorito: fav.idFavorito ?? fav.IdFavorito
            }))
          );
        }
      } catch (err) {
        console.error("Error al obtener favoritos:", err);
      }
    }
    fetchFavoritos();
  }, [idUsuario]);

  // Eliminar producto del carrito
  const handleEliminarDelCarrito = async (idCarrito) => {
    try {
      await eliminarDelCarrito(idCarrito);
      setCarrito(prev => prev.filter(item => item.idCarrito !== idCarrito));
      mostrarMensajeTemporal("Producto eliminado correctamente.");
    } catch (error) {
      console.error("Error al eliminar producto del carrito:", error);
      mostrarMensajeTemporal("Error al eliminar producto.");
    }
  };

  // Modificar la cantidad de productos
  const handleModificarCantidad = async (idCarrito, nuevaCantidad) => {
    if (nuevaCantidad < 1) return;
    try {
      const data = await actualizarCantidadEnBackend(idCarrito, nuevaCantidad);
      if (!data || !data.mensaje.includes("actualizada correctamente")) {
        console.error("Error en actualización:", data?.mensaje);
        return;
      }
      setCarrito(prev =>
        prev.map(item =>
          item.idCarrito === idCarrito ? { ...item, cantidad: nuevaCantidad } : item
        )
      );
    } catch (error) {
      console.error("Error al modificar la cantidad:", error);
    }
  };

  // Función para verificar si un producto está en favoritos
  const esFavorito = (idProducto) => favoritos.some(fav => Number(fav.IdProducto) === Number(idProducto));

  // Alternar favorito: agregar o eliminar
  const toggleFavorito = async (idProducto) => {
    try {
      const favoritoExistente = favoritos.find(fav => Number(fav.IdProducto) === Number(idProducto));
      if (favoritoExistente && favoritoExistente.IdFavorito) {
        await eliminarFavorito(favoritoExistente.IdFavorito);
        setFavoritos(prev => prev.filter(fav => Number(fav.IdProducto) !== Number(idProducto)));
      } else {
        const response = await agregarFavorito(idUsuario, idProducto);
        if (response?.mensaje?.includes("Producto agregado a favoritos.")) {
          setFavoritos(prev => [...prev, { IdProducto: idProducto, IdFavorito: response.IdFavorito }]);
        }
      }
    } catch (err) {
      console.error("Error al manejar el favorito:", err);
    }
  };

  // Confirmar y procesar venta desde el modal
  const handleConfirmarVenta = async (venta) => {
    try {
      const response = await realizarVenta(venta);
      if (response?.mensaje) {
        mostrarMensajeTemporal(response.mensaje);
      } else {
        mostrarMensajeTemporal("Error al realizar la venta.");
      }
      setMostrarModal(false);
    } catch (error) {
      console.error("Error al realizar la venta:", error);
      mostrarMensajeTemporal("Ocurrió un error al procesar la venta.");
      setMostrarModal(false);
    }
  };

  if (loading) return <div className="container mt-4">Cargando carrito...</div>;
  if (error) return <div className="container mt-4 alert alert-danger">{error}</div>;

  if (carrito.length === 0) {
    return (
      <div className="container mt-4">
        <h2>Tu Carrito</h2>
        <p>El carrito está vacío.</p>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-md-8">
          <h2 className="mb-4">Tu Carrito</h2>
          {mensaje && <p className="alert alert-success">{mensaje}</p>}

          {carrito.map(item => (
            <div key={item.idCarrito} className="carrito-item">
              <img
                src={item.idProductoNavigation?.rutaImagen || "/imagenes/jajasalu2.png"}
                alt={item.idProductoNavigation?.nombre || "Producto desconocido"}
                className="carrito-img"
              />

              <div className="carrito-info">
                <h5>{item.idProductoNavigation?.nombre}</h5>
                <p>Precio: ${item.idProductoNavigation?.precio?.toFixed(2) || "0.00"}</p>
                <p>Subtotal: ${
                  item.idProductoNavigation?.precio
                    ? (item.idProductoNavigation.precio * (item.cantidad || 1)).toFixed(2)
                    : "0.00"
                }</p>

                {/* Botones para aumentar/disminuir cantidad */}
                <div className="carrito-actions mt-2">
                  <button
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => handleModificarCantidad(item.idCarrito, Math.max(item.cantidad - 1, 1))}
                  >-
                  </button>
                  <span className="mx-2 fw-bold">{item.cantidad}</span>
                  <button
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => handleModificarCantidad(item.idCarrito, item.cantidad + 1)}
                  >+
                  </button>
                </div>

                {/* Botones para eliminar del carrito y alternar favorito */}
                <div className="carrito-actions mt-2">
                  <button className="btn btn-danger btn-sm" onClick={() => handleEliminarDelCarrito(item.idCarrito)}>
                    Eliminar
                  </button>
                  <button
                    className="btn btn-link p-0 ms-3"
                    aria-label="Favoritos"
                    title={esFavorito(item.idProducto) ? "Eliminar de favoritos" : "Agregar a favoritos"}
                    onClick={() => toggleFavorito(item.idProducto)}
                  >
                    <i className={esFavorito(item.idProducto) ? "bi bi-heart-fill text-danger" : "bi bi-heart"}> Favoritos</i>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Panel lateral de resumen */}
        <div className="col-md-4">
          <div className="resumen-compra">
            <h4>Resumen</h4>
            <p><strong>Subtotal:</strong> ${total.toFixed(2)}</p>
            <p><strong>Envío:</strong> Gratis</p>
            <p><strong>Total:</strong> ${total.toFixed(2)}</p>

            <button className="btn btn-success w-100" onClick={() => setMostrarModal(true)}>
              Proceder a la compra
            </button>
          </div>
        </div>
      </div>

      {/* Modal para procesar la venta */}
      {mostrarModal && (
        <ModalProcesarVenta
          onClose={() => setMostrarModal(false)}
          onConfirm={handleConfirmarVenta}
          total={total}
          totalProductos={carrito.reduce((acc, item) => acc + (item.cantidad || 0), 0)}
        />
      )}
    </div>
  );
}

export default ClienteCarrito;
