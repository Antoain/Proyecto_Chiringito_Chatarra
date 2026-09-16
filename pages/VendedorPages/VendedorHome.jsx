import React, { useEffect, useState } from "react";
import { obtenerDashboardVendedor } from "../../services/data";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from "recharts";

import "./VendedorPagesCss/VendedorHome.css";


export function VendedorHome() {

  const [dashboard, setDashboard] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");


  // =====================================================
  // CARGAR DASHBOARD
  // =====================================================

  useEffect(() => {

    const cargarDashboard = async () => {

      try {

        const data =
          await obtenerDashboardVendedor();

        setDashboard(data);

      } catch (err) {

        console.error(
          "Error al cargar dashboard SIG:",
          err
        );

        setError(
          "No se pudo cargar la información del dashboard."
        );

      } finally {

        setCargando(false);

      }
    };


    cargarDashboard();

  }, []);


  // =====================================================
  // LOADING
  // =====================================================

  if (cargando) {

    return (
      <div className="Vendedor-home">

        <div className="dashboard-loading">
          <div className="spinner-border" />

          <p>
            Cargando información gerencial...
          </p>
        </div>

      </div>
    );
  }


  // =====================================================
  // ERROR
  // =====================================================

  if (error) {

    return (
      <div className="Vendedor-home">

        <div className="alert alert-danger">
          {error}
        </div>

      </div>
    );
  }


  // =====================================================
  // DATOS
  // =====================================================

  const resumen =
    dashboard?.resumen || {};

  const productosMasVendidos =
    dashboard?.productosMasVendidos || [];

  const stockBajo =
    dashboard?.stockBajo || [];

  const pedidosPorEstado =
    dashboard?.pedidosPorEstado || [];

  const kpis =
    dashboard?.kpisLogisticos || {};

  const tendencias =
    dashboard?.tendencias || [];

  const clientesRecurrentes =
    dashboard?.clientesRecurrentes || [];

  const rendimientoProductos =
    dashboard?.rendimientoProductos || [];

  const movimientosInventario =
    dashboard?.movimientosInventario || [];

  const tiempoPromedioEntrega =
    dashboard?.tiempoPromedioEntrega || {};


  // =====================================================
  // CLASE DE ESTADO
  // =====================================================

  const obtenerClaseEstado = (estado) => {

    switch (estado) {

      case "ENTREGADO":
        return "estado estado-entregado";

      case "PENDIENTE":
        return "estado estado-pendiente";

      case "CANCELADO":
        return "estado estado-cancelado";

      case "ENVIADO":
      case "EN_CAMINO":
        return "estado estado-enviado";

      case "CONFIRMADO":
        return "estado estado-confirmado";

      default:
        return "estado";
    }
  };

  const formatearMovimiento = (tipo) => {
    return tipo
      ?.replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, letra =>
        letra.toUpperCase()
      );
  };


  // =====================================================
  // FORMATEAR FECHA
  // =====================================================

  const formatearFecha = (fecha) => {

    if (!fecha) {
      return "";
    }

    return new Date(fecha)
      .toLocaleDateString(
        "es-SV",
        {
          day: "2-digit",
          month: "2-digit"
        }
      );
  };


  return (

    <div className="Vendedor-home">

      <div className="dashboard-container">


        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <div className="dashboard-header">

          <div>

            <span className="dashboard-eyebrow">
              SISTEMA DE INFORMACIÓN GERENCIAL
            </span>

            <h1>
              Panel de rendimiento
            </h1>

            <p>
              Consulta ventas, productos,
              clientes, inventario y desempeño
              logístico de tus tiendas.
            </p>

          </div>


          <div className="dashboard-header-icon">
            <i className="bi bi-speedometer2"></i>
          </div>

        </div>


        {/* ================================================= */}
        {/* KPIs */}
        {/* ================================================= */}

        <div className="dashboard-kpis">


          <div className="kpi-card">

            <div className="kpi-content">

              <span>
                Total de ventas
              </span>

              <strong>
                $
                {Number(
                  resumen.totalVentas || 0
                ).toFixed(2)}
              </strong>

              <small>
                Ingresos registrados
              </small>

            </div>


            <div className="kpi-icon kpi-ventas">
              <i className="bi bi-cash-stack"></i>
            </div>

          </div>


          <div className="kpi-card">

            <div className="kpi-content">

              <span>
                Total de pedidos
              </span>

              <strong>
                {resumen.totalPedidos || 0}
              </strong>

              <small>
                Pedidos procesados
              </small>

            </div>


            <div className="kpi-icon kpi-pedidos">
              <i className="bi bi-bag-check"></i>
            </div>

          </div>


          <div className="kpi-card">

            <div className="kpi-content">

              <span>
                Ticket promedio
              </span>

              <strong>
                $
                {Number(
                  resumen.ticketPromedio || 0
                ).toFixed(2)}
              </strong>

              <small>
                Valor promedio por pedido
              </small>

            </div>


            <div className="kpi-icon kpi-ticket">
              <i className="bi bi-graph-up-arrow"></i>
            </div>

          </div>

        </div>


        {/* ================================================= */}
        {/* TENDENCIA + PEDIDOS ESTADO */}
        {/* ================================================= */}

        <div className="dashboard-grid dashboard-grid-main">


          {/* TENDENCIA */}

          <section className="dashboard-card dashboard-card-chart">

            <div className="card-header-custom">

              <div>
                <h3>
                  Tendencia de ventas
                </h3>

                <p>
                  Evolución de ingresos por fecha
                </p>
              </div>


              <div className="section-icon">
                <i className="bi bi-activity"></i>
              </div>

            </div>


            {tendencias.length === 0 ? (

              <div className="estado-vacio">

                <i className="bi bi-bar-chart"></i>

                <p>
                  No hay ventas suficientes
                  para mostrar tendencias.
                </p>

              </div>

            ) : (

              <div className="chart-container">

                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >

                  <LineChart
                    data={tendencias}
                    margin={{
                      top: 10,
                      right: 20,
                      left: 0,
                      bottom: 0
                    }}
                  >

                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                    />

                    <XAxis
                      dataKey="fecha"
                      tickFormatter={
                        formatearFecha
                      }
                    />

                    <YAxis />

                    <Tooltip
                      labelFormatter={
                        formatearFecha
                      }
                      formatter={(valor) => [
                        `$${Number(valor).toFixed(2)}`,
                        "Ventas"
                      ]}
                    />

                    <Line
                      type="monotone"
                      dataKey="totalVentas"
                      stroke="#2563eb"
                      strokeWidth={3}
                      dot={{
                        r: 4
                      }}
                      activeDot={{
                        r: 6
                      }}
                    />

                  </LineChart>

                </ResponsiveContainer>

              </div>
            )}

          </section>


          {/* PEDIDOS POR ESTADO */}

          <section className="dashboard-card">

            <div className="card-header-custom">

              <div>
                <h3>
                  Pedidos por estado
                </h3>

                <p>
                  Distribución actual
                </p>
              </div>


              <div className="section-icon">
                <i className="bi bi-list-check"></i>
              </div>

            </div>


            {pedidosPorEstado.length === 0 ? (

              <div className="estado-vacio">

                <i className="bi bi-inbox"></i>

                <p>
                  No hay pedidos registrados.
                </p>

              </div>

            ) : (

              <div className="estados-lista">

                {pedidosPorEstado.map(
                  (pedido, index) => (

                    <div
                      className="estado-row"
                      key={index}
                    >

                      <div>

                        <span
                          className={
                            obtenerClaseEstado(
                              pedido.estado
                            )
                          }
                        >
                          {pedido.estado}
                        </span>

                      </div>


                      <div className="estado-row-data">

                        <strong>
                          {pedido.cantidadPedidos}
                        </strong>

                        <small>
                          $
                          {Number(
                            pedido.total || 0
                          ).toFixed(2)}
                        </small>

                      </div>

                    </div>

                  )
                )}

              </div>
            )}

          </section>

        </div>


        {/* ================================================= */}
        {/* STOCK + LOGÍSTICA */}
        {/* ================================================= */}

        <div className="dashboard-grid dashboard-grid-half">


          {/* STOCK */}

          <section className="dashboard-card">

            <div className="card-header-custom">

              <div>
                <h3>
                  Control de stock
                </h3>

                <p>
                  Productos que requieren atención
                </p>
              </div>


              <div className="section-icon">
                <i className="bi bi-box-seam"></i>
              </div>

            </div>


            {stockBajo.length === 0 ? (

              <div className="estado-vacio estado-ok">

                <i className="bi bi-check-circle"></i>

                <strong>
                  Inventario saludable
                </strong>

                <p>
                  No hay productos con stock bajo.
                </p>

              </div>

            ) : (

              <div className="table-responsive">

                <table className="dashboard-table">

                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Actual</th>
                      <th>Mínimo</th>
                    </tr>
                  </thead>

                  <tbody>

                    {stockBajo.map(
                      producto => (

                        <tr
                          key={
                            producto.idProducto
                          }
                        >

                          <td>
                            {producto.nombre}
                          </td>

                          <td>
                            <span className="stock-alert">
                              {producto.stockActual}
                            </span>
                          </td>

                          <td>
                            {producto.stockMinimo}
                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>
            )}

          </section>


          {/* LOGÍSTICA */}

          <section className="dashboard-card">

            <div className="card-header-custom">

              <div>
                <h3>
                  Rendimiento logístico
                </h3>

                <p>
                  Estado general de entregas
                </p>
              </div>


              <div className="section-icon">
                <i className="bi bi-truck"></i>
              </div>

            </div>


            <div className="logistica-grid">

              <div className="logistica-item">

                <span>
                  Entregas totales
                </span>

                <strong>
                  {kpis.totalEntregas || 0}
                </strong>

              </div>


              <div className="logistica-item">

                <span>
                  Pendientes
                </span>

                <strong>
                  {kpis.pendientes || 0}
                </strong>

              </div>


              <div className="logistica-item">

                <span>
                  Entregadas
                </span>

                <strong>
                  {kpis.entregadas || 0}
                </strong>

              </div>


              <div className="logistica-item">

                <span>
                  Completadas
                </span>

                <strong>
                  {Number(
                    kpis.porcentajeCompletadas || 0
                  ).toFixed(2)}
                  %
                </strong>

              </div>

            </div>


            <div className="progress-container">

              <div className="progress-info">

                <span>
                  Tasa de cumplimiento
                </span>

                <strong>
                  {Number(
                    kpis.porcentajeCompletadas || 0
                  ).toFixed(2)}
                  %
                </strong>

              </div>


              <div className="progress">

                <div
                  className="progress-bar"
                  style={{
                    width:
                      `${Math.min(
                        Number(
                          kpis.porcentajeCompletadas || 0
                        ),
                        100
                      )}%`
                  }}
                />

              </div>

            </div>

          </section>

        </div>


        {/* ================================================= */}
        {/* PRODUCTOS MÁS VENDIDOS */}
        {/* ================================================= */}

        <section className="dashboard-card">

          <div className="card-header-custom">

            <div>
              <h3>
                Productos más vendidos
              </h3>

              <p>
                Productos con mayor volumen
                de unidades vendidas
              </p>
            </div>


            <div className="section-icon">
              <i className="bi bi-trophy"></i>
            </div>

          </div>


          {productosMasVendidos.length === 0 ? (

            <div className="estado-vacio">

              <i className="bi bi-cart-x"></i>

              <p>
                No existen ventas registradas.
              </p>

            </div>

          ) : (

            <div className="table-responsive">

              <table className="dashboard-table">

                <thead>
                  <tr>
                    <th>#</th>
                    <th>Producto</th>
                    <th>Unidades</th>
                    <th>Total generado</th>
                  </tr>
                </thead>

                <tbody>

                  {productosMasVendidos.map(
                    (producto, index) => (

                      <tr
                        key={
                          producto.idProducto
                        }
                      >

                        <td>
                          <span className="ranking">
                            {index + 1}
                          </span>
                        </td>

                        <td>
                          <strong>
                            {producto.nombre}
                          </strong>
                        </td>

                        <td>
                          {producto.cantidadVendida}
                        </td>

                        <td>
                          $
                          {Number(
                            producto.totalGenerado || 0
                          ).toFixed(2)}
                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>
          )}

        </section>


        {/* ================================================= */}
        {/* CLIENTES + TIEMPO ENTREGA */}
        {/* ================================================= */}

        <div className="dashboard-grid dashboard-grid-clients">


          {/* CLIENTES */}

          <section className="dashboard-card">

            <div className="card-header-custom">

              <div>
                <h3>
                  Clientes recurrentes
                </h3>

                <p>
                  Clientes con dos o más pedidos
                </p>
              </div>


              <div className="section-icon">
                <i className="bi bi-people"></i>
              </div>

            </div>


            {clientesRecurrentes.length === 0 ? (

              <div className="estado-vacio">

                <i className="bi bi-person"></i>

                <p>
                  Todavía no existen
                  clientes recurrentes.
                </p>

              </div>

            ) : (

              <div className="table-responsive">

                <table className="dashboard-table">

                  <thead>
                    <tr>
                      <th>Cliente</th>
                      <th>Pedidos</th>
                      <th>Total</th>
                    </tr>
                  </thead>

                  <tbody>

                    {clientesRecurrentes.map(
                      cliente => (

                        <tr
                          key={
                            cliente.idUsuario
                          }
                        >

                          <td>

                            <div className="cliente-info">

                              <strong>
                                {cliente.nombres}{" "}
                                {cliente.apellidos}
                              </strong>

                              <small>
                                {cliente.correo}
                              </small>

                            </div>

                          </td>

                          <td>
                            {cliente.cantidadPedidos}
                          </td>

                          <td>
                            $
                            {Number(
                              cliente.totalComprado || 0
                            ).toFixed(2)}
                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>
            )}

          </section>


          {/* TIEMPO DE ENTREGA */}

          <section className="dashboard-card">

            <div className="card-header-custom">

              <div>
                <h3>
                  Tiempo de entrega
                </h3>

                <p>
                  Eficiencia de distribución
                </p>
              </div>


              <div className="section-icon">
                <i className="bi bi-clock-history"></i>
              </div>

            </div>


            <div className="delivery-main">

              <span>
                Promedio
              </span>

              <strong>
                {Number(
                  tiempoPromedioEntrega
                    .tiempoPromedioHoras || 0
                ).toFixed(2)}
              </strong>

              <small>
                horas por entrega
              </small>

            </div>


            <div className="delivery-details">

              <div>

                <span>
                  Completadas
                </span>

                <strong>
                  {
                    tiempoPromedioEntrega
                      .entregasCompletadas || 0
                  }
                </strong>

              </div>


              <div>

                <span>
                  Promedio días
                </span>

                <strong>
                  {Number(
                    tiempoPromedioEntrega
                      .tiempoPromedioDias || 0
                  ).toFixed(2)}
                </strong>

              </div>

            </div>

          </section>

        </div>


        {/* ================================================= */}
        {/* RENDIMIENTO PRODUCTOS + INVENTARIO */}
        {/* ================================================= */}

        <div className="dashboard-grid dashboard-grid-half">


          {/* RENDIMIENTO */}

          <section className="dashboard-card">

            <div className="card-header-custom">

              <div>
                <h3>
                  Rendimiento de productos
                </h3>

                <p>
                  Participación en ingresos
                </p>
              </div>


              <div className="section-icon">
                <i className="bi bi-bar-chart-line"></i>
              </div>

            </div>


            {rendimientoProductos.length === 0 ? (

              <div className="estado-vacio">

                <p>
                  No hay información disponible.
                </p>

              </div>

            ) : (

              <div className="table-responsive">

                <table className="dashboard-table">

                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Ventas</th>
                      <th>Participación</th>
                    </tr>
                  </thead>

                  <tbody>

                    {rendimientoProductos.map(
                      producto => (

                        <tr
                          key={
                            producto.idProducto
                          }
                        >

                          <td>
                            {producto.nombre}
                          </td>

                          <td>
                            $
                            {Number(
                              producto.totalGenerado || 0
                            ).toFixed(2)}
                          </td>

                          <td>

                            <div className="participacion">

                              <span>
                                {Number(
                                  producto
                                    .participacionPorcentaje || 0
                                ).toFixed(2)}
                                %
                              </span>


                              <div className="participacion-bar">

                                <div
                                  style={{
                                    width:
                                      `${Math.min(
                                        Number(
                                          producto
                                            .participacionPorcentaje || 0
                                        ),
                                        100
                                      )}%`
                                  }}
                                />

                              </div>

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


          {/* MOVIMIENTOS INVENTARIO */}

          <section className="dashboard-card">

            <div className="card-header-custom">

              <div>
                <h3>
                  Movimientos de inventario
                </h3>

                <p>
                  Actividad registrada
                </p>
              </div>


              <div className="section-icon">
                <i className="bi bi-arrow-left-right"></i>
              </div>

            </div>


            {movimientosInventario.length === 0 ? (

              <div className="estado-vacio">

                <p>
                  No hay movimientos registrados.
                </p>

              </div>

            ) : (

              <div className="chart-container chart-small">

                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >

                  <BarChart
                    data={movimientosInventario}
                  >

                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                    />

                    <XAxis
                      dataKey="tipoMovimiento"
                      tickFormatter={formatearMovimiento}
                      tick={{
                        fontSize: 11
                      }}
                    />

                    <YAxis />

                    <Tooltip />

                    <Bar
                      dataKey="unidadesMovidas"
                      fill="#2563eb"
                      radius={[5, 5, 0, 0]}
                    />

                  </BarChart>

                </ResponsiveContainer>

              </div>
            )}

          </section>

        </div>


      </div>

    </div>
  );
}


export default VendedorHome;