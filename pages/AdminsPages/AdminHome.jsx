
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

import {
  obtenerDashboardAdministrador
} from "../../services/data";

import "./AdminPagesCss/AdminHome.css";

// =====================================================
// FORMATEADORES
// =====================================================

const dinero = valor =>
  new Intl.NumberFormat("es-SV", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2
  }).format(Number(valor || 0));

const numero = valor =>
  new Intl.NumberFormat("es-SV").format(
    Number(valor || 0)
  );

const porcentaje = valor =>
  `${Number(valor || 0).toFixed(1)}%`;

const fechaCorta = fecha => {
  if (!fecha) return "—";

  const valor = new Date(fecha);

  if (Number.isNaN(valor.getTime())) {
    return "—";
  }

  return valor.toLocaleDateString("es-SV", {
    day: "2-digit",
    month: "short"
  });
};

const coloresEntrega = {
  Pendientes: "#f59e0b",
  "Listas para envío": "#8b5cf6",
  "Listas para recoger": "#6366f1",
  "En camino": "#3b82f6",
  Entregadas: "#16a34a",
  Canceladas: "#ef4444"
};

function Indicador({
  icono,
  etiqueta,
  valor,
  detalle,
  tono = "azul"
}) {
  return (
    <article className="adm-kpi">
      <div className="adm-kpi-superior">
        <span className={`adm-kpi-icono ${tono}`}>
          <i className={`bi ${icono}`} />
        </span>
      </div>

      <span className="adm-kpi-etiqueta">
        {etiqueta}
      </span>

      <strong className="adm-kpi-valor">
        {valor}
      </strong>

      <small className="adm-kpi-detalle">
        {detalle}
      </small>
    </article>
  );
}

function EstadoVacio({ texto }) {
  return (
    <div className="adm-sin-datos">
      <i className="bi bi-bar-chart-line" />
      <strong>Sin datos disponibles</strong>
      <span>{texto}</span>
    </div>
  );
}

function TooltipMoneda({ active, payload, label }) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="adm-tooltip">
      <strong>{label}</strong>

      {payload.map(item => (
        <div key={item.dataKey}>
          <span
            className="adm-tooltip-dot"
            style={{ backgroundColor: item.color }}
          />
          {item.name}: {dinero(item.value)}
        </div>
      ))}
    </div>
  );
}

// =====================================================
// DASHBOARD
// =====================================================

export function AdminHome() {
  const [dashboard, setDashboard] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [actualizando, setActualizando] = useState(false);

  const cargarDashboard = async (esActualizacion = false) => {
    if (esActualizacion) {
      setActualizando(true);
    } else {
      setCargando(true);
    }

    setError("");

    try {
      const data = await obtenerDashboardAdministrador();
      setDashboard(data);
    } catch (err) {
      console.error(
        "Error al cargar SIG Administrador:",
        err
      );

      setError(
        err?.message ||
        "No fue posible cargar la información administrativa."
      );
    } finally {
      setCargando(false);
      setActualizando(false);
    }
  };

  useEffect(() => {
    let activo = true;

    const cargar = async () => {
      try {
        const data =
          await obtenerDashboardAdministrador();

        if (activo) {
          setDashboard(data);
          setError("");
        }
      } catch (err) {
        if (activo) {
          setError(
            err?.message ||
            "No fue posible cargar el dashboard."
          );
        }
      } finally {
        if (activo) {
          setCargando(false);
        }
      }
    };

    cargar();

    return () => {
      activo = false;
    };
  }, []);

  // =====================================================
  // DATOS: ESTRUCTURA REAL DEL BACKEND
  // =====================================================

  const plataforma = dashboard?.rendimientoPlataforma || {};
  const usuarios = plataforma.usuarios || {};
  const pedidos = plataforma.pedidos || {};
  const ventas = plataforma.ventas || {};
  const finanzas = plataforma.finanzas || {};

  const tendencias = useMemo(() => {
    const registros =
      dashboard?.tendenciasGlobales?.tendencias;

    if (!Array.isArray(registros)) {
      return [];
    }

    return registros
      .map(item => ({
        fechaOriginal: item.fecha,
        fecha: fechaCorta(item.fecha),
        ventas: Number(item.totalVentas || 0),
        comisiones: Number(item.totalComisiones || 0),
        pedidos: Number(item.cantidadPedidos || 0)
      }))
      .sort(
        (a, b) =>
          new Date(a.fechaOriginal).getTime() -
          new Date(b.fechaOriginal).getTime()
      );
  }, [dashboard]);

  const tiendas = useMemo(() => {
    const registros =
      dashboard?.rendimientoTiendas?.rendimientoTiendas;

    return Array.isArray(registros)
      ? [...registros].sort(
          (a, b) =>
            Number(b.totalVentas || 0) -
            Number(a.totalVentas || 0)
        )
      : [];
  }, [dashboard]);

  const logistica = dashboard?.kpisLogisticos || {};
  const estados = logistica.estados || {};

  const entregasPorEstado = useMemo(
    () => [
      {
        nombre: "Pendientes",
        cantidad: Number(estados.pendientes || 0)
      },
      {
        nombre: "Listas para envío",
        cantidad: Number(estados.listasParaEnvio || 0)
      },
      {
        nombre: "Listas para recoger",
        cantidad: Number(estados.listasParaRecoger || 0)
      },
      {
        nombre: "En camino",
        cantidad: Number(estados.enCamino || 0)
      },
      {
        nombre: "Entregadas",
        cantidad: Number(estados.entregadas || 0)
      },
      {
        nombre: "Canceladas",
        cantidad: Number(estados.canceladas || 0)
      }
    ].filter(item => item.cantidad > 0),
    [estados]
  );

  const tiempoEntrega =
    dashboard?.tiempoPromedioEntrega || {};

  const tiendasGrafico = tiendas.slice(0, 6).map(item => ({
    nombre:
      String(item.nombreTienda || "Tienda").length > 20
        ? `${String(item.nombreTienda).slice(0, 18)}...`
        : item.nombreTienda || "Tienda",
    ventas: Number(item.totalVentas || 0)
  }));

  const totalEntregas = Number(
    logistica.totalEntregas || 0
  );

  // =====================================================
  // RENDER: CARGA INICIAL
  // =====================================================

  if (cargando) {
    return (
      <main className="adm-pagina">
        <div className="adm-cargando">
          <span
            className="spinner-border text-primary"
            role="status"
          />
          <h2>Preparando centro de control</h2>
          <p>
            Consultando los indicadores de la plataforma...
          </p>
        </div>
      </main>
    );
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <main className="adm-pagina">
      <div className="adm-contenedor">

        {/* ENCABEZADO */}

        <header className="adm-header">
          <div>
            <span className="adm-eyebrow">
              CHIRINGUITO CHATARRA · SIG
            </span>

            <h1>
              Centro de administración
            </h1>

            <p>
              Supervisa las ventas, los usuarios, las tiendas
              y el desempeño de la plataforma.
            </p>
          </div>

          <div className="adm-header-acciones">
            <Link
              to="/admin/mineria"
              className="adm-boton-secundario"
            >
              <i className="bi bi-diagram-3" />
              Minería de datos
            </Link>

            <button
              type="button"
              className="adm-boton-primario"
              onClick={() => cargarDashboard(true)}
              disabled={actualizando}
            >
              <i
                className={
                  `bi bi-arrow-clockwise ${
                    actualizando ? "adm-girando" : ""
                  }`
                }
              />
              {actualizando
                ? "Actualizando..."
                : "Actualizar datos"}
            </button>
          </div>
        </header>

        {/* ERRORES */}

        {error && (
          <div className="adm-error" role="alert">
            <i className="bi bi-exclamation-triangle" />
            <span>{error}</span>

            <button
              type="button"
              onClick={() => cargarDashboard(true)}
              disabled={actualizando}
            >
              Reintentar
            </button>
          </div>
        )}

        {!dashboard ? (
          <div className="adm-panel">
            <EstadoVacio
              texto="No se pudo recuperar el dashboard. Intenta actualizar."
            />
          </div>
        ) : (
          <>
            {/* KPIs PRINCIPALES */}

            <section className="adm-kpis">
              <Indicador
                icono="bi-cash-stack"
                etiqueta="Ventas registradas"
                valor={dinero(ventas.totalVentas)}
                detalle="Subtotal de subpedidos no cancelados"
                tono="verde"
              />

              <Indicador
                icono="bi-bag-check"
                etiqueta="Pedidos"
                valor={numero(pedidos.totalPedidos)}
                detalle={`${numero(
                  pedidos.pedidosValidos
                )} no cancelados`}
                tono="azul"
              />

              <Indicador
                icono="bi-people"
                etiqueta="Clientes"
                valor={numero(usuarios.totalClientes)}
                detalle={`${numero(
                  usuarios.clientesConCompras
                )} con compras`}
                tono="morado"
              />

              <Indicador
                icono="bi-shop"
                etiqueta="Tiendas"
                valor={numero(usuarios.totalTiendas)}
                detalle={`${numero(
                  usuarios.totalVendedores
                )} vendedores`}
                tono="naranja"
              />

              <Indicador
                icono="bi-percent"
                etiqueta="Comisiones de plataforma"
                valor={dinero(
                  finanzas.comisionesPlataforma
                )}
                detalle="Comisiones registradas"
                tono="verde"
              />

              <Indicador
                icono="bi-graph-up-arrow"
                etiqueta="Conversión de clientes"
                valor={porcentaje(
                  usuarios.tasaConversionClientes
                )}
                detalle="Clientes con al menos una compra"
                tono="azul"
              />

              <Indicador
                icono="bi-receipt"
                etiqueta="Ticket promedio"
                valor={dinero(ventas.ticketPromedio)}
                detalle="Por subpedido no cancelado"
                tono="morado"
              />

              <Indicador
                icono="bi-x-octagon"
                etiqueta="Cancelación de pedidos"
                valor={porcentaje(
                  pedidos.porcentajeCancelacion
                )}
                detalle={`${numero(
                  pedidos.pedidosCancelados
                )} pedidos cancelados`}
                tono="rojo"
              />
            </section>

            {/* TENDENCIAS */}

            <div className="adm-grid-principal">
              <section className="adm-panel">
                <div className="adm-panel-header">
                  <div>
                    <span className="adm-panel-eyebrow">
                      CRECIMIENTO
                    </span>
                    <h2>Evolución de ventas</h2>
                    <p>
                      Ventas y comisiones registradas
                      por día.
                    </p>
                  </div>

                  <span className="adm-panel-etiqueta">
                    {numero(tendencias.length)} días
                  </span>
                </div>

                {tendencias.length === 0 ? (
                  <EstadoVacio
                    texto="Cuando existan ventas, aparecerá su evolución."
                  />
                ) : (
                  <div className="adm-grafico">
                    <ResponsiveContainer
                      width="100%"
                      height="100%"
                    >
                      <AreaChart
                        data={tendencias}
                        margin={{
                          top: 10,
                          right: 12,
                          left: 0,
                          bottom: 5
                        }}
                      >
                        <defs>
                          <linearGradient
                            id="admGradientVentas"
                            x1="0"
                            x2="0"
                            y1="0"
                            y2="1"
                          >
                            <stop
                              offset="0%"
                              stopColor="#2563eb"
                              stopOpacity={0.25}
                            />
                            <stop
                              offset="95%"
                              stopColor="#2563eb"
                              stopOpacity={0.01}
                            />
                          </linearGradient>
                        </defs>

                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="#e5e7eb"
                        />

                        <XAxis
                          dataKey="fecha"
                          tick={{
                            fill: "#64748b",
                            fontSize: 11
                          }}
                          tickLine={false}
                          axisLine={false}
                        />

                        <YAxis
                          tick={{
                            fill: "#64748b",
                            fontSize: 11
                          }}
                          tickLine={false}
                          axisLine={false}
                          width={55}
                        />

                        <Tooltip
                          content={<TooltipMoneda />}
                        />

                        <Area
                          name="Ventas"
                          type="monotone"
                          dataKey="ventas"
                          stroke="#2563eb"
                          strokeWidth={3}
                          fill="url(#admGradientVentas)"
                          dot={false}
                          activeDot={{ r: 5 }}
                        />

                        <Area
                          name="Comisiones"
                          type="monotone"
                          dataKey="comisiones"
                          stroke="#16a34a"
                          strokeWidth={2}
                          fill="transparent"
                          dot={false}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}

                <div className="adm-leyenda">
                  <span>
                    <i className="adm-leyenda-azul" />
                    Ventas
                  </span>

                  <span>
                    <i className="adm-leyenda-verde" />
                    Comisiones
                  </span>
                </div>
              </section>

              {/* LOGÍSTICA */}

              <section className="adm-panel">
                <div className="adm-panel-header">
                  <div>
                    <span className="adm-panel-eyebrow">
                      LOGÍSTICA
                    </span>
                    <h2>Estado de entregas</h2>
                    <p>
                      Distribución de entregas registradas.
                    </p>
                  </div>
                </div>

                {entregasPorEstado.length === 0 ? (
                  <EstadoVacio
                    texto="Todavía no hay entregas registradas."
                  />
                ) : (
                  <>
                    <div className="adm-grafico adm-grafico-dona">
                      <ResponsiveContainer
                        width="100%"
                        height="100%"
                      >
                        <PieChart>
                          <Pie
                            data={entregasPorEstado}
                            dataKey="cantidad"
                            nameKey="nombre"
                            cx="50%"
                            cy="50%"
                            innerRadius={72}
                            outerRadius={105}
                            paddingAngle={3}
                          >
                            {entregasPorEstado.map(
                              item => (
                                <Cell
                                  key={item.nombre}
                                  fill={
                                    coloresEntrega[item.nombre]
                                  }
                                />
                              )
                            )}
                          </Pie>

                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>

                      <div className="adm-dona-centro">
                        <strong>{numero(totalEntregas)}</strong>
                        <span>entregas</span>
                      </div>
                    </div>

                    <div className="adm-entregas-leyenda">
                      {entregasPorEstado.map(item => (
                        <div key={item.nombre}>
                          <span>
                            <i
                              style={{
                                backgroundColor:
                                  coloresEntrega[item.nombre]
                              }}
                            />
                            {item.nombre}
                          </span>

                          <strong>
                            {numero(item.cantidad)}
                          </strong>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </section>
            </div>

            {/* TIENDAS */}

            <div className="adm-grid-inferior">
              <section className="adm-panel">
                <div className="adm-panel-header">
                  <div>
                    <span className="adm-panel-eyebrow">
                      RENDIMIENTO
                    </span>
                    <h2>Tiendas destacadas</h2>
                    <p>
                      Ranking por valor de ventas no canceladas.
                    </p>
                  </div>
                </div>

                {tiendasGrafico.length === 0 ? (
                  <EstadoVacio
                    texto="Las tiendas aparecerán al registrar ventas."
                  />
                ) : (
                  <div className="adm-grafico adm-grafico-barras">
                    <ResponsiveContainer
                      width="100%"
                      height="100%"
                    >
                      <BarChart
                        data={tiendasGrafico}
                        layout="vertical"
                        margin={{
                          top: 5,
                          right: 20,
                          left: 16,
                          bottom: 5
                        }}
                      >
                        <CartesianGrid
                          stroke="#e5e7eb"
                          strokeDasharray="3 3"
                          horizontal={false}
                        />

                        <XAxis
                          type="number"
                          tick={{
                            fontSize: 11,
                            fill: "#64748b"
                          }}
                        />

                        <YAxis
                          type="category"
                          dataKey="nombre"
                          width={125}
                          tick={{
                            fontSize: 11,
                            fill: "#374151"
                          }}
                        />

                        <Tooltip
                          formatter={valor => [
                            dinero(valor),
                            "Ventas"
                          ]}
                        />

                        <Bar
                          dataKey="ventas"
                          name="Ventas"
                          fill="#2563eb"
                          radius={[0, 6, 6, 0]}
                          maxBarSize={29}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </section>

              <section className="adm-panel adm-ranking-panel">
                <div className="adm-panel-header">
                  <div>
                    <span className="adm-panel-eyebrow">
                      TOP TIENDAS
                    </span>
                    <h2>Ranking comercial</h2>
                    <p>
                      Las tiendas con mayor volumen
                      de ventas.
                    </p>
                  </div>
                </div>

                {tiendas.length === 0 ? (
                  <EstadoVacio
                    texto="No hay tiendas con ventas todavía."
                  />
                ) : (
                  <div className="adm-ranking">
                    {tiendas.slice(0, 5).map(
                      (tienda, index) => (
                        <article
                          key={tienda.idTienda ?? index}
                          className="adm-ranking-item"
                        >
                          <span className="adm-ranking-puesto">
                            {index + 1}
                          </span>

                          <div>
                            <strong>
                              {tienda.nombreTienda ||
                                `Tienda ${tienda.idTienda}`}
                            </strong>

                            <small>
                              {numero(
                                tienda.cantidadPedidos
                              )}{" "}
                              subpedidos
                            </small>
                          </div>

                          <strong className="adm-ranking-monto">
                            {dinero(tienda.totalVentas)}
                          </strong>
                        </article>
                      )
                    )}
                  </div>
                )}
              </section>
            </div>

            {/* INDICADORES LOGÍSTICOS */}

            <section className="adm-logistica">
              <div>
                <span className="adm-logistica-icono">
                  <i className="bi bi-truck" />
                </span>

                <div>
                  <small>ENTREGAS COMPLETADAS</small>
                  <strong>
                    {porcentaje(
                      logistica.indicadores
                        ?.porcentajeCompletadas
                    )}
                  </strong>
                </div>
              </div>

              <div>
                <span className="adm-logistica-icono">
                  <i className="bi bi-clock-history" />
                </span>

                <div>
                  <small>TIEMPO PROMEDIO DE ENTREGA</small>
                  <strong>
                    {Number(
                      tiempoEntrega.tiempoPromedioHoras || 0
                    ).toFixed(1)}{" "}
                    horas
                  </strong>
                </div>
              </div>

              <div>
                <span className="adm-logistica-icono">
                  <i className="bi bi-check2-circle" />
                </span>

                <div>
                  <small>ENTREGAS FINALIZADAS</small>
                  <strong>
                    {numero(
                      tiempoEntrega.entregasCompletadas
                    )}
                  </strong>
                </div>
              </div>
            </section>

            {/* ACCESOS DIRECTOS */}

            <section className="adm-accesos">
              <div>
                <span className="adm-panel-eyebrow">
                  GESTIÓN
                </span>
                <h2>Accesos rápidos</h2>
                <p>
                  Administra los módulos principales.
                </p>
              </div>

              <div className="adm-accesos-grid">
                <Link to="/admin/usuarios">
                  <i className="bi bi-people" />
                  Usuarios
                  <i className="bi bi-arrow-up-right" />
                </Link>

                <Link to="/admin/tiendas">
                  <i className="bi bi-shop" />
                  Tiendas
                  <i className="bi bi-arrow-up-right" />
                </Link>

                <Link to="/admin/productos">
                  <i className="bi bi-box-seam" />
                  Productos
                  <i className="bi bi-arrow-up-right" />
                </Link>

                <Link to="/admin/mineria">
                  <i className="bi bi-diagram-3" />
                  Minería
                  <i className="bi bi-arrow-up-right" />
                </Link>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}

export default AdminHome;
