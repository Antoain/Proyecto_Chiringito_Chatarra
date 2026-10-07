import React, {
  useEffect,
  useState
} from "react";

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


export function ClienteCarrito() {

  // =====================================================
  // ESTADOS
  // =====================================================

  const [
    promociones,
    setPromociones
  ] = useState([]);

  const [
    carrito,
    setCarrito
  ] = useState([]);

  const [
    total,
    setTotal
  ] = useState(0);

  const [
    loading,
    setLoading
  ] = useState(true);

  const [
    error,
    setError
  ] = useState("");

  const [
    mensaje,
    setMensaje
  ] = useState("");

  const [
    favoritos,
    setFavoritos
  ] = useState([]);

  const [
    mostrarModal,
    setMostrarModal
  ] = useState(false);


  const idUsuario =
    localStorage.getItem(
      "idUsuario"
    );


  // =====================================================
  // MENSAJE TEMPORAL
  // =====================================================

  const mostrarMensajeTemporal = (
    texto,
    tiempo = 3000
  ) => {

    setMensaje(texto);


    setTimeout(
      () => setMensaje(""),
      tiempo
    );
  };


  // =====================================================
  // CARGAR CARRITO + PROMOCIONES
  // =====================================================

  useEffect(() => {

    async function fetchCarrito() {

      try {

        const [
          data,
          dataPromociones
        ] = await Promise.all([
          obtenerCarritoPorUsuario(),
          obtenerPromocionesActivas()
        ]);


        setCarrito(
          Array.isArray(data)
            ? data
            : []
        );


        setPromociones(
          Array.isArray(dataPromociones)
            ? dataPromociones
            : []
        );

      } catch (err) {

        console.error(
          "Error al obtener el carrito:",
          err
        );


        setError(
          "Error al cargar el carrito."
        );

      } finally {

        setLoading(false);
      }
    }


    fetchCarrito();

  }, [idUsuario]);


  // =====================================================
  // PROMOCIONES
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


  const obtenerPrecioProducto =
    item => {

      const promocion =
        obtenerPromocion(
          item.idProducto
        );


      if (promocion) {

        return Number(
          promocion.precioFinal || 0
        );
      }


      return Number(
        item
          ?.idProductoNavigation
          ?.precio || 0
      );
    };


  // =====================================================
  // CALCULAR TOTAL
  // =====================================================

  useEffect(() => {

    const totalCalculado =
      carrito.reduce(
        (
          sum,
          item
        ) => {

          const precio =
            obtenerPrecioProducto(
              item
            );


          const cantidad =
            Number(
              item.cantidad || 1
            );


          return (
            sum +
            precio *
            cantidad
          );
        },
        0
      );


    setTotal(
      totalCalculado
    );

  }, [
    carrito,
    promociones
  ]);


  // =====================================================
  // CARGAR FAVORITOS
  // =====================================================

  useEffect(() => {

    async function fetchFavoritos() {

      try {

        if (!idUsuario) {
          return;
        }


        const favData =
          await obtenerFavoritosPorCliente();


        setFavoritos(
          favData.map(
            fav => ({

              IdProducto:
                fav.idProducto ??
                fav.IdProducto,

              IdFavorito:
                fav.idFavorito ??
                fav.IdFavorito
            })
          )
        );

      } catch (err) {

        console.error(
          "Error al obtener favoritos:",
          err
        );
      }
    }


    fetchFavoritos();

  }, [idUsuario]);


  // =====================================================
  // ELIMINAR DEL CARRITO
  // =====================================================

  const handleEliminarDelCarrito =
    async idCarrito => {

      try {

        await eliminarDelCarrito(
          idCarrito
        );


        setCarrito(
          prev =>
            prev.filter(
              item =>
                item.idCarrito !==
                idCarrito
            )
        );


        window.dispatchEvent(
          new Event(
            "carritoActualizado"
          )
        );


        mostrarMensajeTemporal(
          "Producto eliminado correctamente."
        );

      } catch (error) {

        console.error(
          "Error al eliminar producto del carrito:",
          error
        );


        mostrarMensajeTemporal(
          "Error al eliminar producto."
        );
      }
    };


  // =====================================================
  // MODIFICAR CANTIDAD
  // =====================================================

  const handleModificarCantidad =
    async (
      idCarrito,
      nuevaCantidad
    ) => {

      if (nuevaCantidad < 1) {
        return;
      }


      try {

        const data =
          await actualizarCantidadEnBackend(
            idCarrito,
            nuevaCantidad
          );


        if (
          !data ||
          !data.mensaje?.includes(
            "actualizada correctamente"
          )
        ) {

          console.error(
            "Error en actualización:",
            data?.mensaje
          );

          return;
        }


        setCarrito(
          prev =>
            prev.map(
              item =>
                item.idCarrito ===
                idCarrito
                  ? {
                      ...item,

                      cantidad:
                        nuevaCantidad
                    }
                  : item
            )
        );


        window.dispatchEvent(
          new Event(
            "carritoActualizado"
          )
        );

      } catch (error) {

        console.error(
          "Error al modificar la cantidad:",
          error
        );
      }
    };


  // =====================================================
  // FAVORITOS
  // =====================================================

  const esFavorito =
    idProducto => {

      return favoritos.some(
        fav =>
          Number(
            fav.IdProducto
          ) ===
          Number(
            idProducto
          )
      );
    };


  const toggleFavorito =
    async idProducto => {

      try {

        const favoritoExistente =
          favoritos.find(
            fav =>
              Number(
                fav.IdProducto
              ) ===
              Number(
                idProducto
              )
          );


        if (
          favoritoExistente &&
          favoritoExistente.IdFavorito
        ) {

          await eliminarFavorito(
            favoritoExistente.IdFavorito
          );


          setFavoritos(
            prev =>
              prev.filter(
                fav =>
                  Number(
                    fav.IdProducto
                  ) !==
                  Number(
                    idProducto
                  )
              )
          );

        } else {

          await agregarFavorito(
            idProducto
          );


          const favData =
            await obtenerFavoritosPorCliente();


          setFavoritos(
            favData.map(
              fav => ({

                IdProducto:
                  fav.idProducto ??
                  fav.IdProducto,

                IdFavorito:
                  fav.idFavorito ??
                  fav.IdFavorito
              })
            )
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
  // CHECKOUT
  // =====================================================

  const handleConfirmarVenta =
    async checkout => {

      try {

        const response =
          await realizarCheckout(
            checkout
          );


        if (response?.mensaje) {

          mostrarMensajeTemporal(
            response.mensaje
          );

        } else {

          mostrarMensajeTemporal(
            "Pedido realizado correctamente."
          );
        }


        setCarrito([]);


        window.dispatchEvent(
          new Event(
            "carritoActualizado"
          )
        );


        setMostrarModal(
          false
        );

      } catch (error) {

        console.error(
          "Error al procesar el pedido:",
          error
        );


        mostrarMensajeTemporal(
          error.message ||
          "Ocurrió un error al procesar el pedido."
        );


        setMostrarModal(
          false
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
            Cargando carrito...
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


      {error && (

        <div className="alert alert-danger">

          {error}

        </div>

      )}


      {mensaje && (

        <div className="alert alert-success">

          {mensaje}

        </div>

      )}


      <div className="row">


        {/* ================================================= */}
        {/* PRODUCTOS */}
        {/* ================================================= */}

        <div className="col-md-8">

          <h2 className="mb-4">
            Tu Carrito
          </h2>


          {carrito.length === 0 ? (

            <div className="text-center py-5">

              <i
                className="bi bi-cart-x"
                style={{
                  fontSize: "3rem"
                }}
              ></i>


              <h4 className="mt-3">

                Tu carrito está vacío

              </h4>


              <p className="text-muted">

                Agrega productos para comenzar
                tu compra.

              </p>

            </div>

          ) : (

            carrito.map(
              item => {

                const promocion =
                  obtenerPromocion(
                    item.idProducto
                  );


                const precioFinal =
                  obtenerPrecioProducto(
                    item
                  );


                const cantidad =
                  Number(
                    item.cantidad || 1
                  );


                const subtotal =
                  precioFinal *
                  cantidad;


                return (

                  <div
                    key={
                      item.idCarrito
                    }
                    className="carrito-item"
                  >


                    {/* IMAGEN */}

                    <div className="position-relative">

                      {item
                        .idProductoNavigation
                        ?.rutaImagen ? (

                        <img
                          src={
                            item
                              .idProductoNavigation
                              .rutaImagen
                          }
                          alt={
                            item
                              .idProductoNavigation
                              ?.nombre ||
                            "Producto"
                          }
                          className="carrito-img"
                        />

                      ) : (

                        <div
                          className="carrito-img d-flex align-items-center justify-content-center bg-light"
                        >

                          <i
                            className="bi bi-image text-muted"
                            style={{
                              fontSize: "2rem"
                            }}
                          ></i>

                        </div>

                      )}


                      {promocion && (

                        <span
                          className="badge bg-danger position-absolute top-0 start-0 m-2"
                        >

                          -
                          {
                            Number(
                              promocion.descuento || 0
                            )
                          }
                          %

                        </span>

                      )}

                    </div>


                    {/* INFO */}

                    <div className="carrito-info">


                      <h5>

                        {
                          item
                            .idProductoNavigation
                            ?.nombre
                        }

                      </h5>


                      {/* PRECIO */}

                      <div className="mb-2">

                        <strong>
                          Precio:
                        </strong>

                        {" "}


                        {promocion ? (

                          <>

                            <span
                              className="text-muted me-2"
                              style={{
                                textDecoration:
                                  "line-through"
                              }}
                            >

                              $

                              {
                                Number(
                                  promocion.precioOriginal || 0
                                ).toFixed(2)
                              }

                            </span>


                            <strong className="text-success">

                              $

                              {
                                precioFinal.toFixed(2)
                              }

                            </strong>


                            <span className="badge bg-danger ms-2">

                              -
                              {
                                Number(
                                  promocion.descuento || 0
                                )
                              }
                              %

                            </span>

                          </>

                        ) : (

                          <span>

                            $

                            {
                              precioFinal.toFixed(2)
                            }

                          </span>

                        )}

                      </div>


                      {/* SUBTOTAL */}

                      <p>

                        <strong>
                          Subtotal:
                        </strong>

                        {" $"}

                        {
                          subtotal.toFixed(2)
                        }

                      </p>


                      {/* AHORRO */}

                      {promocion && (

                        <p className="text-success small">

                          <i className="bi bi-tag me-1"></i>

                          Ahorras{" $"}

                          {
                            (
                              Number(
                                promocion.precioOriginal || 0
                              ) *
                              cantidad -
                              subtotal
                            ).toFixed(2)
                          }

                        </p>

                      )}


                      {/* CANTIDAD */}

                      <div className="carrito-actions mt-2">


                        <button
                          type="button"
                          className="btn btn-outline-secondary btn-sm"
                          disabled={
                            item.cantidad <= 1
                          }
                          onClick={() =>
                            handleModificarCantidad(
                              item.idCarrito,

                              Math.max(
                                item.cantidad - 1,
                                1
                              )
                            )
                          }
                        >

                          -

                        </button>


                        <span className="mx-2 fw-bold">

                          {item.cantidad}

                        </span>


                        <button
                          type="button"
                          className="btn btn-outline-secondary btn-sm"
                          onClick={() =>
                            handleModificarCantidad(
                              item.idCarrito,
                              item.cantidad + 1
                            )
                          }
                        >

                          +

                        </button>

                      </div>


                      {/* ACCIONES */}

                      <div className="carrito-actions mt-2">


                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          onClick={() =>
                            handleEliminarDelCarrito(
                              item.idCarrito
                            )
                          }
                        >

                          Eliminar

                        </button>


                        <button
                          type="button"
                          className="btn btn-link p-0 ms-3"
                          aria-label="Favoritos"
                          title={
                            esFavorito(
                              item.idProducto
                            )
                              ? "Eliminar de favoritos"
                              : "Agregar a favoritos"
                          }
                          onClick={() =>
                            toggleFavorito(
                              item.idProducto
                            )
                          }
                        >

                          <i
                            className={
                              esFavorito(
                                item.idProducto
                              )
                                ? "bi bi-heart-fill text-danger"
                                : "bi bi-heart"
                            }
                          ></i>

                          {" Favoritos"}

                        </button>

                      </div>


                    </div>

                  </div>

                );
              }
            )

          )}

        </div>


        {/* ================================================= */}
        {/* RESUMEN */}
        {/* ================================================= */}

        <div className="col-md-4">

          <div className="resumen-compra">

            <h4>
              Resumen
            </h4>


            <p>

              <strong>
                Subtotal:
              </strong>

              {" $"}

              {
                total.toFixed(2)
              }

            </p>


            <p>

              <strong>
                Envío:
              </strong>

              {" "}

              Se calcula al completar
              la compra

            </p>


            <hr />


            <p>

              <strong>
                Total parcial:
              </strong>

              {" $"}

              {
                total.toFixed(2)
              }

            </p>


            <small className="text-muted d-block mb-3">

              El total final puede variar según
              el método y la zona de entrega.

            </small>


            <button
              type="button"
              className="btn btn-success w-100"
              disabled={
                carrito.length === 0
              }
              onClick={() =>
                setMostrarModal(
                  true
                )
              }
            >

              Proceder a la compra

            </button>

          </div>

        </div>


      </div>


      {/* ================================================= */}
      {/* CHECKOUT */}
      {/* ================================================= */}

      {mostrarModal && (

        <ModalProcesarVenta
          onClose={() =>
            setMostrarModal(
              false
            )
          }
          onConfirm={
            handleConfirmarVenta
          }
          carrito={
            carrito
          }
        />

      )}


    </div>
  );
}


export default ClienteCarrito;