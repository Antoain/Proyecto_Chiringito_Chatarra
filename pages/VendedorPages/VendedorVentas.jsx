import React, {
  useEffect,
  useMemo,
  useState
} from "react";

import {
  obtenerPedidosVendedor,
  obtenerPedidosTiendaVendedor,
  cambiarEstadoEntrega,
  actualizarSeguimientoEntrega,
  obtenerHistorialEntrega,
  registrarDevolucionInventario
} from "../../services/data";

import "./VendedorPagesCss/VendedorVentas.css";


export function VendedorVentas() {

  // =====================================================
  // DATOS PRINCIPALES
  // =====================================================

  const [pedidos, setPedidos] =
    useState([]);

  const [cargando, setCargando] =
    useState(true);

  const [error, setError] =
    useState("");

  const [mensaje, setMensaje] =
    useState("");

  const [busqueda, setBusqueda] =
    useState("");

  const [estadoFiltro, setEstadoFiltro] =
    useState("TODOS");

  const [paginaActual, setPaginaActual] =
    useState(1);

  const pedidosPorPagina = 10;


  // =====================================================
  // MODAL
  // =====================================================

  const [
    pedidoSeleccionado,
    setPedidoSeleccionado
  ] = useState(null);

  const [
    modalGestion,
    setModalGestion
  ] = useState(false);

  const [
    historial,
    setHistorial
  ] = useState(null);

  const [
    cargandoHistorial,
    setCargandoHistorial
  ] = useState(false);

  const [
    guardando,
    setGuardando
  ] = useState(false);


  // =====================================================
  // SEGUIMIENTO ALIADO
  // =====================================================

  const [
    proveedorEntrega,
    setProveedorEntrega
  ] = useState("");

  const [
    codigoSeguimiento,
    setCodigoSeguimiento
  ] = useState("");


  // =====================================================
  // DEVOLUCIÓN
  // =====================================================

  const [
    idProductoDevolucion,
    setIdProductoDevolucion
  ] = useState("");

  const [
    cantidadDevolucion,
    setCantidadDevolucion
  ] = useState("");

  const [
    motivoDevolucion,
    setMotivoDevolucion
  ] = useState("");

  const [
    procesandoDevolucion,
    setProcesandoDevolucion
  ] = useState(false);


  // =====================================================
  // CARGAR PEDIDOS
  // =====================================================

  const cargarPedidos = async () => {

    try {

      setCargando(true);
      setError("");

      const [
        dataPedidos,
        dataDetalle
      ] = await Promise.all([
        obtenerPedidosVendedor(),
        obtenerPedidosTiendaVendedor()
      ]);


      const pedidosSIG =
        Array.isArray(dataPedidos)
          ? dataPedidos
          : [];

      const pedidosDetalle =
        Array.isArray(dataDetalle)
          ? dataDetalle
          : [];


      const pedidosCombinados =
        pedidosSIG.map(
          pedido => {

            const detalle =
              pedidosDetalle.find(
                item =>
                  Number(
                    item.idSubPedido
                  ) ===
                  Number(
                    pedido.idSubPedido
                  )
              );


            return {
              ...pedido,

              productos:
                detalle?.productos || []
            };
          }
        );


      setPedidos(
        pedidosCombinados
      );

    } catch (err) {

      console.error(
        "Error al cargar pedidos:",
        err
      );

      setError(
        err.message ||
        "No se pudieron cargar los pedidos."
      );

    } finally {

      setCargando(false);
    }
  };


  useEffect(() => {

    cargarPedidos();

  }, []);


  useEffect(() => {

    setPaginaActual(1);

  }, [
    busqueda,
    estadoFiltro
  ]);


  // =====================================================
  // HELPERS
  // =====================================================

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


  const formatearEstado = estado => {

    if (!estado) {
      return "SIN ESTADO";
    }

    return String(estado)
      .replaceAll("_", " ")
      .toUpperCase();
  };


  const obtenerClaseEstado = estado => {

    switch (estado) {

      case "ENTREGADO":
        return "venta-status entregado";

      case "PENDIENTE":
        return "venta-status pendiente";

      case "LISTO_PARA_ENVIO":
      case "LISTO_PARA_RECOGER":
        return "venta-status confirmado";

      case "ENVIADO":
      case "EN_CAMINO":
        return "venta-status enviado";

      case "CANCELADO":
        return "venta-status cancelado";

      default:
        return "venta-status";
    }
  };


  const obtenerEstadoActual =
    pedido => {

      return (
        pedido?.entrega
          ?.estadoEntrega ||
        pedido?.estado ||
        ""
      );
    };


  const obtenerMetodoEntrega =
    pedido => {

      return (
        pedido?.entrega
          ?.metodoEntrega ||
        pedido?.metodoEntrega ||
        ""
      );
    };


  // =====================================================
  // FILTRADO
  // =====================================================

  const pedidosFiltrados =
    useMemo(() => {

      const texto =
        busqueda
          .trim()
          .toLowerCase();


      return pedidos.filter(
        pedido => {

          const coincideEstado =
            estadoFiltro === "TODOS" ||
            pedido.estado ===
              estadoFiltro;


          const cliente =
            `${
              pedido.cliente
                ?.nombres || ""
            } ${
              pedido.cliente
                ?.apellidos || ""
            }`
              .toLowerCase();


          const contenidoBusqueda =
            [
              pedido.idPedido,
              pedido.idSubPedido,
              pedido.tienda,
              pedido.cliente?.correo,
              cliente
            ]
              .join(" ")
              .toLowerCase();


          const coincideBusqueda =
            !texto ||
            contenidoBusqueda.includes(
              texto
            );


          return (
            coincideEstado &&
            coincideBusqueda
          );
        }
      );

    }, [
      pedidos,
      busqueda,
      estadoFiltro
    ]);


  // =====================================================
  // PAGINACIÓN
  // =====================================================

  const totalPaginas =
    Math.ceil(
      pedidosFiltrados.length /
      pedidosPorPagina
    );


  const indiceInicio =
    (paginaActual - 1) *
    pedidosPorPagina;


  const indiceFin =
    indiceInicio +
    pedidosPorPagina;


  const pedidosPaginados =
    pedidosFiltrados.slice(
      indiceInicio,
      indiceFin
    );


  // =====================================================
  // RESUMEN
  // =====================================================

  const resumen =
    useMemo(() => {

      const validos =
        pedidos.filter(
          pedido =>
            pedido.estado !==
            "CANCELADO"
        );


      const totalVendedor =
        validos.reduce(
          (total, pedido) =>
            total +
            Number(
              pedido.totalVendedor || 0
            ),
          0
        );


      const pendientes =
        pedidos.filter(
          pedido =>
            pedido.estado ===
            "PENDIENTE"
        ).length;


      const entregados =
        pedidos.filter(
          pedido =>
            pedido.estado ===
            "ENTREGADO"
        ).length;


      return {
        totalPedidos:
          validos.length,

        totalVendedor,

        pendientes,

        entregados
      };

    }, [pedidos]);


  // =====================================================
  // SIGUIENTE ESTADO
  // =====================================================

  const obtenerSiguienteEstado =
    pedido => {

      const estado =
        obtenerEstadoActual(
          pedido
        );

      const metodo =
        obtenerMetodoEntrega(
          pedido
        );


      if (
        estado === "ENTREGADO" ||
        estado === "CANCELADO"
      ) {
        return null;
      }


      if (
        metodo ===
        "RECOGER_TIENDA"
      ) {

        if (
          estado === "PENDIENTE"
        ) {
          return "LISTO_PARA_RECOGER";
        }

        if (
          estado ===
          "LISTO_PARA_RECOGER"
        ) {
          return "ENTREGADO";
        }
      }


      if (
        metodo === "TIENDA" ||
        metodo === "ALIADO"
      ) {

        if (
          estado === "PENDIENTE"
        ) {
          return "LISTO_PARA_ENVIO";
        }

        if (
          estado ===
          "LISTO_PARA_ENVIO"
        ) {
          return "EN_CAMINO";
        }

        if (
          estado === "EN_CAMINO"
        ) {
          return "ENTREGADO";
        }
      }


      return null;
    };


  // =====================================================
  // ABRIR GESTIÓN
  // =====================================================

  const abrirGestion =
    async pedido => {

      setPedidoSeleccionado(
        pedido
      );

      setProveedorEntrega(
        pedido.entrega
          ?.proveedorEntrega ||
        ""
      );

      setCodigoSeguimiento(
        pedido.entrega
          ?.codigoSeguimiento ||
        ""
      );


      setIdProductoDevolucion("");
      setCantidadDevolucion("");
      setMotivoDevolucion("");

      setHistorial(null);

      setError("");

      setModalGestion(true);


      try {

        setCargandoHistorial(true);

        const data =
          await obtenerHistorialEntrega(
            pedido.idSubPedido
          );

        setHistorial(
          data
        );

      } catch (err) {

        console.error(
          "Error cargando historial:",
          err
        );

      } finally {

        setCargandoHistorial(false);
      }
    };


  // =====================================================
  // CERRAR MODAL
  // =====================================================

  const cerrarGestion = () => {

    if (
      guardando ||
      procesandoDevolucion
    ) {
      return;
    }


    setModalGestion(false);

    setPedidoSeleccionado(null);

    setHistorial(null);

    setProveedorEntrega("");
    setCodigoSeguimiento("");

    setIdProductoDevolucion("");
    setCantidadDevolucion("");
    setMotivoDevolucion("");

    setError("");
  };


  // =====================================================
  // AVANZAR ESTADO
  // =====================================================

  const avanzarEstado =
    async () => {

      if (!pedidoSeleccionado) {
        return;
      }


      const siguienteEstado =
        obtenerSiguienteEstado(
          pedidoSeleccionado
        );


      if (!siguienteEstado) {
        return;
      }


      const confirmar =
        window.confirm(
          `¿Cambiar el estado a ${formatearEstado(
            siguienteEstado
          )}?`
        );


      if (!confirmar) {
        return;
      }


      try {

        setGuardando(true);
        setError("");


        await cambiarEstadoEntrega(
          pedidoSeleccionado
            .idSubPedido,
          siguienteEstado
        );


        const historialActualizado =
          await obtenerHistorialEntrega(
            pedidoSeleccionado
              .idSubPedido
          );


        setHistorial(
          historialActualizado
        );


        const actualizado = {
          ...pedidoSeleccionado,

          estado:
            siguienteEstado,

          entrega: {
            ...(
              pedidoSeleccionado
                .entrega || {}
            ),

            estadoEntrega:
              siguienteEstado
          }
        };


        setPedidoSeleccionado(
          actualizado
        );


        setPedidos(prev =>
          prev.map(
            pedido =>
              pedido.idSubPedido ===
              actualizado.idSubPedido
                ? actualizado
                : pedido
          )
        );


        setMensaje(
          "Estado actualizado correctamente."
        );


        setTimeout(
          () => setMensaje(""),
          3000
        );

      } catch (err) {

        console.error(err);

        setError(
          err.message ||
          "No se pudo actualizar el estado."
        );

      } finally {

        setGuardando(false);
      }
    };


  // =====================================================
  // CANCELAR
  // =====================================================

  const cancelarEntrega =
    async () => {

      if (!pedidoSeleccionado) {
        return;
      }


      const confirmar =
        window.confirm(
          "¿Seguro que deseas cancelar esta entrega?"
        );


      if (!confirmar) {
        return;
      }


      try {

        setGuardando(true);
        setError("");


        await cambiarEstadoEntrega(
          pedidoSeleccionado
            .idSubPedido,
          "CANCELADO"
        );


        const actualizado = {
          ...pedidoSeleccionado,

          estado:
            "CANCELADO",

          entrega: {
            ...(
              pedidoSeleccionado
                .entrega || {}
            ),

            estadoEntrega:
              "CANCELADO"
          }
        };


        setPedidoSeleccionado(
          actualizado
        );


        setPedidos(prev =>
          prev.map(
            pedido =>
              pedido.idSubPedido ===
              actualizado.idSubPedido
                ? actualizado
                : pedido
          )
        );


        const historialActualizado =
          await obtenerHistorialEntrega(
            pedidoSeleccionado
              .idSubPedido
          );


        setHistorial(
          historialActualizado
        );


        setMensaje(
          "Entrega cancelada correctamente."
        );


        setTimeout(
          () => setMensaje(""),
          3000
        );

      } catch (err) {

        console.error(err);

        setError(
          err.message ||
          "No se pudo cancelar la entrega."
        );

      } finally {

        setGuardando(false);
      }
    };


  // =====================================================
  // SEGUIMIENTO ALIADO
  // =====================================================

  const guardarSeguimiento =
    async e => {

      e.preventDefault();


      if (!pedidoSeleccionado) {
        return;
      }


      if (
        !proveedorEntrega.trim() ||
        !codigoSeguimiento.trim()
      ) {

        setError(
          "Completa el proveedor y el código de seguimiento."
        );

        return;
      }


      try {

        setGuardando(true);
        setError("");


        await actualizarSeguimientoEntrega(
          pedidoSeleccionado
            .idSubPedido,

          proveedorEntrega.trim(),

          codigoSeguimiento.trim()
        );


        const actualizado = {
          ...pedidoSeleccionado,

          entrega: {
            ...(
              pedidoSeleccionado
                .entrega || {}
            ),

            proveedorEntrega:
              proveedorEntrega.trim(),

            codigoSeguimiento:
              codigoSeguimiento.trim()
          }
        };


        setPedidoSeleccionado(
          actualizado
        );


        setPedidos(prev =>
          prev.map(
            pedido =>
              pedido.idSubPedido ===
              actualizado.idSubPedido
                ? actualizado
                : pedido
          )
        );


        setMensaje(
          "Seguimiento actualizado correctamente."
        );


        setTimeout(
          () => setMensaje(""),
          3000
        );

      } catch (err) {

        console.error(err);

        setError(
          err.message ||
          "No se pudo actualizar el seguimiento."
        );

      } finally {

        setGuardando(false);
      }
    };


  // =====================================================
  // REGISTRAR DEVOLUCIÓN
  // =====================================================

  const manejarDevolucion =
    async e => {

      e.preventDefault();


      if (!pedidoSeleccionado) {
        return;
      }


      const idProducto =
        Number(
          idProductoDevolucion
        );

      const cantidad =
        Number(
          cantidadDevolucion
        );


      if (
        !idProducto ||
        !cantidad ||
        cantidad <= 0
      ) {

        setError(
          "Selecciona un producto y una cantidad válida."
        );

        return;
      }


      const producto =
        pedidoSeleccionado
          .productos
          ?.find(
            item =>
              Number(
                item.idProducto
              ) === idProducto
          );


      if (!producto) {

        setError(
          "El producto seleccionado no pertenece al pedido."
        );

        return;
      }


      if (
        cantidad >
        Number(
          producto.cantidad
        )
      ) {

        setError(
          `La cantidad no puede superar las ${producto.cantidad} unidades compradas.`
        );

        return;
      }


      const confirmar =
        window.confirm(
          `¿Registrar devolución de ${cantidad} unidad(es) de ${producto.nombre}?`
        );


      if (!confirmar) {
        return;
      }


      try {

        setProcesandoDevolucion(
          true
        );

        setError("");


        const resultado =
          await registrarDevolucionInventario({
            idSubPedido:
              pedidoSeleccionado
                .idSubPedido,

            idProducto,

            cantidad,

            motivo:
              motivoDevolucion
          });


        setMensaje(
          resultado?.mensaje ||
          "Devolución registrada correctamente."
        );


        setIdProductoDevolucion("");
        setCantidadDevolucion("");
        setMotivoDevolucion("");


        setTimeout(
          () => setMensaje(""),
          3500
        );

      } catch (err) {

        console.error(
          "Error registrando devolución:",
          err
        );

        setError(
          err.message ||
          "No se pudo registrar la devolución."
        );

      } finally {

        setProcesandoDevolucion(
          false
        );
      }
    };


  // =====================================================
  // LOADING
  // =====================================================

  if (cargando) {

    return (

      <div className="ventas-page">

        <div className="ventas-loading">

          <div className="spinner-border" />

          <p>
            Cargando pedidos...
          </p>

        </div>

      </div>
    );
  }


  return (

    <div className="ventas-page">

      <div className="ventas-container">


        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <div className="ventas-header">

          <div>

            <span className="ventas-eyebrow">
              GESTIÓN DE PEDIDOS
            </span>

            <h1>
              Ventas y pedidos
            </h1>

            <p>
              Gestiona pedidos, productos,
              entregas, seguimiento y devoluciones.
            </p>

          </div>

        </div>


        {/* ================================================= */}
        {/* ALERTAS */}
        {/* ================================================= */}

        {error && !modalGestion && (

          <div className="ventas-alert ventas-alert-error">

            <i className="bi bi-exclamation-circle"></i>

            {error}

          </div>
        )}


        {mensaje && (

          <div className="ventas-alert ventas-alert-success">

            <i className="bi bi-check-circle"></i>

            {mensaje}

          </div>
        )}


        {/* ================================================= */}
        {/* KPIS */}
        {/* ================================================= */}

        <div className="ventas-summary">


          <div className="ventas-summary-card">

            <div>

              <span>
                Pedidos válidos
              </span>

              <strong>
                {resumen.totalPedidos}
              </strong>

            </div>

            <div className="ventas-summary-icon">

              <i className="bi bi-bag-check"></i>

            </div>

          </div>


          <div className="ventas-summary-card">

            <div>

              <span>
                Ingreso del vendedor
              </span>

              <strong>

                $

                {
                  resumen
                    .totalVendedor
                    .toFixed(2)
                }

              </strong>

            </div>

            <div className="ventas-summary-icon">

              <i className="bi bi-cash-stack"></i>

            </div>

          </div>


          <div className="ventas-summary-card">

            <div>

              <span>
                Pendientes
              </span>

              <strong>
                {resumen.pendientes}
              </strong>

            </div>

            <div className="ventas-summary-icon warning">

              <i className="bi bi-clock-history"></i>

            </div>

          </div>


          <div className="ventas-summary-card">

            <div>

              <span>
                Entregados
              </span>

              <strong>
                {resumen.entregados}
              </strong>

            </div>

            <div className="ventas-summary-icon success">

              <i className="bi bi-check2-circle"></i>

            </div>

          </div>


        </div>


        {/* ================================================= */}
        {/* TABLA */}
        {/* ================================================= */}

        <section className="ventas-card">

          <div className="ventas-card-header">

            <div>

              <h2>
                Pedidos recientes
              </h2>

              <p>
                Información comercial y logística
                de tus ventas.
              </p>

            </div>


            <div className="ventas-filtros">


              <div className="ventas-search">

                <i className="bi bi-search"></i>

                <input
                  type="text"
                  placeholder="Buscar pedido, tienda o cliente..."
                  value={busqueda}
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
                  Todos los estados
                </option>

                <option value="PENDIENTE">
                  Pendiente
                </option>

                <option value="LISTO_PARA_ENVIO">
                  Listo para envío
                </option>

                <option value="LISTO_PARA_RECOGER">
                  Listo para recoger
                </option>

                <option value="EN_CAMINO">
                  En camino
                </option>

                <option value="ENTREGADO">
                  Entregado
                </option>

                <option value="CANCELADO">
                  Cancelado
                </option>

              </select>


            </div>

          </div>


          {pedidosFiltrados.length === 0 ? (

            <div className="ventas-empty">

              <i className="bi bi-receipt"></i>

              <h3>
                No hay pedidos
              </h3>

              <p>
                No se encontraron pedidos
                con los filtros seleccionados.
              </p>

            </div>

          ) : (

            <div className="table-responsive">

              <table className="ventas-table">

                <thead>

                  <tr>

                    <th>Pedido</th>
                    <th>Fecha</th>
                    <th>Cliente</th>
                    <th>Tienda</th>
                    <th>Total</th>
                    <th>Ingreso</th>
                    <th>Estado</th>
                    <th>Entrega</th>
                    <th>Acciones</th>

                  </tr>

                </thead>


                <tbody>

                  {pedidosPaginados.map(
                    pedido => (

                      <tr
                        key={
                          pedido.idSubPedido
                        }
                      >


                        <td>

                          <div className="venta-id">

                            <strong>
                              #{pedido.idPedido}
                            </strong>

                            <small>
                              Subpedido #
                              {pedido.idSubPedido}
                            </small>

                          </div>

                        </td>


                        <td>

                          {
                            formatearFecha(
                              pedido.fechaPedido
                            )
                          }

                        </td>


                        <td>

                          {pedido.cliente ? (

                            <div className="venta-cliente">

                              <strong>

                                {
                                  pedido.cliente
                                    .nombres
                                }{" "}

                                {
                                  pedido.cliente
                                    .apellidos
                                }

                              </strong>

                              <small>

                                {
                                  pedido.cliente
                                    .correo
                                }

                              </small>

                            </div>

                          ) : (

                            "Cliente no disponible"

                          )}

                        </td>


                        <td>

                          {
                            pedido.tienda ||
                            "Sin tienda"
                          }

                        </td>


                        <td className="venta-dinero">

                          $

                          {
                            Number(
                              pedido.subtotal || 0
                            ).toFixed(2)
                          }

                        </td>


                        <td className="venta-ingreso">

                          $

                          {
                            Number(
                              pedido.totalVendedor || 0
                            ).toFixed(2)
                          }

                        </td>


                        <td>

                          <span
                            className={
                              obtenerClaseEstado(
                                pedido.estado
                              )
                            }
                          >

                            {
                              formatearEstado(
                                pedido.estado
                              )
                            }

                          </span>

                        </td>


                        <td>

                          <div className="venta-entrega">

                            <span>

                              {
                                formatearEstado(
                                  obtenerEstadoActual(
                                    pedido
                                  )
                                )
                              }

                            </span>

                            <small>

                              {
                                formatearEstado(
                                  obtenerMetodoEntrega(
                                    pedido
                                  )
                                )
                              }

                            </small>

                          </div>

                        </td>


                        <td>

                          <button
                            type="button"
                            className="ventas-manage-btn"
                            onClick={() =>
                              abrirGestion(
                                pedido
                              )
                            }
                          >

                            <i className="bi bi-sliders"></i>

                            Gestionar

                          </button>

                        </td>


                      </tr>

                    )
                  )}

                </tbody>

              </table>


              <div className="ventas-pagination">


                <div className="ventas-pagination-info">

                  Mostrando{" "}

                  <strong>
                    {indiceInicio + 1}
                  </strong>

                  {" - "}

                  <strong>

                    {
                      Math.min(
                        indiceFin,
                        pedidosFiltrados.length
                      )
                    }

                  </strong>

                  {" de "}

                  <strong>
                    {pedidosFiltrados.length}
                  </strong>

                  {" pedidos"}

                </div>


                <div className="ventas-pagination-controls">


                  <button
                    type="button"
                    disabled={
                      paginaActual === 1
                    }
                    onClick={() =>
                      setPaginaActual(
                        pagina =>
                          Math.max(
                            pagina - 1,
                            1
                          )
                      )
                    }
                  >

                    <i className="bi bi-chevron-left"></i>

                  </button>


                  <span>

                    Página{" "}

                    <strong>
                      {paginaActual}
                    </strong>

                    {" de "}

                    <strong>
                      {totalPaginas || 1}
                    </strong>

                  </span>


                  <button
                    type="button"
                    disabled={
                      paginaActual >=
                      totalPaginas
                    }
                    onClick={() =>
                      setPaginaActual(
                        pagina =>
                          Math.min(
                            pagina + 1,
                            totalPaginas
                          )
                      )
                    }
                  >

                    <i className="bi bi-chevron-right"></i>

                  </button>


                </div>

              </div>

            </div>
          )}

        </section>

      </div>


      {/* ================================================= */}
      {/* MODAL */}
      {/* ================================================= */}

      {modalGestion &&
        pedidoSeleccionado && (

        <div className="ventas-modal-backdrop">

          <div className="ventas-modal">


            <div className="ventas-modal-header">

              <div>

                <span>
                  GESTIÓN DEL PEDIDO
                </span>

                <h2>

                  Pedido #
                  {
                    pedidoSeleccionado
                      .idPedido
                  }

                </h2>

                <small>

                  Subpedido #
                  {
                    pedidoSeleccionado
                      .idSubPedido
                  }

                </small>

              </div>


              <button
                type="button"
                onClick={
                  cerrarGestion
                }
                disabled={
                  guardando ||
                  procesandoDevolucion
                }
              >

                <i className="bi bi-x-lg"></i>

              </button>

            </div>


            <div className="ventas-modal-body">


              {error && (

                <div className="ventas-modal-error">

                  <i className="bi bi-exclamation-circle"></i>

                  {error}

                </div>
              )}


              {/* ======================================= */}
              {/* DATOS */}
              {/* ======================================= */}

              <div className="ventas-detail-grid">


                <div>

                  <span>
                    Cliente
                  </span>

                  <strong>

                    {
                      pedidoSeleccionado
                        .cliente
                        ?.nombres ||
                      "Sin cliente"
                    }{" "}

                    {
                      pedidoSeleccionado
                        .cliente
                        ?.apellidos ||
                      ""
                    }

                  </strong>

                </div>


                <div>

                  <span>
                    Tienda
                  </span>

                  <strong>

                    {
                      pedidoSeleccionado
                        .tienda ||
                      "Sin tienda"
                    }

                  </strong>

                </div>


                <div>

                  <span>
                    Método
                  </span>

                  <strong>

                    {
                      formatearEstado(
                        obtenerMetodoEntrega(
                          pedidoSeleccionado
                        )
                      )
                    }

                  </strong>

                </div>


                <div>

                  <span>
                    Estado
                  </span>

                  <strong>

                    {
                      formatearEstado(
                        obtenerEstadoActual(
                          pedidoSeleccionado
                        )
                      )
                    }

                  </strong>

                </div>


                <div>

                  <span>
                    Pago
                  </span>

                  <strong>

                    {
                      pedidoSeleccionado
                        .metodoPago ||
                      "Sin información"
                    }

                  </strong>

                </div>


                <div>

                  <span>
                    Teléfono
                  </span>

                  <strong>

                    {
                      pedidoSeleccionado
                        .telefono ||
                      "Sin información"
                    }

                  </strong>

                </div>


              </div>


              <div className="ventas-address">

                <i className="bi bi-geo-alt"></i>

                <div>

                  <span>
                    Dirección
                  </span>

                  <strong>

                    {
                      pedidoSeleccionado
                        .direccionEntrega ||
                      "No aplica"
                    }

                  </strong>

                </div>

              </div>


              {/* ======================================= */}
              {/* PRODUCTOS */}
              {/* ======================================= */}

              <section className="ventas-modal-section">

                <div className="ventas-modal-section-title">

                  <div>

                    <span>
                      DETALLE DE COMPRA
                    </span>

                    <h3>
                      Productos del pedido
                    </h3>

                  </div>

                </div>


                {pedidoSeleccionado
                  .productos
                  ?.length > 0 ? (

                  <div className="ventas-products">

                    {pedidoSeleccionado
                      .productos
                      .map(
                        producto => (

                          <div
                            className="ventas-product-item"
                            key={
                              producto.idProducto
                            }
                          >

                            <div className="ventas-product-main">

                              <div className="ventas-product-icon">

                                <i className="bi bi-box-seam"></i>

                              </div>


                              <div>

                                <strong>
                                  {producto.nombre}
                                </strong>

                                <span>

                                  Producto #
                                  {producto.idProducto}

                                </span>

                              </div>

                            </div>


                            <div className="ventas-product-data">

                              <div>

                                <span>
                                  Cantidad
                                </span>

                                <strong>
                                  {producto.cantidad}
                                </strong>

                              </div>


                              <div>

                                <span>
                                  Precio
                                </span>

                                <strong>

                                  $

                                  {
                                    Number(
                                      producto.precioUnitario || 0
                                    ).toFixed(2)
                                  }

                                </strong>

                              </div>


                              <div>

                                <span>
                                  Subtotal
                                </span>

                                <strong>

                                  $

                                  {
                                    Number(
                                      producto.subtotal || 0
                                    ).toFixed(2)
                                  }

                                </strong>

                              </div>

                            </div>

                          </div>

                        )
                      )}

                  </div>

                ) : (

                  <div className="ventas-products-empty">

                    <i className="bi bi-box"></i>

                    No se encontraron productos
                    para este subpedido.

                  </div>

                )}

              </section>


              {/* ======================================= */}
              {/* ESTADO LOGÍSTICO */}
              {/* ======================================= */}

              <section className="ventas-modal-section">

                <div className="ventas-modal-section-title">

                  <div>

                    <span>
                      ESTADO LOGÍSTICO
                    </span>

                    <h3>
                      Gestionar entrega
                    </h3>

                  </div>

                </div>


                <div className="ventas-state-actions">


                  {obtenerSiguienteEstado(
                    pedidoSeleccionado
                  ) && (

                    <button
                      type="button"
                      className="ventas-state-next"
                      onClick={
                        avanzarEstado
                      }
                      disabled={
                        guardando
                      }
                    >

                      <i className="bi bi-arrow-right-circle"></i>

                      Cambiar a{" "}

                      {
                        formatearEstado(
                          obtenerSiguienteEstado(
                            pedidoSeleccionado
                          )
                        )
                      }

                    </button>

                  )}


                  {![
                    "ENTREGADO",
                    "CANCELADO"
                  ].includes(
                    obtenerEstadoActual(
                      pedidoSeleccionado
                    )
                  ) && (

                    <button
                      type="button"
                      className="ventas-state-cancel"
                      onClick={
                        cancelarEntrega
                      }
                      disabled={
                        guardando
                      }
                    >

                      <i className="bi bi-x-circle"></i>

                      Cancelar entrega

                    </button>

                  )}


                </div>

              </section>


              {/* ======================================= */}
              {/* ALIADO */}
              {/* ======================================= */}

              {
                obtenerMetodoEntrega(
                  pedidoSeleccionado
                ) === "ALIADO" &&
                ![
                  "ENTREGADO",
                  "CANCELADO"
                ].includes(
                  obtenerEstadoActual(
                    pedidoSeleccionado
                  )
                ) && (

                <section className="ventas-modal-section">

                  <div className="ventas-modal-section-title">

                    <div>

                      <span>
                        SEGUIMIENTO
                      </span>

                      <h3>
                        Información del aliado
                      </h3>

                    </div>

                  </div>


                  <form
                    className="ventas-tracking-form"
                    onSubmit={
                      guardarSeguimiento
                    }
                  >


                    <div className="ventas-field">

                      <label>
                        Proveedor
                      </label>

                      <input
                        type="text"
                        maxLength={100}
                        value={
                          proveedorEntrega
                        }
                        onChange={e =>
                          setProveedorEntrega(
                            e.target.value
                          )
                        }
                        placeholder="Ej. Delivery Express"
                      />

                    </div>


                    <div className="ventas-field">

                      <label>
                        Código de seguimiento
                      </label>

                      <input
                        type="text"
                        maxLength={100}
                        value={
                          codigoSeguimiento
                        }
                        onChange={e =>
                          setCodigoSeguimiento(
                            e.target.value
                          )
                        }
                        placeholder="Ej. ENV-001"
                      />

                    </div>


                    <button
                      type="submit"
                      className="ventas-save-tracking"
                      disabled={
                        guardando
                      }
                    >

                      <i className="bi bi-floppy"></i>

                      Guardar

                    </button>


                  </form>

                </section>

              )}


              {/* ======================================= */}
              {/* DEVOLUCIONES */}
              {/* ======================================= */}

              {
                obtenerEstadoActual(
                  pedidoSeleccionado
                ) === "ENTREGADO" &&
                pedidoSeleccionado
                  .productos
                  ?.length > 0 && (

                <section className="ventas-modal-section">

                  <div className="ventas-modal-section-title">

                    <div>

                      <span>
                        INVENTARIO
                      </span>

                      <h3>
                        Registrar devolución
                      </h3>

                      <p className="ventas-section-help">

                        Las unidades devueltas
                        volverán automáticamente
                        al inventario.

                      </p>

                    </div>

                  </div>


                  <form
                    className="ventas-return-form"
                    onSubmit={
                      manejarDevolucion
                    }
                  >


                    <div className="ventas-field">

                      <label>
                        Producto
                      </label>

                      <select
                        required
                        value={
                          idProductoDevolucion
                        }
                        onChange={e => {

                          setIdProductoDevolucion(
                            e.target.value
                          );

                          setCantidadDevolucion(
                            ""
                          );

                        }}
                      >

                        <option value="">
                          Selecciona un producto
                        </option>


                        {
                          pedidoSeleccionado
                            .productos
                            .map(
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

                                  {" — "}

                                  {
                                    producto.cantidad
                                  } ud.

                                </option>

                              )
                            )
                        }

                      </select>

                    </div>


                    <div className="ventas-field">

                      <label>
                        Cantidad
                      </label>

                      <input
                        type="number"
                        min="1"
                        required
                        disabled={
                          !idProductoDevolucion
                        }
                        value={
                          cantidadDevolucion
                        }
                        onChange={e =>
                          setCantidadDevolucion(
                            e.target.value
                          )
                        }
                        placeholder="1"
                      />

                    </div>


                    <div className="ventas-field ventas-field-full">

                      <label>
                        Motivo
                      </label>

                      <textarea
                        rows="3"
                        value={
                          motivoDevolucion
                        }
                        onChange={e =>
                          setMotivoDevolucion(
                            e.target.value
                          )
                        }
                        placeholder="Ej. Producto defectuoso, talla incorrecta..."
                      />

                    </div>


                    <div className="ventas-return-warning">

                      <i className="bi bi-info-circle"></i>

                      <span>

                        La devolución incrementará
                        nuevamente el stock del producto
                        y creará un movimiento
                        DEVOLUCION.

                      </span>

                    </div>


                    <button
                      type="submit"
                      className="ventas-return-btn"
                      disabled={
                        procesandoDevolucion
                      }
                    >

                      <i className="bi bi-arrow-counterclockwise"></i>

                      {
                        procesandoDevolucion
                          ? "Registrando..."
                          : "Registrar devolución"
                      }

                    </button>


                  </form>

                </section>

              )}


              {/* ======================================= */}
              {/* HISTORIAL */}
              {/* ======================================= */}

              <section className="ventas-modal-section">

                <div className="ventas-modal-section-title">

                  <div>

                    <span>
                      TRAZABILIDAD
                    </span>

                    <h3>
                      Historial de entrega
                    </h3>

                  </div>

                </div>


                {cargandoHistorial ? (

                  <div className="ventas-history-loading">

                    <div className="spinner-border spinner-border-sm" />

                    Cargando historial...

                  </div>

                ) : historial
                    ?.historial
                    ?.length > 0 ? (

                  <div className="ventas-history">

                    {
                      historial
                        .historial
                        .map(
                          item => (

                            <div
                              className="ventas-history-item"
                              key={
                                item.idHistorial
                              }
                            >

                              <div className="ventas-history-dot"></div>

                              <div>

                                <strong>

                                  {
                                    formatearEstado(
                                      item.estadoNuevo
                                    )
                                  }

                                </strong>

                                <span>

                                  {
                                    formatearFecha(
                                      item.fechaCambio
                                    )
                                  }

                                </span>


                                {
                                  item.estadoAnterior && (

                                    <small>

                                      Desde{" "}

                                      {
                                        formatearEstado(
                                          item.estadoAnterior
                                        )
                                      }

                                    </small>

                                  )
                                }

                              </div>

                            </div>

                          )
                        )
                    }

                  </div>

                ) : (

                  <div className="ventas-history-empty">

                    <i className="bi bi-clock-history"></i>

                    <span>
                      Aún no hay cambios registrados.
                    </span>

                  </div>

                )}

              </section>


            </div>

          </div>

        </div>
      )}

    </div>
  );
}


export default VendedorVentas;