import React, {
  useEffect,
  useState
} from "react";

import {
  Link,
  useOutletContext
} from "react-router-dom";

import {
  obtenerFavoritosPorCliente,
  eliminarFavorito,
  obtenerPromocionesActivas
} from "../../services/data";


export function ClienteFavoritos() {

  const {
    busqueda
  } = useOutletContext() || {};


  const [
    favoritos,
    setFavoritos
  ] = useState([]);

  const [
    favoritosFiltrados,
    setFavoritosFiltrados
  ] = useState([]);

  const [
    promociones,
    setPromociones
  ] = useState([]);

  const [
    error,
    setError
  ] = useState("");

  const [
    loading,
    setLoading
  ] = useState(true);


  const idUsuario =
    localStorage.getItem(
      "idUsuario"
    );


  // =====================================================
  // CARGAR FAVORITOS + PROMOCIONES
  // =====================================================

  useEffect(() => {

    const fetchFavoritos =
      async () => {

        try {

          setLoading(true);

          setError("");


          const [
            data,
            dataPromociones
          ] = await Promise.all([
            obtenerFavoritosPorCliente(),
            obtenerPromocionesActivas()
          ]);


          const favoritosData =
            Array.isArray(data)
              ? data
              : [];


          setFavoritos(
            favoritosData
          );


          setFavoritosFiltrados(
            favoritosData
          );


          setPromociones(
            Array.isArray(
              dataPromociones
            )
              ? dataPromociones
              : []
          );

        } catch (err) {

          setError(
            "Error al cargar favoritos."
          );

          console.error(
            "Error al cargar favoritos:",
            err
          );

        } finally {

          setLoading(false);
        }
      };


    if (idUsuario) {

      fetchFavoritos();

    } else {

      setError(
        "Usuario no autenticado."
      );

      setLoading(false);
    }

  }, [idUsuario]);


  // =====================================================
  // FILTRO DE BÚSQUEDA
  // =====================================================

  useEffect(() => {

    if (!busqueda) {

      setFavoritosFiltrados(
        favoritos
      );

      return;
    }


    const texto =
      busqueda
        .trim()
        .toLowerCase();


    const filtrados =
      favoritos.filter(
        fav => {

          const producto =
            fav.producto;


          if (!producto) {
            return false;
          }


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


    setFavoritosFiltrados(
      filtrados
    );

  }, [
    busqueda,
    favoritos
  ]);


  // =====================================================
  // PROMOCIÓN DE PRODUCTO
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
  // ELIMINAR FAVORITO
  // =====================================================

  const toggleFavorito =
    async favorito => {

      const producto =
        favorito?.producto;


      if (!producto) {

        console.error(
          "Error: producto no definido en favorito",
          favorito
        );

        return;
      }


      try {

        await eliminarFavorito(
          favorito.idFavorito
        );


        setFavoritos(
          prev =>
            prev.filter(
              fav =>
                Number(
                  fav.idProducto
                ) !==
                Number(
                  producto.idProducto
                )
            )
        );

      } catch (error) {

        console.error(
          "Error al eliminar favorito:",
          error
        );


        setError(
          "No se pudo eliminar el producto de favoritos."
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
            Cargando favoritos...
          </p>

        </div>

      </div>
    );
  }


  // =====================================================
  // RENDER
  // =====================================================

  return (

    <div className="cliente-favoritos container mt-4">


      <div className="welcome-message text-center mb-4">

        <h1>
          Tus productos favoritos
        </h1>

        <p>
          Aquí están los productos que
          has guardado como favoritos.
        </p>

      </div>


      {error && (

        <div className="alert alert-danger">

          {error}

        </div>

      )}


      <div className="row">


        {favoritosFiltrados.length === 0 ? (

          <div className="text-center py-5">

            <i
              className="bi bi-heart"
              style={{
                fontSize: "3rem",
                color: "#9ca3af"
              }}
            ></i>


            <h4 className="mt-3">

              No tienes favoritos

            </h4>


            <p className="text-muted">

              Guarda productos para
              encontrarlos fácilmente después.

            </p>

          </div>

        ) : (

          favoritosFiltrados.map(
            favorito => {

              const producto =
                favorito.producto;


              if (!producto) {
                return null;
              }


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


              return (

                <div
                  className="col-md-3 col-sm-6 mb-4"
                  key={
                    favorito.idFavorito
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


                      {/* PRECIO */}

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


                          <strong className="text-success">

                            $

                            {
                              precioFinal
                                .toFixed(2)
                            }

                          </strong>


                          <small className="text-danger d-block mt-1">

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

                        <p className="h6 text-success">

                          $

                          {
                            precioFinal
                              .toFixed(2)
                          }

                        </p>

                      )}


                      {/* STOCK */}

                      <p className="small text-muted">

                        Stock:{" "}

                        <strong>

                          {
                            producto.stock ??
                            0
                          }

                        </strong>

                      </p>


                      {/* ACCIONES */}

                      <div className="button-group mt-auto d-flex justify-content-around">


                        <button
                          type="button"
                          className="btn btn-outline-danger btn-sm"
                          title="Eliminar de favoritos"
                          onClick={() =>
                            toggleFavorito(
                              favorito
                            )
                          }
                        >

                          <i className="bi bi-heart-fill text-danger"></i>

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


export default ClienteFavoritos;