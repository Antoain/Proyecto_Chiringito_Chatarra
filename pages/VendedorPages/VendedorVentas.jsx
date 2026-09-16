import React, { useEffect, useMemo, useState } from "react";

import {
  obtenerPedidosVendedor
} from "../../services/data";

import "./VendedorPagesCss/VendedorVentas.css";


export function VendedorVentas() {

  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [busqueda, setBusqueda] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("TODOS");

  const [paginaActual, setPaginaActual] = useState(1);
  const pedidosPorPagina = 10;


  useEffect(() => {

    const cargarPedidos = async () => {

      try {

        const data =
          await obtenerPedidosVendedor();

        setPedidos(data);

      } catch (err) {

        console.error(
          "Error al cargar pedidos:",
          err
        );

        setError(
          "No se pudieron cargar los pedidos."
        );

      } finally {

        setCargando(false);

      }
    };


    cargarPedidos();

  }, []);

  useEffect(() => { setPaginaActual(1);},
   [
    busqueda,
    estadoFiltro]);


  const formatearFecha = fecha => {

    if (!fecha) {
      return "Sin fecha";
    }

    return new Date(fecha)
      .toLocaleDateString(
        "es-SV",
        {
          day: "2-digit",
          month: "2-digit",
          year: "numeric"
        }
      );
  };


  const formatearEstado = estado => {

    if (!estado) {
      return "SIN ESTADO";
    }

    return estado
      .replaceAll("_", " ")
      .toUpperCase();
  };


  const obtenerClaseEstado = estado => {

    switch (estado) {

      case "ENTREGADO":
        return "venta-status entregado";

      case "PENDIENTE":
        return "venta-status pendiente";

      case "CONFIRMADO":
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


  const pedidosFiltrados = useMemo(() => {

    const texto =
      busqueda
        .trim()
        .toLowerCase();


    return pedidos.filter(pedido => {

      const coincideEstado =
        estadoFiltro === "TODOS" ||
        pedido.estado === estadoFiltro;


      const cliente =
        `${pedido.cliente?.nombres || ""} ${pedido.cliente?.apellidos || ""}`
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
        contenidoBusqueda.includes(texto);


      return (
        coincideEstado &&
        coincideBusqueda
      );
    });

  }, [
    pedidos,
    busqueda,
    estadoFiltro
  ]);

  const totalPaginas = Math.ceil(
  pedidosFiltrados.length / pedidosPorPagina);
  
  const indiceInicio =
  (paginaActual - 1) * pedidosPorPagina;
  
  const indiceFin =
  indiceInicio + pedidosPorPagina;
  
  const pedidosPaginados =
  pedidosFiltrados.slice(
    indiceInicio,
    indiceFin);


  const resumen = useMemo(() => {

    const validos =
      pedidos.filter(
        pedido =>
          pedido.estado !== "CANCELADO"
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
          pedido.estado === "PENDIENTE"
      ).length;


    const entregados =
      pedidos.filter(
        pedido =>
          pedido.estado === "ENTREGADO"
      ).length;


    return {
      totalPedidos: validos.length,
      totalVendedor,
      pendientes,
      entregados
    };

  }, [pedidos]);


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


        {/* HEADER */}

        <div className="ventas-header">

          <div>

            <span className="ventas-eyebrow">
              GESTIÓN DE PEDIDOS
            </span>

            <h1>
              Ventas y pedidos
            </h1>

            <p>
              Consulta los pedidos asociados
              a tus tiendas, clientes y entregas.
            </p>

          </div>

        </div>


        {error && (

          <div className="ventas-alert ventas-alert-error">

            <i className="bi bi-exclamation-circle"></i>

            {error}

          </div>
        )}


        {/* KPIs */}

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
                {resumen.totalVendedor.toFixed(2)}
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


        {/* TABLA */}

        <section className="ventas-card">

          <div className="ventas-card-header">

            <div>

              <h2>
                Pedidos recientes
              </h2>

              <p>
                Información de ventas,
                cliente y entrega
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

                <option value="CONFIRMADO">
                  Confirmado
                </option>

                <option value="ENVIADO">
                  Enviado
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
                    <th>Comisión</th>
                    <th>Ingreso vendedor</th>
                    <th>Estado</th>
                    <th>Entrega</th>
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
                              Subpedido #{pedido.idSubPedido}
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
                                  pedido.cliente.nombres
                                }{" "}
                                {
                                  pedido.cliente.apellidos
                                }
                              </strong>

                              <small>
                                {
                                  pedido.cliente.correo
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
                          {Number(
                            pedido.subtotal || 0
                          ).toFixed(2)}

                        </td>


                        <td>

                          $
                          {Number(
                            pedido.comisionPlataforma || 0
                          ).toFixed(2)}

                        </td>


                        <td className="venta-ingreso">

                          $
                          {Number(
                            pedido.totalVendedor || 0
                          ).toFixed(2)}

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
                                  pedido.entrega
                                    ?.estadoEntrega ||
                                  pedido.metodoEntrega
                                )
                              }
                            </span>

                            {pedido.entrega
                              ?.codigoSeguimiento && (

                              <small>
                                {
                                  pedido.entrega
                                    .codigoSeguimiento
                                }
                              </small>
                            )}

                          </div>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

              {pedidosFiltrados.length > 0 && (
                <div className="ventas-pagination">

                    <div className="ventas-pagination-info">

                    Mostrando{" "}
                    <strong>
                        {indiceInicio + 1}
                    </strong>

                    {" - "}

                    <strong>
                        {Math.min(
                        indiceFin,
                        pedidosFiltrados.length
                        )}
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
                        disabled={paginaActual === 1}
                        onClick={() =>
                        setPaginaActual(
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
                        paginaActual >= totalPaginas
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
                        title="Página siguiente"
                    >

                        <i className="bi bi-chevron-right"></i>

                    </button>

                    </div>

                </div>
                )}

            </div>
          )}

        </section>

      </div>

    </div>
  );
}


export default VendedorVentas;