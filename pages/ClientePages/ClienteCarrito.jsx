
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
  obtenerCarritoPorUsuario,
  eliminarDelCarrito,
  actualizarCantidadEnBackend,
  agregarFavorito,
  eliminarFavorito,
  obtenerFavoritosPorCliente,
  realizarCheckout,
  obtenerPromocionesActivas
} from "../../services/data";

import ModalProcesarVenta from "./ModalProcesarVenta";
import "./ClientePagesCss/ClienteCarrito.css";

const dinero = valor =>
  `$${Number(valor || 0).toFixed(2)}`;

const normalizarFavoritos = data =>
  (Array.isArray(data) ? data : []).map(fav => ({
    idProducto: fav.idProducto ?? fav.IdProducto,
    idFavorito: fav.idFavorito ?? fav.IdFavorito
  }));

function ImagenProducto({ producto }) {
  const [fallo, setFallo] = useState(false);

  useEffect(() => {
    setFallo(false);
  }, [producto?.rutaImagen]);

  if (!producto?.rutaImagen || fallo) {
    return (
      <div className="cc-imagen-placeholder">
        <i className="bi bi-image"></i>
        <span>Sin imagen</span>
      </div>
    );
  }

  return (
    <img
      src={producto.rutaImagen}
      alt={producto.nombre || "Producto"}
      className="carrito-img"
      loading="lazy"
      onError={() => setFallo(true)}
    />
  );
}

export function ClienteCarrito() {
  const [carrito, setCarrito] = useState([]);
  const [promociones, setPromociones] = useState([]);
  const [favoritos, setFavoritos] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const [procesandoItems, setProcesandoItems] = useState([]);
  const [procesandoCheckout, setProcesandoCheckout] = useState(false);
  const [mostrarModal, setMostrarModal] = useState(false);

  const idUsuario = localStorage.getItem("idUsuario");

  // =====================================================
  // NOTIFICACIONES
  // =====================================================

  const notificar = (texto, esError = false) => {
    if (esError) {
      setError(texto);
      setMensaje("");
    } else {
      setMensaje(texto);
      setError("");
    }
  };

  const avisarCambioCarrito = () => {
    window.dispatchEvent(new Event("carritoActualizado"));
  };

  // =====================================================
  // CARGA INICIAL
  // =====================================================

  useEffect(() => {
    let activo = true;

    const cargar = async () => {
      setLoading(true);
      setError("");

      try {
        const dataCarrito = await obtenerCarritoPorUsuario();

        if (activo) {
          setCarrito(
            Array.isArray(dataCarrito) ? dataCarrito : []
          );
        }

        // Los datos complementarios no deben romper
        // la página principal si fallan.
        const [resultadoPromociones, resultadoFavoritos] =
          await Promise.allSettled([
            obtenerPromocionesActivas(),
            obtenerFavoritosPorCliente()
          ]);

        if (!activo) return;

        if (resultadoPromociones.status === "fulfilled") {
          setPromociones(
            Array.isArray(resultadoPromociones.value)
              ? resultadoPromociones.value
              : []
          );
        }

        if (resultadoFavoritos.status === "fulfilled") {
          setFavoritos(
            normalizarFavoritos(resultadoFavoritos.value)
          );
        }
      } catch (err) {
        if (!activo) return;

        console.error("Error cargando carrito:", err);

        if (err.status === 404) {
          setCarrito([]);
        } else {
          setError(
            err.message || "No se pudo cargar tu carrito."
          );
        }
      } finally {
        if (activo) setLoading(false);
      }
    };

    cargar();

    return () => {
      activo = false;
    };
  }, [idUsuario]);

  // =====================================================
  // PRECIOS Y PROMOCIONES
  // =====================================================

  const promocionesPorProducto = useMemo(() => {
    const mapa = new Map();

    promociones.forEach(promocion => {
      mapa.set(Number(promocion.idProducto), promocion);
    });

    return mapa;
  }, [promociones]);

  const obtenerPromocion = idProducto =>
    promocionesPorProducto.get(Number(idProducto)) || null;

  const obtenerPrecio = item => {
    const promocion = obtenerPromocion(item.idProducto);

    if (promocion) {
      return Number(promocion.precioFinal ?? 0);
    }

    return Number(item.idProductoNavigation?.precio ?? 0);
  };

  const obtenerStock = item => {
    const producto = item.idProductoNavigation;

    const stock = Number(producto?.stock ?? 0);

    return Number.isFinite(stock)
      ? Math.max(0, Math.floor(stock))
      : 0;
  };

  const resumen = useMemo(() => {
    let subtotal = 0;
    let ahorro = 0;
    let cantidadProductos = 0;
    let productosSinStock = 0;
    let cantidadesInvalidas = 0;

    carrito.forEach(item => {
      const cantidad = Number(item.cantidad || 0);
      const producto = item.idProductoNavigation;

      const promocion = promocionesPorProducto.get(
        Number(item.idProducto)
      );

      const precioOriginal = Number(producto?.precio ?? 0);
      const precioFinal = promocion
        ? Number(promocion.precioFinal ?? 0)
        : precioOriginal;

      const stock = Math.max(
        0,
        Number(producto?.stock ?? 0)
      );

      const cantidadSegura = Math.max(0, cantidad);

      subtotal += precioFinal * cantidadSegura;

      ahorro += Math.max(
        0,
        precioOriginal - precioFinal
      ) * cantidadSegura;

      cantidadProductos += cantidadSegura;

      if (stock <= 0) productosSinStock++;

      if (
        !Number.isInteger(cantidad) ||
        cantidad < 1 ||
        cantidad > stock ||
        producto?.activo === false
      ) {
        cantidadesInvalidas++;
      }
    });

    return {
      subtotal,
      ahorro,
      cantidadProductos,
      productosSinStock,
      cantidadesInvalidas
    };
  }, [carrito, promocionesPorProducto]);

  const puedeComprar =
    carrito.length > 0 &&
    resumen.cantidadesInvalidas === 0 &&
    procesandoItems.length === 0 &&
    !procesandoCheckout &&
    !loading;

  // =====================================================
  // ELIMINAR PRODUCTO
  // =====================================================

  const handleEliminarDelCarrito = async idCarrito => {
    if (procesandoItems.includes(idCarrito)) return;

    setProcesandoItems(prev => [...prev, idCarrito]);
    setError("");

    try {
      await eliminarDelCarrito(idCarrito);

      setCarrito(prev =>
        prev.filter(item => item.idCarrito !== idCarrito)
      );

      avisarCambioCarrito();
      notificar("Producto eliminado del carrito.");
    } catch (err) {
      console.error("Error eliminando producto:", err);

      notificar(
        err.message || "No se pudo eliminar el producto.",
        true
      );
    } finally {
      setProcesandoItems(prev =>
        prev.filter(id => id !== idCarrito)
      );
    }
  };

  // =====================================================
  // MODIFICAR CANTIDAD
  // =====================================================

  const handleModificarCantidad = async (
    item,
    nuevaCantidad
  ) => {
    const idCarrito = item.idCarrito;
    const stock = obtenerStock(item);

    if (procesandoItems.includes(idCarrito)) return;

    if (
      !Number.isInteger(nuevaCantidad) ||
      nuevaCantidad < 1
    ) {
      return;
    }

    if (nuevaCantidad > stock) {
      notificar(
        `Solo hay ${stock} unidades disponibles de ${item.idProductoNavigation?.nombre || "este producto"}.`,
        true
      );
      return;
    }

    setProcesandoItems(prev => [...prev, idCarrito]);
    setError("");

    try {
      const respuesta = await actualizarCantidadEnBackend(
        idCarrito,
        nuevaCantidad
      );

      // apiFetch lanza error ante estados HTTP fallidos.
      // Comprobamos además respuestas que declaren fallo.
      if (respuesta?.exito === false) {
        throw new Error(
          respuesta.mensaje || "No se pudo actualizar."
        );
      }

      setCarrito(prev =>
        prev.map(producto =>
          producto.idCarrito === idCarrito
            ? { ...producto, cantidad: nuevaCantidad }
            : producto
        )
      );

      avisarCambioCarrito();
    } catch (err) {
      console.error("Error modificando cantidad:", err);

      notificar(
        err.message ||
          "No se pudo actualizar la cantidad. Comprueba el stock.",
        true
      );

      // Volver a consultar por si el stock cambió
      // mientras se realizaba la operación.
      try {
        const actualizado =
          await obtenerCarritoPorUsuario();

        setCarrito(
          Array.isArray(actualizado) ? actualizado : []
        );
        avisarCambioCarrito();
      } catch (errorRecarga) {
        console.error(
          "No se pudo refrescar el carrito:",
          errorRecarga
        );
      }
    } finally {
      setProcesandoItems(prev =>
        prev.filter(id => id !== idCarrito)
      );
    }
  };

  // =====================================================
  // FAVORITOS
  // =====================================================

  const esFavorito = idProducto =>
    favoritos.some(
      fav =>
        Number(fav.idProducto) === Number(idProducto)
    );

  const toggleFavorito = async idProducto => {
    const encontrado = favoritos.find(
      fav =>
        Number(fav.idProducto) === Number(idProducto)
    );

    try {
      setError("");

      if (encontrado?.idFavorito) {
        await eliminarFavorito(encontrado.idFavorito);

        setFavoritos(prev =>
          prev.filter(
            fav =>
              Number(fav.idProducto) !== Number(idProducto)
          )
        );

        notificar("Producto eliminado de favoritos.");
      } else {
        await agregarFavorito(idProducto);

        const actualizados =
          await obtenerFavoritosPorCliente();

        setFavoritos(normalizarFavoritos(actualizados));
        notificar("Producto agregado a favoritos.");
      }
    } catch (err) {
      console.error("Error modificando favoritos:", err);

      notificar(
        err.message || "No se pudo modificar el favorito.",
        true
      );
    }
  };

  // =====================================================
  // CHECKOUT
  // =====================================================

  const handleConfirmarVenta = async checkout => {
    if (procesandoCheckout) return;

    setProcesandoCheckout(true);
    setError("");

    try {
      const respuesta = await realizarCheckout(checkout);

      setCarrito([]);
      setMostrarModal(false);

      avisarCambioCarrito();

      notificar(
        respuesta?.mensaje ||
          "¡Tu pedido se realizó correctamente!"
      );
    } catch (err) {
      console.error("Error al realizar checkout:", err);

      notificar(
        err.message ||
          "No se pudo completar la compra.",
        true
      );

      // Permite al modal mostrar el error sin cerrarse.
      throw err;
    } finally {
      setProcesandoCheckout(false);
    }
  };

  // =====================================================
  // RENDER
  // =====================================================

  if (loading) {
    return (
      <div className="cc-page">
        <div className="cc-loading">
          <div className="spinner-border text-primary" />
          <p>Cargando tu carrito...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cc-page">
      <div className="cc-container">

        {/* ENCABEZADO */}

        <header className="cc-header">
          <div>
            <span className="cc-eyebrow">
              CHIRINGUITO CHATARRA
            </span>

            <h1>
              <i className="bi bi-cart3"></i>
              Tu carrito
            </h1>

            <p>
              Revisa tus productos antes de completar
              la compra.
            </p>
          </div>

          <Link to="/cliente" className="cc-back-link">
            <i className="bi bi-arrow-left"></i>
            Seguir comprando
          </Link>
        </header>

        {/* ALERTAS */}

        {error && (
          <div
            className="cc-alert cc-alert-error"
            role="alert"
          >
            <i className="bi bi-exclamation-triangle"></i>
            <span>{error}</span>

            <button
              type="button"
              onClick={() => setError("")}
              aria-label="Cerrar error"
            >
              <i className="bi bi-x-lg"></i>
            </button>
          </div>
        )}

        {mensaje && (
          <div
            className="cc-alert cc-alert-success"
            role="status"
          >
            <i className="bi bi-check-circle"></i>
            <span>{mensaje}</span>

            <button
              type="button"
              onClick={() => setMensaje("")}
              aria-label="Cerrar mensaje"
            >
              <i className="bi bi-x-lg"></i>
            </button>
          </div>
        )}

        {resumen.cantidadesInvalidas > 0 && (
          <div className="cc-alert cc-alert-warning">
            <i className="bi bi-info-circle"></i>
            <span>
              Hay productos agotados, inactivos o con
              cantidades superiores al stock. Corrige
              tu carrito antes de continuar.
            </span>
          </div>
        )}

        <div className="cc-layout">

          {/* LISTADO */}

          <section className="cc-main">
            <div className="cc-section-title">
              <div>
                <h2>Productos seleccionados</h2>
                <p>
                  {resumen.cantidadProductos} unidades
                  en {carrito.length} productos
                </p>
              </div>

              <span className="cc-count">
                {carrito.length}
              </span>
            </div>

            {carrito.length === 0 ? (
              <div className="cc-empty">
                <div className="cc-empty-icon">
                  <i className="bi bi-bag"></i>
                </div>

                <h3>Tu carrito está vacío</h3>

                <p>
                  Descubre productos y agrégalos para
                  comenzar tu compra.
                </p>

                <Link to="/cliente" className="cc-primary-link">
                  <i className="bi bi-grid"></i>
                  Explorar productos
                </Link>
              </div>
            ) : (
              <div className="cc-items">
                {carrito.map(item => {
                  const producto = item.idProductoNavigation || {};
                  const promocion = obtenerPromocion(
                    item.idProducto
                  );

                  const cantidad = Number(item.cantidad || 0);
                  const stock = obtenerStock(item);
                  const precio = obtenerPrecio(item);
                  const precioNormal = Number(producto.precio || 0);

                  const subtotal = precio * cantidad;
                  const ahorro = Math.max(
                    0,
                    precioNormal - precio
                  ) * cantidad;

                  const ocupado = procesandoItems.includes(
                    item.idCarrito
                  );

                  const agotado = stock <= 0;
                  const inactivo = producto.activo === false;
                  const excedido = cantidad > stock;

                  const problema =
                    agotado || excedido || inactivo;

                  return (
                    <article
                      key={item.idCarrito}
                      className={`carrito-item ${problema ? "cc-item-warning" : ""}`}
                    >
                      <div className="cc-item-media">
                        <ImagenProducto producto={producto} />

                        {promocion && (
                          <span className="cc-discount-tag">
                            -{Number(promocion.descuento)}%
                          </span>
                        )}
                      </div>

                      <div className="carrito-info">
                        <div className="cc-item-heading">
                          <div>
                            <span className="cc-product-label">
                              PRODUCTO
                            </span>

                            <Link
                              to={`/cliente/detalles/${item.idProducto}`}
                              className="cc-product-name"
                            >
                              {producto.nombre || "Producto"}
                            </Link>

                            {producto.sku && (
                              <span className="cc-sku">
                                SKU: {producto.sku}
                              </span>
                            )}
                          </div>

                          <button
                            type="button"
                            className="cc-remove-icon"
                            disabled={ocupado || procesandoCheckout}
                            title="Eliminar del carrito"
                            aria-label="Eliminar del carrito"
                            onClick={() =>
                              handleEliminarDelCarrito(
                                item.idCarrito
                              )
                            }
                          >
                            <i className="bi bi-trash3"></i>
                          </button>
                        </div>

                        <div className="cc-stock">
                          {inactivo ? (
                            <span className="cc-stock-error">
                              Producto no disponible
                            </span>
                          ) : agotado ? (
                            <span className="cc-stock-error">
                              Agotado
                            </span>
                          ) : excedido ? (
                            <span className="cc-stock-error">
                              Stock insuficiente: {stock} disponibles
                            </span>
                          ) : (
                            <span className="cc-stock-ok">
                              <i className="bi bi-check-circle"></i>
                              {stock} disponibles
                            </span>
                          )}
                        </div>

                        <div className="cc-pricing">
                          {promocion ? (
                            <div className="cc-unit-prices">
                              <span className="cc-old-price">
                                {dinero(precioNormal)}
                              </span>

                              <strong className="cc-new-price">
                                {dinero(precio)}
                              </strong>

                              <small>por unidad</small>
                            </div>
                          ) : (
                            <div className="cc-unit-prices">
                              <strong className="cc-new-price">
                                {dinero(precio)}
                              </strong>
                              <small>por unidad</small>
                            </div>
                          )}

                          {ahorro > 0 && (
                            <span className="cc-saving">
                              Ahorras {dinero(ahorro)}
                            </span>
                          )}
                        </div>

                        <div className="cc-item-bottom">
                          <div className="cc-quantity-wrapper">
                            <span>Cantidad</span>

                            <div className="carrito-actions cc-quantity">
                              <button
                                type="button"
                                disabled={
                                  ocupado ||
                                  procesandoCheckout ||
                                  cantidad <= 1 ||
                                  inactivo
                                }
                                onClick={() =>
                                  handleModificarCantidad(
                                    item,
                                    cantidad - 1
                                  )
                                }
                                aria-label="Disminuir cantidad"
                              >
                                <i className="bi bi-dash"></i>
                              </button>

                              <strong>{cantidad}</strong>

                              <button
                                type="button"
                                disabled={
                                  ocupado ||
                                  procesandoCheckout ||
                                  cantidad >= stock ||
                                  inactivo
                                }
                                onClick={() =>
                                  handleModificarCantidad(
                                    item,
                                    cantidad + 1
                                  )
                                }
                                aria-label="Aumentar cantidad"
                              >
                                <i className="bi bi-plus"></i>
                              </button>
                            </div>
                          </div>

                          <div className="cc-item-total">
                            <span>Subtotal</span>
                            <strong>{dinero(subtotal)}</strong>
                          </div>
                        </div>

                        <div className="cc-item-extra">
                          <button
                            type="button"
                            className="cc-favorite-action"
                            disabled={procesandoCheckout}
                            onClick={() =>
                              toggleFavorito(item.idProducto)
                            }
                          >
                            <i
                              className={
                                esFavorito(item.idProducto)
                                  ? "bi bi-heart-fill"
                                  : "bi bi-heart"
                              }
                            ></i>
                            {esFavorito(item.idProducto)
                              ? "En favoritos"
                              : "Guardar en favoritos"}
                          </button>
                        </div>

                        {ocupado && (
                          <small className="cc-processing">
                            Actualizando producto...
                          </small>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          {/* RESUMEN */}

          <aside className="cc-sidebar">
            <div className="resumen-compra">
              <div className="cc-summary-heading">
                <div className="cc-summary-icon">
                  <i className="bi bi-receipt"></i>
                </div>
                <div>
                  <h2>Resumen de compra</h2>
                  <p>Detalle de tu pedido</p>
                </div>
              </div>

              <div className="cc-summary-lines">
                <div>
                  <span>Productos</span>
                  <strong>{resumen.cantidadProductos}</strong>
                </div>

                <div>
                  <span>Subtotal</span>
                  <strong>{dinero(resumen.subtotal)}</strong>
                </div>

                {resumen.ahorro > 0 && (
                  <div className="cc-summary-discount">
                    <span>
                      <i className="bi bi-tag"></i>
                      Ahorro estimado
                    </span>
                    <strong>-{dinero(resumen.ahorro)}</strong>
                  </div>
                )}

                <div className="cc-shipping-row">
                  <span>Envío</span>
                  <span className="cc-shipping-text">
                    Por calcular
                  </span>
                </div>
              </div>

              <div className="cc-summary-total">
                <span>Total parcial</span>
                <strong>{dinero(resumen.subtotal)}</strong>
              </div>

              <p className="cc-summary-note">
                <i className="bi bi-info-circle"></i>
                El envío se determina al seleccionar
                el distrito y método de entrega.
                El servidor confirma el total final.
              </p>

              <button
                type="button"
                className="cc-checkout-btn"
                disabled={!puedeComprar}
                onClick={() => setMostrarModal(true)}
              >
                <i className="bi bi-lock"></i>
                Proceder a la compra
                <i className="bi bi-arrow-right"></i>
              </button>

              {!puedeComprar && carrito.length > 0 && (
                <small className="cc-checkout-hint">
                  Comprueba existencias y cantidades
                  antes de continuar.
                </small>
              )}

              <div className="cc-security">
                <i className="bi bi-shield-check"></i>
                <span>
                  Compra procesada y validada por
                  nuestro servidor
                </span>
              </div>
            </div>

            <div className="cc-help-card">
              <i className="bi bi-question-circle"></i>
              <div>
                <strong>¿Tienes dudas?</strong>
                <p>
                  Revisa tus productos y cantidades
                  antes de confirmar la compra.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* MODAL EXISTENTE - CONSERVAMOS CONTRATO */}

      {mostrarModal && (
        <ModalProcesarVenta
          carrito={carrito}
          onClose={() => {
            if (!procesandoCheckout) setMostrarModal(false);
          }}
          onConfirm={handleConfirmarVenta}
        />
      )}
    </div>
  );
}

export default ClienteCarrito;
