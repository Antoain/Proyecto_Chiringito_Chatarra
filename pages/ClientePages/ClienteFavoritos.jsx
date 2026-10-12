
import React, { useEffect, useMemo, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";

import {
  obtenerFavoritosPorCliente,
  eliminarFavorito,
  obtenerPromocionesActivas
} from "../../services/data";

import "./ClientePagesCss/ClienteFavoritos.css";

// =====================================================
// HELPERS
// =====================================================

const formatoPrecio = valor =>
  `$${Number(valor || 0).toFixed(2)}`;

const normalizarTexto = valor =>
  String(valor || "").trim().toLowerCase();

function ImagenFavorito({ producto }) {
  const [imagenFallida, setImagenFallida] = useState(false);

  useEffect(() => {
    setImagenFallida(false);
  }, [producto?.rutaImagen]);

  if (!producto?.rutaImagen || imagenFallida) {
    return (
      <div className="cf-imagen-vacia">
        <i className="bi bi-image"></i>
        <span>Imagen no disponible</span>
      </div>
    );
  }

  return (
    <img
      src={producto.rutaImagen}
      alt={producto.nombre || "Producto"}
      loading="lazy"
      className="cf-imagen"
      onError={() => setImagenFallida(true)}
    />
  );
}

// =====================================================
// COMPONENTE
// =====================================================

export function ClienteFavoritos() {
  const contexto = useOutletContext() || {};

  const busquedaNavbar = contexto.busqueda || "";

  const [favoritos, setFavoritos] = useState([]);
  const [promociones, setPromociones] = useState([]);

  const [busquedaLocal, setBusquedaLocal] = useState("");
  const [filtro, setFiltro] = useState("todos");
  const [orden, setOrden] = useState("recientes");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const [favoritoAEliminar, setFavoritoAEliminar] =
    useState(null);

  const [eliminando, setEliminando] = useState(false);

  const idUsuario = localStorage.getItem("idUsuario");

  // =====================================================
  // CARGAR FAVORITOS
  // =====================================================

  useEffect(() => {
    let activo = true;

    const cargarFavoritos = async () => {
      setLoading(true);
      setError("");

      if (!idUsuario) {
        setError("Debes iniciar sesión para ver tus favoritos.");
        setLoading(false);
        return;
      }

      try {
        const [resultadoFavoritos, resultadoPromociones] =
          await Promise.allSettled([
            obtenerFavoritosPorCliente(),
            obtenerPromocionesActivas()
          ]);

        if (!activo) return;

        if (resultadoFavoritos.status === "rejected") {
          throw resultadoFavoritos.reason;
        }

        const data = resultadoFavoritos.value;

        setFavoritos(Array.isArray(data) ? data : []);

        if (resultadoPromociones.status === "fulfilled") {
          const dataPromociones = resultadoPromociones.value;

          setPromociones(
            Array.isArray(dataPromociones)
              ? dataPromociones
              : []
          );
        } else {
          // Fallar al consultar promociones no debe
          // impedir que los favoritos se muestren.
          setPromociones([]);
          console.warn(
            "No se pudieron cargar las promociones.",
            resultadoPromociones.reason
          );
        }
      } catch (err) {
        if (!activo) return;

        if (err?.status === 404) {
          setFavoritos([]);
        } else {
          setError(
            err?.message ||
              "No se pudieron cargar tus favoritos."
          );
        }

        console.error("Error cargando favoritos:", err);
      } finally {
        if (activo) {
          setLoading(false);
        }
      }
    };

    cargarFavoritos();

    return () => {
      activo = false;
    };
  }, [idUsuario]);

  // =====================================================
  // PROMOCIONES
  // =====================================================

  const promocionesPorProducto = useMemo(() => {
    const mapa = new Map();

    promociones.forEach(promocion => {
      mapa.set(
        Number(promocion.idProducto),
        promocion
      );
    });

    return mapa;
  }, [promociones]);

  const obtenerDatosPrecio = producto => {
    const promocion = promocionesPorProducto.get(
      Number(producto.idProducto)
    );

    const precioOriginal = Number(
      promocion?.precioOriginal ??
      producto.precio ??
      0
    );

    const precioFinal = promocion
      ? Number(promocion.precioFinal ?? precioOriginal)
      : Number(producto.precio ?? 0);

    const ahorro = Math.max(
      0,
      precioOriginal - precioFinal
    );

    return {
      promocion,
      precioOriginal,
      precioFinal,
      ahorro
    };
  };

  // =====================================================
  // FILTROS Y ORDENAMIENTO
  // =====================================================

  const favoritosFiltrados = useMemo(() => {
    const texto = normalizarTexto(
      busquedaLocal || busquedaNavbar
    );

    const resultado = favoritos.filter(favorito => {
      const producto = favorito.producto;

      if (!producto) return false;

      const contenido = [
        producto.nombre,
        producto.descripcion,
        producto.sku
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      if (texto && !contenido.includes(texto)) {
        return false;
      }

      const stock = Number(producto.stock ?? 0);
      const disponible =
        producto.activo !== false && stock > 0;

      const tienePromocion =
        promocionesPorProducto.has(
          Number(producto.idProducto)
        );

      if (filtro === "disponibles") {
        return disponible;
      }

      if (filtro === "ofertas") {
        return tienePromocion;
      }

      return true;
    });

    resultado.sort((a, b) => {
      const productoA = a.producto;
      const productoB = b.producto;

      const promocionA = promocionesPorProducto.get(
        Number(productoA.idProducto)
      );

      const promocionB = promocionesPorProducto.get(
        Number(productoB.idProducto)
      );

      const precioA = Number(
        promocionA?.precioFinal ??
        productoA.precio ??
        0
      );

      const precioB = Number(
        promocionB?.precioFinal ??
        productoB.precio ??
        0
      );

      switch (orden) {
        case "precio-asc":
          return precioA - precioB;

        case "precio-desc":
          return precioB - precioA;

        case "nombre":
          return String(productoA.nombre || "")
            .localeCompare(
              String(productoB.nombre || ""),
              "es"
            );

        default:
          return 0;
      }
    });

    return resultado;
  }, [
    favoritos,
    busquedaLocal,
    busquedaNavbar,
    filtro,
    orden,
    promocionesPorProducto
  ]);

  // =====================================================
  // ESTADÍSTICAS
  // =====================================================

  const estadisticas = useMemo(() => {
    let disponibles = 0;
    let conOferta = 0;

    favoritos.forEach(favorito => {
      const producto = favorito.producto;

      if (!producto) return;

      if (
        producto.activo !== false &&
        Number(producto.stock ?? 0) > 0
      ) {
        disponibles++;
      }

      if (
        promocionesPorProducto.has(
          Number(producto.idProducto)
        )
      ) {
        conOferta++;
      }
    });

    return {
      total: favoritos.length,
      disponibles,
      conOferta
    };
  }, [favoritos, promocionesPorProducto]);

  // =====================================================
  // ELIMINAR FAVORITO
  // =====================================================

  const confirmarEliminarFavorito = favorito => {
    setFavoritoAEliminar(favorito);
    setError("");
    setMensaje("");
  };

  const cancelarEliminacion = () => {
    if (eliminando) return;
    setFavoritoAEliminar(null);
  };

  const ejecutarEliminacion = async () => {
    if (!favoritoAEliminar || eliminando) return;

    setEliminando(true);
    setError("");
    setMensaje("");

    try {
      await eliminarFavorito(
        favoritoAEliminar.idFavorito
      );

      const idFavoritoEliminado =
        favoritoAEliminar.idFavorito;

      setFavoritos(prev =>
        prev.filter(
          fav =>
            Number(fav.idFavorito) !==
            Number(idFavoritoEliminado)
        )
      );

      setFavoritoAEliminar(null);

      setMensaje(
        "Producto eliminado de favoritos correctamente."
      );
    } catch (err) {
      console.error(
        "Error eliminando favorito:",
        err
      );

      setError(
        err?.message ||
          "No se pudo eliminar el producto de favoritos."
      );
    } finally {
      setEliminando(false);
    }
  };

  // =====================================================
  // LIMPIAR FILTROS
  // =====================================================

  const limpiarFiltros = () => {
    setBusquedaLocal("");
    setFiltro("todos");
    setOrden("recientes");
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <main className="cf-pagina">
        <div className="cf-contenedor">
          <div className="cf-loading">
            <div
              className="spinner-border text-primary"
              role="status"
            >
              <span className="visually-hidden">
                Cargando...
              </span>
            </div>

            <h2>Cargando tus favoritos</h2>

            <p>
              Estamos preparando los productos que
              guardaste.
            </p>
          </div>
        </div>
      </main>
    );
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <main className="cf-pagina">
      <div className="cf-contenedor">

        {/* ==========================================
            ENCABEZADO
        ========================================== */}

        <header className="cf-encabezado">
          <div className="cf-encabezado-texto">
            <span className="cf-etiqueta-superior">
              TU ESPACIO PERSONAL
            </span>

            <h1>
              <i className="bi bi-heart-fill"></i>
              Mis favoritos
            </h1>

            <p>
              Todos los productos que te gustan,
              organizados en un solo lugar.
            </p>
          </div>

          <Link
            to="/cliente"
            className="cf-volver"
          >
            <i className="bi bi-arrow-left"></i>
            Seguir explorando
          </Link>
        </header>

        {/* ==========================================
            MENSAJES
        ========================================== */}

        {error && (
          <div
            className="cf-alerta cf-alerta-error"
            role="alert"
          >
            <i className="bi bi-exclamation-circle"></i>

            <span>{error}</span>

            <button
              type="button"
              aria-label="Cerrar mensaje"
              onClick={() => setError("")}
            >
              <i className="bi bi-x-lg"></i>
            </button>
          </div>
        )}

        {mensaje && (
          <div
            className="cf-alerta cf-alerta-exito"
            role="status"
          >
            <i className="bi bi-check-circle"></i>

            <span>{mensaje}</span>

            <button
              type="button"
              aria-label="Cerrar mensaje"
              onClick={() => setMensaje("")}
            >
              <i className="bi bi-x-lg"></i>
            </button>
          </div>
        )}

        {/* ==========================================
            ESTADÍSTICAS
        ========================================== */}

        <section
          className="cf-estadisticas"
          aria-label="Resumen de favoritos"
        >
          <div className="cf-estadistica">
            <div className="cf-estadistica-icono cf-icono-rosa">
              <i className="bi bi-heart-fill"></i>
            </div>

            <div>
              <strong>{estadisticas.total}</strong>
              <span>Guardados</span>
            </div>
          </div>

          <div className="cf-estadistica">
            <div className="cf-estadistica-icono cf-icono-verde">
              <i className="bi bi-check-circle"></i>
            </div>

            <div>
              <strong>{estadisticas.disponibles}</strong>
              <span>Disponibles</span>
            </div>
          </div>

          <div className="cf-estadistica">
            <div className="cf-estadistica-icono cf-icono-azul">
              <i className="bi bi-tags"></i>
            </div>

            <div>
              <strong>{estadisticas.conOferta}</strong>
              <span>Con descuento</span>
            </div>
          </div>
        </section>

        {/* ==========================================
            BARRA DE FILTROS
        ========================================== */}

        <section
          className="cf-herramientas"
          aria-label="Buscar y filtrar favoritos"
        >
          <div className="cf-buscador">
            <i className="bi bi-search"></i>

            <input
              type="search"
              value={busquedaLocal}
              onChange={e =>
                setBusquedaLocal(e.target.value)
              }
              placeholder="Buscar entre tus favoritos..."
              aria-label="Buscar favoritos"
            />

            {busquedaLocal && (
              <button
                type="button"
                className="cf-limpiar-busqueda"
                onClick={() => setBusquedaLocal("")}
                aria-label="Limpiar búsqueda"
              >
                <i className="bi bi-x-lg"></i>
              </button>
            )}
          </div>

          <div className="cf-controles">
            <select
              value={filtro}
              onChange={e => setFiltro(e.target.value)}
              aria-label="Filtrar favoritos"
            >
              <option value="todos">
                Todos los productos
              </option>

              <option value="disponibles">
                Disponibles
              </option>

              <option value="ofertas">
                Con descuento
              </option>
            </select>

            <select
              value={orden}
              onChange={e => setOrden(e.target.value)}
              aria-label="Ordenar favoritos"
            >
              <option value="recientes">
                Orden original
              </option>

              <option value="precio-asc">
                Menor precio
              </option>

              <option value="precio-desc">
                Mayor precio
              </option>

              <option value="nombre">
                Nombre A-Z
              </option>
            </select>
          </div>
        </section>

        {/* ==========================================
            RESULTADOS
        ========================================== */}

        <div className="cf-resultados">
          <div>
            <h2>
              Productos guardados
            </h2>

            <p>
              {favoritosFiltrados.length} resultados
              encontrados
            </p>
          </div>
        </div>

        {/* ==========================================
            ESTADO VACÍO
        ========================================== */}

        {favoritos.length === 0 ? (
          <div className="cf-vacio">
            <div className="cf-vacio-icono">
              <i className="bi bi-heart"></i>
            </div>

            <h3>Aún no tienes favoritos</h3>

            <p>
              Guarda los productos que te gusten
              para encontrarlos fácilmente después.
            </p>

            <Link
              to="/cliente"
              className="cf-boton-principal"
            >
              <i className="bi bi-grid"></i>
              Explorar productos
            </Link>
          </div>
        ) : favoritosFiltrados.length === 0 ? (
          <div className="cf-vacio">
            <div className="cf-vacio-icono">
              <i className="bi bi-search"></i>
            </div>

            <h3>No encontramos coincidencias</h3>

            <p>
              Prueba con otro nombre o cambia
              los filtros de búsqueda.
            </p>

            <button
              type="button"
              className="cf-boton-principal"
              onClick={limpiarFiltros}
            >
              <i className="bi bi-arrow-clockwise"></i>
              Limpiar filtros
            </button>
          </div>
        ) : (
          <section className="cf-grid">
            {favoritosFiltrados.map(favorito => {
              const producto = favorito.producto;

              if (!producto) return null;

              const {
                promocion,
                precioOriginal,
                precioFinal,
                ahorro
              } = obtenerDatosPrecio(producto);

              const stock = Math.max(
                0,
                Number(producto.stock ?? 0)
              );

              const disponible =
                producto.activo !== false &&
                stock > 0;

              return (
                <article
                  className="cf-tarjeta"
                  key={favorito.idFavorito}
                >
                  {/* IMAGEN */}

                  <div className="cf-tarjeta-imagen">
                    <ImagenFavorito producto={producto} />

                    <div className="cf-etiquetas">
                      {promocion && (
                        <span className="cf-badge-oferta">
                          <i className="bi bi-tag-fill"></i>
                          -{Number(promocion.descuento || 0)}%
                        </span>
                      )}

                      {!disponible && (
                        <span className="cf-badge-agotado">
                          No disponible
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      className="cf-corazon"
                      title="Eliminar de favoritos"
                      aria-label={`Eliminar ${producto.nombre} de favoritos`}
                      onClick={() =>
                        confirmarEliminarFavorito(favorito)
                      }
                    >
                      <i className="bi bi-heart-fill"></i>
                    </button>
                  </div>

                  {/* INFORMACIÓN */}

                  <div className="cf-tarjeta-cuerpo">
                    <span className="cf-producto-etiqueta">
                      PRODUCTO FAVORITO
                    </span>

                    <Link
                      to={`/cliente/detalles/${producto.idProducto}`}
                      className="cf-nombre"
                    >
                      {producto.nombre}
                    </Link>

                    <p className="cf-descripcion">
                      {producto.descripcion ||
                        "Descubre los detalles de este producto."}
                    </p>

                    {/* PRECIO */}

                    <div className="cf-precios">
                      {promocion && ahorro > 0 && (
                        <span className="cf-precio-anterior">
                          {formatoPrecio(precioOriginal)}
                        </span>
                      )}

                      <strong className="cf-precio-actual">
                        {formatoPrecio(precioFinal)}
                      </strong>

                      {ahorro > 0 && (
                        <span className="cf-ahorro">
                          Ahorras {formatoPrecio(ahorro)}
                        </span>
                      )}
                    </div>

                    {/* STOCK */}

                    <div className="cf-stock">
                      {disponible ? (
                        <span className="cf-stock-disponible">
                          <i className="bi bi-check-circle-fill"></i>
                          Disponible
                          <small>
                            {stock} en stock
                          </small>
                        </span>
                      ) : (
                        <span className="cf-stock-agotado">
                          <i className="bi bi-exclamation-circle-fill"></i>
                          Producto no disponible
                        </span>
                      )}
                    </div>

                    {/* ACCIONES */}

                    <div className="cf-tarjeta-acciones">
                      <Link
                        to={`/cliente/detalles/${producto.idProducto}`}
                        className="cf-boton-ver"
                      >
                        Ver producto
                        <i className="bi bi-arrow-up-right"></i>
                      </Link>

                      <button
                        type="button"
                        className="cf-boton-quitar"
                        onClick={() =>
                          confirmarEliminarFavorito(favorito)
                        }
                        title="Quitar de favoritos"
                        aria-label={`Quitar ${producto.nombre} de favoritos`}
                      >
                        <i className="bi bi-trash3"></i>
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </div>

      {/* ==========================================
          MODAL DE CONFIRMACIÓN
      ========================================== */}

      {favoritoAEliminar && (
        <div
          className="cf-modal-overlay"
          role="presentation"
        >
          <div
            className="cf-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cf-modal-titulo"
          >
            <div className="cf-modal-icono">
              <i className="bi bi-heartbreak"></i>
            </div>

            <h2 id="cf-modal-titulo">
              ¿Quitar de favoritos?
            </h2>

            <p>
              Vas a eliminar{" "}
              <strong>
                {favoritoAEliminar.producto?.nombre ||
                  "este producto"}
              </strong>{" "}
              de tu lista de favoritos.
            </p>

            <div className="cf-modal-acciones">
              <button
                type="button"
                className="cf-modal-cancelar"
                disabled={eliminando}
                onClick={cancelarEliminacion}
              >
                Cancelar
              </button>

              <button
                type="button"
                className="cf-modal-confirmar"
                disabled={eliminando}
                onClick={ejecutarEliminacion}
              >
                {eliminando ? (
                  <>
                    <span className="spinner-border spinner-border-sm" />
                    Eliminando...
                  </>
                ) : (
                  <>
                    <i className="bi bi-trash3"></i>
                    Sí, quitar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default ClienteFavoritos;
