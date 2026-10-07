import React, {
  useEffect,
  useState
} from "react";

import {
  useParams,
  Link,
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


export function ProductosPorCategoria() {

  const {
    idCategoria
  } = useParams();


  const {
    busqueda = ""
  } = useOutletContext() || {};


  const [
    productos,
    setProductos
  ] = useState([]);

  const [
    favoritos,
    setFavoritos
  ] = useState([]);

  const [
    promociones,
    setPromociones
  ] = useState([]);

  const [
    productosFiltrados,
    setProductosFiltrados
  ] = useState([]);

  const [
    categoriaNombre,
    setCategoriaNombre
  ] = useState("");

  const [
    loading,
    setLoading
  ] = useState(true);

  const [
    error,
    setError
  ] = useState("");

  const [
    favoritoProcesando,
    setFavoritoProcesando
  ] = useState(null);


  const idUsuario =
    localStorage.getItem(
      "idUsuario"
    );


  // =====================================================
  // NORMALIZAR FAVORITOS
  // =====================================================

  const normalizarFavoritos =
    data => {

      return (
        Array.isArray(data)
          ? data
          : []
      ).map(
        fav => ({

          idProducto:
            fav.IdProducto ??
            fav.idProducto,

          idFavorito:
            fav.IdFavorito ??
            fav.idFavorito
        })
      );
    };


  // =====================================================
  // CARGAR CATEGORÍA + PRODUCTOS + PROMOCIONES
  // =====================================================

  useEffect(() => {

    const fetchDatos =
      async () => {

        try {

          setLoading(true);

          setError("");


          const [
            categoria,
            productosData,
            promocionesData
          ] = await Promise.all([
            obtenerCategoriaPorId(
              idCategoria
            ),

            obtenerProductosPorCategoria(
              idCategoria
            ),

            obtenerPromocionesActivas()
          ]);


          if (categoria) {

            setCategoriaNombre(
              categoria.descripcion ||
              "Desconocida"
            );
          }


          const listaProductos =
            Array.isArray(
              productosData
            )
              ? productosData
              : [];


          setProductos(
            listaProductos
          );


          setProductosFiltrados(
            listaProductos
          );


          setPromociones(
            Array.isArray(
              promocionesData
            )
              ? promocionesData
              : []
          );

        } catch (error) {

          console.error(
            "Error al obtener datos:",
            error
          );


          setError(
            error.message ||
            "No se pudieron cargar los productos."
          );

        } finally {

          setLoading(false);
        }
      };


    fetchDatos();

  }, [idCategoria]);


  // =====================================================
  // CARGAR FAVORITOS
  // =====================================================

  useEffect(() => {

    const fetchFavoritos =
      async () => {

        try {

          const data =
            await obtenerFavoritosPorCliente();


          setFavoritos(
            normalizarFavoritos(
              data
            )
          );

        } catch (error) {

          console.error(
            "Error al obtener favoritos:",
            error
          );


          setFavoritos(
            []
          );
        }
      };


    if (idUsuario) {

      fetchFavoritos();
    }

  }, [idUsuario]);


  // =====================================================
  // FILTRO DE BÚSQUEDA
  // =====================================================

  useEffect(() => {

    if (!busqueda.trim()) {

      setProductosFiltrados(
        productos
      );

      return;
    }


    const texto =
      busqueda
        .trim()
        .toLowerCase();


    const filtrados =
      productos.filter(
        producto => {

          const contenido =
            [
              producto.nombre,
              producto.descripcion,
              producto.sku
            ]
              .filter(Boolean)
              .join(" ")
              .toLowerCase();


          return contenido.includes(
            texto
          );
        }
      );


    setProductosFiltrados(
      filtrados
    );

  }, [
    busqueda,
    productos
  ]);


  // =====================================================
  // PROMOCIÓN
  // =====================================================

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


  // =====================================================
  // FAVORITO
  // =====================================================

  const isFavorito =
    producto => {

      return favoritos.some(
        fav =>
          Number(
            fav.idProducto
          ) ===
          Number(
            producto.idProducto
          )
      );
    };


  // =====================================================
  // TOGGLE FAVORITO
  // =====================================================

  const toggleFavorito =
    async producto => {

      const productoId =
        Number(
          producto.idProducto
        );


      const favoritoEncontrado =
        favoritos.find(
          fav =>
            Number(
              fav.idProducto
            ) ===
            productoId
        );


      const favoritosAnteriores =
        [...favoritos];


      try {

        setFavoritoProcesando(
          productoId
        );


        if (
          favoritoEncontrado &&
          favoritoEncontrado.idFavorito
        ) {

          setFavoritos(
            prev =>
              prev.filter(
                fav =>
                  Number(
                    fav.idProducto
                  ) !==
                  productoId
              )
          );


          await eliminarFavorito(
            favoritoEncontrado.idFavorito
          );

        } else {

          setFavoritos(
            prev => [
              ...prev,
              {
                idFavorito: -1,
                idProducto:
                  productoId
              }
            ]
          );


          await agregarFavorito(
            productoId
          );
        }


        const data =
          await obtenerFavoritosPorCliente();


        setFavoritos(
          normalizarFavoritos(
            data
          )
        );

      } catch (error) {

        console.error(
          "Error en toggleFavorito:",
          error
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
  // LOADING
  // =====================================================

  if (loading) {

    return (

      <div className="container mt-4">

        <div className="text-center py-5">

          <div className="spinner-border mb-3" />

          <p>
            Cargando productos...
          </p>

        </div>

      </div>
    );
  }


  // =====================================================
  // RENDER
  // =====================================================

  return (

    <div className="container mt-4">


      <div className="mb-4">

        <h2>

          Productos de la categoría:{" "}

          {
            categoriaNombre ||
            "Desconocida"
          }

        </h2>


        <p className="text-muted">

          {
            productosFiltrados.length
          }

          {" "}

          {
            productosFiltrados.length === 1
              ? "producto disponible"
              : "productos disponibles"
          }

        </p>

      </div>


      {error && (

        <div className="alert alert-danger">

          {error}

        </div>

      )}


      <div className="row g-4">


        {productosFiltrados.length === 0 ? (

          <div className="text-center py-5">

            <i
              className="bi bi-search"
              style={{
                fontSize: "3rem",
                color: "#9ca3af"
              }}
            ></i>


            <h4 className="mt-3">

              No se encontraron productos

            </h4>


            <p className="text-muted">

              {
                busqueda
                  ? "Prueba con otro término de búsqueda."
                  : "No hay productos disponibles en esta categoría."
              }

            </p>

          </div>

        ) : (

          productosFiltrados.map(
            producto => {

              const promocion =
                obtenerPromocion(
                  producto.idProducto
                );


              const precioOriginal =
                Number(
                  promocion
                    ?.precioOriginal ??
                  producto.precio ??
                  0
                );


              const precioFinal =
                promocion
                  ? Number(
                      promocion.precioFinal ||
                      0
                    )
                  : Number(
                      producto.precio ||
                      0
                    );


              const favorito =
                isFavorito(
                  producto
                );


              const procesando =
                favoritoProcesando ===
                Number(
                  producto.idProducto
                );


              const stock =
                Number(
                  producto.stock ||
                  0
                );


              return (

                <div
                  className="col-xl-3 col-lg-4 col-md-6"
                  key={
                    producto.idProducto
                  }
                >

                  <div className="card h-100">


                    {/* ===================================== */}
                    {/* IMAGEN */}
                    {/* ===================================== */}

                    <div className="position-relative">


                      {producto.rutaImagen ? (

                        <img
                          src={
                            producto.rutaImagen
                          }
                          className="card-img-top"
                          alt={
                            producto.nombre
                          }
                          style={{
                            height: "220px",
                            objectFit: "cover"
                          }}
                        />

                      ) : (

                        <div
                          className="card-img-top d-flex flex-column align-items-center justify-content-center bg-light"
                          style={{
                            height: "220px"
                          }}
                        >

                          <i
                            className="bi bi-image text-muted"
                            style={{
                              fontSize: "2rem"
                            }}
                          ></i>


                          <small className="text-muted mt-2">

                            Sin imagen

                          </small>

                        </div>

                      )}


                      {/* DESCUENTO */}

                      {promocion && (

                        <span className="badge bg-danger discount-badge">

                          -
                          {
                            Number(
                              promocion.descuento ||
                              0
                            )
                          }
                          %

                        </span>

                      )}


                      {/* STOCK */}

                      {stock <= 0 && (

                        <span
                          className="badge bg-secondary position-absolute top-0 end-0 m-2"
                        >

                          Agotado

                        </span>

                      )}


                    </div>


                    {/* ===================================== */}
                    {/* BODY */}
                    {/* ===================================== */}

                    <div className="card-body d-flex flex-column">


                      <h5 className="card-title">

                        {
                          producto.nombre
                        }

                      </h5>


                      <p className="card-text small text-truncate">

                        {
                          producto.descripcion ||
                          "Sin descripción"
                        }

                      </p>


                      <p className="small text-muted mb-2">

                        Stock:{" "}

                        <strong>
                          {stock}
                        </strong>

                      </p>


                      {/* ===================================== */}
                      {/* PRECIO */}
                      {/* ===================================== */}

                      {promocion ? (

                        <div className="mb-3">

                          <small
                            className="text-muted d-block"
                            style={{
                              textDecoration:
                                "line-through"
                            }}
                          >

                            $

                            {
                              precioOriginal
                                .toFixed(2)
                            }

                          </small>


                          <strong className="text-success fs-5">

                            $

                            {
                              precioFinal
                                .toFixed(2)
                            }

                          </strong>


                          <small className="text-danger d-block">

                            Ahorras{" $"}

                            {
                              (
                                precioOriginal -
                                precioFinal
                              ).toFixed(2)
                            }

                          </small>

                        </div>

                      ) : (

                        <p className="h6 text-success mb-3">

                          $

                          {
                            precioFinal
                              .toFixed(2)
                          }

                        </p>

                      )}


                      {/* ===================================== */}
                      {/* ACCIONES */}
                      {/* ===================================== */}

                      <div className="button-group mt-auto d-flex justify-content-around">


                        <button
                          type="button"
                          className="btn btn-outline-danger btn-sm"
                          title={
                            favorito
                              ? "Eliminar de favoritos"
                              : "Agregar a favoritos"
                          }
                          disabled={
                            procesando
                          }
                          onClick={() =>
                            toggleFavorito(
                              producto
                            )
                          }
                        >

                          {procesando ? (

                            <span className="spinner-border spinner-border-sm"></span>

                          ) : (

                            <i
                              className={
                                favorito
                                  ? "bi bi-heart-fill text-danger"
                                  : "bi bi-heart"
                              }
                            ></i>

                          )}

                        </button>


                        <Link
                          to={
                            `/cliente/detalles/${producto.idProducto}`
                          }
                          className="btn btn-secondary btn-sm"
                          title="Ver detalles"
                        >

                          Detalles

                        </Link>


                      </div>


                    </div>

                  </div>

                </div>

              );
            }
          )

        )}


      </div>

    </div>
  );
}


export default ProductosPorCategoria;