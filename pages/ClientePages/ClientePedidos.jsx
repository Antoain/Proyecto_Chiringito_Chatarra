
import React, {
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";

import { Link } from "react-router-dom";

import {
  obtenerMisPedidos,
  obtenerMiPedido,
  obtenerHistorialEntregaCliente
} from "../../services/data";

import "./ClientePagesCss/ClientePedidos.css";

// =====================================================
// UTILIDADES
// =====================================================

const PRECIO = valor =>
  `$${Number(valor || 0).toFixed(2)}`;

const ESTADOS = {
  PENDIENTE: {
    texto: "Pendiente",
    icono: "bi-clock-history",
    clase: "pendiente"
  },
  LISTO_PARA_ENVIO: {
    texto: "Listo para envío",
    icono: "bi-box-seam",
    clase: "listo"
  },
  LISTO_PARA_RECOGER: {
    texto: "Listo para recoger",
    icono: "bi-shop",
    clase: "listo"
  },
  EN_CAMINO: {
    texto: "En camino",
    icono: "bi-truck",
    clase: "camino"
  },
  ENVIADO: {
    texto: "Enviado",
    icono: "bi-truck",
    clase: "camino"
  },
  ENTREGADO: {
    texto: "Entregado",
    icono: "bi-check-circle-fill",
    clase: "entregado"
  },
  CANCELADO: {
    texto: "Cancelado",
    icono: "bi-x-circle",
    clase: "cancelado"
  }
};

const METODOS_ENTREGA = {
  TIENDA: "Envío de la tienda",
  ALIADO: "Entrega con aliado",
  RECOGER_TIENDA: "Recoger en tienda"
};

const obtenerEstado = estado =>
  ESTADOS[String(estado || "").toUpperCase()] || {
    texto: String(estado || "Sin estado")
      .replaceAll("_", " "),
    icono: "bi-info-circle",
    clase: "neutral"
  };

const fechaBonita = fecha => {
  if (!fecha) return "Sin fecha";

  const valor = new Date(fecha);

  if (Number.isNaN(valor.getTime())) {
    return "Fecha no disponible";
  }

  return new Intl.DateTimeFormat("es-SV", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(valor);
};

const lista = valor =>
  Array.isArray(valor) ? valor : [];

function EstadoBadge({ estado }) {
  const datos = obtenerEstado(estado);

  return (
    <span className={`cp-status ${datos.clase}`}>
      <i className={`bi ${datos.icono}`} />
      {datos.texto}
    </span>
  );
}

// =====================================================
// SEGUIMIENTO DE ENTREGA
// =====================================================

function SeguimientoEntrega({
  historial,
  cargando,
  fallido
}) {
  const eventos = lista(
    Array.isArray(historial)
      ? historial
      : historial?.historial
  ).slice();

  eventos.sort(
    (a, b) =>
      new Date(a.fechaCambio || 0).getTime() -
      new Date(b.fechaCambio || 0).getTime()
  );

  return (
    <section className="cp-seguimiento">
      <div className="cp-seguimiento-titulo">
        <div>
          <i className="bi bi-clock-history" />
          <h4>Seguimiento de entrega</h4>
        </div>
        <span>
          {eventos.length} movimientos
        </span>
      </div>

      {cargando ? (
        <div className="cp-historial-vacio">
          <span className="spinner-border spinner-border-sm" />
          Cargando seguimiento...
        </div>
      ) : fallido ? (
        <div className="cp-historial-vacio cp-historial-error">
          <i className="bi bi-exclamation-circle" />
          No fue posible consultar el historial.
        </div>
      ) : eventos.length === 0 ? (
        <div className="cp-historial-vacio">
          <i className="bi bi-info-circle" />
          Todavía no hay cambios registrados.
        </div>
      ) : (
        <ol className="cp-timeline">
          {eventos.map((evento, index) => {
            const datos = obtenerEstado(
              evento.estadoNuevo
            );

            return (
              <li
                key={
                  evento.idHistorial ??
                  `${evento.fechaCambio}-${index}`
                }
                className={
                  index === eventos.length - 1
                    ? "cp-timeline-item actual"
                    : "cp-timeline-item"
                }
              >
                <span className="cp-timeline-punto">
                  <i className={`bi ${datos.icono}`} />
                </span>

                <div className="cp-timeline-contenido">
                  <strong>{datos.texto}</strong>
                  <time>
                    {fechaBonita(evento.fechaCambio)}
                  </time>

                  {evento.estadoAnterior && (
                    <small>
                      Estado anterior:{" "}
                      {
                        obtenerEstado(
                          evento.estadoAnterior
                        ).texto
                      }
                    </small>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}

// =====================================================
// DETALLE DEL SUBPEDIDO
// =====================================================

function TarjetaSubPedido({
  subPedido,
  historial,
  cargandoHistorial,
  errorHistorial
}) {
  const entrega = subPedido.entrega;
  const estadoActual =
    entrega?.estadoEntrega || subPedido.estado;

  return (
    <article className="cp-subpedido">
      <header className="cp-subpedido-header">
        <div className="cp-subpedido-identidad">
          <span className="cp-tienda-icono">
            <i className="bi bi-shop" />
          </span>

          <div>
            <small>COMPRA POR TIENDA</small>
            <h3>
              {subPedido.tienda ||
                subPedido.nombreTienda ||
                `Subpedido #${subPedido.idSubPedido}`}
            </h3>
            <span>
              Referencia #{subPedido.idSubPedido}
            </span>
          </div>
        </div>

        <EstadoBadge estado={estadoActual} />
      </header>

      <div className="cp-subpedido-cuerpo">
        <h4 className="cp-subtitulo">
          <i className="bi bi-bag" />
          Productos comprados
        </h4>

        <div className="cp-productos">
          {lista(subPedido.productos).map(
            (producto, indice) => {
              const descuento = Number(
                producto.descuento || 0
              );

              return (
                <div
                  className="cp-producto"
                  key={`${producto.idProducto}-${indice}`}
                >
                  <div className="cp-producto-identidad">
                    <span className="cp-producto-icono">
                      <i className="bi bi-box-seam" />
                    </span>

                    <div>
                      <strong>
                        {producto.nombre || "Producto"}
                      </strong>

                      <small>
                        {producto.cantidad} ×{" "}
                        {PRECIO(producto.precioUnitario)}
                      </small>

                      {descuento > 0 && (
                        <small className="cp-descuento">
                          Descuento aplicado: {descuento}%
                        </small>
                      )}
                    </div>
                  </div>

                  <strong className="cp-producto-total">
                    {PRECIO(producto.subtotal)}
                  </strong>
                </div>
              );
            }
          )}
        </div>

        <div className="cp-subpedido-totales">
          <span>
            Subtotal de tienda:
            <strong>{PRECIO(subPedido.subtotal)}</strong>
          </span>

          <span>
            Envío:
            <strong>{PRECIO(subPedido.costoEnvio)}</strong>
          </span>
        </div>

        {entrega && (
          <section className="cp-entrega">
            <h4 className="cp-subtitulo">
              <i className="bi bi-truck" />
              Información de entrega
            </h4>

            <div className="cp-entrega-grid">
              <div>
                <span>Método</span>
                <strong>
                  {METODOS_ENTREGA[
                    entrega.metodoEntrega
                  ] ||
                    String(
                      entrega.metodoEntrega || "No definido"
                    ).replaceAll("_", " ")}
                </strong>
              </div>

              <div>
                <span>Estado actual</span>
                <strong>
                  {obtenerEstado(
                    entrega.estadoEntrega
                  ).texto}
                </strong>
              </div>

              {entrega.proveedorEntrega && (
                <div>
                  <span>Proveedor</span>
                  <strong>
                    {entrega.proveedorEntrega}
                  </strong>
                </div>
              )}

              {entrega.codigoSeguimiento && (
                <div>
                  <span>Código de seguimiento</span>
                  <strong className="cp-codigo">
                    {entrega.codigoSeguimiento}
                  </strong>
                </div>
              )}

              {entrega.fechaEntrega && (
                <div>
                  <span>Fecha de entrega</span>
                  <strong>
                    {fechaBonita(entrega.fechaEntrega)}
                  </strong>
                </div>
              )}
            </div>
          </section>
        )}

        <SeguimientoEntrega
          historial={historial}
          cargando={cargandoHistorial}
          fallido={errorHistorial}
        />
      </div>
    </article>
  );
}

// =====================================================
// PÁGINA MIS PEDIDOS
// =====================================================

export default function ClientePedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [busqueda, setBusqueda] = useState("");
  const [estadoFiltro, setEstadoFiltro] =
    useState("TODOS");
  const [paginaActual, setPaginaActual] = useState(1);

  const [modalDetalle, setModalDetalle] = useState(false);
  const [pedidoDetalle, setPedidoDetalle] = useState(null);
  const [cargandoDetalle, setCargandoDetalle] =
    useState(false);
  const [errorDetalle, setErrorDetalle] = useState("");

  const [historiales, setHistoriales] = useState({});
  const [erroresHistorial, setErroresHistorial] =
    useState({});
  const [cargandoHistorial, setCargandoHistorial] =
    useState(false);

  const peticionDetalleRef = useRef(0);
  const dialogoRef = useRef(null);

  const pedidosPorPagina = 8;

  // =====================================================
  // CARGAR PEDIDOS
  // =====================================================

  const cargarPedidos = async () => {
    setCargando(true);
    setError("");

    try {
      const data = await obtenerMisPedidos();
      setPedidos(lista(data));
    } catch (err) {
      if (err?.status === 404) {
        setPedidos([]);
      } else {
        setError(
          err?.message ||
          "No se pudieron cargar tus pedidos."
        );
      }
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarPedidos();
  }, []);

  // =====================================================
  // FILTROS
  // =====================================================

  useEffect(() => {
    setPaginaActual(1);
  }, [busqueda, estadoFiltro]);

  const pedidosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    return pedidos.filter(pedido => {
      const coincideEstado =
        estadoFiltro === "TODOS" ||
        pedido.estado === estadoFiltro;

      const productos = lista(pedido.subPedidos)
        .flatMap(sub => lista(sub.productos))
        .map(producto => producto.nombre || "")
        .join(" ");

      const contenido = [
        pedido.idPedido,
        pedido.metodoPago,
        pedido.direccionEntrega,
        productos
      ]
        .join(" ")
        .toLowerCase();

      return (
        coincideEstado &&
        (!texto || contenido.includes(texto))
      );
    });
  }, [pedidos, busqueda, estadoFiltro]);

  const totalPaginas = Math.ceil(
    pedidosFiltrados.length / pedidosPorPagina
  );

  const paginaSegura = Math.min(
    Math.max(1, paginaActual),
    Math.max(1, totalPaginas)
  );

  const indiceInicio =
    (paginaSegura - 1) * pedidosPorPagina;

  const pedidosPaginados = pedidosFiltrados.slice(
    indiceInicio,
    indiceInicio + pedidosPorPagina
  );

  // =====================================================
  // RESUMEN
  // =====================================================

  const resumen = useMemo(() => {
    const noCancelados = pedidos.filter(
      pedido => pedido.estado !== "CANCELADO"
    );

    return {
      total: pedidos.length,

      totalGastado: noCancelados.reduce(
        (suma, pedido) =>
          suma + Number(pedido.total || 0),
        0
      ),

      pendientes: pedidos.filter(
        pedido => pedido.estado === "PENDIENTE"
      ).length,

      entregados: pedidos.filter(
        pedido => pedido.estado === "ENTREGADO"
      ).length
    };
  }, [pedidos]);

  // =====================================================
  // ABRIR DETALLE
  // =====================================================

  const abrirDetalle = async idPedido => {
    const peticion = ++peticionDetalleRef.current;

    setModalDetalle(true);
    setPedidoDetalle(null);
    setHistoriales({});
    setErroresHistorial({});
    setErrorDetalle("");
    setCargandoDetalle(true);
    setCargandoHistorial(false);

    try {
      const pedido = await obtenerMiPedido(idPedido);

      if (peticion !== peticionDetalleRef.current) {
        return;
      }

      setPedidoDetalle(pedido);
      setCargandoDetalle(false);
      setCargandoHistorial(true);

      const subPedidos = lista(pedido?.subPedidos);

      const resultados = await Promise.all(
        subPedidos.map(async subPedido => {
          try {
            const historial =
              await obtenerHistorialEntregaCliente(
                subPedido.idSubPedido
              );

            return {
              id: subPedido.idSubPedido,
              historial,
              error: false
            };
          } catch (err) {
            return {
              id: subPedido.idSubPedido,
              historial: null,
              error: err?.status !== 404
            };
          }
        })
      );

      if (peticion !== peticionDetalleRef.current) {
        return;
      }

      const mapaHistoriales = {};
      const mapaErrores = {};

      resultados.forEach(resultado => {
        mapaHistoriales[resultado.id] =
          resultado.historial;

        mapaErrores[resultado.id] =
          resultado.error;
      });

      setHistoriales(mapaHistoriales);
      setErroresHistorial(mapaErrores);
    } catch (err) {
      if (peticion !== peticionDetalleRef.current) {
        return;
      }

      setErrorDetalle(
        err?.message ||
        "No se pudo cargar el detalle del pedido."
      );
      setCargandoDetalle(false);
    } finally {
      if (peticion === peticionDetalleRef.current) {
        setCargandoDetalle(false);
        setCargandoHistorial(false);
      }
    }
  };

  const cerrarDetalle = () => {
    peticionDetalleRef.current++;
    setModalDetalle(false);
    setPedidoDetalle(null);
    setHistoriales({});
    setErroresHistorial({});
    setErrorDetalle("");
  };

  // =====================================================
  // ACCESIBILIDAD DEL MODAL
  // =====================================================

  useEffect(() => {
    if (!modalDetalle) return;

    const overflowAnterior = document.body.style.overflow;
    const elementoAnterior = document.activeElement;

    document.body.style.overflow = "hidden";
    dialogoRef.current?.focus();

    const manejarTeclas = evento => {
      if (evento.key === "Escape") {
        cerrarDetalle();
      }

      if (
        evento.key === "Tab" &&
        dialogoRef.current
      ) {
        const botones = Array.from(
          dialogoRef.current.querySelectorAll(
            "button:not([disabled]), a[href]"
          )
        );

        if (!botones.length) return;

        const primero = botones[0];
        const ultimo = botones[botones.length - 1];

        if (
          evento.shiftKey &&
          document.activeElement === primero
        ) {
          evento.preventDefault();
          ultimo.focus();
        } else if (
          !evento.shiftKey &&
          document.activeElement === ultimo
        ) {
          evento.preventDefault();
          primero.focus();
        }
      }
    };

    document.addEventListener(
      "keydown",
      manejarTeclas
    );

    return () => {
      document.body.style.overflow = overflowAnterior;
      document.removeEventListener(
        "keydown",
        manejarTeclas
      );
      elementoAnterior?.focus?.();
    };
  }, [modalDetalle]);

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <main className="cp-page">
      <div className="cp-container">
        <header className="cp-header">
          <div>
            <span className="cp-eyebrow">
              HISTORIAL DE COMPRAS
            </span>

            <h1>
              <i className="bi bi-bag-check" />
              Mis pedidos
            </h1>

            <p>
              Revisa tus compras y sigue las entregas
              de cada tienda.
            </p>
          </div>

          <div className="cp-header-acciones">
            <button
              type="button"
              onClick={cargarPedidos}
              disabled={cargando}
              className="cp-btn-secundario"
            >
              <i className="bi bi-arrow-clockwise" />
              Actualizar
            </button>

            <Link
              to="/cliente"
              className="cp-btn-secundario"
            >
              <i className="bi bi-arrow-left" />
              Seguir comprando
            </Link>
          </div>
        </header>

        {error && (
          <div className="cp-alert" role="alert">
            <i className="bi bi-exclamation-circle" />
            <span>{error}</span>
          </div>
        )}

        {/* RESUMEN */}

        <section className="cp-resumen">
          <article className="cp-resumen-card">
            <span className="cp-resumen-icono azul">
              <i className="bi bi-bag-check" />
            </span>
            <div>
              <small>Pedidos realizados</small>
              <strong>{resumen.total}</strong>
            </div>
          </article>

          <article className="cp-resumen-card">
            <span className="cp-resumen-icono verde">
              <i className="bi bi-wallet2" />
            </span>
            <div>
              <small>Total comprado*</small>
              <strong>{PRECIO(resumen.totalGastado)}</strong>
            </div>
          </article>

          <article className="cp-resumen-card">
            <span className="cp-resumen-icono amarillo">
              <i className="bi bi-clock-history" />
            </span>
            <div>
              <small>Pendientes</small>
              <strong>{resumen.pendientes}</strong>
            </div>
          </article>

          <article className="cp-resumen-card">
            <span className="cp-resumen-icono morado">
              <i className="bi bi-check-circle" />
            </span>
            <div>
              <small>Entregados</small>
              <strong>{resumen.entregados}</strong>
            </div>
          </article>
        </section>

        <p className="cp-resumen-nota">
          * Total registrado en pedidos no cancelados.
          No representa necesariamente pagos liquidados.
        </p>

        {/* LISTADO */}

        <section className="cp-panel">
          <div className="cp-panel-header">
            <div>
              <h2>Historial de pedidos</h2>
              <p>
                Consulta el estado y los detalles
                de tus compras.
              </p>
            </div>

            <div className="cp-filtros">
              <label className="cp-busqueda">
                <i className="bi bi-search" />
                <input
                  type="search"
                  value={busqueda}
                  onChange={e =>
                    setBusqueda(e.target.value)
                  }
                  placeholder="Buscar pedido o producto..."
                  aria-label="Buscar pedidos"
                />
              </label>

              <select
                value={estadoFiltro}
                onChange={e =>
                  setEstadoFiltro(e.target.value)
                }
                aria-label="Filtrar por estado"
              >
                <option value="TODOS">
                  Todos los estados
                </option>
                {Object.entries(ESTADOS).map(
                  ([valor, datos]) => (
                    <option
                      value={valor}
                      key={valor}
                    >
                      {datos.texto}
                    </option>
                  )
                )}
              </select>
            </div>
          </div>

          {cargando ? (
            <div className="cp-vacio">
              <span className="spinner-border text-primary" />
              <p>Cargando tus pedidos...</p>
            </div>
          ) : pedidosFiltrados.length === 0 ? (
            <div className="cp-vacio">
              <div className="cp-vacio-icono">
                <i
                  className={
                    pedidos.length === 0
                      ? "bi bi-bag"
                      : "bi bi-search"
                  }
                />
              </div>

              <h3>
                {pedidos.length === 0
                  ? "Todavía no tienes pedidos"
                  : "No hay coincidencias"}
              </h3>

              <p>
                {pedidos.length === 0
                  ? "Cuando realices tu primera compra, aparecerá aquí."
                  : "Intenta cambiar el texto o el estado seleccionado."}
              </p>

              {pedidos.length === 0 ? (
                <Link
                  to="/cliente"
                  className="cp-btn-primario"
                >
                  Explorar productos
                </Link>
              ) : (
                <button
                  type="button"
                  className="cp-btn-primario"
                  onClick={() => {
                    setBusqueda("");
                    setEstadoFiltro("TODOS");
                  }}
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="cp-lista">
                {pedidosPaginados.map(pedido => (
                  <article
                    className="cp-pedido"
                    key={pedido.idPedido}
                  >
                    <div className="cp-pedido-principal">
                      <div className="cp-pedido-identidad">
                        <div className="cp-pedido-icono">
                          <i className="bi bi-bag-check" />
                        </div>

                        <div>
                          <small>PEDIDO</small>
                          <strong>
                            #{pedido.idPedido}
                          </strong>
                          <time>
                            {fechaBonita(
                              pedido.fechaPedido
                            )}
                          </time>
                        </div>
                      </div>

                      <div className="cp-pedido-datos">
                        <div>
                          <small>Total</small>
                          <strong className="cp-dinero">
                            {PRECIO(pedido.total)}
                          </strong>
                        </div>

                        <div>
                          <small>Envío</small>
                          <strong>
                            {PRECIO(pedido.costoEnvio)}
                          </strong>
                        </div>

                        <div>
                          <small>Pago</small>
                          <strong>
                            {pedido.metodoPago || "—"}
                          </strong>
                        </div>

                        <div>
                          <small>Tiendas</small>
                          <strong>
                            {lista(pedido.subPedidos).length}
                          </strong>
                        </div>
                      </div>
                    </div>

                    <div className="cp-pedido-footer">
                      <div className="cp-pedido-estados">
                        <EstadoBadge estado={pedido.estado} />

                        {lista(pedido.subPedidos).length > 1 && (
                          <small>
                            Consulta el avance por tienda
                          </small>
                        )}
                      </div>

                      <button
                        type="button"
                        className="cp-ver-pedido"
                        onClick={() =>
                          abrirDetalle(pedido.idPedido)
                        }
                      >
                        Ver pedido
                        <i className="bi bi-arrow-right" />
                      </button>
                    </div>
                  </article>
                ))}
              </div>

              {/* PAGINACIÓN */}

              <div className="cp-paginacion">
                <span>
                  Mostrando{" "}
                  <strong>
                    {indiceInicio + 1}–
                    {Math.min(
                      indiceInicio + pedidosPorPagina,
                      pedidosFiltrados.length
                    )}
                  </strong>{" "}
                  de{" "}
                  <strong>
                    {pedidosFiltrados.length}
                  </strong>
                </span>

                <div>
                  <button
                    type="button"
                    disabled={paginaSegura <= 1}
                    onClick={() =>
                      setPaginaActual(
                        paginaSegura - 1
                      )
                    }
                    aria-label="Página anterior"
                  >
                    <i className="bi bi-chevron-left" />
                  </button>

                  <span>
                    Página {paginaSegura} de{" "}
                    {Math.max(1, totalPaginas)}
                  </span>

                  <button
                    type="button"
                    disabled={
                      paginaSegura >= totalPaginas
                    }
                    onClick={() =>
                      setPaginaActual(
                        paginaSegura + 1
                      )
                    }
                    aria-label="Página siguiente"
                  >
                    <i className="bi bi-chevron-right" />
                  </button>
                </div>
              </div>
            </>
          )}
        </section>
      </div>

      {/* MODAL DE DETALLE */}

      {modalDetalle && (
        <div
          className="cp-modal-fondo"
          onMouseDown={e => {
            if (e.target === e.currentTarget) {
              cerrarDetalle();
            }
          }}
        >
          <div
            className="cp-modal"
            ref={dialogoRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cp-modal-titulo"
            tabIndex={-1}
          >
            <header className="cp-modal-header">
              <div>
                <span>DETALLE DE COMPRA</span>

                <h2 id="cp-modal-titulo">
                  {pedidoDetalle
                    ? `Pedido #${pedidoDetalle.idPedido}`
                    : "Detalle de pedido"}
                </h2>
              </div>

              <button
                type="button"
                onClick={cerrarDetalle}
                aria-label="Cerrar detalle"
              >
                <i className="bi bi-x-lg" />
              </button>
            </header>

            <div className="cp-modal-body">
              {cargandoDetalle ? (
                <div className="cp-vacio">
                  <span className="spinner-border text-primary" />
                  <p>Cargando detalle del pedido...</p>
                </div>
              ) : errorDetalle ? (
                <div className="cp-vacio">
                  <i className="bi bi-exclamation-circle" />
                  <h3>No se pudo abrir el pedido</h3>
                  <p>{errorDetalle}</p>
                  <button
                    type="button"
                    className="cp-btn-primario"
                    onClick={() => {
                      cerrarDetalle();
                    }}
                  >
                    Volver a mis pedidos
                  </button>
                </div>
              ) : pedidoDetalle ? (
                <>
                  {/* DATOS GENERALES */}

                  <div className="cp-detalle-grid">
                    <div>
                      <span>Fecha</span>
                      <strong>
                        {fechaBonita(
                          pedidoDetalle.fechaPedido
                        )}
                      </strong>
                    </div>

                    <div>
                      <span>Estado general</span>
                      <EstadoBadge
                        estado={pedidoDetalle.estado}
                      />
                    </div>

                    <div>
                      <span>Método de pago</span>
                      <strong>
                        {pedidoDetalle.metodoPago || "—"}
                      </strong>
                    </div>

                    <div>
                      <span>Subtotal</span>
                      <strong>
                        {PRECIO(pedidoDetalle.subtotal)}
                      </strong>
                    </div>

                    <div>
                      <span>Envío total</span>
                      <strong>
                        {PRECIO(
                          pedidoDetalle.costoEnvio
                        )}
                      </strong>
                    </div>

                    <div className="cp-total-destacado">
                      <span>Total del pedido</span>
                      <strong>
                        {PRECIO(pedidoDetalle.total)}
                      </strong>
                    </div>
                  </div>

                  <div className="cp-direccion">
                    <i className="bi bi-geo-alt" />

                    <div>
                      <span>Datos de entrega</span>

                      <strong>
                        {pedidoDetalle.direccionEntrega ||
                          "No especificada"}
                      </strong>

                      <small>
                        Teléfono:{" "}
                        {pedidoDetalle.telefono ||
                          "No especificado"}
                      </small>
                    </div>
                  </div>

                  <div className="cp-detalle-seccion">
                    <div className="cp-detalle-seccion-header">
                      <div>
                        <h3>
                          <i className="bi bi-box-seam" />
                          Pedidos por tienda
                        </h3>

                        <p>
                          Cada tienda gestiona su propia
                          entrega y seguimiento.
                        </p>
                      </div>

                      <span>
                        {lista(
                          pedidoDetalle.subPedidos
                        ).length}{" "}
                        tiendas
                      </span>
                    </div>

                    <div className="cp-subpedidos">
                      {lista(
                        pedidoDetalle.subPedidos
                      ).map(subPedido => (
                        <TarjetaSubPedido
                          key={subPedido.idSubPedido}
                          subPedido={subPedido}
                          historial={
                            historiales[
                              subPedido.idSubPedido
                            ]
                          }
                          cargandoHistorial={
                            cargandoHistorial
                          }
                          errorHistorial={
                            erroresHistorial[
                              subPedido.idSubPedido
                            ]
                          }
                        />
                      ))}
                    </div>
                  </div>
                </>
              ) : null}
            </div>

            <footer className="cp-modal-footer">
              <button
                type="button"
                onClick={cerrarDetalle}
                className="cp-btn-secundario"
              >
                Cerrar detalle
              </button>
            </footer>
          </div>
        </div>
      )}
    </main>
  );
}
