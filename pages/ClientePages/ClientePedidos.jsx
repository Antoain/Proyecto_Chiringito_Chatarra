import React, {
  useEffect,
  useMemo,
  useState
} from "react";

import {
  obtenerMisPedidos,
  obtenerMiPedido,
  obtenerHistorialEntregaCliente
} from "../../services/data";

import "./ClientePagesCss/ClientePedidos.css";


export default function ClientePedidos() {

  // =====================================================
  // ESTADO PRINCIPAL
  // =====================================================

  const [pedidos, setPedidos] =
    useState([]);

  const [cargando, setCargando] =
    useState(true);

  const [error, setError] =
    useState("");

  const [busqueda, setBusqueda] =
    useState("");

  const [estadoFiltro, setEstadoFiltro] =
    useState("TODOS");


  // =====================================================
  // PAGINACIÓN
  // =====================================================

  const [paginaActual, setPaginaActual] =
    useState(1);

  const pedidosPorPagina = 8;


  // =====================================================
  // MODAL
  // =====================================================

  const [
    modalDetalle,
    setModalDetalle
  ] = useState(false);

  const [
    pedidoDetalle,
    setPedidoDetalle
  ] = useState(null);

  const [
    historiales,
    setHistoriales
  ] = useState({});

  const [
    cargandoDetalle,
    setCargandoDetalle
  ] = useState(false);


  // =====================================================
  // CARGAR PEDIDOS
  // =====================================================

  useEffect(() => {

    const cargarPedidos =
      async () => {

        try {

          setCargando(true);
          setError("");

          const data =
            await obtenerMisPedidos();

          setPedidos(
            Array.isArray(data)
              ? data
              : []
          );

        } catch (err) {

          console.error(
            "Error cargando pedidos:",
            err
          );

          setError(
            err.message ||
            "No se pudieron cargar tus pedidos."
          );

        } finally {

          setCargando(false);
        }
      };


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

  const formatearFecha =
    fecha => {

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


  const formatearEstado =
    estado => {

      if (!estado) {
        return "SIN ESTADO";
      }

      return String(estado)
        .replaceAll("_", " ")
        .toUpperCase();
    };


  const obtenerClaseEstado =
    estado => {

      switch (estado) {

        case "ENTREGADO":
          return "cliente-pedido-status entregado";

        case "PENDIENTE":
          return "cliente-pedido-status pendiente";

        case "LISTO_PARA_ENVIO":
        case "LISTO_PARA_RECOGER":
          return "cliente-pedido-status listo";

        case "EN_CAMINO":
        case "ENVIADO":
          return "cliente-pedido-status camino";

        case "CANCELADO":
          return "cliente-pedido-status cancelado";

        default:
          return "cliente-pedido-status";
      }
    };


  // =====================================================
  // FILTROS
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


          const productos =
            pedido.subPedidos
              ?.flatMap(
                subPedido =>
                  subPedido.productos || []
              )
              ?.map(
                producto =>
                  producto.nombre || ""
              )
              .join(" ")
              .toLowerCase() || "";


          const contenido =
            [
              pedido.idPedido,
              pedido.metodoPago,
              pedido.direccionEntrega,
              productos
            ]
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

      const activos =
        pedidos.filter(
          pedido =>
            pedido.estado !==
            "CANCELADO"
        );


      const totalGastado =
        activos.reduce(
          (total, pedido) =>
            total +
            Number(
              pedido.total || 0
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
        total:
          pedidos.length,

        totalGastado,

        pendientes,

        entregados
      };

    }, [pedidos]);


  // =====================================================
  // ABRIR DETALLE
  // =====================================================

  const abrirDetalle =
    async idPedido => {

      try {

        setModalDetalle(true);

        setCargandoDetalle(true);

        setPedidoDetalle(null);

        setHistoriales({});

        setError("");


        const pedido =
          await obtenerMiPedido(
            idPedido
          );


        setPedidoDetalle(
          pedido
        );


        const subPedidos =
          Array.isArray(
            pedido?.subPedidos
          )
            ? pedido.subPedidos
            : [];


        const resultados =
          await Promise.all(
            subPedidos.map(
              async subPedido => {

                try {

                  const historial =
                    await obtenerHistorialEntregaCliente(
                      subPedido.idSubPedido
                    );


                  return {
                    idSubPedido:
                      subPedido.idSubPedido,

                    historial
                  };

                } catch (err) {

                  console.error(
                    `No se pudo cargar historial del subpedido ${subPedido.idSubPedido}:`,
                    err
                  );


                  return {
                    idSubPedido:
                      subPedido.idSubPedido,

                    historial:
                      null
                  };
                }
              }
            )
          );


        const mapa = {};

        resultados.forEach(
          item => {

            mapa[
              item.idSubPedido
            ] = item.historial;

          }
        );


        setHistoriales(
          mapa
        );

      } catch (err) {

        console.error(
          "Error cargando detalle:",
          err
        );

        setError(
          err.message ||
          "No se pudo cargar el pedido."
        );

        setModalDetalle(false);

      } finally {

        setCargandoDetalle(false);
      }
    };


  // =====================================================
  // CERRAR DETALLE
  // =====================================================

  const cerrarDetalle = () => {

    setModalDetalle(false);

    setPedidoDetalle(null);

    setHistoriales({});
  };


  // =====================================================
  // LOADING
  // =====================================================

  if (cargando) {

    return (

      <div className="cliente-pedidos-page">

        <div className="cliente-pedidos-loading">

          <div className="spinner-border" />

          <p>
            Cargando tus pedidos...
          </p>

        </div>

      </div>
    );
  }


  return (

    <div className="cliente-pedidos-page">

      <div className="cliente-pedidos-container">


        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <header className="cliente-pedidos-header">

          <div>

            <span className="cliente-pedidos-eyebrow">
              MIS COMPRAS
            </span>

            <h1>
              Mis pedidos
            </h1>

            <p>
              Consulta tus compras, productos,
              entregas y seguimiento.
            </p>

          </div>

        </header>


        {/* ================================================= */}
        {/* ERROR */}
        {/* ================================================= */}

        {error && (

          <div className="cliente-pedidos-alert">

            <i className="bi bi-exclamation-circle"></i>

            {error}

          </div>

        )}


        {/* ================================================= */}
        {/* RESUMEN */}
        {/* ================================================= */}

        <div className="cliente-pedidos-summary">


          <article className="cliente-pedidos-summary-card">

            <div>

              <span>
                Pedidos realizados
              </span>

              <strong>
                {resumen.total}
              </strong>

            </div>

            <i className="bi bi-bag-check"></i>

          </article>


          <article className="cliente-pedidos-summary-card">

            <div>

              <span>
                Total comprado
              </span>

              <strong>

                $

                {
                  resumen
                    .totalGastado
                    .toFixed(2)
                }

              </strong>

            </div>

            <i className="bi bi-wallet2"></i>

          </article>


          <article className="cliente-pedidos-summary-card">

            <div>

              <span>
                Pendientes
              </span>

              <strong>
                {resumen.pendientes}
              </strong>

            </div>

            <i className="bi bi-clock-history"></i>

          </article>


          <article className="cliente-pedidos-summary-card">

            <div>

              <span>
                Entregados
              </span>

              <strong>
                {resumen.entregados}
              </strong>

            </div>

            <i className="bi bi-check2-circle"></i>

          </article>


        </div>


        {/* ================================================= */}
        {/* CONTENIDO */}
        {/* ================================================= */}

        <section className="cliente-pedidos-card">


          <div className="cliente-pedidos-card-header">

            <div>

              <h2>
                Historial de compras
              </h2>

              <p>
                Todos los pedidos asociados a tu cuenta.
              </p>

            </div>


            <div className="cliente-pedidos-filtros">


              <div className="cliente-pedidos-search">

                <i className="bi bi-search"></i>

                <input
                  type="text"
                  value={busqueda}
                  onChange={e =>
                    setBusqueda(
                      e.target.value
                    )
                  }
                  placeholder="Buscar pedido o producto..."
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

            <div className="cliente-pedidos-empty">

              <i className="bi bi-bag"></i>

              <h3>
                No encontramos pedidos
              </h3>

              <p>
                Cuando realices una compra aparecerá aquí.
              </p>

            </div>

          ) : (

            <div className="cliente-pedidos-list">

              {pedidosPaginados.map(
                pedido => (

                  <article
                    key={
                      pedido.idPedido
                    }
                    className="cliente-pedido-item"
                  >


                    <div className="cliente-pedido-main">


                      <div className="cliente-pedido-id">

                        <div className="cliente-pedido-icon">

                          <i className="bi bi-bag-check"></i>

                        </div>


                        <div>

                          <span>
                            PEDIDO
                          </span>

                          <strong>
                            #{pedido.idPedido}
                          </strong>

                          <small>
                            {
                              formatearFecha(
                                pedido.fechaPedido
                              )
                            }
                          </small>

                        </div>

                      </div>


                      <div className="cliente-pedido-info">


                        <div>

                          <span>
                            Total
                          </span>

                          <strong>

                            $

                            {
                              Number(
                                pedido.total || 0
                              ).toFixed(2)
                            }

                          </strong>

                        </div>


                        <div>

                          <span>
                            Envío
                          </span>

                          <strong>

                            $

                            {
                              Number(
                                pedido.costoEnvio || 0
                              ).toFixed(2)
                            }

                          </strong>

                        </div>


                        <div>

                          <span>
                            Pago
                          </span>

                          <strong>

                            {
                              formatearEstado(
                                pedido.metodoPago
                              )
                            }

                          </strong>

                        </div>


                        <div>

                          <span>
                            Tiendas
                          </span>

                          <strong>

                            {
                              pedido
                                .subPedidos
                                ?.length || 0
                            }

                          </strong>

                        </div>


                      </div>


                    </div>


                    <div className="cliente-pedido-footer">


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


                      <button
                        type="button"
                        onClick={() =>
                          abrirDetalle(
                            pedido.idPedido
                          )
                        }
                      >

                        Ver pedido

                        <i className="bi bi-arrow-right"></i>

                      </button>


                    </div>


                  </article>

                )
              )}


              <div className="cliente-pedidos-pagination">


                <span>

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

                </span>


                <div>


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
      {/* MODAL DETALLE */}
      {/* ================================================= */}

      {modalDetalle && (

        <div className="cliente-pedido-modal-backdrop">

          <div className="cliente-pedido-modal">


            <div className="cliente-pedido-modal-header">

              <div>

                <span>
                  DETALLE DE COMPRA
                </span>

                <h2>

                  {
                    pedidoDetalle
                      ? `Pedido #${pedidoDetalle.idPedido}`
                      : "Cargando pedido..."
                  }

                </h2>

              </div>


              <button
                type="button"
                onClick={
                  cerrarDetalle
                }
              >

                <i className="bi bi-x-lg"></i>

              </button>

            </div>


            <div className="cliente-pedido-modal-body">


              {cargandoDetalle ? (

                <div className="cliente-pedido-detail-loading">

                  <div className="spinner-border" />

                  <span>
                    Cargando detalle...
                  </span>

                </div>

              ) : pedidoDetalle && (

                <>


                  {/* ===================================== */}
                  {/* DATOS GENERALES */}
                  {/* ===================================== */}

                  <div className="cliente-pedido-detail-grid">


                    <div>

                      <span>
                        Fecha
                      </span>

                      <strong>

                        {
                          formatearFecha(
                            pedidoDetalle.fechaPedido
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
                            pedidoDetalle.estado
                          )
                        }

                      </strong>

                    </div>


                    <div>

                      <span>
                        Método de pago
                      </span>

                      <strong>

                        {
                          formatearEstado(
                            pedidoDetalle.metodoPago
                          )
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
                            pedidoDetalle.subtotal || 0
                          ).toFixed(2)
                        }

                      </strong>

                    </div>


                    <div>

                      <span>
                        Envío
                      </span>

                      <strong>

                        $

                        {
                          Number(
                            pedidoDetalle.costoEnvio || 0
                          ).toFixed(2)
                        }

                      </strong>

                    </div>


                    <div>

                      <span>
                        Total
                      </span>

                      <strong className="cliente-pedido-total">

                        $

                        {
                          Number(
                            pedidoDetalle.total || 0
                          ).toFixed(2)
                        }

                      </strong>

                    </div>


                  </div>


                  <div className="cliente-pedido-address">


                    <i className="bi bi-geo-alt"></i>


                    <div>

                      <span>
                        Dirección de entrega
                      </span>

                      <strong>

                        {
                          pedidoDetalle
                            .direccionEntrega ||
                          "No especificada"
                        }

                      </strong>

                      <small>

                        Teléfono:{" "}

                        {
                          pedidoDetalle
                            .telefono ||
                          "No especificado"
                        }

                      </small>

                    </div>


                  </div>


                  {/* ===================================== */}
                  {/* SUBPEDIDOS */}
                  {/* ===================================== */}

                  <div className="cliente-subpedidos">


                    {
                      pedidoDetalle
                        .subPedidos
                        ?.map(
                          subPedido => {

                            const entrega =
                              subPedido.entrega;

                            const historial =
                              historiales[
                                subPedido.idSubPedido
                              ];


                            return (

                              <section
                                key={
                                  subPedido.idSubPedido
                                }
                                className="cliente-subpedido"
                              >


                                <div className="cliente-subpedido-header">


                                  <div>

                                    <span>
                                      ENVÍO / TIENDA
                                    </span>

                                    <h3>

                                      Subpedido #
                                      {
                                        subPedido.idSubPedido
                                      }

                                    </h3>

                                  </div>


                                  <span
                                    className={
                                      obtenerClaseEstado(
                                        entrega
                                          ?.estadoEntrega ||
                                        subPedido.estado
                                      )
                                    }
                                  >

                                    {
                                      formatearEstado(
                                        entrega
                                          ?.estadoEntrega ||
                                        subPedido.estado
                                      )
                                    }

                                  </span>


                                </div>


                                {/* PRODUCTOS */}

                                <div className="cliente-subpedido-products">


                                  {
                                    subPedido
                                      .productos
                                      ?.map(
                                        producto => (

                                          <div
                                            key={
                                              producto.idProducto
                                            }
                                            className="cliente-subpedido-product"
                                          >


                                            <div>

                                              <div className="cliente-product-mini-icon">

                                                <i className="bi bi-box-seam"></i>

                                              </div>


                                              <div>

                                                <strong>
                                                  {producto.nombre}
                                                </strong>

                                                <span>

                                                  {
                                                    producto.cantidad
                                                  }

                                                  {" × $"}

                                                  {
                                                    Number(
                                                      producto.precioUnitario || 0
                                                    ).toFixed(2)
                                                  }

                                                </span>

                                              </div>

                                            </div>


                                            <strong>

                                              $

                                              {
                                                Number(
                                                  producto.subtotal || 0
                                                ).toFixed(2)
                                              }

                                            </strong>


                                          </div>

                                        )
                                      )
                                  }


                                </div>


                                {/* ENTREGA */}

                                {entrega && (

                                  <div className="cliente-entrega-info">


                                    <div>

                                      <span>
                                        Método
                                      </span>

                                      <strong>

                                        {
                                          formatearEstado(
                                            entrega.metodoEntrega
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
                                            entrega.estadoEntrega
                                          )
                                        }

                                      </strong>

                                    </div>


                                    {
                                      entrega.proveedorEntrega && (

                                        <div>

                                          <span>
                                            Proveedor
                                          </span>

                                          <strong>

                                            {
                                              entrega
                                                .proveedorEntrega
                                            }

                                          </strong>

                                        </div>

                                      )
                                    }


                                    {
                                      entrega.codigoSeguimiento && (

                                        <div>

                                          <span>
                                            Seguimiento
                                          </span>

                                          <strong>

                                            {
                                              entrega
                                                .codigoSeguimiento
                                            }

                                          </strong>

                                        </div>

                                      )
                                    }


                                  </div>

                                )}


                                {/* HISTORIAL */}

                                <div className="cliente-delivery-history">


                                  <h4>

                                    <i className="bi bi-clock-history"></i>

                                    Seguimiento

                                  </h4>


                                  {
                                    historial
                                      ?.historial
                                      ?.length > 0 ? (

                                      <div className="cliente-history-list">


                                        {
                                          historial
                                            .historial
                                            .map(
                                              item => (

                                                <div
                                                  key={
                                                    item.idHistorial
                                                  }
                                                  className="cliente-history-item"
                                                >


                                                  <div className="cliente-history-dot"></div>


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

                                      <div className="cliente-history-empty">

                                        <i className="bi bi-info-circle"></i>

                                        Todavía no hay cambios
                                        registrados.

                                      </div>

                                    )
                                  }


                                </div>


                              </section>

                            );
                          }
                        )
                    }


                  </div>


                </>

              )}


            </div>

          </div>

        </div>

      )}


    </div>
  );
}