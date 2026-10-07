import React, {
  useEffect,
  useMemo,
  useState
} from "react";

import {
  obtenerMisPromociones,
  crearPromocion,
  actualizarPromocion,
  eliminarPromocion,
  obtenerProductosPorVendedor
} from "../../services/data";

import "./VendedorPagesCss/VendedorPromociones.css";


const promocionVacia = {
  idPromocion: null,
  idProducto: "",
  titulo: "",
  descripcion: "",
  descuento: "",
  fechaInicio: "",
  fechaFin: ""
};


export default function VendedorPromociones() {

  const vendedorId =
    localStorage.getItem("idVendedor") ||
    localStorage.getItem("idUsuario") ||
    "";


  const [
    promociones,
    setPromociones
  ] = useState([]);

  const [
    productos,
    setProductos
  ] = useState([]);

  const [
    cargando,
    setCargando
  ] = useState(true);

  const [
    guardando,
    setGuardando
  ] = useState(false);

  const [
    mensaje,
    setMensaje
  ] = useState("");

  const [
    error,
    setError
  ] = useState("");

  const [
    busqueda,
    setBusqueda
  ] = useState("");

  const [
    filtroEstado,
    setFiltroEstado
  ] = useState("TODOS");

  const [
    mostrarModal,
    setMostrarModal
  ] = useState(false);

  const [
    modoEdicion,
    setModoEdicion
  ] = useState(false);

  const [
    promocionActual,
    setPromocionActual
  ] = useState(
    promocionVacia
  );


  // =====================================================
  // CARGAR DATOS
  // =====================================================

  const cargarDatos =
    async () => {

      try {

        setCargando(true);
        setError("");


        const [
          dataPromociones,
          dataProductos
        ] = await Promise.all([
          obtenerMisPromociones(),
          obtenerProductosPorVendedor(
            vendedorId
          )
        ]);


        setPromociones(
          Array.isArray(dataPromociones)
            ? dataPromociones
            : []
        );


        setProductos(
          Array.isArray(dataProductos)
            ? dataProductos
            : []
        );

      } catch (err) {

        console.error(
          "Error cargando promociones:",
          err
        );


        setError(
          err.message ||
          "No se pudieron cargar las promociones."
        );

      } finally {

        setCargando(false);
      }
    };


  useEffect(() => {

    if (vendedorId) {

      cargarDatos();
    }

  }, [vendedorId]);


  // =====================================================
  // MENSAJE TEMPORAL
  // =====================================================

  const mostrarMensaje =
    texto => {

      setMensaje(texto);

      setTimeout(
        () => setMensaje(""),
        3000
      );
    };


  // =====================================================
  // MODAL CREAR
  // =====================================================

  const abrirCrear = () => {

    setModoEdicion(false);

    setPromocionActual({
      ...promocionVacia,

      idProducto:
        productos.length > 0
          ? productos[0].idProducto
          : ""
    });

    setError("");

    setMostrarModal(true);
  };


  // =====================================================
  // MODAL EDITAR
  // =====================================================

  const abrirEditar =
    promocion => {

      setModoEdicion(true);

      setPromocionActual({
        idPromocion:
          promocion.idPromocion,

        idProducto:
          promocion.idProducto,

        titulo:
          promocion.titulo || "",

        descripcion:
          promocion.descripcion || "",

        descuento:
          promocion.descuento ?? "",

        fechaInicio:
          promocion.fechaInicio || "",

        fechaFin:
          promocion.fechaFin || ""
      });

      setError("");

      setMostrarModal(true);
    };


  // =====================================================
  // GUARDAR
  // =====================================================

  const guardarPromocion =
    async () => {

      if (
        !promocionActual.idProducto ||
        !promocionActual.titulo.trim() ||
        promocionActual.descuento === "" ||
        !promocionActual.fechaInicio ||
        !promocionActual.fechaFin
      ) {

        setError(
          "Completa todos los campos obligatorios."
        );

        return;
      }


      const descuento =
        Number(
          promocionActual.descuento
        );


      if (
        descuento <= 0 ||
        descuento > 100
      ) {

        setError(
          "El descuento debe estar entre 1% y 100%."
        );

        return;
      }


      if (
        promocionActual.fechaFin <
        promocionActual.fechaInicio
      ) {

        setError(
          "La fecha final no puede ser anterior a la fecha inicial."
        );

        return;
      }


      const payload = {
        idProducto:
          Number(
            promocionActual.idProducto
          ),

        titulo:
          promocionActual
            .titulo
            .trim(),

        descripcion:
          promocionActual
            .descripcion
            ?.trim() || null,

        descuento,

        fechaInicio:
          promocionActual.fechaInicio,

        fechaFin:
          promocionActual.fechaFin
      };


      try {

        setGuardando(true);
        setError("");


        if (modoEdicion) {

          await actualizarPromocion(
            promocionActual.idPromocion,
            payload
          );


          mostrarMensaje(
            "Promoción actualizada correctamente."
          );

        } else {

          await crearPromocion(
            payload
          );


          mostrarMensaje(
            "Promoción creada correctamente."
          );
        }


        setMostrarModal(false);

        await cargarDatos();

      } catch (err) {

        console.error(
          "Error guardando promoción:",
          err
        );


        setError(
          err.message ||
          "No se pudo guardar la promoción."
        );

      } finally {

        setGuardando(false);
      }
    };


  // =====================================================
  // ELIMINAR
  // =====================================================

  const manejarEliminar =
    async promocion => {

      const confirmar =
        window.confirm(
          `¿Eliminar la promoción "${promocion.titulo}"?`
        );


      if (!confirmar) {
        return;
      }


      try {

        await eliminarPromocion(
          promocion.idPromocion
        );


        setPromociones(
          prev =>
            prev.filter(
              item =>
                item.idPromocion !==
                promocion.idPromocion
            )
        );


        mostrarMensaje(
          "Promoción eliminada correctamente."
        );

      } catch (err) {

        console.error(
          "Error eliminando promoción:",
          err
        );


        setError(
          err.message ||
          "No se pudo eliminar la promoción."
        );
      }
    };


  // =====================================================
  // HELPERS
  // =====================================================

  const formatearFecha =
    fecha => {

      if (!fecha) {
        return "—";
      }


      return new Intl.DateTimeFormat(
        "es-SV",
        {
          dateStyle: "medium"
        }
      ).format(
        new Date(
          `${fecha}T00:00:00`
        )
      );
    };


  const claseEstado =
    estado => {

      switch (estado) {

        case "ACTIVA":
          return "promocion-status activa";

        case "PROGRAMADA":
          return "promocion-status programada";

        case "FINALIZADA":
          return "promocion-status finalizada";

        default:
          return "promocion-status";
      }
    };


  // =====================================================
  // FILTRO
  // =====================================================

  const promocionesFiltradas =
    useMemo(() => {

      const texto =
        busqueda
          .trim()
          .toLowerCase();


      return promociones.filter(
        promocion => {

          const coincideEstado =
            filtroEstado === "TODOS" ||
            promocion.estado ===
              filtroEstado;


          const contenido =
            [
              promocion.titulo,
              promocion.producto,
              promocion.tienda
            ]
              .filter(Boolean)
              .join(" ")
              .toLowerCase();


          const coincideBusqueda =
            !texto ||
            contenido.includes(
              texto
            );


          return (
            coincideEstado &&
            coincideBusqueda
          );
        }
      );

    }, [
      promociones,
      busqueda,
      filtroEstado
    ]);


  // =====================================================
  // RESUMEN
  // =====================================================

  const resumen =
    useMemo(() => ({

      total:
        promociones.length,

      activas:
        promociones.filter(
          p =>
            p.estado ===
            "ACTIVA"
        ).length,

      programadas:
        promociones.filter(
          p =>
            p.estado ===
            "PROGRAMADA"
        ).length,

      finalizadas:
        promociones.filter(
          p =>
            p.estado ===
            "FINALIZADA"
        ).length

    }), [promociones]);


  // =====================================================
  // LOADING
  // =====================================================

  if (cargando) {

    return (

      <div className="promociones-page">

        <div className="promociones-loading">

          <div className="spinner-border" />

          <p>
            Cargando promociones...
          </p>

        </div>

      </div>
    );
  }


  // =====================================================
  // RENDER
  // =====================================================

  return (

    <div className="promociones-page">

      <div className="promociones-container">


        {/* HEADER */}

        <header className="promociones-header">

          <div>

            <span className="promociones-eyebrow">
              MARKETING
            </span>

            <h1>
              Promociones
            </h1>

            <p>
              Crea descuentos temporales para
              tus productos sin modificar su
              precio original.
            </p>

          </div>


          <button
            type="button"
            className="promociones-btn-primary"
            onClick={
              abrirCrear
            }
            disabled={
              productos.length === 0
            }
          >

            <i className="bi bi-percent"></i>

            Nueva promoción

          </button>

        </header>


        {/* ALERTAS */}

        {mensaje && (

          <div className="promociones-alert success">

            <i className="bi bi-check-circle"></i>

            {mensaje}

          </div>

        )}


        {error && !mostrarModal && (

          <div className="promociones-alert error">

            <i className="bi bi-exclamation-circle"></i>

            {error}

          </div>

        )}


        {/* RESUMEN */}

        <div className="promociones-summary">

          <article>

            <span>
              Registradas
            </span>

            <strong>
              {resumen.total}
            </strong>

            <i className="bi bi-tags"></i>

          </article>


          <article>

            <span>
              Activas
            </span>

            <strong>
              {resumen.activas}
            </strong>

            <i className="bi bi-lightning-charge"></i>

          </article>


          <article>

            <span>
              Programadas
            </span>

            <strong>
              {resumen.programadas}
            </strong>

            <i className="bi bi-calendar-event"></i>

          </article>


          <article>

            <span>
              Finalizadas
            </span>

            <strong>
              {resumen.finalizadas}
            </strong>

            <i className="bi bi-archive"></i>

          </article>

        </div>


        {/* CONTENIDO */}

        <section className="promociones-card">

          <div className="promociones-card-header">

            <div>

              <h2>
                Mis promociones
              </h2>

              <p>
                Descuentos activos, futuros y
                finalizados.
              </p>

            </div>


            <div className="promociones-filtros">

              <div className="promociones-search">

                <i className="bi bi-search"></i>

                <input
                  type="text"
                  placeholder="Buscar promoción..."
                  value={busqueda}
                  onChange={e =>
                    setBusqueda(
                      e.target.value
                    )
                  }
                />

              </div>


              <select
                value={filtroEstado}
                onChange={e =>
                  setFiltroEstado(
                    e.target.value
                  )
                }
              >

                <option value="TODOS">
                  Todos
                </option>

                <option value="ACTIVA">
                  Activas
                </option>

                <option value="PROGRAMADA">
                  Programadas
                </option>

                <option value="FINALIZADA">
                  Finalizadas
                </option>

              </select>

            </div>

          </div>


          {promocionesFiltradas.length === 0 ? (

            <div className="promociones-empty">

              <i className="bi bi-percent"></i>

              <h3>
                No hay promociones
              </h3>

              <p>
                Crea una promoción para ofrecer
                descuentos temporales.
              </p>

            </div>

          ) : (

            <div className="table-responsive">

              <table className="promociones-table">

                <thead>

                  <tr>
                    <th>Promoción</th>
                    <th>Producto</th>
                    <th>Descuento</th>
                    <th>Precio</th>
                    <th>Periodo</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>

                </thead>


                <tbody>

                  {promocionesFiltradas.map(
                    promocion => (

                      <tr
                        key={
                          promocion.idPromocion
                        }
                      >

                        <td>

                          <div className="promocion-info">

                            <strong>
                              {promocion.titulo}
                            </strong>

                            <small>
                              {
                                promocion.descripcion ||
                                "Sin descripción"
                              }
                            </small>

                          </div>

                        </td>


                        <td>

                          <div className="promocion-producto">

                            <strong>
                              {promocion.producto}
                            </strong>

                            <small>
                              {promocion.tienda}
                            </small>

                          </div>

                        </td>


                        <td>

                          <span className="promocion-discount">

                            -
                            {
                              Number(
                                promocion.descuento || 0
                              )
                            }
                            %

                          </span>

                        </td>


                        <td>

                          <div className="promocion-price">

                            <span>
                              $
                              {
                                Number(
                                  promocion.precioOriginal || 0
                                ).toFixed(2)
                              }
                            </span>

                            <strong>
                              $
                              {
                                Number(
                                  promocion.precioFinal || 0
                                ).toFixed(2)
                              }
                            </strong>

                          </div>

                        </td>


                        <td>

                          <div className="promocion-dates">

                            <span>
                              {
                                formatearFecha(
                                  promocion.fechaInicio
                                )
                              }
                            </span>

                            <small>
                              hasta
                            </small>

                            <span>
                              {
                                formatearFecha(
                                  promocion.fechaFin
                                )
                              }
                            </span>

                          </div>

                        </td>


                        <td>

                          <span
                            className={
                              claseEstado(
                                promocion.estado
                              )
                            }
                          >

                            {promocion.estado}

                          </span>

                        </td>


                        <td>

                          <div className="promocion-actions">

                            <button
                              type="button"
                              className="editar"
                              title="Editar promoción"
                              onClick={() =>
                                abrirEditar(
                                  promocion
                                )
                              }
                            >

                              <i className="bi bi-pencil"></i>

                            </button>


                            <button
                              type="button"
                              className="eliminar"
                              title="Eliminar promoción"
                              onClick={() =>
                                manejarEliminar(
                                  promocion
                                )
                              }
                            >

                              <i className="bi bi-trash"></i>

                            </button>

                          </div>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

        </section>

      </div>


      {/* ================================================= */}
      {/* MODAL */}
      {/* ================================================= */}

      {mostrarModal && (

        <div className="promociones-modal-backdrop">

          <div className="promociones-modal">

            <div className="promociones-modal-header">

              <div>

                <span>
                  {
                    modoEdicion
                      ? "EDITAR DESCUENTO"
                      : "NUEVO DESCUENTO"
                  }
                </span>

                <h2>
                  {
                    modoEdicion
                      ? "Editar promoción"
                      : "Crear promoción"
                  }
                </h2>

              </div>


              <button
                type="button"
                onClick={() =>
                  setMostrarModal(
                    false
                  )
                }
              >

                <i className="bi bi-x-lg"></i>

              </button>

            </div>


            {error && (

              <div className="promociones-alert error">

                {error}

              </div>

            )}


            <div className="promociones-form">


              <div className="promociones-field span-2">

                <label>
                  Producto *
                </label>

                <select
                  value={
                    promocionActual.idProducto
                  }
                  disabled={
                    modoEdicion
                  }
                  onChange={e =>
                    setPromocionActual({
                      ...promocionActual,

                      idProducto:
                        e.target.value
                    })
                  }
                >

                  <option value="">
                    Selecciona un producto
                  </option>


                  {productos.map(
                    producto => (

                      <option
                        key={
                          producto.idProducto
                        }
                        value={
                          producto.idProducto
                        }
                      >

                        {
                          producto.nombre
                        }

                        {" — $"}

                        {
                          Number(
                            producto.precio || 0
                          ).toFixed(2)
                        }

                      </option>

                    )
                  )}

                </select>

              </div>


              <div className="promociones-field span-2">

                <label>
                  Título *
                </label>

                <input
                  type="text"
                  value={
                    promocionActual.titulo
                  }
                  onChange={e =>
                    setPromocionActual({
                      ...promocionActual,

                      titulo:
                        e.target.value
                    })
                  }
                  placeholder="Ej. Oferta de octubre"
                />

              </div>


              <div className="promociones-field span-2">

                <label>
                  Descripción
                </label>

                <textarea
                  rows="3"
                  value={
                    promocionActual.descripcion
                  }
                  onChange={e =>
                    setPromocionActual({
                      ...promocionActual,

                      descripcion:
                        e.target.value
                    })
                  }
                  placeholder="Descripción opcional..."
                />

              </div>


              <div className="promociones-field">

                <label>
                  Descuento (%) *
                </label>

                <input
                  type="number"
                  min="1"
                  max="100"
                  step="1"
                  value={
                    promocionActual.descuento
                  }
                  onChange={e =>
                    setPromocionActual({
                      ...promocionActual,

                      descuento:
                        e.target.value
                    })
                  }
                />

              </div>


              <div className="promociones-preview">

                <span>
                  Precio con descuento
                </span>

                <strong>

                  $

                  {
                    (() => {

                      const producto =
                        productos.find(
                          p =>
                            Number(
                              p.idProducto
                            ) ===
                            Number(
                              promocionActual.idProducto
                            )
                        );


                      const precio =
                        Number(
                          producto?.precio || 0
                        );


                      const descuento =
                        Number(
                          promocionActual.descuento || 0
                        );


                      return (
                        precio *
                        (
                          1 -
                          descuento /
                          100
                        )
                      ).toFixed(2);

                    })()
                  }

                </strong>

              </div>


              <div className="promociones-field">

                <label>
                  Fecha inicio *
                </label>

                <input
                  type="date"
                  value={
                    promocionActual.fechaInicio
                  }
                  onChange={e =>
                    setPromocionActual({
                      ...promocionActual,

                      fechaInicio:
                        e.target.value
                    })
                  }
                />

              </div>


              <div className="promociones-field">

                <label>
                  Fecha fin *
                </label>

                <input
                  type="date"
                  value={
                    promocionActual.fechaFin
                  }
                  onChange={e =>
                    setPromocionActual({
                      ...promocionActual,

                      fechaFin:
                        e.target.value
                    })
                  }
                />

              </div>

            </div>


            <div className="promociones-modal-actions">

              <button
                type="button"
                className="secondary"
                onClick={() =>
                  setMostrarModal(
                    false
                  )
                }
              >

                Cancelar

              </button>


              <button
                type="button"
                className="primary"
                disabled={
                  guardando
                }
                onClick={
                  guardarPromocion
                }
              >

                {guardando ? (

                  <>
                    <span className="spinner-border spinner-border-sm"></span>
                    Guardando...
                  </>

                ) : (

                  <>
                    <i className="bi bi-check-lg"></i>

                    {
                      modoEdicion
                        ? "Guardar cambios"
                        : "Crear promoción"
                    }
                  </>

                )}

              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}