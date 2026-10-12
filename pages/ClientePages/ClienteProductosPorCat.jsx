
import React, {
  useEffect,
  useMemo,
  useState
} from "react";

import {
  Link,
  useParams,
  useOutletContext
} from "react-router-dom";

import {
  obtenerProductosPorCategoria,
  obtenerCategoriaPorId,
  obtenerFavoritosPorCliente,
  agregarFavorito,
  eliminarFavorito,
  obtenerPromocionesActivas
} from "../../services/data";

import "./ClientePagesCss/ProductosPorCategoria.css";

// =====================================================
// HELPERS
// =====================================================

const dinero = valor =>
  `$${Number(valor || 0).toFixed(2)}`;

const normalizarFavoritos = data =>
  (Array.isArray(data) ? data : []).map(fav => ({
    idProducto: fav.idProducto ?? fav.IdProducto,
    idFavorito: fav.idFavorito ?? fav.IdFavorito
  }));

function ImagenCategoria({ producto }) {
  const [fallo, setFallo] = useState(false);

  useEffect(() => {
    setFallo(false);
  }, [producto.rutaImagen]);

  if (!producto.rutaImagen || fallo) {
    return (
      <div className="cpc-sin-imagen">
        <i className="bi bi-image"></i>
        <span>Imagen no disponible</span>
      </div>
    );
  }

  return (
    <img
      className="cpc-imagen"
      src={producto.rutaImagen}
      alt={producto.nombre || "Producto"}
      loading="lazy"
      onError={() => setFallo(true)}
    />
  );
}

// =====================================================
// COMPONENTE PRINCIPAL
// =====================================================

export function ProductosPorCategoria() {
  const { idCategoria } = useParams();

  const { busqueda = "" } = useOutletContext() || {};

  const [productos, setProductos] = useState([]);
  const [favoritos, setFavoritos] = useState([]);
  const [promociones, setPromociones] = useState([]);

  const [categoriaNombre, setCategoriaNombre] =
    useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const [filtro, setFiltro] = useState("todos");
  const [orden, setOrden] = useState("defecto");
  const [busquedaLocal, setBusquedaLocal] = useState("");

  const [favoritoProcesando, setFavoritoProcesando] =
    useState(null);

  const idUsuario = localStorage.getItem("idUsuario");

  // =====================================================
  // CARGAR CATEGORÍA Y PRODUCTOS
  // =====================================================

  useEffect(() => {
    let activo = true;

    const cargarDatos = async () => {
      setLoading(true);
      setError("");
      setMensaje("");
      setProductos([]);
      setPromociones([]);
      setCategoriaNombre("");

      try {
        const [
          resultadoCategoria,
          resultadoProductos,
          resultadoPromociones
        ] = await Promise.allSettled([
          obtenerCategoriaPorId(idCategoria),
          obtenerProductosPorCategoria(idCategoria),
          obtenerPromocionesActivas()
        ]);

        if (!activo) return;

        if (resultadoProductos.status === "rejected") {
          throw resultadoProductos.reason;
        }

        const listaProductos = resultadoProductos.value;

        setProductos(
          Array.isArray(listaProductos)
            ? listaProductos
            : []
        );

        if (resultadoCategoria.status === "fulfilled") {
          setCategoriaNombre(
            resultadoCategoria.value?.descripcion ||
            "Productos de la categoría"
          );
        } else {
          setCategoriaNombre("Productos de la categoría");
        }

        if (resultadoPromociones.status === "fulfilled") {
          setPromociones(
            Array.isArray(resultadoPromociones.value)
              ? resultadoPromociones.value
              : []
          );
        } else {
          // No rompemos el catálogo si fallan promociones.
          setPromociones([]);
        }
      } catch (err) {
        if (!activo) return;

        console.error(
          "Error al cargar categoría:",
          err
        );

        if (err?.status === 404) {
          setProductos([]);
        } else {
          setError(
            err?.message ||
            "No se pudieron cargar los productos."
          );
        }
      } finally {
        if (activo) setLoading(false);
      }
    };

    cargarDatos();

    return () => {
      activo = false;
    };
  }, [idCategoria]);

  // =====================================================
  // CARGAR FAVORITOS
  // =====================================================

  useEffect(() => {
    let activo = true;

    if (!idUsuario) {
      setFavoritos([]);
      return;
    }

    const cargarFavoritos = async () => {
      try {
        const data =
          await obtenerFavoritosPorCliente();

        if (activo) {
          setFavoritos(normalizarFavoritos(data));
        }
      } catch (err) {
        console.error(
          "Error al cargar favoritos:",
          err
        );

        if (activo) {
          setFavoritos([]);
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

    promociones.forEach(promo => {
      mapa.set(
        Number(promo.idProducto),
        promo
      );
    });

    return mapa;
  }, [promociones]);

  const obtenerPrecio = producto => {
    const promo = promocionesPorProducto.get(
      Number(producto.idProducto)
    );

    const precioOriginal = Number(
      promo?.precioOriginal ??
      producto.precio ??
      0
    );

    const precioFinal = Number(
      promo?.precioFinal ??
      producto.precio ??
      0
    );

    const ahorro = Math.max(
      0,
      precioOriginal - precioFinal
    );

    return {
      promo,
      precioOriginal,
      precioFinal,
      ahorro
    };
  };

  // =====================================================
  // FILTROS Y ORDEN
  // =====================================================

  const productosVisibles = useMemo(() => {
    const texto = String(
      busquedaLocal || busqueda
    )
      .trim()
      .toLowerCase();

    const filtrados = productos.filter(producto => {
      const activo =
        (producto.activo ?? producto.Activo) !== false;

      if (!activo) return false;

      const contenido = [
        producto.nombre,
        producto.descripcion,
        producto.sku,
        producto.idTiendaNavigation?.nombreNegocio
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      if (texto && !contenido.includes(texto)) {
        return false;
      }

      const disponible =
        Number(producto.stock ?? 0) > 0;

      const tienePromocion =
        promocionesPorProducto.has(
          Number(producto.idProducto)
        );

      if (filtro === "disponibles") {
        return disponible;
      }

      if (filtro === "promociones") {
        return tienePromocion;
      }

      return true;
    });

    filtrados.sort((a, b) => {
      const promoA = promocionesPorProducto.get(
        Number(a.idProducto)
      );

      const promoB = promocionesPorProducto.get(
        Number(b.idProducto)
      );

      const precioA = Number(
        promoA?.precioFinal ?? a.precio ?? 0
      );

      const precioB = Number(
        promoB?.precioFinal ?? b.precio ?? 0
      );

      switch (orden) {
        case "precio-asc":
          return precioA - precioB;

        case "precio-desc":
          return precioB - precioA;

        case "nombre":
          return String(a.nombre || "")
            .localeCompare(
              String(b.nombre || ""),
              "es"
            );

        default:
          return 0;
      }
    });

    return filtrados;
  }, [
    productos,
    busquedaLocal,
    busqueda,
    filtro,
    orden,
    promocionesPorProducto
  ]);

  // =====================================================
  // ESTADÍSTICAS
  // =====================================================

  const estadisticas = useMemo(() => {
    const activos = productos.filter(
      producto =>
        (producto.activo ?? producto.Activo) !== false
    );

    return {
      total: activos.length,

      disponibles: activos.filter(
        producto =>
          Number(producto.stock ?? 0) > 0
      ).length,

      ofertas: activos.filter(
        producto =>
          promocionesPorProducto.has(
            Number(producto.idProducto)
          )
      ).length
    };
  }, [productos, promocionesPorProducto]);

  // =====================================================
  // FAVORITOS
  // =====================================================

  const esFavorito = idProducto =>
    favoritos.some(
      fav =>
        Number(fav.idProducto) ===
        Number(idProducto)
    );

  const toggleFavorito = async producto => {
    if (!idUsuario) {
      setMensaje(
        "Debes iniciar sesión para guardar favoritos."
      );
      return;
    }

    const idProducto = Number(producto.idProducto);

    if (
      !idProducto ||
      favoritoProcesando !== null
    ) {
      return;
    }

    setMensaje("");

    const anteriores = [...favoritos];

    const favoritoExistente = favoritos.find(
      fav =>
        Number(fav.idProducto) === idProducto
    );

    setFavoritoProcesando(idProducto);

    try {
      if (favoritoExistente) {
        setFavoritos(prev =>
          prev.filter(
            fav =>
              Number(fav.idProducto) !==
              idProducto
          )
        );

        await eliminarFavorito(
          favoritoExistente.idFavorito
        );
      } else {
        setFavoritos(prev => [
          ...prev,
          {
            idProducto,
            idFavorito: -1
          }
        ]);

        await agregarFavorito(idProducto);
      }

      const actualizados =
        await obtenerFavoritosPorCliente();

      setFavoritos(
        normalizarFavoritos(actualizados)
      );

      setMensaje(
        favoritoExistente
          ? "Producto eliminado de favoritos."
          : "Producto agregado a favoritos."
      );
    } catch (err) {
      console.error(
        "Error al actualizar favorito:",
        err
      );

      setFavoritos(anteriores);

      setMensaje(
        err?.message ||
        "No se pudo actualizar el favorito."
      );
    } finally {
      setFavoritoProcesando(null);
    }
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <main className="cpc-pagina">
      <div className="cpc-contenedor">

        {/* NAVEGACIÓN */}

        <nav
          className="cpc-migas"
          aria-label="Navegación de categoría"
        >
          <Link to="/cliente">
            <i className="bi bi-house-door"></i>
            Inicio
          </Link>

          <i className="bi bi-chevron-right"></i>

          <span>
            {categoriaNombre || "Categoría"}
          </span>
        </nav>

        {/* HERO */}

        <header className="cpc-hero">
          <div className="cpc-hero-contenido">
            <span className="cpc-eyebrow">
              CHIRINGUITO CHATARRA
            </span>

            <h1>
              {categoriaNombre ||
                "Explora nuestra categoría"}
            </h1>

            <p>
              Encuentra productos de distintas tiendas,
              compara precios y descubre nuevas ofertas.
            </p>

            <div className="cpc-hero-estadisticas">
              <span>
                <i className="bi bi-box-seam"></i>
                <strong>{estadisticas.total}</strong>
                productos
              </span>

              <span>
                <i className="bi bi-check-circle"></i>
                <strong>
                  {estadisticas.disponibles}
                </strong>
                disponibles
              </span>

              <span>
                <i className="bi bi-tags"></i>
                <strong>{estadisticas.ofertas}</strong>
                con oferta
              </span>
            </div>
          </div>

          <div className="cpc-hero-icono">
            <i className="bi bi-grid-3x3-gap"></i>
          </div>
        </header>

        {/* MENSAJES */}

        {error && (
          <div
            className="cpc-alerta cpc-alerta-error"
            role="alert"
          >
            <i className="bi bi-exclamation-circle"></i>
            <span>{error}</span>
          </div>
        )}

        {mensaje && (
          <div
            className="cpc-alerta cpc-alerta-info"
            role="status"
          >
            <i className="bi bi-info-circle"></i>

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

        {/* CABECERA DEL CATÁLOGO */}

        <section className="cpc-catalogo">
          <div className="cpc-catalogo-header">
            <div>
              <span className="cpc-seccion-etiqueta">
                CATÁLOGO DE PRODUCTOS
              </span>

              <h2>
                Productos de esta categoría
              </h2>

              <p>
                {loading
                  ? "Cargando productos..."
                  : `${productosVisibles.length} ${
                      productosVisibles.length === 1
                        ? "producto encontrado"
                        : "productos encontrados"
                    }`}
              </p>
            </div>
          </div>

          {/* FILTROS */}

          <div className="cpc-herramientas">
            <div className="cpc-buscador">
              <i className="bi bi-search"></i>

              <input
                type="search"
                value={busquedaLocal}
                onChange={e =>
                  setBusquedaLocal(e.target.value)
                }
                placeholder="Buscar en esta categoría..."
                aria-label="Buscar productos en la categoría"
              />

              {busquedaLocal && (
                <button
                  type="button"
                  onClick={() => setBusquedaLocal("")}
                  aria-label="Limpiar búsqueda"
                >
                  <i className="bi bi-x-lg"></i>
                </button>
              )}
            </div>

            <div className="cpc-filtros">
              <select
                value={filtro}
                onChange={e =>
                  setFiltro(e.target.value)
                }
                aria-label="Filtrar productos"
              >
                <option value="todos">
                  Todos los productos
                </option>

                <option value="disponibles">
                  Con stock
                </option>

                <option value="promociones">
                  Con descuento
                </option>
              </select>

              <select
                value={orden}
                onChange={e =>
                  setOrden(e.target.value)
                }
                aria-label="Ordenar productos"
              >
                <option value="defecto">
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
          </div>

          {/* PRODUCTOS */}

          {loading ? (
            <div className="cpc-estado">
              <div
                className="spinner-border text-primary"
                role="status"
              >
                <span className="visually-hidden">
                  Cargando...
                </span>
              </div>

              <h3>Cargando productos</h3>

              <p>
                Estamos preparando el catálogo.
              </p>
            </div>
          ) : productosVisibles.length === 0 ? (
            <div className="cpc-estado">
              <div className="cpc-estado-icono">
                <i className="bi bi-search"></i>
              </div>

              <h3>
                No encontramos productos
              </h3>

              <p>
                {busquedaLocal || busqueda
                  ? "Prueba con otro término de búsqueda."
                  : "No hay productos que coincidan con los filtros seleccionados."}
              </p>

              <button
                type="button"
                className="cpc-boton-primario"
                onClick={() => {
                  setBusquedaLocal("");
                  setFiltro("todos");
                  setOrden("defecto");
                }}
              >
                <i className="bi bi-arrow-clockwise"></i>
                Limpiar filtros
              </button>
            </div>
          ) : (
            <div className="cpc-grid">
              {productosVisibles.map(producto => {
                const stock = Number(
                  producto.stock ?? 0
                );

                const {
                  promo,
                  precioOriginal,
                  precioFinal,
                  ahorro
                } = obtenerPrecio(producto);

                const favorito = esFavorito(
                  producto.idProducto
                );

                const procesando =
                  favoritoProcesando ===
                  Number(producto.idProducto);

                return (
                  <article
                    className="cpc-tarjeta"
                    key={producto.idProducto}
                  >
                    <div className="cpc-tarjeta-imagen">
                      <Link
                        to={`/cliente/detalles/${producto.idProducto}`}
                        aria-label={`Ver ${producto.nombre}`}
                      >
                        <ImagenCategoria
                          producto={producto}
                        />
                      </Link>

                      {promo && ahorro > 0 && (
                        <span className="cpc-badge-oferta">
                          <i className="bi bi-tag-fill"></i>
                          -{Number(promo.descuento || 0)}%
                        </span>
                      )}

                      <span
                        className={
                          stock > 0
                            ? "cpc-badge-stock disponible"
                            : "cpc-badge-stock agotado"
                        }
                      >
                        {stock > 0
                          ? "Disponible"
                          : "Agotado"}
                      </span>

                      <button
                        type="button"
                        className={
                          favorito
                            ? "cpc-corazon activo"
                            : "cpc-corazon"
                        }
                        title={
                          favorito
                            ? "Eliminar de favoritos"
                            : "Agregar a favoritos"
                        }
                        aria-label={
                          favorito
                            ? `Eliminar ${producto.nombre} de favoritos`
                            : `Agregar ${producto.nombre} a favoritos`
                        }
                        disabled={
                          procesando ||
                          favoritoProcesando !== null
                        }
                        onClick={() =>
                          toggleFavorito(producto)
                        }
                      >
                        {procesando ? (
                          <span className="spinner-border spinner-border-sm" />
                        ) : (
                          <i
                            className={
                              favorito
                                ? "bi bi-heart-fill"
                                : "bi bi-heart"
                            }
                          ></i>
                        )}
                      </button>
                    </div>

                    <div className="cpc-tarjeta-cuerpo">
                      <span className="cpc-sku">
                        {producto.sku
                          ? `SKU ${producto.sku}`
                          : `PRODUCTO #${producto.idProducto}`}
                      </span>

                      <Link
                        to={`/cliente/detalles/${producto.idProducto}`}
                        className="cpc-producto-nombre"
                      >
                        {producto.nombre}
                      </Link>

                      <p className="cpc-descripcion">
                        {producto.descripcion ||
                          "Sin descripción disponible."}
                      </p>

                      <div className="cpc-meta">
                        <span>
                          <i className="bi bi-box"></i>
                          Stock: {stock}
                        </span>

                        {producto.idTiendaNavigation
                          ?.nombreNegocio && (
                          <span>
                            <i className="bi bi-shop"></i>
                            {
                              producto.idTiendaNavigation
                                .nombreNegocio
                            }
                          </span>
                        )}
                      </div>

                      <div className="cpc-precios">
                        {ahorro > 0 && (
                          <span className="cpc-precio-original">
                            {dinero(precioOriginal)}
                          </span>
                        )}

                        <strong className="cpc-precio-final">
                          {dinero(precioFinal)}
                        </strong>

                        {ahorro > 0 && (
                          <span className="cpc-ahorro">
                            Ahorras {dinero(ahorro)}
                          </span>
                        )}
                      </div>

                      <Link
                        className="cpc-boton-detalle"
                        to={`/cliente/detalles/${producto.idProducto}`}
                      >
                        Ver producto
                        <i className="bi bi-arrow-up-right"></i>
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default ProductosPorCategoria;
