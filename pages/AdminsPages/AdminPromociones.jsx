
import React, { useEffect, useMemo, useState } from "react";

import {
  obtenerPromocionesAdministrador
} from "../../services/data";

import "./AdminPagesCss/AdminPromociones.css";

const POR_PAGINA = 8;

const dinero = valor =>
  valor == null
    ? "N/D"
    : new Intl.NumberFormat("es-SV", {
        style: "currency",
        currency: "USD"
      }).format(Number(valor));

const normalizar = valor =>
  String(valor ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const fecha = valor => {
  if (!valor) return "Sin fecha";
  const [anio, mes, dia] = String(valor).slice(0, 10).split("-");
  return `${dia}/${mes}/${anio}`;
};

const fechaHoy = () => {
  const ahora = new Date();
  const anio = ahora.getFullYear();
  const mes = String(ahora.getMonth() + 1).padStart(2, "0");
  const dia = String(ahora.getDate()).padStart(2, "0");
  return `${anio}-${mes}-${dia}`;
};

const estadoPromocion = (promo, hoy) => {
  const inicio = promo.fechaInicio?.slice(0, 10);
  const fin = promo.fechaFin?.slice(0, 10);

  if (!inicio || !fin) return "sinFechas";
  if (inicio > fin) return "invalida";
  if (hoy < inicio) return "programada";
  if (hoy > fin) return "finalizada";

  if (
    promo.productoActivo !== true ||
    Number(promo.descuento) <= 0
  ) {
    return "noVisible";
  }

  return "vigente";
};

const etiquetas = {
  vigente: "Vigente",
  programada: "Programada",
  finalizada: "Finalizada",
  noVisible: "No visible",
  sinFechas: "Sin fechas",
  invalida: "Fechas inválidas"
};

function Estado({ valor }) {
  return (
    <span className={`apr-estado ${valor}`}>
      <i className="bi bi-circle-fill" />
      {etiquetas[valor] || valor}
    </span>
  );
}

function Indicador({ icono, titulo, valor, tono }) {
  return (
    <article className="apr-kpi">
      <span className={`apr-kpi-icono ${tono}`}>
        <i className={`bi ${icono}`} />
      </span>
      <div>
        <small>{titulo}</small>
        <strong>{valor}</strong>
      </div>
    </article>
  );
}

export default function AdminPromociones() {
  const [promociones, setPromociones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [filtroTienda, setFiltroTienda] = useState("todas");
  const [pagina, setPagina] = useState(1);
  const [detalle, setDetalle] = useState(null);

  // Se calcula cuando se carga o actualiza la información.
  const [hoy, setHoy] = useState(fechaHoy);

  const cargar = async () => {
    setCargando(true);
    setError("");

    try {
      const datos = await obtenerPromocionesAdministrador();
      setPromociones(Array.isArray(datos) ? datos : []);
      setHoy(fechaHoy());
    } catch (err) {
      setError(
        err?.message ||
        "No fue posible obtener las promociones."
      );
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    let activo = true;

    const consultar = async () => {
      try {
        const datos = await obtenerPromocionesAdministrador();

        if (activo) {
          setPromociones(Array.isArray(datos) ? datos : []);
          setHoy(fechaHoy());
        }
      } catch (err) {
        if (activo) {
          setError(
            err?.message ||
            "No fue posible obtener las promociones."
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
  }, [busqueda, filtroEstado, filtroTienda]);

  useEffect(() => {
    if (!detalle) return;

    const anterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const cerrar = evento => {
      if (evento.key === "Escape") setDetalle(null);
    };

    document.addEventListener("keydown", cerrar);

    return () => {
      document.body.style.overflow = anterior;
      document.removeEventListener("keydown", cerrar);
    };
  }, [detalle]);

  const datos = useMemo(
    () => promociones.map(promo => ({
      ...promo,
      estadoCalculado: estadoPromocion(promo, hoy)
    })),
    [promociones, hoy]
  );

  const resumen = useMemo(() => ({
    total: datos.length,
    vigentes: datos.filter(
      p => p.estadoCalculado === "vigente"
    ).length,
    programadas: datos.filter(
      p => p.estadoCalculado === "programada"
    ).length,
    finalizadas: datos.filter(
      p => p.estadoCalculado === "finalizada"
    ).length,
    noVisibles: datos.filter(
      p => ["noVisible", "sinFechas", "invalida"]
        .includes(p.estadoCalculado)
    ).length
  }), [datos]);

  const tiendas = useMemo(
    () => [...new Set(datos.map(p => p.nombreTienda))]
      .sort((a, b) => a.localeCompare(b)),
    [datos]
  );

  const filtradas = useMemo(() => {
    const termino = normalizar(busqueda.trim());

    return datos.filter(promo => {
      if (
        filtroEstado !== "todos" &&
        promo.estadoCalculado !== filtroEstado
      ) {
        return false;
      }

      if (
        filtroTienda !== "todas" &&
        promo.nombreTienda !== filtroTienda
      ) {
        return false;
      }

      const contenido = normalizar([
        promo.idPromocion,
        promo.titulo,
        promo.descripcion,
        promo.nombreProducto,
        promo.nombreTienda,
        promo.idProducto
      ].join(" "));

      return !termino || contenido.includes(termino);
    });
  }, [datos, busqueda, filtroEstado, filtroTienda]);

  const totalPaginas = Math.max(
    1,
    Math.ceil(filtradas.length / POR_PAGINA)
  );

  const paginaActual = Math.min(pagina, totalPaginas);
  const inicio = (paginaActual - 1) * POR_PAGINA;
  const visibles = filtradas.slice(inicio, inicio + POR_PAGINA);

  return (
    <main className="apr-pagina">
      <div className="apr-contenedor">
        <header className="apr-header">
          <div>
            <span className="apr-eyebrow">
              ADMINISTRACIÓN · MARKETING
            </span>
            <h1>
              <i className="bi bi-tags" />
              Supervisión de promociones
            </h1>
            <p>
              Consulta descuentos y campañas de las tiendas
              desde un solo lugar.
            </p>
          </div>

          <button
            type="button"
            className="apr-btn"
            onClick={cargar}
            disabled={cargando}
          >
            <i className="bi bi-arrow-clockwise" />
            {cargando ? "Actualizando..." : "Actualizar"}
          </button>
        </header>

        {error && (
          <div className="apr-error" role="alert">
            <i className="bi bi-exclamation-triangle" />
            <span>{error}</span>
            <button type="button" onClick={cargar}>
              Reintentar
            </button>
          </div>
        )}

        <section className="apr-resumen">
          <Indicador
            icono="bi-tags"
            titulo="Total promociones"
            valor={resumen.total}
            tono="azul"
          />
          <Indicador
            icono="bi-lightning-charge"
            titulo="Vigentes"
            valor={resumen.vigentes}
            tono="verde"
          />
          <Indicador
            icono="bi-calendar-event"
            titulo="Programadas"
            valor={resumen.programadas}
            tono="morado"
          />
          <Indicador
            icono="bi-clock-history"
            titulo="Finalizadas"
            valor={resumen.finalizadas}
            tono="naranja"
          />
          <Indicador
            icono="bi-eye-slash"
            titulo="No visibles / revisar"
            valor={resumen.noVisibles}
            tono="rojo"
          />
        </section>

        <section className="apr-panel">
          <div className="apr-panel-header">
            <div>
              <h2>Directorio de promociones</h2>
              <p>{filtradas.length} resultados</p>
            </div>

            <span className="apr-nota">
              <i className="bi bi-shield-check" />
              Supervisión · Solo lectura
            </span>
          </div>

          <div className="apr-filtros">
            <label className="apr-buscador">
              <i className="bi bi-search" />
              <input
                type="search"
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                placeholder="Promoción, producto, tienda..."
                aria-label="Buscar promociones"
              />
            </label>

            <select
              value={filtroEstado}
              aria-label="Filtrar por vigencia"
              onChange={e => setFiltroEstado(e.target.value)}
            >
              <option value="todos">Todos los estados</option>
              {Object.entries(etiquetas).map(([valor, texto]) => (
                <option key={valor} value={valor}>
                  {texto}
                </option>
              ))}
            </select>

            <select
              value={filtroTienda}
              aria-label="Filtrar por tienda"
              onChange={e => setFiltroTienda(e.target.value)}
            >
              <option value="todas">Todas las tiendas</option>
              {tiendas.map(tienda => (
                <option key={tienda} value={tienda}>
                  {tienda}
                </option>
              ))}
            </select>
          </div>

          {cargando ? (
            <div className="apr-vacio">
              <span className="spinner-border text-primary" />
              <p>Cargando promociones...</p>
            </div>
          ) : filtradas.length === 0 ? (
            <div className="apr-vacio">
              <i className="bi bi-tag" />
              <strong>No hay promociones para mostrar</strong>
              <p>Modifica los filtros o actualiza el listado.</p>
            </div>
          ) : (
            <>
              <div className="apr-tabla-scroll">
                <table className="apr-tabla">
                  <thead>
                    <tr>
                      <th>Promoción</th>
                      <th>Producto</th>
                      <th>Tienda</th>
                      <th>Descuento</th>
                      <th>Vigencia</th>
                      <th>Estado</th>
                      <th>Acción</th>
                    </tr>
                  </thead>

                  <tbody>
                    {visibles.map(promo => (
                      <tr key={promo.idPromocion}>
                        <td>
                          <strong>
                            {promo.titulo || "Sin título"}
                          </strong>
                          <small>
                            ID #{promo.idPromocion}
                          </small>
                        </td>

                        <td>
                          <strong>{promo.nombreProducto}</strong>
                          <small>
                            {promo.idProducto
                              ? `Producto #${promo.idProducto}`
                              : "Sin producto"}
                          </small>
                        </td>

                        <td>{promo.nombreTienda}</td>

                        <td>
                          <span className="apr-descuento">
                            {Number(promo.descuento || 0)}%
                          </span>
                        </td>

                        <td>
                          <span className="apr-fecha">
                            {fecha(promo.fechaInicio)}
                          </span>
                          <small>
                            hasta {fecha(promo.fechaFin)}
                          </small>
                        </td>

                        <td>
                          <Estado valor={promo.estadoCalculado} />
                        </td>

                        <td>
                          <button
                            type="button"
                            className="apr-ver"
                            onClick={() => setDetalle(promo)}
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

              <div className="apr-paginacion">
                <span>
                  Mostrando {inicio + 1}–
                  {Math.min(
                    inicio + POR_PAGINA,
                    filtradas.length
                  )} de {filtradas.length}
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
          className="apr-modal-fondo"
          onMouseDown={e => {
            if (e.target === e.currentTarget) {
              setDetalle(null);
            }
          }}
        >
          <section
            className="apr-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="apr-detalle-titulo"
          >
            <header className="apr-modal-header">
              <div>
                <span>DETALLE DE PROMOCIÓN</span>
                <h2 id="apr-detalle-titulo">
                  {detalle.titulo || "Sin título"}
                </h2>
                <p>Promoción #{detalle.idPromocion}</p>
              </div>

              <button
                type="button"
                aria-label="Cerrar detalle"
                onClick={() => setDetalle(null)}
              >
                <i className="bi bi-x-lg" />
              </button>
            </header>

            <div className="apr-modal-body">
              <Estado valor={detalle.estadoCalculado} />

              {detalle.descripcion && (
                <p className="apr-descripcion">
                  {detalle.descripcion}
                </p>
              )}

              <div className="apr-detalle-grid">
                <div>
                  <small>Producto</small>
                  <strong>{detalle.nombreProducto}</strong>
                </div>
                <div>
                  <small>Tienda responsable</small>
                  <strong>{detalle.nombreTienda}</strong>
                </div>
                <div>
                  <small>Descuento</small>
                  <strong>
                    {Number(detalle.descuento || 0)}%
                  </strong>
                </div>
                <div>
                  <small>Producto habilitado</small>
                  <strong>
                    {detalle.productoActivo == null
                      ? "No disponible"
                      : detalle.productoActivo
                        ? "Sí"
                        : "No"}
                  </strong>
                </div>
                <div>
                  <small>Fecha de inicio</small>
                  <strong>{fecha(detalle.fechaInicio)}</strong>
                </div>
                <div>
                  <small>Fecha de finalización</small>
                  <strong>{fecha(detalle.fechaFin)}</strong>
                </div>
                <div>
                  <small>Precio original</small>
                  <strong>
                    {dinero(detalle.precioOriginal)}
                  </strong>
                </div>
                <div>
                  <small>Precio calculado con descuento</small>
                  <strong className="apr-precio-final">
                    {dinero(detalle.precioFinal)}
                  </strong>
                </div>
              </div>

              <p className="apr-aviso">
                <i className="bi bi-info-circle" />
                La vigencia se calcula por fechas y disponibilidad
                del producto. Las promociones se administran
                desde la cuenta del vendedor.
              </p>
            </div>

            <footer className="apr-modal-footer">
              <button
                type="button"
                className="apr-btn"
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
