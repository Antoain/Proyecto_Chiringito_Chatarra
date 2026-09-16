import React, { useEffect, useState } from "react";

import {
  obtenerCategorias,
  obtenerTiendasPorVendedor,
  crearTienda,
  actualizarTienda,
  eliminarTienda
} from "../../services/data";

import "./VendedorPagesCss/VendedorTiendas.css";


export default function VendedorTiendas() {

  const vendedorId =
    localStorage.getItem("idVendedor") || "";


  const [tiendas, setTiendas] = useState([]);
  const [categorias, setCategorias] = useState([]);

  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);


  const crearTiendaVacia = () => ({
    nombreNegocio: "",
    horario: "",
    fotoFachadaUrl: "",
    idCategoria: "",
    eslogan: "",
    numeroContacto: "",
    cuentaEnvio: false,
    facebookUrl: "",
    paginaWebUrl: "",
    fechaRegistro:
      new Date().toISOString().split("T")[0],
    idVendedor: vendedorId,
  });


  const [tiendaActual, setTiendaActual] =
    useState(crearTiendaVacia());


  // =====================================================
  // CARGAR DATOS
  // =====================================================

  useEffect(() => {

    if (!vendedorId) {
      setError(
        "No se encontró el vendedor activo."
      );

      return;
    }


    const fetchDatos = async () => {

      try {

        const [
          dataTiendas,
          dataCategorias
        ] = await Promise.all([
          obtenerTiendasPorVendedor(
            vendedorId
          ),
          obtenerCategorias()
        ]);


        setTiendas(dataTiendas);
        setCategorias(dataCategorias);

      } catch (err) {

        console.error(err);

        setError(
          "Error al cargar los datos."
        );
      }
    };


    fetchDatos();

  }, [vendedorId]);


  // =====================================================
  // CREAR
  // =====================================================

  const manejarAbrirModalCrear = () => {

    setModoEdicion(false);

    setTiendaActual(
      crearTiendaVacia()
    );

    setError("");
    setShowModal(true);
  };


  // =====================================================
  // EDITAR
  // =====================================================

  const manejarEditarTienda = (tienda) => {

    setModoEdicion(true);

    setTiendaActual({
      ...tienda,
      fechaRegistro:
        tienda.fechaRegistro ||
        new Date()
          .toISOString()
          .split("T")[0]
    });

    setError("");
    setShowModal(true);
  };


  // =====================================================
  // GUARDAR
  // =====================================================

  const manejarGuardarCambios =
    async () => {

      const {
        nombreNegocio,
        idCategoria,
        idVendedor
      } = tiendaActual;


      if (
        !nombreNegocio ||
        !idCategoria ||
        !idVendedor
      ) {

        setError(
          "Completa los campos obligatorios."
        );

        return;
      }


      const tiendaProcesada = {
        ...tiendaActual,

        idCategoria:
          parseInt(
            tiendaActual.idCategoria
          ),

        cuentaEnvio:
          Boolean(
            tiendaActual.cuentaEnvio
          )
      };


      try {

        if (modoEdicion) {

          await actualizarTienda(
            tiendaActual.idTienda,
            tiendaProcesada
          );

          setMensaje(
            "Tienda actualizada correctamente."
          );

        } else {

          await crearTienda(
            tiendaProcesada
          );

          setMensaje(
            "Tienda creada correctamente."
          );
        }


        const dataTiendas =
          await obtenerTiendasPorVendedor(
            vendedorId
          );


        setTiendas(dataTiendas);
        setShowModal(false);
        setError("");


        setTimeout(
          () => setMensaje(""),
          3000
        );

      } catch (err) {

        console.error(err);

        setError(
          err.message ||
          "Error al guardar la tienda."
        );


        setTimeout(
          () => setError(""),
          3000
        );
      }
    };


  // =====================================================
  // ELIMINAR
  // =====================================================

  const manejarEliminarTienda =
    async (id) => {

      const confirmar =
        window.confirm(
          "¿Estás seguro de eliminar esta tienda?"
        );


      if (!confirmar) {
        return;
      }


      try {

        await eliminarTienda(id);


        setTiendas(prev =>
          prev.filter(
            tienda =>
              tienda.idTienda !== id
          )
        );


        setMensaje(
          "Tienda eliminada correctamente."
        );


        setTimeout(
          () => setMensaje(""),
          3000
        );

      } catch (err) {

        console.error(err);

        setError(
          err.message ||
          "Error al eliminar la tienda."
        );


        setTimeout(
          () => setError(""),
          3000
        );
      }
    };


  // =====================================================
  // HELPERS
  // =====================================================

  const obtenerCategoria = (
    idCategoria
  ) => {

    return (
      categorias.find(
        categoria =>
          Number(
            categoria.idCategoria
          ) ===
          Number(idCategoria)
      )?.descripcion ||
      "Sin categoría"
    );
  };


  return (

    <div className="tiendas-page">

      <div className="tiendas-container">


        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <div className="tiendas-header">

          <div>

            <span className="tiendas-eyebrow">
              GESTIÓN COMERCIAL
            </span>

            <h1>
              Mis tiendas
            </h1>

            <p>
              Administra los negocios asociados
              a tu cuenta de vendedor.
            </p>

          </div>


          <button
            className="tiendas-btn-primary"
            onClick={
              manejarAbrirModalCrear
            }
          >

            <i className="bi bi-plus-lg"></i>

            Nueva tienda

          </button>

        </div>


        {/* ================================================= */}
        {/* MENSAJES */}
        {/* ================================================= */}

        {mensaje && (

          <div className="tiendas-alert tiendas-alert-success">

            <i className="bi bi-check-circle"></i>

            {mensaje}

          </div>
        )}


        {error && !showModal && (

          <div className="tiendas-alert tiendas-alert-error">

            <i className="bi bi-exclamation-circle"></i>

            {error}

          </div>
        )}


        {/* ================================================= */}
        {/* RESUMEN */}
        {/* ================================================= */}

        <div className="tiendas-summary">

          <div className="tiendas-summary-card">

            <div>

              <span>
                Tiendas registradas
              </span>

              <strong>
                {tiendas.length}
              </strong>

            </div>


            <div className="tiendas-summary-icon">
              <i className="bi bi-shop"></i>
            </div>

          </div>


          <div className="tiendas-summary-card">

            <div>

              <span>
                Con servicio de envío
              </span>

              <strong>
                {
                  tiendas.filter(
                    tienda =>
                      tienda.cuentaEnvio
                  ).length
                }
              </strong>

            </div>


            <div className="tiendas-summary-icon">
              <i className="bi bi-truck"></i>
            </div>

          </div>

        </div>


        {/* ================================================= */}
        {/* CONTENIDO */}
        {/* ================================================= */}

        <section className="tiendas-card">

          <div className="tiendas-card-header">

            <div>

              <h2>
                Tiendas registradas
              </h2>

              <p>
                Información general de tus negocios
              </p>

            </div>


            <div className="tiendas-card-icon">
              <i className="bi bi-buildings"></i>
            </div>

          </div>


          {tiendas.length === 0 ? (

            <div className="tiendas-empty">

              <i className="bi bi-shop-window"></i>

              <h3>
                Aún no tienes tiendas
              </h3>

              <p>
                Crea tu primera tienda para
                comenzar a publicar productos.
              </p>


              <button
                className="tiendas-btn-primary"
                onClick={
                  manejarAbrirModalCrear
                }
              >

                <i className="bi bi-plus-lg"></i>

                Crear tienda

              </button>

            </div>

          ) : (

            <div className="tiendas-grid">

              {tiendas.map(
                tienda => (

                  <article
                    className="tienda-card"
                    key={tienda.idTienda}
                  >


                    <div className="tienda-image">

                      {tienda.fotoFachadaUrl ? (

                        <img
                          src={
                            tienda.fotoFachadaUrl
                          }
                          alt={
                            tienda.nombreNegocio
                          }
                        />

                      ) : (

                        <div className="tienda-image-placeholder">

                          <i className="bi bi-shop"></i>

                        </div>
                      )}


                      <span
                        className={
                          tienda.cuentaEnvio
                            ? "tienda-delivery activo"
                            : "tienda-delivery"
                        }
                      >

                        <i
                          className={
                            tienda.cuentaEnvio
                              ? "bi bi-truck"
                              : "bi bi-shop-window"
                          }
                        ></i>

                        {
                          tienda.cuentaEnvio
                            ? "Envío disponible"
                            : "Solo retiro"
                        }

                      </span>

                    </div>


                    <div className="tienda-card-body">

                      <div className="tienda-title">

                        <div>

                          <span className="tienda-id">
                            Tienda #
                            {tienda.idTienda}
                          </span>

                          <h3>
                            {
                              tienda.nombreNegocio
                            }
                          </h3>

                        </div>

                      </div>


                      {tienda.eslogan && (

                        <p className="tienda-slogan">
                          “{tienda.eslogan}”
                        </p>
                      )}


                      <div className="tienda-meta">

                        <div>

                          <i className="bi bi-tag"></i>

                          <span>
                            {
                              obtenerCategoria(
                                tienda.idCategoria
                              )
                            }
                          </span>

                        </div>


                        <div>

                          <i className="bi bi-clock"></i>

                          <span>
                            {
                              tienda.horario ||
                              "Sin horario"
                            }
                          </span>

                        </div>


                        <div>

                          <i className="bi bi-telephone"></i>

                          <span>
                            {
                              tienda.numeroContacto ||
                              "Sin contacto"
                            }
                          </span>

                        </div>

                      </div>


                      <div className="tienda-links">

                        {tienda.facebookUrl && (

                          <a
                            href={
                              tienda.facebookUrl
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                          >

                            <i className="bi bi-facebook"></i>

                            Facebook

                          </a>
                        )}


                        {tienda.paginaWebUrl && (

                          <a
                            href={
                              tienda.paginaWebUrl
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                          >

                            <i className="bi bi-globe"></i>

                            Sitio web

                          </a>
                        )}

                      </div>


                      <div className="tienda-actions">

                        <button
                          className="tienda-btn editar"
                          onClick={() =>
                            manejarEditarTienda(
                              tienda
                            )
                          }
                        >

                          <i className="bi bi-pencil"></i>

                          Editar

                        </button>


                        <button
                          className="tienda-btn eliminar"
                          onClick={() =>
                            manejarEliminarTienda(
                              tienda.idTienda
                            )
                          }
                        >

                          <i className="bi bi-trash"></i>

                          Eliminar

                        </button>

                      </div>

                    </div>

                  </article>

                )
              )}

            </div>
          )}

        </section>


        {/* ================================================= */}
        {/* MODAL */}
        {/* ================================================= */}

        {showModal && (

          <div className="tiendas-modal-backdrop">

            <div className="tiendas-modal">

              <div className="tiendas-modal-header">

                <div>

                  <span>
                    {
                      modoEdicion
                        ? "ACTUALIZAR NEGOCIO"
                        : "NUEVO NEGOCIO"
                    }
                  </span>

                  <h2>
                    {
                      modoEdicion
                        ? "Editar tienda"
                        : "Crear tienda"
                    }
                  </h2>

                </div>


                <button
                  className="tiendas-modal-close"
                  onClick={() =>
                    setShowModal(false)
                  }
                >

                  <i className="bi bi-x-lg"></i>

                </button>

              </div>


              {error && (

                <div className="tiendas-alert tiendas-alert-error">

                  <i className="bi bi-exclamation-circle"></i>

                  {error}

                </div>
              )}


              <div className="tiendas-form-grid">


                <div className="tiendas-field span-2">

                  <label>
                    Nombre del negocio *
                  </label>

                  <input
                    type="text"
                    value={
                      tiendaActual.nombreNegocio
                    }
                    onChange={e =>
                      setTiendaActual({
                        ...tiendaActual,
                        nombreNegocio:
                          e.target.value
                      })
                    }
                    placeholder="Ej. Tech Store Chalatenango"
                  />

                </div>


                <div className="tiendas-field">

                  <label>
                    Categoría *
                  </label>

                  <select
                    value={
                      tiendaActual.idCategoria
                    }
                    onChange={e =>
                      setTiendaActual({
                        ...tiendaActual,
                        idCategoria:
                          e.target.value
                      })
                    }
                  >

                    <option value="">
                      Selecciona una categoría
                    </option>

                    {categorias.map(
                      categoria => (

                        <option
                          key={
                            categoria.idCategoria
                          }
                          value={
                            categoria.idCategoria
                          }
                        >
                          {
                            categoria.descripcion
                          }
                        </option>

                      )
                    )}

                  </select>

                </div>


                <div className="tiendas-field">

                  <label>
                    Horario
                  </label>

                  <input
                    type="text"
                    value={
                      tiendaActual.horario
                    }
                    onChange={e =>
                      setTiendaActual({
                        ...tiendaActual,
                        horario:
                          e.target.value
                      })
                    }
                    placeholder="Ej. Lun-Sáb 8:00 - 18:00"
                  />

                </div>


                <div className="tiendas-field span-2">

                  <label>
                    Eslogan
                  </label>

                  <input
                    type="text"
                    value={
                      tiendaActual.eslogan
                    }
                    onChange={e =>
                      setTiendaActual({
                        ...tiendaActual,
                        eslogan:
                          e.target.value
                      })
                    }
                    placeholder="Una frase que represente tu negocio"
                  />

                </div>


                <div className="tiendas-field">

                  <label>
                    Número de contacto
                  </label>

                  <input
                    type="text"
                    value={
                      tiendaActual.numeroContacto
                    }
                    onChange={e =>
                      setTiendaActual({
                        ...tiendaActual,
                        numeroContacto:
                          e.target.value
                      })
                    }
                    placeholder="Ej. 7000-0000"
                  />

                </div>


                <div className="tiendas-field">

                  <label>
                    Fecha de registro
                  </label>

                  <input
                    type="date"
                    value={
                      tiendaActual.fechaRegistro
                    }
                    onChange={e =>
                      setTiendaActual({
                        ...tiendaActual,
                        fechaRegistro:
                          e.target.value
                      })
                    }
                  />

                </div>


                <div className="tiendas-field span-2">

                  <label>
                    URL de fachada
                  </label>

                  <input
                    type="text"
                    value={
                      tiendaActual.fotoFachadaUrl
                    }
                    onChange={e =>
                      setTiendaActual({
                        ...tiendaActual,
                        fotoFachadaUrl:
                          e.target.value
                      })
                    }
                    placeholder="https://..."
                  />

                </div>


                <div className="tiendas-field">

                  <label>
                    Facebook
                  </label>

                  <input
                    type="text"
                    value={
                      tiendaActual.facebookUrl
                    }
                    onChange={e =>
                      setTiendaActual({
                        ...tiendaActual,
                        facebookUrl:
                          e.target.value
                      })
                    }
                    placeholder="https://facebook.com/..."
                  />

                </div>


                <div className="tiendas-field">

                  <label>
                    Página web
                  </label>

                  <input
                    type="text"
                    value={
                      tiendaActual.paginaWebUrl
                    }
                    onChange={e =>
                      setTiendaActual({
                        ...tiendaActual,
                        paginaWebUrl:
                          e.target.value
                      })
                    }
                    placeholder="https://..."
                  />

                </div>


                <div className="tiendas-field span-2">

                  <label className="tiendas-switch">

                    <input
                      type="checkbox"
                      checked={
                        tiendaActual.cuentaEnvio
                      }
                      onChange={e =>
                        setTiendaActual({
                          ...tiendaActual,
                          cuentaEnvio:
                            e.target.checked
                        })
                      }
                    />

                    <span className="switch-ui"></span>

                    <div>

                      <strong>
                        Servicio de envío
                      </strong>

                      <small>
                        Indica si esta tienda
                        realiza entregas a domicilio.
                      </small>

                    </div>

                  </label>

                </div>

              </div>


              <div className="tiendas-modal-actions">

                <button
                  className="tiendas-btn-secondary"
                  onClick={() =>
                    setShowModal(false)
                  }
                >
                  Cancelar
                </button>


                <button
                  className="tiendas-btn-primary"
                  onClick={
                    manejarGuardarCambios
                  }
                >

                  <i
                    className={
                      modoEdicion
                        ? "bi bi-check-lg"
                        : "bi bi-plus-lg"
                    }
                  ></i>

                  {
                    modoEdicion
                      ? "Guardar cambios"
                      : "Crear tienda"
                  }

                </button>

              </div>

            </div>

          </div>
        )}

      </div>

    </div>
  );
}