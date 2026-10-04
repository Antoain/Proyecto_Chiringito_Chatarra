import React, {
  useEffect,
  useMemo,
  useState
} from "react";

import {
  obtenerMiInventario,
  obtenerMovimientosInventario,
  registrarEntradaInventario,
  registrarAjusteInventario
} from "../../services/data";

import "./VendedorPagesCss/VendedorInventario.css";


export default function VendedorInventario() {

  // ==========================================
  // DATOS
  // ==========================================

  const [inventario, setInventario] =
    useState([]);

  const [movimientos, setMovimientos] =
    useState([]);

  const [cargando, setCargando] =
    useState(true);

  const [error, setError] =
    useState("");

  const [mensaje, setMensaje] =
    useState("");


  // ==========================================
  // FILTROS
  // ==========================================

  const [busqueda, setBusqueda] =
    useState("");

  const [estadoFiltro, setEstadoFiltro] =
    useState("TODOS");

  const [vista, setVista] =
    useState("inventario");


  // ==========================================
  // PAGINACIÓN
  // ==========================================

  const [
    paginaInventario,
    setPaginaInventario
  ] = useState(1);

  const [
    paginaMovimientos,
    setPaginaMovimientos
  ] = useState(1);

  const registrosPorPagina = 10;


  // ==========================================
  // MODAL ENTRADA
  // ==========================================

  const [
    modalEntrada,
    setModalEntrada
  ] = useState(false);

  const [
    productoSeleccionado,
    setProductoSeleccionado
  ] = useState(null);

  const [
    cantidadEntrada,
    setCantidadEntrada
  ] = useState("");

  const [
    motivoEntrada,
    setMotivoEntrada
  ] = useState("");

  const [
    guardando,
    setGuardando
  ] = useState(false);


  // ==========================================
  // MODAL AJUSTE
  // ==========================================

  const [
    modalAjuste,
    setModalAjuste
  ] = useState(false);

  const [
    productoAjuste,
    setProductoAjuste
  ] = useState(null);

  const [
    stockFisico,
    setStockFisico
  ] = useState("");

  const [
    motivoAjuste,
    setMotivoAjuste
  ] = useState("");

  const [
    guardandoAjuste,
    setGuardandoAjuste
  ] = useState(false);


  // ==========================================
  // CARGAR DATOS
  // ==========================================

  const cargarDatos = async () => {

    try {

      setCargando(true);
      setError("");

      const [
        inventarioData,
        movimientosData
      ] = await Promise.all([
        obtenerMiInventario(),
        obtenerMovimientosInventario()
      ]);

      setInventario(
        Array.isArray(inventarioData)
          ? inventarioData
          : []
      );

      setMovimientos(
        Array.isArray(movimientosData)
          ? movimientosData
          : []
      );

    } catch (err) {

      console.error(
        "Error cargando inventario:",
        err
      );

      setError(
        "No se pudo cargar el inventario."
      );

    } finally {

      setCargando(false);
    }
  };


  useEffect(() => {
    cargarDatos();
  }, []);


  // ==========================================
  // FILTRAR INVENTARIO
  // ==========================================

  const inventarioFiltrado =
    useMemo(() => {

      const texto =
        busqueda
          .trim()
          .toLowerCase();

      return inventario.filter(item => {

        const coincideEstado =
          estadoFiltro === "TODOS" ||
          item.estadoStock === estadoFiltro;

        const contenido =
          [
            item.producto,
            item.tienda,
            item.idProducto
          ]
            .join(" ")
            .toLowerCase();

        const coincideBusqueda =
          !texto ||
          contenido.includes(texto);

        return (
          coincideEstado &&
          coincideBusqueda
        );
      });

    }, [
      inventario,
      busqueda,
      estadoFiltro
    ]);


  // ==========================================
  // PAGINACIÓN INVENTARIO
  // ==========================================

  const totalPaginasInventario =
    Math.ceil(
      inventarioFiltrado.length /
      registrosPorPagina
    );

  const inicioInventario =
    (paginaInventario - 1) *
    registrosPorPagina;

  const finInventario =
    inicioInventario +
    registrosPorPagina;

  const inventarioPaginado =
    inventarioFiltrado.slice(
      inicioInventario,
      finInventario
    );


  // ==========================================
  // PAGINACIÓN MOVIMIENTOS
  // ==========================================

  const totalPaginasMovimientos =
    Math.ceil(
      movimientos.length /
      registrosPorPagina
    );

  const inicioMovimientos =
    (paginaMovimientos - 1) *
    registrosPorPagina;

  const finMovimientos =
    inicioMovimientos +
    registrosPorPagina;

  const movimientosPaginados =
    movimientos.slice(
      inicioMovimientos,
      finMovimientos
    );


  // ==========================================
  // REINICIAR PAGINACIÓN AL FILTRAR
  // ==========================================

  useEffect(() => {

    setPaginaInventario(1);

  }, [
    busqueda,
    estadoFiltro
  ]);


  // ==========================================
  // RESUMEN
  // ==========================================

  const resumen =
    useMemo(() => {

      const totalProductos =
        inventario.length;

      const bajoStock =
        inventario.filter(
          item =>
            item.estadoStock ===
            "STOCK BAJO"
        ).length;

      const agotados =
        inventario.filter(
          item =>
            item.estadoStock ===
            "AGOTADO"
        ).length;

      const unidades =
        inventario.reduce(
          (total, item) =>
            total +
            Number(
              item.stockActual || 0
            ),
          0
        );

      return {
        totalProductos,
        bajoStock,
        agotados,
        unidades
      };

    }, [inventario]);


  // ==========================================
  // MODAL ENTRADA
  // ==========================================

  const abrirEntrada = producto => {

    setProductoSeleccionado(
      producto
    );

    setCantidadEntrada("");
    setMotivoEntrada("");
    setError("");

    setModalEntrada(true);
  };


  const cerrarEntrada = () => {

    setModalEntrada(false);

    setProductoSeleccionado(null);

    setCantidadEntrada("");
    setMotivoEntrada("");
  };


  // ==========================================
  // REGISTRAR ENTRADA
  // ==========================================

  const guardarEntrada = async e => {

    e.preventDefault();

    const cantidad =
      Number(cantidadEntrada);

    if (
      !productoSeleccionado ||
      cantidad <= 0
    ) {

      setError(
        "La cantidad debe ser mayor que cero."
      );

      return;
    }

    try {

      setGuardando(true);
      setError("");
      setMensaje("");

      const respuesta =
        await registrarEntradaInventario({
          idProducto:
            productoSeleccionado.idProducto,

          cantidad,

          motivo:
            motivoEntrada.trim()
        });

      setMensaje(
        respuesta?.mensaje ||
        "Entrada registrada correctamente."
      );

      cerrarEntrada();

      await cargarDatos();

    } catch (err) {

      console.error(
        "Error registrando entrada:",
        err
      );

      setError(
        err.message ||
        "No se pudo registrar la entrada."
      );

    } finally {

      setGuardando(false);
    }
  };


  // ==========================================
  // MODAL AJUSTE
  // ==========================================

  const abrirAjuste = producto => {

    setProductoAjuste(
      producto
    );

    setStockFisico(
      producto.stockActual
    );

    setMotivoAjuste("");
    setError("");

    setModalAjuste(true);
  };


  const cerrarAjuste = () => {

    setModalAjuste(false);

    setProductoAjuste(null);

    setStockFisico("");

    setMotivoAjuste("");
  };


  // ==========================================
  // REGISTRAR AJUSTE
  // ==========================================

  const guardarAjuste = async e => {

    e.preventDefault();

    const nuevoStock =
      Number(stockFisico);

    if (
      !productoAjuste ||
      nuevoStock < 0
    ) {

      setError(
        "El stock físico no puede ser negativo."
      );

      return;
    }

    if (
      nuevoStock ===
      Number(
        productoAjuste.stockActual
      )
    ) {

      setError(
        "El stock físico es igual al stock actual."
      );

      return;
    }

    try {

      setGuardandoAjuste(true);

      setError("");
      setMensaje("");

      const respuesta =
        await registrarAjusteInventario({
          idProducto:
            productoAjuste.idProducto,

          stockFisico:
            nuevoStock,

          motivo:
            motivoAjuste.trim()
        });

      setMensaje(
        respuesta?.mensaje ||
        "Inventario ajustado correctamente."
      );

      cerrarAjuste();

      await cargarDatos();

    } catch (err) {

      console.error(
        "Error ajustando inventario:",
        err
      );

      setError(
        err.message ||
        "No se pudo ajustar el inventario."
      );

    } finally {

      setGuardandoAjuste(false);
    }
  };


  // ==========================================
  // ESTADO STOCK
  // ==========================================

  const estadoClase = estado => {

    switch (estado) {

      case "DISPONIBLE":
        return (
          "inventario-status disponible"
        );

      case "STOCK BAJO":
        return (
          "inventario-status bajo"
        );

      case "AGOTADO":
        return (
          "inventario-status agotado"
        );

      default:
        return "inventario-status";
    }
  };


  // ==========================================
  // FORMATEAR MOVIMIENTO
  // ==========================================

  const formatearMovimiento = tipo => {

    if (!tipo) {
      return "Sin tipo";
    }

    return tipo
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(
        /\b\w/g,
        letra =>
          letra.toUpperCase()
      );
  };


  // ==========================================
  // FORMATEAR FECHA
  // ==========================================

  const formatearFecha = fecha => {

    if (!fecha) {
      return "Sin fecha";
    }

    return new Intl.DateTimeFormat(
      "es-SV",
      {
        dateStyle: "medium",
        timeStyle: "short"
      }
    ).format(
      new Date(fecha)
    );
  };


  // ==========================================
  // LOADING
  // ==========================================

  if (cargando) {

    return (

      <div className="inventario-page">

        <div className="inventario-loading">

          <div
            className="spinner-border"
          />

          <p>
            Cargando inventario...
          </p>

        </div>

      </div>
    );
  }


  return (

    <div className="inventario-page">

      <div className="inventario-container">


        {/* ====================================== */}
        {/* HEADER */}
        {/* ====================================== */}

        <div className="inventario-header">

          <div>

            <span className="inventario-eyebrow">
              CONTROL DE EXISTENCIAS
            </span>

            <h1>
              Inventario
            </h1>

            <p>
              Consulta el stock de tus productos,
              registra entradas y realiza ajustes
              de inventario.
            </p>

          </div>

        </div>


        {/* ====================================== */}
        {/* ALERTAS */}
        {/* ====================================== */}

        {error && (

          <div className="inventario-alert error">

            <i className="bi bi-exclamation-circle"></i>

            {error}

          </div>
        )}


        {mensaje && (

          <div className="inventario-alert success">

            <i className="bi bi-check-circle"></i>

            {mensaje}

          </div>
        )}


        {/* ====================================== */}
        {/* KPI */}
        {/* ====================================== */}

        <div className="inventario-summary">


          <div className="inventario-summary-card">

            <span>
              Productos
            </span>

            <strong>
              {resumen.totalProductos}
            </strong>

            <i className="bi bi-box-seam"></i>

          </div>


          <div className="inventario-summary-card">

            <span>
              Unidades disponibles
            </span>

            <strong>
              {resumen.unidades}
            </strong>

            <i className="bi bi-boxes"></i>

          </div>


          <div className="inventario-summary-card">

            <span>
              Stock bajo
            </span>

            <strong>
              {resumen.bajoStock}
            </strong>

            <i className="bi bi-exclamation-triangle"></i>

          </div>


          <div className="inventario-summary-card">

            <span>
              Agotados
            </span>

            <strong>
              {resumen.agotados}
            </strong>

            <i className="bi bi-x-circle"></i>

          </div>


        </div>


        {/* ====================================== */}
        {/* TABS */}
        {/* ====================================== */}

        <div className="inventario-tabs">

          <button
            type="button"
            className={
              vista === "inventario"
                ? "active"
                : ""
            }
            onClick={() =>
              setVista("inventario")
            }
          >

            <i className="bi bi-box-seam"></i>

            Inventario

          </button>


          <button
            type="button"
            className={
              vista === "movimientos"
                ? "active"
                : ""
            }
            onClick={() =>
              setVista("movimientos")
            }
          >

            <i className="bi bi-clock-history"></i>

            Movimientos

          </button>

        </div>


        {/* ====================================== */}
        {/* INVENTARIO */}
        {/* ====================================== */}

        {vista === "inventario" && (

          <section className="inventario-card">


            <div className="inventario-card-header">

              <div>

                <h2>
                  Existencias actuales
                </h2>

                <p>
                  Stock disponible por
                  producto y tienda
                </p>

              </div>


              <div className="inventario-filtros">


                <div className="inventario-search">

                  <i className="bi bi-search"></i>

                  <input
                    type="text"
                    value={busqueda}
                    placeholder="Buscar producto o tienda..."
                    onChange={e =>
                      setBusqueda(
                        e.target.value
                      )
                    }
                  />

                </div>


                <select
                  value={estadoFiltro}
                  onChange={e =>
                    setEstadoFiltro(
                      e.target.value
                    )
                  }
                >

                  <option value="TODOS">
                    Todos
                  </option>

                  <option value="DISPONIBLE">
                    Disponible
                  </option>

                  <option value="STOCK BAJO">
                    Stock bajo
                  </option>

                  <option value="AGOTADO">
                    Agotado
                  </option>

                </select>


              </div>

            </div>


            {inventarioFiltrado.length === 0 ? (

              <div className="inventario-empty">

                <i className="bi bi-box"></i>

                <h3>
                  No hay inventario
                </h3>

                <p>
                  No se encontraron productos
                  con los filtros seleccionados.
                </p>

              </div>

            ) : (

              <div className="table-responsive">


                <table className="inventario-table">

                  <thead>

                    <tr>
                      <th>Producto</th>
                      <th>Tienda</th>
                      <th>Stock actual</th>
                      <th>Mínimo</th>
                      <th>Máximo</th>
                      <th>Estado</th>
                      <th>Actualizado</th>
                      <th>Acciones</th>
                    </tr>

                  </thead>


                  <tbody>

                    {inventarioPaginado.map(
                      item => (

                        <tr
                          key={
                            item.idInventario
                          }
                        >


                          <td>

                            <div className="inventario-producto">

                              <strong>
                                {item.producto}
                              </strong>

                              <small>
                                ID #{item.idProducto}
                              </small>

                            </div>

                          </td>


                          <td>
                            {item.tienda}
                          </td>


                          <td>

                            <strong className="inventario-stock">
                              {item.stockActual}
                            </strong>

                          </td>


                          <td>
                            {item.stockMinimo}
                          </td>


                          <td>
                            {item.stockMaximo}
                          </td>


                          <td>

                            <span
                              className={
                                estadoClase(
                                  item.estadoStock
                                )
                              }
                            >
                              {item.estadoStock}
                            </span>

                          </td>


                          <td>

                            {
                              formatearFecha(
                                item.fechaActualizacion
                              )
                            }

                          </td>


                          <td>

                            <div className="inventario-actions">

                              <button
                                type="button"
                                className="inventario-action"
                                onClick={() =>
                                  abrirEntrada(item)
                                }
                              >

                                <i className="bi bi-plus-lg"></i>

                                Entrada

                              </button>


                              <button
                                type="button"
                                className="inventario-action ajuste"
                                onClick={() =>
                                  abrirAjuste(item)
                                }
                              >

                                <i className="bi bi-sliders"></i>

                                Ajustar

                              </button>

                            </div>

                          </td>


                        </tr>
                      )
                    )}

                  </tbody>

                </table>


                {/* ================================== */}
                {/* PAGINACIÓN INVENTARIO */}
                {/* ================================== */}

                <div className="inventario-pagination">

                  <span>

                    Mostrando{" "}

                    <strong>
                      {inicioInventario + 1}
                    </strong>

                    {" - "}

                    <strong>
                      {Math.min(
                        finInventario,
                        inventarioFiltrado.length
                      )}
                    </strong>

                    {" de "}

                    <strong>
                      {inventarioFiltrado.length}
                    </strong>

                    {" productos"}

                  </span>


                  <div className="inventario-pagination-controls">


                    <button
                      type="button"
                      disabled={
                        paginaInventario === 1
                      }
                      onClick={() =>
                        setPaginaInventario(
                          pagina =>
                            Math.max(
                              pagina - 1,
                              1
                            )
                        )
                      }
                      title="Página anterior"
                    >

                      <i className="bi bi-chevron-left"></i>

                    </button>


                    <span>

                      Página{" "}

                      <strong>
                        {paginaInventario}
                      </strong>

                      {" de "}

                      <strong>
                        {
                          totalPaginasInventario ||
                          1
                        }
                      </strong>

                    </span>


                    <button
                      type="button"
                      disabled={
                        paginaInventario >=
                        totalPaginasInventario
                      }
                      onClick={() =>
                        setPaginaInventario(
                          pagina =>
                            Math.min(
                              pagina + 1,
                              totalPaginasInventario
                            )
                        )
                      }
                      title="Página siguiente"
                    >

                      <i className="bi bi-chevron-right"></i>

                    </button>


                  </div>

                </div>


              </div>
            )}


          </section>
        )}


        {/* ====================================== */}
        {/* MOVIMIENTOS */}
        {/* ====================================== */}

        {vista === "movimientos" && (

          <section className="inventario-card">


            <div className="inventario-card-header">

              <div>

                <h2>
                  Historial de movimientos
                </h2>

                <p>
                  Entradas, ventas,
                  ajustes y devoluciones
                </p>

              </div>

            </div>


            {movimientos.length === 0 ? (

              <div className="inventario-empty">

                <i className="bi bi-clock-history"></i>

                <h3>
                  Sin movimientos
                </h3>

                <p>
                  Todavía no hay movimientos
                  registrados.
                </p>

              </div>

            ) : (

              <div className="table-responsive">


                <table className="inventario-table">

                  <thead>

                    <tr>
                      <th>Fecha</th>
                      <th>Producto</th>
                      <th>Tienda</th>
                      <th>Tipo</th>
                      <th>Cantidad</th>
                      <th>Stock anterior</th>
                      <th>Stock nuevo</th>
                      <th>Motivo</th>
                    </tr>

                  </thead>


                  <tbody>

                    {movimientosPaginados.map(
                      movimiento => (

                        <tr
                          key={
                            movimiento.idMovimiento
                          }
                        >


                          <td>

                            {
                              formatearFecha(
                                movimiento.fechaMovimiento
                              )
                            }

                          </td>


                          <td>
                            {
                              movimiento.producto ||
                              "Producto"
                            }
                          </td>


                          <td>
                            {
                              movimiento.tienda ||
                              "Sin tienda"
                            }
                          </td>


                          <td>

                            <span className="movimiento-tipo">

                              {
                                formatearMovimiento(
                                  movimiento.tipoMovimiento
                                )
                              }

                            </span>

                          </td>


                          <td>
                            {movimiento.cantidad}
                          </td>


                          <td>
                            {movimiento.stockAnterior}
                          </td>


                          <td>

                            <strong>
                              {movimiento.stockNuevo}
                            </strong>

                          </td>


                          <td>

                            {
                              movimiento.motivo ||
                              "Sin motivo"
                            }

                          </td>


                        </tr>
                      )
                    )}

                  </tbody>

                </table>


                {/* ================================== */}
                {/* PAGINACIÓN MOVIMIENTOS */}
                {/* ================================== */}

                <div className="inventario-pagination">

                  <span>

                    Mostrando{" "}

                    <strong>
                      {inicioMovimientos + 1}
                    </strong>

                    {" - "}

                    <strong>
                      {Math.min(
                        finMovimientos,
                        movimientos.length
                      )}
                    </strong>

                    {" de "}

                    <strong>
                      {movimientos.length}
                    </strong>

                    {" movimientos"}

                  </span>


                  <div className="inventario-pagination-controls">


                    <button
                      type="button"
                      disabled={
                        paginaMovimientos === 1
                      }
                      onClick={() =>
                        setPaginaMovimientos(
                          pagina =>
                            Math.max(
                              pagina - 1,
                              1
                            )
                        )
                      }
                      title="Página anterior"
                    >

                      <i className="bi bi-chevron-left"></i>

                    </button>


                    <span>

                      Página{" "}

                      <strong>
                        {paginaMovimientos}
                      </strong>

                      {" de "}

                      <strong>
                        {
                          totalPaginasMovimientos ||
                          1
                        }
                      </strong>

                    </span>


                    <button
                      type="button"
                      disabled={
                        paginaMovimientos >=
                        totalPaginasMovimientos
                      }
                      onClick={() =>
                        setPaginaMovimientos(
                          pagina =>
                            Math.min(
                              pagina + 1,
                              totalPaginasMovimientos
                            )
                        )
                      }
                      title="Página siguiente"
                    >

                      <i className="bi bi-chevron-right"></i>

                    </button>


                  </div>

                </div>


              </div>
            )}


          </section>
        )}


      </div>


      {/* ====================================== */}
      {/* MODAL ENTRADA */}
      {/* ====================================== */}

      {modalEntrada && (

        <div className="inventario-modal-backdrop">

          <div className="inventario-modal">


            <div className="inventario-modal-header">

              <div>

                <span>
                  REGISTRAR ENTRADA
                </span>

                <h2>
                  {
                    productoSeleccionado
                      ?.producto
                  }
                </h2>

              </div>


              <button
                type="button"
                onClick={cerrarEntrada}
                disabled={guardando}
              >

                <i className="bi bi-x-lg"></i>

              </button>

            </div>


            <form
              onSubmit={guardarEntrada}
            >


              <div className="inventario-modal-stock">

                <span>
                  Stock actual
                </span>

                <strong>
                  {
                    productoSeleccionado
                      ?.stockActual
                  }
                </strong>

              </div>


              <div className="inventario-form-group">

                <label>
                  Cantidad a ingresar
                </label>

                <input
                  type="number"
                  min="1"
                  required
                  value={cantidadEntrada}
                  onChange={e =>
                    setCantidadEntrada(
                      e.target.value
                    )
                  }
                />

              </div>


              <div className="inventario-form-group">

                <label>
                  Motivo
                </label>

                <textarea
                  rows="3"
                  value={motivoEntrada}
                  placeholder="Ej: Reposición de proveedor"
                  onChange={e =>
                    setMotivoEntrada(
                      e.target.value
                    )
                  }
                />

              </div>


              <div className="inventario-modal-actions">

                <button
                  type="button"
                  className="btn-cancelar"
                  onClick={cerrarEntrada}
                  disabled={guardando}
                >

                  Cancelar

                </button>


                <button
                  type="submit"
                  className="btn-guardar"
                  disabled={guardando}
                >

                  {
                    guardando
                      ? "Guardando..."
                      : "Registrar entrada"
                  }

                </button>

              </div>


            </form>


          </div>

        </div>
      )}


      {/* ====================================== */}
      {/* MODAL AJUSTE */}
      {/* ====================================== */}

      {modalAjuste && (

        <div className="inventario-modal-backdrop">

          <div className="inventario-modal">


            <div className="inventario-modal-header">

              <div>

                <span>
                  AJUSTE DE INVENTARIO
                </span>

                <h2>
                  {
                    productoAjuste
                      ?.producto
                  }
                </h2>

              </div>


              <button
                type="button"
                onClick={cerrarAjuste}
                disabled={
                  guardandoAjuste
                }
              >

                <i className="bi bi-x-lg"></i>

              </button>

            </div>


            <form
              onSubmit={guardarAjuste}
            >


              <div className="inventario-modal-stock">

                <span>
                  Stock registrado
                </span>

                <strong>
                  {
                    productoAjuste
                      ?.stockActual
                  }
                </strong>

              </div>


              <div className="inventario-form-group">

                <label>
                  Stock físico real
                </label>

                <input
                  type="number"
                  min="0"
                  required
                  value={stockFisico}
                  onChange={e =>
                    setStockFisico(
                      e.target.value
                    )
                  }
                />

                <small className="inventario-form-help">

                  Ingresa la cantidad real
                  encontrada durante el conteo
                  físico.

                </small>

              </div>


              <div className="inventario-form-group">

                <label>
                  Motivo del ajuste
                </label>

                <textarea
                  rows="3"
                  value={motivoAjuste}
                  placeholder="Ej: Conteo físico de inventario"
                  onChange={e =>
                    setMotivoAjuste(
                      e.target.value
                    )
                  }
                />

              </div>


              <div className="inventario-ajuste-preview">

                <span>
                  Diferencia
                </span>

                <strong>

                  {
                    stockFisico === ""
                      ? 0
                      : Number(stockFisico) -
                        Number(
                          productoAjuste
                            ?.stockActual || 0
                        )
                  }

                </strong>

              </div>


              <div className="inventario-modal-actions">

                <button
                  type="button"
                  className="btn-cancelar"
                  onClick={cerrarAjuste}
                  disabled={
                    guardandoAjuste
                  }
                >

                  Cancelar

                </button>


                <button
                  type="submit"
                  className="btn-guardar"
                  disabled={
                    guardandoAjuste
                  }
                >

                  {
                    guardandoAjuste
                      ? "Guardando..."
                      : "Guardar ajuste"
                  }

                </button>

              </div>


            </form>


          </div>

        </div>
      )}


    </div>
  );
}