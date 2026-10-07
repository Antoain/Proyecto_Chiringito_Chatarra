import React, {
  useEffect,
  useRef,
  useState
} from "react";

import {
  useParams
} from "react-router-dom";

import {
  obtenerProductosPorId,
  obtenerFavoritosPorCliente,
  agregarFavorito,
  eliminarFavorito,
  obtenerResenasPorProducto,
  agregarResena,
  obtenerTiendaPorId,
  agregarCarrito,
  obtenerPromocionActiva
} from "../../services/data";

import "./ClientePagesCss/ClienteProductoDetail.css";


export function ClienteProductoDetalles() {

  const {
    idProducto
  } = useParams();


  const [
    producto,
    setProducto
  ] = useState(null);

  const [
    error,
    setError
  ] = useState("");

  const [
    favorito,
    setFavorito
  ] = useState(false);

  const [
    promocion,
    setPromocion
  ] = useState(null);

  const [
    resenas,
    setResenas
  ] = useState([]);

  const [
    tienda,
    setTienda
  ] = useState(null);

  const [
    nuevoRating,
    setNuevoRating
  ] = useState(5);

  const [
    nuevoComentario,
    setNuevoComentario
  ] = useState("");

  const [
    agregandoResena,
    setAgregandoResena
  ] = useState(false);

  const [
    mensajeCarrito,
    setMensajeCarrito
  ] = useState("");


  const idUsuario =
    localStorage.getItem(
      "idUsuario"
    );


  const resenasRef =
    useRef(null);


  // =====================================================
  // NORMALIZAR FAVORITOS
  // =====================================================

  const normalizarFavoritos =
    favData => {

      return (
        Array.isArray(favData)
          ? favData
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
  // CARGAR PRODUCTO
  // =====================================================

  useEffect(() => {

    async function fetchProducto() {

      try {

        const data =
          await obtenerProductosPorId(
            idProducto
          );


        setProducto(
          data
        );

      } catch (err) {

        setError(
          "Error al cargar el producto."
        );

        console.error(
          err
        );
      }
    }


    fetchProducto();

  }, [idProducto]);


  // =====================================================
  // CARGAR PROMOCIÓN
  // =====================================================

  useEffect(() => {

    const cargarPromocion =
      async () => {

        try {

          if (!idProducto) {
            return;
          }


          const data =
            await obtenerPromocionActiva(
              idProducto
            );


          if (
            data?.tienePromocion
          ) {

            setPromocion(
              data
            );

          } else {

            setPromocion(
              null
            );
          }

        } catch (error) {

          console.error(
            "Error cargando promoción:",
            error
          );


          setPromocion(
            null
          );
        }
      };


    cargarPromocion();

  }, [idProducto]);


  // =====================================================
  // CARGAR TIENDA
  // =====================================================

  useEffect(() => {

    async function fetchTienda() {

      try {

        if (
          producto?.idTienda
        ) {

          const dataTienda =
            await obtenerTiendaPorId(
              producto.idTienda
            );


          setTienda(
            dataTienda
          );
        }

      } catch (err) {

        console.error(
          "Error al obtener la tienda:",
          err
        );
      }
    }


    fetchTienda();

  }, [producto]);


  // =====================================================
  // FAVORITOS
  // =====================================================

  useEffect(() => {

    async function fetchFavoritos() {

      try {

        if (
          idUsuario &&
          producto
        ) {

          const favData =
            await obtenerFavoritosPorCliente();


          const normalized =
            normalizarFavoritos(
              favData
            );


          const exists =
            normalized.some(
              fav =>
                Number(
                  fav.idProducto
                ) ===
                Number(
                  producto.idProducto
                )
            );


          setFavorito(
            exists
          );
        }

      } catch (err) {

        console.error(
          "Error al verificar favoritos:",
          err
        );
      }
    }


    fetchFavoritos();

  }, [
    idUsuario,
    producto
  ]);


  // =====================================================
  // RESEÑAS
  // =====================================================

  useEffect(() => {

    async function fetchResenas() {

      try {

        if (idProducto) {

          const data =
            await obtenerResenasPorProducto(
              idProducto
            );


          setResenas(
            Array.isArray(data)
              ? data
              : []
          );
        }

      } catch (err) {

        console.error(
          "Error al obtener reseñas:",
          err
        );
      }
    }


    fetchResenas();

  }, [idProducto]);


  // =====================================================
  // PROMEDIO
  // =====================================================

  const promedioCalificacion =
    resenas.length > 0
      ? (
          resenas.reduce(
            (
              sum,
              r
            ) =>
              sum +
              Number(
                r.calificacion || 0
              ),
            0
          ) /
          resenas.length
        ).toFixed(1)
      : null;


  // =====================================================
  // PRECIO
  // =====================================================

  const precioOriginal =
    Number(
      promocion?.precioOriginal ??
      producto?.precio ??
      0
    );


  const precioFinal =
    promocion
      ? Number(
          promocion.precioFinal ||
          0
        )
      : Number(
          producto?.precio ||
          0
        );


  const ahorro =
    promocion
      ? precioOriginal -
        precioFinal
      : 0;


  // =====================================================
  // TOGGLE FAVORITO
  // =====================================================

  const toggleFavorito =
    async () => {

      if (
        !producto ||
        !idUsuario
      ) {
        return;
      }


      const productoId =
        Number(
          producto.idProducto
        );


      try {

        const favData =
          await obtenerFavoritosPorCliente();


        const normalized =
          normalizarFavoritos(
            favData
          );


        const favFound =
          normalized.find(
            fav =>
              Number(
                fav.idProducto
              ) ===
              productoId
          );


        if (
          favorito &&
          favFound?.idFavorito
        ) {

          await eliminarFavorito(
            favFound.idFavorito
          );


          setFavorito(
            false
          );

        } else {

          await agregarFavorito(
            productoId
          );


          setFavorito(
            true
          );
        }

      } catch (err) {

        console.error(
          "Error al manejar el favorito:",
          err
        );
      }
    };


  // =====================================================
  // SCROLL RESEÑAS
  // =====================================================

  const handleScrollToResenas =
    () => {

      resenasRef.current
        ?.scrollIntoView({
          behavior: "smooth"
        });
    };


  // =====================================================
  // AGREGAR RESEÑA
  // =====================================================

  const handleAgregarResena =
    async e => {

      e.preventDefault();


      if (
        !idUsuario ||
        !nuevoComentario.trim()
      ) {
        return;
      }


      setAgregandoResena(
        true
      );


      try {

        const resenaObj = {

          idProducto:
            Number(
              producto.idProducto
            ),

          calificacion:
            Number(
              nuevoRating
            ),

          comentario:
            nuevoComentario.trim()
        };


        await agregarResena(
          resenaObj
        );


        const data =
          await obtenerResenasPorProducto(
            idProducto
          );


        setResenas(
          Array.isArray(data)
            ? data
            : []
        );


        setNuevoRating(
          5
        );


        setNuevoComentario(
          ""
        );

      } catch (err) {

        console.error(
          "Error al agregar la reseña:",
          err
        );

      } finally {

        setAgregandoResena(
          false
        );
      }
    };


  // =====================================================
  // AGREGAR AL CARRITO
  // =====================================================

  const handleAgregarCarrito =
    async () => {

      if (
        !idUsuario ||
        !producto
      ) {
        return;
      }


      if (
        Number(
          producto.stock || 0
        ) <= 0
      ) {

        setMensajeCarrito(
          "Este producto no tiene existencias disponibles."
        );

        setTimeout(
          () =>
            setMensajeCarrito(
              ""
            ),
          3000
        );

        return;
      }


      const carritoItem = {

        idProducto:
          Number(
            producto.idProducto
          ),

        cantidad:
          1
      };


      try {

        await agregarCarrito(
          carritoItem
        );


        window.dispatchEvent(
          new Event(
            "carritoActualizado"
          )
        );


        setMensajeCarrito(
          "Producto agregado al carrito."
        );

      } catch (error) {

        console.error(
          "No se pudo agregar al carrito:",
          error
        );


        setMensajeCarrito(
          "Error al agregar el producto. Intenta nuevamente."
        );

      } finally {

        setTimeout(
          () =>
            setMensajeCarrito(
              ""
            ),
          3000
        );
      }
    };


  // =====================================================
  // ERROR / LOADING
  // =====================================================

  if (error) {

    return (

      <div className="alert alert-danger container mt-4">

        {error}

      </div>
    );
  }


  if (!producto) {

    return (

      <div className="container mt-4 text-center py-5">

        <div className="spinner-border mb-3" />

        <p>
          Cargando producto...
        </p>

      </div>
    );
  }


  // =====================================================
  // RENDER
  // =====================================================

  return (

    <div className="container mt-4 cliente-producto-detail">


      <div className="row">


        {/* ================================================= */}
        {/* IMAGEN */}
        {/* ================================================= */}

        <div className="col-md-4">

          <div className="mi-borde">

            <div className="img-container position-relative">


              {producto.rutaImagen ? (

                <img
                  src={
                    producto.rutaImagen
                  }
                  alt={
                    `Imagen de ${producto.nombre}`
                  }
                  className="img-fluid"
                />

              ) : (

                <div
                  className="d-flex flex-column align-items-center justify-content-center bg-light"
                  style={{
                    minHeight: "350px"
                  }}
                >

                  <i
                    className="bi bi-image text-muted"
                    style={{
                      fontSize: "3rem"
                    }}
                  ></i>

                  <span className="text-muted mt-2">

                    Sin imagen disponible

                  </span>

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

          </div>

        </div>


        {/* ================================================= */}
        {/* DETALLES */}
        {/* ================================================= */}

        <div className="col-md-4">

          <div className="mi-borde">


            <h2 className="producto-nombre">

              {
                producto.nombre
              }

            </h2>


            <p className="producto-descripcion">

              {
                producto.descripcion ||
                "Sin descripción disponible."
              }

            </p>


            {/* PRECIO */}

            <div className="producto-precio mb-3">


              {promocion ? (

                <>

                  <div
                    className="text-muted"
                    style={{
                      textDecoration:
                        "line-through",
                      fontSize: ".95rem"
                    }}
                  >

                    $

                    {
                      precioOriginal
                        .toFixed(2)
                    }

                  </div>


                  <h3 className="text-success mb-1">

                    $

                    {
                      precioFinal
                        .toFixed(2)
                    }

                  </h3>


                  <div className="d-flex align-items-center gap-2">

                    <span className="badge bg-danger">

                      -
                      {
                        Number(
                          promocion.descuento ||
                          0
                        )
                      }
                      %

                    </span>


                    <small className="text-success fw-bold">

                      Ahorras{" $"}

                      {
                        ahorro.toFixed(
                          2
                        )
                      }

                    </small>

                  </div>


                  {promocion.titulo && (

                    <small className="text-muted d-block mt-2">

                      {
                        promocion.titulo
                      }

                    </small>

                  )}

                </>

              ) : (

                <h3 className="text-success">

                  $

                  {
                    precioFinal
                      .toFixed(2)
                  }

                </h3>

              )}


            </div>


            {/* STOCK */}

            <p className="producto-stock">

              <strong>
                Stock:
              </strong>

              {" "}

              {
                producto.stock ??
                0
              }

            </p>


            {Number(
              producto.stock || 0
            ) <= 0 && (

              <div className="alert alert-warning py-2">

                Producto agotado.

              </div>

            )}


            {/* CALIFICACIÓN */}

            <div className="mt-4 d-flex align-items-center flex-wrap gap-2">


              <div
                className="star-rating"
                onClick={
                  handleScrollToResenas
                }
                style={{
                  cursor: "pointer"
                }}
              >

                {[...Array(5)].map(
                  (
                    _,
                    index
                  ) => {

                    const valorEstrella =
                      index + 1;


                    const activa =
                      promedioCalificacion &&
                      valorEstrella <=
                        Math.round(
                          Number(
                            promedioCalificacion
                          )
                        );


                    return (

                      <span
                        key={
                          index
                        }
                        className="star"
                        style={{
                          opacity:
                            activa
                              ? 1
                              : 0.25
                        }}
                      >

                        &#9733;

                      </span>

                    );
                  }
                )}

              </div>


              {promedioCalificacion ? (

                <div>

                  {
                    promedioCalificacion
                  }
                  /5

                  {" "}

                  <small className="text-muted">

                    (
                    {
                      resenas.length
                    }

                    {
                      resenas.length === 1
                        ? " reseña"
                        : " reseñas"
                    }
                    )

                  </small>

                </div>

              ) : (

                <small className="text-muted">

                  Sin reseñas

                </small>

              )}


              <button
                type="button"
                className="btn btn-link p-0 ms-2"
                title={
                  favorito
                    ? "Eliminar de favoritos"
                    : "Agregar a favoritos"
                }
                onClick={
                  toggleFavorito
                }
              >

                <i
                  className={
                    favorito
                      ? "bi bi-heart-fill text-danger"
                      : "bi bi-heart"
                  }
                  style={{
                    fontSize: "1.25rem"
                  }}
                ></i>

              </button>


            </div>

          </div>

        </div>


        {/* ================================================= */}
        {/* TIENDA */}
        {/* ================================================= */}

        <div className="col-md-4">

          <div className="mi-borde">


            <h3>
              Información de la tienda
            </h3>


            {tienda?.fotoFachadaUrl ? (

              <div className="text-center mb-3">

                <img
                  src={
                    tienda.fotoFachadaUrl
                  }
                  alt={
                    tienda.nombreNegocio
                  }
                  className="img-fluid tienda-logo"
                  style={{
                    maxWidth: "150px",
                    borderRadius: "8px"
                  }}
                />

              </div>

            ) : (

              <div className="text-muted text-center mb-3">

                <i
                  className="bi bi-shop"
                  style={{
                    fontSize: "2rem"
                  }}
                ></i>

                <p className="mb-0 mt-2">

                  No hay imagen disponible

                </p>

              </div>

            )}


            <p>

              <strong>
                Tienda:
              </strong>

              {" "}

              {
                tienda?.nombreNegocio ||
                "No definido"
              }

            </p>


            {tienda?.paginaWebUrl && (

              <p>

                <strong>
                  Página Web:
                </strong>

                {" "}

                <a
                  href={
                    tienda.paginaWebUrl
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                >

                  Visitar sitio

                </a>

              </p>

            )}


            {tienda?.facebookUrl && (

              <p>

                <strong>
                  Facebook:
                </strong>

                {" "}

                <a
                  href={
                    tienda.facebookUrl
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                >

                  Página de Facebook

                </a>

              </p>

            )}


            <p>

              <strong>
                Horario:
              </strong>

              {" "}

              {
                tienda?.horario ||
                "No definido"
              }

            </p>


            <p>

              <strong>
                Número:
              </strong>

              {" "}

              {
                tienda?.numeroContacto ||
                "No definido"
              }

            </p>


            <div className="d-grid gap-2 mt-4">

              <button
                type="button"
                className="btn btn-outline-primary btn-lg"
                onClick={
                  handleAgregarCarrito
                }
                disabled={
                  Number(
                    producto.stock || 0
                  ) <= 0
                }
              >

                <i className="bi bi-cart-plus me-2"></i>

                {
                  Number(
                    producto.stock || 0
                  ) <= 0
                    ? "Producto agotado"
                    : "Agregar al carrito"
                }

              </button>


              {mensajeCarrito && (

                <p className="mt-2 alert alert-info">

                  {
                    mensajeCarrito
                  }

                </p>

              )}

            </div>

          </div>

        </div>


      </div>


      {/* ================================================= */}
      {/* RESEÑAS */}
      {/* ================================================= */}

      <div
        ref={
          resenasRef
        }
        className="mt-5 mi-borde"
      >

        <h3>
          Reseñas del producto
        </h3>


        {resenas.length === 0 ? (

          <p className="text-muted">

            Aún no hay reseñas para este producto.

          </p>

        ) : (

          resenas.map(
            (
              resena,
              index
            ) => (

              <div
                className="resena-item"
                key={
                  resena.idResena ||
                  index
                }
              >

                <p className="mb-1">

                  <strong>

                    {
                      resena.usuario ||
                      "Usuario"
                    }

                    :

                  </strong>

                  {" "}

                  {
                    resena.calificacion
                  }

                  {" ★"}

                </p>


                {resena.comentario && (

                  <p>

                    {
                      resena.comentario
                    }

                  </p>

                )}

              </div>

            )
          )

        )}

      </div>


      {/* ================================================= */}
      {/* NUEVA RESEÑA */}
      {/* ================================================= */}

      <div className="mt-5 mi-borde">


        <h3>
          Agregar tu reseña
        </h3>


        <form
          onSubmit={
            handleAgregarResena
          }
        >


          <div className="mb-3">

            <label
              htmlFor="calificacion"
              className="form-label"
            >

              Calificación:

            </label>


            <select
              id="calificacion"
              className="form-select"
              value={
                nuevoRating
              }
              onChange={e =>
                setNuevoRating(
                  Number(
                    e.target.value
                  )
                )
              }
            >

              {[1, 2, 3, 4, 5].map(
                num => (

                  <option
                    key={
                      num
                    }
                    value={
                      num
                    }
                  >

                    {num}

                  </option>

                )
              )}

            </select>

          </div>


          <div className="mb-3">

            <label
              htmlFor="comentario"
              className="form-label"
            >

              Comentario:

            </label>


            <textarea
              id="comentario"
              className="form-control"
              rows="3"
              value={
                nuevoComentario
              }
              onChange={e =>
                setNuevoComentario(
                  e.target.value
                )
              }
            ></textarea>

          </div>


          <button
            type="submit"
            className="btn btn-success"
            disabled={
              agregandoResena ||
              !nuevoComentario.trim()
            }
          >

            {
              agregandoResena
                ? "Agregando reseña..."
                : "Enviar reseña"
            }

          </button>


        </form>

      </div>


    </div>
  );
}


export default ClienteProductoDetalles;