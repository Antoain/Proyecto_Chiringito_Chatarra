import React, {
  useEffect,
  useMemo,
  useState
} from "react";

import {
  Link,
  useOutletContext
} from "react-router-dom";

import {
  obtenerProductos,
  obtenerFavoritosPorCliente,
  agregarFavorito,
  eliminarFavorito,
  obtenerPromocionesActivas
} from "../../services/data";

import "./ClientePagesCss/ClienteHome.css";


// =====================================================
// NORMALIZAR FAVORITO
// =====================================================

const normalizarFavorito = fav => ({
  idFavorito:
    fav.idFavorito ??
    fav.IdFavorito,

  idProducto:
    fav.idProducto ??
    fav.IdProducto
});


export function ClienteHome() {

  // =====================================================
  // CONTEXTO
  // =====================================================

  const {
    busqueda = ""
  } = useOutletContext() || {};


  // =====================================================
  // ESTADOS
  // =====================================================

  const [
    productos,
    setProductos
  ] = useState([]);

  const [
    favoritos,
    setFavoritos
  ] = useState([]);

  const [
    cargando,
    setCargando
  ] = useState(true);

  const [
    error,
    setError
  ] = useState("");

  const [
    favoritoProcesando,
    setFavoritoProcesando
  ] = useState(null);


  // =====================================================
  // FAVORITOS
  // =====================================================

  const refrescarFavoritos =
    async () => {

      try {

        const data =
          await obtenerFavoritosPorCliente();


        setFavoritos(
          Array.isArray(data)
            ? data.map(
                normalizarFavorito
              )
            : []
        );

      } catch (err) {

        console.error(
          "Error al obtener favoritos:",
          err
        );

        setFavoritos([]);
      }
    };


  // =====================================================
  // CARGA INICIAL
  // =====================================================

  useEffect(() => {

    const cargarDatos =
      async () => {

        try {

          setCargando(true);
          setError("");


          const [
            dataProductos,
            dataFavoritos,
            dataPromociones
          ] = await Promise.all([
            obtenerProductos(),
            obtenerFavoritosPorCliente(),
            obtenerPromocionesActivas()
          ]);


          setProductos(
            Array.isArray(dataProductos)
              ? dataProductos
              : []
          );


          setFavoritos(
            Array.isArray(dataFavoritos)
              ? dataFavoritos.map(
                  normalizarFavorito
                )
              : []
          );

          setPromociones(
            Array.isArray(dataPromociones)
              ? dataPromociones
              : []
          );

        } catch (err) {

          console.error(
            "Error cargando catálogo:",
            err
          );


          setError(
            err.message ||
            "No se pudo cargar el catálogo."
          );

        } finally {

          setCargando(false);
        }
      };


    cargarDatos();

  }, []);


  // =====================================================
  // PRODUCTOS VISIBLES
  // =====================================================

  const productosVisibles =
    useMemo(() => {

      const texto =
        busqueda
          .trim()
          .toLowerCase();


      return productos.filter(
        producto => {

          // Si el backend envía Activo/activo en false,
          // no mostramos el producto.
          const activo =
            producto.activo ??
            producto.Activo;


          if (activo === false) {
            return false;
          }


          if (!texto) {
            return true;
          }


          const contenido =
            [
              producto.nombre,
              producto.descripcion,
              producto.sku,
              producto
                .idCategoriaNavigation
                ?.descripcion,
              producto
                .idTiendaNavigation
                ?.nombreNegocio
            ]
              .filter(Boolean)
              .join(" ")
              .toLowerCase();


          return contenido.includes(
            texto
          );
        }
      );

    }, [
      productos,
      busqueda
    ]);


  // =====================================================
  // RESUMEN
  // =====================================================

  const resumen =
    useMemo(() => {

      const disponibles =
        productosVisibles.filter(
          producto =>
            Number(
              producto.stock || 0
            ) > 0
        ).length;


      const agotados =
        productosVisibles.filter(
          producto =>
            Number(
              producto.stock || 0
            ) <= 0
        ).length;


      return {
        total:
          productosVisibles.length,

        disponibles,

        agotados
      };

    }, [
      productosVisibles
    ]);


  // =====================================================
  // FAVORITO
  // =====================================================

  const esFavorito =
    producto => {

      return favoritos.some(
        favorito =>
          Number(
            favorito.idProducto
          ) ===
          Number(
            producto.idProducto
          )
      );
    };


  const toggleFavorito =
    async producto => {

      const idProducto =
        Number(
          producto.idProducto
        );


      if (!idProducto) {
        return;
      }


      const favoritosAnteriores =
        [...favoritos];


      const favoritoExistente =
        favoritos.find(
          favorito =>
            Number(
              favorito.idProducto
            ) ===
            idProducto
        );


      try {

        setFavoritoProcesando(
          idProducto
        );


        if (favoritoExistente) {

          // Actualización optimista
          setFavoritos(
            prev =>
              prev.filter(
                favorito =>
                  Number(
                    favorito.idProducto
                  ) !==
                  idProducto
              )
          );


          await eliminarFavorito(
            favoritoExistente.idFavorito
          );

        } else {

          // Favorito temporal
          setFavoritos(
            prev => [
              ...prev,
              {
                idFavorito: -1,
                idProducto
              }
            ]
          );


          await agregarFavorito(
            idProducto
          );
        }


        // Sincronizar contra backend
        await refrescarFavoritos();

      } catch (err) {

        console.error(
          "Error al modificar favorito:",
          err
        );


        setFavoritos(
          favoritosAnteriores
        );

      } finally {

        setFavoritoProcesando(
          null
        );
      }
    };


  // =====================================================
  // FORMATEADORES
  // =====================================================

  const obtenerPrecio =
    producto => {

      return Number(
        producto.precio || 0
      ).toFixed(2);
    };


  const obtenerStock =
    producto => {

      return Number(
        producto.stock || 0
      );
    };

  // =====================================================
  // Promociones
  // =====================================================


    const [
      promociones,
      setPromociones
    ] = useState([]);


    const obtenerPromocion =
  idProducto => {

    return promociones.find(
      promocion =>
        Number(
          promocion.idProducto
        ) ===
        Number(
          idProducto
        )
    ) || null;
  };


const obtenerPrecioMostrar =
  producto => {

    const promocion =
      obtenerPromocion(
        producto.idProducto
      );


    return promocion
      ? Number(
          promocion.precioFinal
        )
      : Number(
          producto.precio || 0
        );
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (cargando) {

    return (

      <div className="cliente-home-page">

        <div className="cliente-home-loading">

          <div className="spinner-border" />

          <p>
            Cargando catálogo...
          </p>

        </div>

      </div>
    );
  }


  // =====================================================
  // RENDER
  // =====================================================

  return (

    <div className="cliente-home-page">

      <div className="cliente-home-container">


        {/* ================================================= */}
        {/* HERO */}
        {/* ================================================= */}

        <section className="cliente-home-hero">


          <div className="cliente-home-hero-content">

            <span className="cliente-home-eyebrow">
              CHIRINGUITO CHATARRA
            </span>


            <h1>
              Encuentra lo que buscas
              en un solo lugar
            </h1>


            <p>
              Explora productos de diferentes
              tiendas, guarda tus favoritos y
              realiza tus compras fácilmente.
            </p>


            <div className="cliente-home-hero-info">


              <div>

                <i className="bi bi-box-seam"></i>

                <span>

                  <strong>
                    {resumen.total}
                  </strong>

                  productos

                </span>

              </div>


              <div>

                <i className="bi bi-check-circle"></i>

                <span>

                  <strong>
                    {resumen.disponibles}
                  </strong>

                  disponibles

                </span>

              </div>


            </div>

          </div>


          <div className="cliente-home-hero-icon">

            <i className="bi bi-shop"></i>

          </div>


        </section>


        {/* ================================================= */}
        {/* ERROR */}
        {/* ================================================= */}

        {error && (

          <div className="cliente-home-alert">

            <i className="bi bi-exclamation-circle"></i>

            {error}

          </div>

        )}


        {/* ================================================= */}
        {/* CABECERA CATÁLOGO */}
        {/* ================================================= */}

        <section className="cliente-catalog-header">


          <div>

            <span>
              CATÁLOGO
            </span>


            <h2>

              {
                busqueda
                  ? "Resultados de búsqueda"
                  : "Productos disponibles"
              }

            </h2>


            <p>

              {
                busqueda
                  ? `Resultados para "${busqueda}"`
                  : "Explora los productos disponibles en nuestras tiendas."
              }

            </p>

          </div>


          <div className="cliente-catalog-count">

            <strong>
              {productosVisibles.length}
            </strong>

            <span>

              {
                productosVisibles.length === 1
                  ? "producto"
                  : "productos"
              }

            </span>

          </div>


        </section>


        {/* ================================================= */}
        {/* CATÁLOGO */}
        {/* ================================================= */}

        {productosVisibles.length === 0 ? (

          <div className="cliente-home-empty">

            <div className="cliente-home-empty-icon">

              <i className="bi bi-search"></i>

            </div>


            <h3>
              No encontramos productos
            </h3>


            <p>

              {
                busqueda
                  ? "Prueba con otro término de búsqueda."
                  : "Todavía no hay productos disponibles."
              }

            </p>

          </div>

        ) : (

          <div className="cliente-product-grid">


            {productosVisibles.map(
              producto => {

                const stock =
                  obtenerStock(
                    producto
                  );
                
                const promocion =
                  obtenerPromocion(
                    producto.idProducto
                  );


                const favorito =
                  esFavorito(
                    producto
                  );


                const procesando =
                  favoritoProcesando ===
                  Number(
                    producto.idProducto
                  );


                return (

                  <article
                    key={
                      producto.idProducto
                    }
                    className="cliente-product-card"
                  >


                    {/* ===================================== */}
                    {/* IMAGEN */}
                    {/* ===================================== */}

                    <div className="cliente-product-image-wrapper">


                      {producto.rutaImagen ? (

                        <img
                          src={
                            producto.rutaImagen
                          }
                          alt={
                            producto.nombre
                          }
                          className="cliente-product-image"
                        />

                      ) : (

                        <div className="cliente-product-no-image">

                          <i className="bi bi-image"></i>

                          <span>
                            Sin imagen
                          </span>

                        </div>

                      )}


                      {/* FAVORITO */}

                      <button
                        type="button"
                        className={
                          favorito
                            ? "cliente-favorite-btn active"
                            : "cliente-favorite-btn"
                        }
                        disabled={
                          procesando
                        }
                        title={
                          favorito
                            ? "Eliminar de favoritos"
                            : "Agregar a favoritos"
                        }
                        onClick={() =>
                          toggleFavorito(
                            producto
                          )
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


                      {/* DESCUENTO */}

                      {promocion && (

                        <span className="cliente-product-discount">

                          -
                          {
                            Number(
                              promocion.descuento
                            )
                          }
                          %

                        </span>

                      )}


                      {/* STOCK */}

                      <span
                        className={
                          stock > 0
                            ? "cliente-product-stock disponible"
                            : "cliente-product-stock agotado"
                        }
                      >

                        {
                          stock > 0
                            ? "Disponible"
                            : "Agotado"
                        }

                      </span>


                    </div>


                    {/* ===================================== */}
                    {/* CONTENIDO */}
                    {/* ===================================== */}

                    <div className="cliente-product-body">


                      <div className="cliente-product-top">


                        <div>

                          <span className="cliente-product-sku">

                            {
                              producto.sku
                                ? `SKU ${producto.sku}`
                                : `Producto #${producto.idProducto}`
                            }

                          </span>


                          <h3>

                            {
                              producto.nombre
                            }

                          </h3>

                        </div>


                      </div>


                      <p className="cliente-product-description">

                        {
                          producto.descripcion ||
                          "Sin descripción disponible."
                        }

                      </p>


                      <div className="cliente-product-meta">


                        <span>

                          <i className="bi bi-box"></i>

                          Stock:{" "}

                          <strong>
                            {stock}
                          </strong>

                        </span>


                        {
                          producto
                            .idTiendaNavigation
                            ?.nombreNegocio && (

                            <span>

                              <i className="bi bi-shop"></i>

                              {
                                producto
                                  .idTiendaNavigation
                                  .nombreNegocio
                              }

                            </span>

                          )
                        }


                      </div>


                      {/* ================================= */}
                      {/* FOOTER */}
                      {/* ================================= */}

                      <div className="cliente-product-footer">


                        <div className="cliente-product-price">

                        <span>
                          Precio
                        </span>


                        {promocion ? (

                          <>

                            <small className="cliente-product-old-price">

                              $
                              {
                                Number(
                                  promocion.precioOriginal
                                ).toFixed(2)
                              }

                            </small>


                            <strong>

                              $

                              {
                                Number(
                                  promocion.precioFinal
                                ).toFixed(2)
                              }

                            </strong>

                          </>

                        ) : (

                          <strong>

                            $

                            {
                              Number(
                                producto.precio || 0
                              ).toFixed(2)
                            }

                          </strong>

                        )}

                      </div>


                        <Link
                          to={
                            `/cliente/detalles/${producto.idProducto}`
                          }
                          className="cliente-product-detail-btn"
                        >

                          Ver producto

                          <i className="bi bi-arrow-right"></i>

                        </Link>


                      </div>


                    </div>


                  </article>

                );
              }
            )}


          </div>

        )}


      </div>

    </div>
  );
}


export default ClienteHome;