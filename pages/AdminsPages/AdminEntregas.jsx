
import React, { useEffect, useMemo, useState } from "react";
import {
  obtenerEntregasAdministrador
} from "../../services/data";
import "./AdminPagesCss/AdminEntregas.css";

const LIMITE = 10;

const lista = valor =>
  Array.isArray(valor) ? valor : [];

const normalizar = valor =>
  String(valor ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const fechaBonita = valor => {
  if (!valor) return "Pendiente";

  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return "No disponible";

  return fecha.toLocaleString("es-SV", {
    dateStyle: "medium",
    timeStyle: "short"
  });
};

const estados = {
  PENDIENTE: "Pendiente",
  LISTO_PARA_ENVIO: "Listo para envío",
  LISTO_PARA_RECOGER: "Listo para recoger",
  EN_CAMINO: "En camino",
  ENVIADO: "Enviado",
  ENTREGADO: "Entregado",
  CANCELADO: "Cancelado"
};

const textoEstado = valor =>
  estados[valor] ||
  String(valor || "Sin estado").replaceAll("_", " ");

const claseEstado = valor => {
  if (valor === "ENTREGADO") return "entregado";
  if (valor === "CANCELADO") return "cancelado";
  if (valor === "EN_CAMINO" || valor === "ENVIADO") {
    return "camino";
  }
  if (valor === "PENDIENTE") return "pendiente";
  return "preparacion";
};

function Indicador({ icono, titulo, valor, tono }) {
  return (
    <article className="ae-kpi">
      <span className={`ae-kpi-icono ${tono}`}>
        <i className={`bi ${icono}`} />
      </span>
      <div>
        <small>{titulo}</small>
        <strong>{valor}</strong>
      </div>
    </article>
  );
}

export default function AdminEntregas() {
  const [entregas, setEntregas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [busqueda, setBusqueda] = useState("");
  const [estado, setEstado] = useState("todos");
  const [metodo, setMetodo] = useState("todos");
  const [pagina, setPagina] = useState(1);
  const [detalle, setDetalle] = useState(null);

  const cargar = async () => {
    setCargando(true);
    setError("");

    try {
      const datos = await obtenerEntregasAdministrador();
      setEntregas(lista(datos));
    } catch (err) {
      setError(
        err?.message ||
        "No se pudieron cargar las entregas."
      );
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    let activo = true;

    const consultar = async () => {
      try {
        const datos = await obtenerEntregasAdministrador();
        if (activo) setEntregas(lista(datos));
      } catch (err) {
        if (activo) {
          setError(
            err?.message ||
            "No se pudieron consultar las entregas."
          );
        }
      } finally {
        if (activo) setCargando(false);
      }
    };

    consultar();

    return () => {
      activo = false;
    };
  }, []);

  useEffect(() => {
    setPagina(1);
  }, [busqueda, estado, metodo]);

  useEffect(() => {
    if (!detalle) return;

    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const escape = e => {
      if (e.key === "Escape") setDetalle(null);
    };

    document.addEventListener("keydown", escape);

    return () => {
      document.body.style.overflow = original;
      document.removeEventListener("keydown", escape);
    };
  }, [detalle]);

  const resumen = useMemo(() => ({
    total: entregas.length,
    entregadas: entregas.filter(
      e => e.estadoEntrega === "ENTREGADO"
    ).length,
    pendientes: entregas.filter(
      e => e.estadoEntrega === "PENDIENTE"
    ).length,
    enCamino: entregas.filter(
      e => ["EN_CAMINO", "ENVIADO"].includes(e.estadoEntrega)
    ).length,
    canceladas: entregas.filter(
      e => e.estadoEntrega === "CANCELADO"
    ).length
  }), [entregas]);

  const estadosDisponibles = useMemo(
    () => [...new Set(
      entregas.map(e => e.estadoEntrega).filter(Boolean)
    )].sort(),
    [entregas]
  );

  const metodosDisponibles = useMemo(
    () => [...new Set(
      entregas.map(e => e.metodoEntrega).filter(Boolean)
    )].sort(),
    [entregas]
  );

  const filtradas = useMemo(() => {
    const termino = normalizar(busqueda.trim());

    return entregas.filter(entrega => {
      if (
        estado !== "todos" &&
        entrega.estadoEntrega !== estado
      ) {
        return false;
      }

      if (
        metodo !== "todos" &&
        entrega.metodoEntrega !== metodo
      ) {
        return false;
      }

      const contenido = normalizar([
        entrega.idPedido,
        entrega.idSubPedido,
        entrega.tienda,
        entrega.cliente,
        entrega.correoCliente,
        entrega.estadoEntrega,
        entrega.proveedorEntrega,
        entrega.codigoSeguimiento
      ].join(" "));

      return !termino || contenido.includes(termino);
    });
  }, [entregas, busqueda, estado, metodo]);

  const totalPaginas = Math.max(
    1,
    Math.ceil(filtradas.length / LIMITE)
  );

  const paginaActual = Math.min(pagina, totalPaginas);
  const inicio = (paginaActual - 1) * LIMITE;
  const visibles = filtradas.slice(inicio, inicio + LIMITE);

  return (
    <main className="ae-pagina">
      <div className="ae-contenedor">
        <header className="ae-header">
          <div>
            <span className="ae-eyebrow">
              ADMINISTRACIÓN · LOGÍSTICA
            </span>
            <h1>
              <i className="bi bi-truck" />
              Supervisión de entregas
            </h1>
            <p>
              Seguimiento global de entregas y responsables
              de la plataforma.
            </p>
          </div>

          <button
            type="button"
            className="ae-boton"
            disabled={cargando}
            onClick={cargar}
          >
            <i className="bi bi-arrow-clockwise" />
            {cargando ? "Actualizando..." : "Actualizar"}
          </button>
        </header>

        {error && (
          <div className="ae-error" role="alert">
            <i className="bi bi-exclamation-triangle" />
            <span>{error}</span>
            <button type="button" onClick={cargar}>
              Reintentar
            </button>
          </div>
        )}

        <section className="ae-resumen">
          <Indicador
            icono="bi-boxes"
            titulo="Total entregas"
            valor={resumen.total}
            tono="azul"
          />
          <Indicador
            icono="bi-check-circle"
            titulo="Entregadas"
            valor={resumen.entregadas}
            tono="verde"
          />
          <Indicador
            icono="bi-clock-history"
            titulo="Pendientes"
            valor={resumen.pendientes}
            tono="naranja"
          />
          <Indicador
            icono="bi-truck"
            titulo="En camino"
            valor={resumen.enCamino}
            tono="morado"
          />
          <Indicador
            icono="bi-x-circle"
            titulo="Canceladas"
            valor={resumen.canceladas}
            tono="rojo"
          />
        </section>

        <section className="ae-panel">
          <div className="ae-panel-encabezado">
            <div>
              <h2>Control logístico</h2>
              <p>
                {filtradas.length} entregas encontradas
              </p>
            </div>
            <span className="ae-solo-lectura">
              <i className="bi bi-shield-check" />
              Supervisión · Solo lectura
            </span>
          </div>

          <div className="ae-filtros">
            <label className="ae-buscador">
              <i className="bi bi-search" />
              <input
                type="search"
                placeholder="Pedido, tienda, cliente, código..."
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                aria-label="Buscar entregas"
              />
            </label>

            <select
              value={estado}
              onChange={e => setEstado(e.target.value)}
              aria-label="Filtrar por estado"
            >
              <option value="todos">Todos los estados</option>
              {estadosDisponibles.map(item => (
                <option key={item} value={item}>
                  {textoEstado(item)}
                </option>
              ))}
            </select>

            <select
              value={metodo}
              onChange={e => setMetodo(e.target.value)}
              aria-label="Filtrar por método"
            >
              <option value="todos">Todos los métodos</option>
              {metodosDisponibles.map(item => (
                <option key={item} value={item}>
                  {item.replaceAll("_", " ")}
                </option>
              ))}
            </select>
          </div>

          {cargando ? (
            <div className="ae-vacio">
              <span className="spinner-border text-primary" />
              <p>Cargando entregas...</p>
            </div>
          ) : filtradas.length === 0 ? (
            <div className="ae-vacio">
              <i className="bi bi-inboxes" />
              <strong>No hay entregas para mostrar</strong>
              <p>Modifica los filtros o actualiza la lista.</p>
            </div>
          ) : (
            <>
              <div className="ae-tabla-scroll">
                <table className="ae-tabla">
                  <thead>
                    <tr>
                      <th>Pedido / Entrega</th>
                      <th>Tienda</th>
                      <th>Cliente</th>
                      <th>Método</th>
                      <th>Estado</th>
                      <th>Último cambio</th>
                      <th>Detalle</th>
                    </tr>
                  </thead>

                  <tbody>
                    {visibles.map(entrega => (
                      <tr key={entrega.idSubPedido}>
                        <td>
                          <strong>#{entrega.idPedido}</strong>
                          <small>
                            Subpedido #{entrega.idSubPedido}
                          </small>
                        </td>

                        <td>
                          <strong>{entrega.tienda}</strong>
                        </td>

                        <td>
                          <strong>{entrega.cliente}</strong>
                          <small>{entrega.correoCliente}</small>
                        </td>

                        <td>
                          {String(
                            entrega.metodoEntrega || "Sin método"
                          ).replaceAll("_", " ")}
                        </td>

                        <td>
                          <span
                            className={`ae-estado ${
                              claseEstado(entrega.estadoEntrega)
                            }`}
                          >
                            {textoEstado(entrega.estadoEntrega)}
                          </span>
                        </td>

                        <td>
                          {fechaBonita(entrega.fechaActualizacion)}
                        </td>

                        <td>
                          <button
                            type="button"
                            className="ae-ver"
                            onClick={() => setDetalle(entrega)}
                          >
                            <i className="bi bi-eye" />
                            Ver
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="ae-paginacion">
                <span>
                  Mostrando {inicio + 1}–
                  {Math.min(inicio + LIMITE, filtradas.length)}
                  {" "}de {filtradas.length}
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

      {detalle && (
        <div
          className="ae-modal-fondo"
          onMouseDown={e => {
            if (e.target === e.currentTarget) setDetalle(null);
          }}
        >
          <section
            className="ae-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ae-detalle-titulo"
          >
            <header className="ae-modal-header">
              <div>
                <span>DETALLE LOGÍSTICO</span>
                <h2 id="ae-detalle-titulo">
                  Entrega del pedido #{detalle.idPedido}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setDetalle(null)}
                aria-label="Cerrar detalle"
              >
                <i className="bi bi-x-lg" />
              </button>
            </header>

            <div className="ae-modal-body">
              <div className="ae-detalle-grid">
                <div>
                  <small>Subpedido</small>
                  <strong>#{detalle.idSubPedido}</strong>
                </div>
                <div>
                  <small>Tienda</small>
                  <strong>{detalle.tienda}</strong>
                </div>
                <div>
                  <small>Cliente</small>
                  <strong>{detalle.cliente}</strong>
                </div>
                <div>
                  <small>Correo</small>
                  <strong>
                    {detalle.correoCliente || "No disponible"}
                  </strong>
                </div>
                <div>
                  <small>Estado de entrega</small>
                  <span
                    className={`ae-estado ${
                      claseEstado(detalle.estadoEntrega)
                    }`}
                  >
                    {textoEstado(detalle.estadoEntrega)}
                  </span>
                </div>
                <div>
                  <small>Estado del subpedido</small>
                  <strong>
                    {textoEstado(detalle.estadoSubPedido)}
                  </strong>
                </div>
                <div>
                  <small>Método</small>
                  <strong>
                    {detalle.metodoEntrega || "No especificado"}
                  </strong>
                </div>
                <div>
                  <small>Proveedor</small>
                  <strong>
                    {detalle.proveedorEntrega ||
                      "No asignado"}
                  </strong>
                </div>
                <div>
                  <small>Código de seguimiento</small>
                  <strong>
                    {detalle.codigoSeguimiento ||
                      "No registrado"}
                  </strong>
                </div>
                <div>
                  <small>Fecha de creación</small>
                  <strong>
                    {fechaBonita(detalle.fechaCreacion)}
                  </strong>
                </div>
                <div>
                  <small>Última actualización</small>
                  <strong>
                    {fechaBonita(detalle.fechaActualizacion)}
                  </strong>
                </div>
                <div>
                  <small>Fecha de entrega</small>
                  <strong>
                    {fechaBonita(detalle.fechaEntrega)}
                  </strong>
                </div>
              </div>

              <p className="ae-nota-modal">
                <i className="bi bi-info-circle" />
                Los cambios de estado y seguimiento los realiza
                el vendedor desde su módulo correspondiente.
              </p>
            </div>

            <footer className="ae-modal-footer">
              <button
                type="button"
                className="ae-boton"
                onClick={() => setDetalle(null)}
              >
                Cerrar
              </button>
            </footer>
          </section>
        </div>
      )}
    </main>
  );
}
