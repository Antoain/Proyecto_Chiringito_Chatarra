
import React, {
  useEffect,
  useMemo,
  useState
} from "react";

import {
  obtenerTodosLosPedidosAdmin
} from "../../services/data";

import "./AdminPagesCss/AdminPedidos.css";

const POR_PAGINA = 8;

const moneda = valor =>
  new Intl.NumberFormat("es-SV", {
    style: "currency",
    currency: "USD"
  }).format(Number(valor || 0));

const normalizar = valor =>
  String(valor ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const fecha = valor => {
  if (!valor) return "Sin fecha";

  const date = new Date(valor);

  if (Number.isNaN(date.getTime())) {
    return "Fecha no disponible";
  }

  return new Intl.DateTimeFormat("es-SV", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
};

const nombreCliente = pedido => {
  const cliente = pedido.cliente || {};

  return [cliente.nombres, cliente.apellidos]
    .filter(Boolean)
    .join(" ") || `Cliente #${cliente.idUsuario ?? "—"}`;
};

function Estado({ valor }) {
  const estado = String(valor || "SIN_ESTADO").toUpperCase();

  const etiqueta = estado
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/^\w/, letra => letra.toUpperCase());

  const clase =
    estado === "ENTREGADO" || estado === "COMPLETADO"
      ? "completado"
      : estado === "CANCELADO"
        ? "cancelado"
        : estado === "PENDIENTE"
          ? "pendiente"
          : estado === "EN_CAMINO" || estado === "ENVIADO"
            ? "camino"
            : "otro";

  return (
    <span className={`aped-estado ${clase}`}>
      <span className="aped-estado-punto" />
      {etiqueta}
    </span>
  );
}

function Resumen({ icono, titulo, valor, tono }) {
  return (
    <article className="aped-resumen-card">
      <span className={`aped-resumen-icono ${tono}`}>
        <i className={`bi ${icono}`} />
      </span>
      <div>
        <small>{titulo}</small>
        <strong>{valor}</strong>
      </div>
    </article>
  );
}

export default function AdminPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [pagina, setPagina] = useState(1);
  const [seleccionado, setSeleccionado] = useState(null);

  const cargarPedidos = async () => {
    setCargando(true);
    setError("");

    try {
      const data = await obtenerTodosLosPedidosAdmin();
      setPedidos(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err?.message ||
        "No fue posible consultar los pedidos."
      );
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    let activo = true;

    const cargar = async () => {
      try {
        const data = await obtenerTodosLosPedidosAdmin();

        if (activo) {
          setPedidos(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (activo) {
          setError(
            err?.message ||
            "No fue posible consultar los pedidos."
          );
        }
      } finally {
        if (activo) setCargando(false);
      }
    };

    cargar();

    return () => {
      activo = false;
    };
  }, []);

  useEffect(() => {
    setPagina(1);
  }, [busqueda, filtroEstado]);

  useEffect(() => {
    if (!seleccionado) return;

    const anterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const cerrar = e => {
      if (e.key === "Escape") {
        setSeleccionado(null);
      }
    };

    document.addEventListener("keydown", cerrar);

    return () => {
      document.body.style.overflow = anterior;
      document.removeEventListener("keydown", cerrar);
    };
  }, [seleccionado]);

  const estadosDisponibles = useMemo(
    () => [...new Set(
      pedidos.map(p => String(p.estado || "SIN_ESTADO"))
    )].sort(),
    [pedidos]
  );

  const filtrados = useMemo(() => {
    const termino = normalizar(busqueda.trim());

    return pedidos.filter(pedido => {
      if (
        filtroEstado !== "todos" &&
        pedido.estado !== filtroEstado
      ) {
        return false;
      }

      const tiendas = (pedido.subPedidos || [])
        .map(sub => sub.tienda)
        .join(" ");

      const contenido = normalizar([
        pedido.idPedido,
        nombreCliente(pedido),
        pedido.cliente?.correo,
        pedido.telefono,
        pedido.estado,
        tiendas
      ].join(" "));

      return !termino || contenido.includes(termino);
    });
  }, [pedidos, busqueda, filtroEstado]);

  const resumen = useMemo(() => ({
    total: pedidos.length,
    validos: pedidos.filter(
      p => p.estado !== "CANCELADO"
    ).length,
    cancelados: pedidos.filter(
      p => p.estado === "CANCELADO"
    ).length,
    importe: pedidos
      .filter(p => p.estado !== "CANCELADO")
      .reduce(
        (suma, p) => suma + Number(p.total || 0),
        0
      )
  }), [pedidos]);

  const totalPaginas = Math.max(
    1,
    Math.ceil(filtrados.length / POR_PAGINA)
  );

  const paginaActual = Math.min(pagina, totalPaginas);
  const inicio = (paginaActual - 1) * POR_PAGINA;

  const visibles = filtrados.slice(
    inicio,
    inicio + POR_PAGINA
  );

  return (
    <main className="aped-pagina">
      <div className="aped-contenedor">
        <header className="aped-header">
          <div>
            <span className="aped-eyebrow">
              SIG · SUPERVISIÓN GLOBAL
            </span>
            <h1>
              <i className="bi bi-bag-check" />
              Pedidos de la plataforma
            </h1>
            <p>
              Consulta las compras, clientes y tiendas
              involucradas en cada pedido.
            </p>
          </div>

          <button
            type="button"
            className="aped-btn secundario"
            onClick={cargarPedidos}
            disabled={cargando}
          >
            <i className="bi bi-arrow-clockwise" />
            Actualizar
          </button>
        </header>

        {error && (
          <div className="aped-alerta" role="alert">
            <i className="bi bi-exclamation-triangle" />
            <span>{error}</span>
            <button type="button" onClick={cargarPedidos}>
              Reintentar
            </button>
          </div>
        )}

        <section className="aped-resumen">
          <Resumen
            icono="bi-bag"
            titulo="Total de pedidos"
            valor={resumen.total}
            tono="azul"
          />
          <Resumen
            icono="bi-check-circle"
            titulo="No cancelados"
            valor={resumen.validos}
            tono="verde"
          />
          <Resumen
            icono="bi-x-circle"
            titulo="Cancelados"
            valor={resumen.cancelados}
            tono="rojo"
          />
          <Resumen
            icono="bi-cash-stack"
            titulo="Importe no cancelado"
            valor={moneda(resumen.importe)}
            tono="morado"
          />
        </section>

        <section className="aped-panel">
          <div className="aped-panel-header">
            <div>
              <h2>Historial general</h2>
              <p>
                {filtrados.length} pedidos encontrados
              </p>
            </div>

            <div className="aped-filtros">
              <label className="aped-buscador">
                <i className="bi bi-search" />
                <input
                  type="search"
                  value={busqueda}
                  onChange={e => setBusqueda(e.target.value)}
                  placeholder="Pedido, cliente, tienda..."
                  aria-label="Buscar pedidos"
                />
              </label>

              <select
                aria-label="Filtrar por estado"
                value={filtroEstado}
                onChange={e => setFiltroEstado(e.target.value)}
              >
                <option value="todos">Todos los estados</option>
                {estadosDisponibles.map(estado => (
                  <option key={estado} value={estado}>
                    {estado.replaceAll("_", " ")}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {cargando ? (
            <div className="aped-vacio">
              <span className="spinner-border text-primary" />
              <p>Cargando pedidos...</p>
            </div>
          ) : filtrados.length === 0 ? (
            <div className="aped-vacio">
              <i className="bi bi-bag-x" />
              <strong>No hay pedidos para mostrar</strong>
              <p>
                Prueba con otra búsqueda o estado.
              </p>
            </div>
          ) : (
            <>
              <div className="aped-tabla-scroll">
                <table className="aped-tabla">
                  <thead>
                    <tr>
                      <th>Pedido</th>
                      <th>Cliente</th>
                      <th>Fecha</th>
                      <th>Tiendas</th>
                      <th>Estado</th>
                      <th>Total</th>
                      <th>Acción</th>
                    </tr>
                  </thead>

                  <tbody>
                    {visibles.map(pedido => (
                      <tr key={pedido.idPedido}>
                        <td>
                          <strong>#{pedido.idPedido}</strong>
                          <small className="aped-subtexto">
                            {pedido.metodoPago || "Sin método"}
                          </small>
                        </td>

                        <td>
                          <strong>{nombreCliente(pedido)}</strong>
                          <small className="aped-subtexto">
                            {pedido.cliente?.correo || "Sin correo"}
                          </small>
                        </td>

                        <td>{fecha(pedido.fechaPedido)}</td>

                        <td>
                          <span className="aped-tiendas">
                            {(pedido.subPedidos || []).length}
                            {" "}
                            subpedido(s)
                          </span>
                        </td>

                        <td>
                          <Estado valor={pedido.estado} />
                        </td>

                        <td className="aped-total">
                          {moneda(pedido.total)}
                        </td>

                        <td>
                          <button
                            type="button"
                            className="aped-btn-ver"
                            onClick={() => setSeleccionado(pedido)}
                          >
                            <i className="bi bi-eye" />
                            Ver detalle
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="aped-paginacion">
                <span>
                  Mostrando {inicio + 1}–
                  {Math.min(
                    inicio + POR_PAGINA,
                    filtrados.length
                  )} de {filtrados.length}
                </span>

                <div>
                  <button
                    type="button"
                    disabled={paginaActual === 1}
                    onClick={() => setPagina(paginaActual - 1)}
                    aria-label="Página anterior"
                  >
                    <i className="bi bi-chevron-left" />
                  </button>
                  <span>{paginaActual} / {totalPaginas}</span>
                  <button
                    type="button"
                    disabled={paginaActual === totalPaginas}
                    onClick={() => setPagina(paginaActual + 1)}
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

      {/* DETALLE DEL PEDIDO */}

      {seleccionado && (
        <div
          className="aped-modal-fondo"
          onMouseDown={e => {
            if (e.target === e.currentTarget) {
              setSeleccionado(null);
            }
          }}
        >
          <div
            className="aped-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="aped-detalle-titulo"
          >
            <header className="aped-modal-header">
              <div>
                <span>SUPERVISIÓN DE PEDIDOS</span>
                <h2 id="aped-detalle-titulo">
                  Pedido #{seleccionado.idPedido}
                </h2>
                <p>{fecha(seleccionado.fechaPedido)}</p>
              </div>

              <button
                type="button"
                aria-label="Cerrar detalle"
                onClick={() => setSeleccionado(null)}
              >
                <i className="bi bi-x-lg" />
              </button>
            </header>

            <div className="aped-modal-body">
              <div className="aped-detalle-resumen">
                <div>
                  <small>Cliente</small>
                  <strong>
                    {nombreCliente(seleccionado)}
                  </strong>
                  <span>
                    {seleccionado.cliente?.correo}
                  </span>
                </div>
                <div>
                  <small>Estado del pedido</small>
                  <Estado valor={seleccionado.estado} />
                </div>
                <div>
                  <small>Forma de pago</small>
                  <strong>
                    {seleccionado.metodoPago || "No registrada"}
                  </strong>
                </div>
                <div>
                  <small>Total del pedido</small>
                  <strong className="aped-monto">
                    {moneda(seleccionado.total)}
                  </strong>
                </div>
              </div>

              <div className="aped-direccion">
                <i className="bi bi-geo-alt" />
                <div>
                  <strong>Dirección de entrega</strong>
                  <span>
                    {seleccionado.direccionEntrega ||
                      "No registrada"}
                  </span>
                  <small>
                    Teléfono: {seleccionado.telefono || "N/D"}
                  </small>
                </div>
              </div>

              <h3 className="aped-subtitulo">
                Subpedidos y productos
              </h3>

              {(seleccionado.subPedidos || []).length === 0 ? (
                <p className="aped-sin-subpedidos">
                  No hay subpedidos registrados.
                </p>
              ) : (
                (seleccionado.subPedidos || []).map(sub => (
                  <section
                    className="aped-subpedido"
                    key={sub.idSubPedido}
                  >
                    <div className="aped-subpedido-header">
                      <div>
                        <strong>
                          {sub.tienda || `Tienda #${sub.idTienda}`}
                        </strong>
                        <small>
                          Subpedido #{sub.idSubPedido}
                        </small>
                      </div>
                      <Estado valor={sub.estado} />
                    </div>

                    {(sub.productos || []).map(
                      (producto, index) => (
                        <div
                          className="aped-linea-producto"
                          key={`${producto.idProducto}-${index}`}
                        >
                          <div>
                            <strong>
                              {producto.nombre}
                            </strong>
                            <small>
                              Cantidad: {producto.cantidad}
                              {" · "}
                              Unitario: {moneda(
                                producto.precioUnitario
                              )}
                              {Number(producto.descuento) > 0 &&
                                ` · Descuento: ${
                                  moneda(producto.descuento)
                                }`}
                            </small>
                          </div>
                          <strong>
                            {moneda(producto.subtotal)}
                          </strong>
                        </div>
                      )
                    )}

                    <div className="aped-subpedido-totales">
                      <span>
                        Subtotal: {moneda(sub.subtotal)}
                      </span>
                      <span>
                        Envío: {moneda(sub.costoEnvio)}
                      </span>
                      <span>
                        Comisión:{" "}
                        {moneda(sub.comisionPlataforma)}
                      </span>
                      <strong>
                        Vendedor:{" "}
                        {moneda(sub.totalVendedor)}
                      </strong>
                    </div>
                  </section>
                ))
              )}

              <div className="aped-total-final">
                <span>Total general</span>
                <strong>{moneda(seleccionado.total)}</strong>
              </div>
            </div>

            <footer className="aped-modal-footer">
              <span>
                <i className="bi bi-shield-check" />
                Consulta administrativa · Solo lectura
              </span>
              <button
                type="button"
                className="aped-btn secundario"
                onClick={() => setSeleccionado(null)}
              >
                Cerrar
              </button>
            </footer>
          </div>
        </div>
      )}
    </main>
  );
}
