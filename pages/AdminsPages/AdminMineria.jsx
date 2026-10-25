
import React, { useEffect, useRef, useState } from "react";

import {
  obtenerClientesMineria,
  verificarMineria,
  obtenerRecurrenciaCliente,
  obtenerSegmentoCliente,
  obtenerRecomendacionesCliente,
  obtenerComportamientoCliente
} from "../../services/data";

import "./AdminPagesCss/AdminMineria.css";

const dinero = valor =>
  new Intl.NumberFormat("es-SV", {
    style: "currency",
    currency: "USD"
  }).format(Number(valor || 0));

const porcentaje = valor => {
  const n = Number(valor);
  if (!Number.isFinite(n)) return "N/D";
  return `${(n * 100).toFixed(1)}%`;
};

const formatos = {
  recurrencia: "Recurrencia",
  segmento: "Segmentación",
  recomendaciones: "Recomendaciones",
  comportamiento: "Comportamiento"
};

function Metrica({ icono, titulo, valor, tono = "azul" }) {
  return (
    <article className="am-metrica">
      <span className={`am-metrica-icono ${tono}`}>
        <i className={`bi ${icono}`} />
      </span>
      <div>
        <small>{titulo}</small>
        <strong>{valor ?? "N/D"}</strong>
      </div>
    </article>
  );
}

function TarjetaAnalisis({ titulo, icono, children }) {
  return (
    <section className="am-tarjeta">
      <h3>
        <i className={`bi ${icono}`} />
        {titulo}
      </h3>
      {children}
    </section>
  );
}

export default function AdminMineria() {
  const [clientes, setClientes] = useState([]);
  const [idCliente, setIdCliente] = useState("");
  const [cargandoClientes, setCargandoClientes] = useState(true);
  const [analizando, setAnalizando] = useState(false);

  const [servicio, setServicio] = useState("comprobando");
  const [errorClientes, setErrorClientes] = useState("");
  const [errorGeneral, setErrorGeneral] = useState("");

  const [resultado, setResultado] = useState(null);
  const [erroresAnalisis, setErroresAnalisis] = useState({});

  const analisisActual = useRef(0);

  useEffect(() => {
    let activo = true;

    const cargar = async () => {
      const [respuestaClientes, respuestaHealth] =
        await Promise.allSettled([
          obtenerClientesMineria(),
          verificarMineria()
        ]);

      if (!activo) return;

      if (respuestaClientes.status === "fulfilled") {
        const datos = Array.isArray(respuestaClientes.value)
          ? respuestaClientes.value
          : [];

        setClientes(datos);

        if (datos.length > 0) {
          setIdCliente(String(datos[0].idCliente));
        }
      } else {
        setErrorClientes(
          respuestaClientes.reason?.message ||
          "No fue posible obtener los clientes."
        );
      }

      setServicio(
        respuestaHealth.status === "fulfilled"
          ? "disponible"
          : "noDisponible"
      );

      setCargandoClientes(false);
    };

    cargar();

    return () => {
      activo = false;
      analisisActual.current += 1;
    };
  }, []);

  const consultarServicio = async () => {
    setServicio("comprobando");

    try {
      await verificarMineria();
      setServicio("disponible");
    } catch {
      setServicio("noDisponible");
    }
  };

  const analizar = async () => {
    if (!idCliente || analizando) return;

    const id = Number(idCliente);

    if (!Number.isInteger(id) || id <= 0) {
      setErrorGeneral("Selecciona un cliente válido.");
      return;
    }

    const solicitud = ++analisisActual.current;

    setAnalizando(true);
    setResultado(null);
    setErroresAnalisis({});
    setErrorGeneral("");

    try {
      const respuestas = await Promise.allSettled([
        obtenerRecurrenciaCliente(id),
        obtenerSegmentoCliente(id),
        obtenerRecomendacionesCliente(id),
        obtenerComportamientoCliente(id)
      ]);

      if (solicitud !== analisisActual.current) return;

      const claves = [
        "recurrencia",
        "segmento",
        "recomendaciones",
        "comportamiento"
      ];

      const datos = {};
      const errores = {};

      respuestas.forEach((respuesta, index) => {
        const clave = claves[index];

        if (respuesta.status === "fulfilled") {
          datos[clave] = respuesta.value;
        } else {
          datos[clave] = null;
          errores[clave] =
            respuesta.reason?.message ||
            `No fue posible obtener ${formatos[clave]}.`;
        }
      });

      setResultado(datos);
      setErroresAnalisis(errores);

      if (Object.keys(errores).length === 4) {
        setErrorGeneral(
          "Ninguno de los análisis pudo completarse. " +
          "Comprueba el servicio Python y el historial del cliente."
        );
      }
    } finally {
      if (solicitud === analisisActual.current) {
        setAnalizando(false);
      }
    }
  };

  const cambiarCliente = valor => {
    analisisActual.current += 1;
    setIdCliente(valor);
    setResultado(null);
    setErroresAnalisis({});
    setErrorGeneral("");
    setAnalizando(false);
  };

  const clienteSeleccionado = clientes.find(
    c => String(c.idCliente) === idCliente
  );

  const recurrencia = resultado?.recurrencia;
  const datosCliente = recurrencia?.datosCliente;

  const prediccion = recurrencia?.prediccion;
  const segmento = resultado?.segmento?.segmentacion;
  const comportamiento = resultado?.comportamiento;

  const recomendaciones =
    resultado?.recomendaciones?.recomendaciones;

  const probabilidad =
    Number(prediccion?.probabilidadRecurrencia);

  const probabilidadValida =
    Number.isFinite(probabilidad) &&
    prediccion?.probabilidadRecurrencia != null;

  return (
    <main className="am-pagina">
      <div className="am-contenedor">
        <header className="am-header">
          <div>
            <span className="am-eyebrow">
              ADMINISTRACIÓN · INTELIGENCIA DE DATOS
            </span>
            <h1>
              <i className="bi bi-cpu" />
              Minería de datos
            </h1>
            <p>
              Analiza recurrencia, segmentación y
              comportamiento de los clientes.
            </p>
          </div>

          <div className="am-servicio">
            <span
              className={`am-servicio-estado ${servicio}`}
            >
              <i className="bi bi-circle-fill" />
              {servicio === "disponible"
                ? "Servicio Python disponible"
                : servicio === "comprobando"
                  ? "Comprobando Python..."
                  : "Servicio Python no disponible"}
            </span>

            <button
              type="button"
              onClick={consultarServicio}
              aria-label="Volver a comprobar el servicio Python"
              title="Comprobar conexión"
            >
              <i className="bi bi-arrow-clockwise" />
            </button>
          </div>
        </header>

        <section className="am-selector">
          <div className="am-selector-info">
            <span className="am-selector-icono">
              <i className="bi bi-person-lines-fill" />
            </span>
            <div>
              <h2>Análisis de cliente</h2>
              <p>
                Selecciona un cliente para ejecutar los
                modelos con sus datos registrados.
              </p>
            </div>
          </div>

          <div className="am-selector-controles">
            <label htmlFor="am-cliente">
              Cliente
            </label>

            <div className="am-selector-acciones">
              <select
                id="am-cliente"
                value={idCliente}
                disabled={cargandoClientes}
                onChange={e =>
                  cambiarCliente(e.target.value)
                }
              >
                <option value="">
                  {cargandoClientes
                    ? "Cargando clientes..."
                    : "Selecciona un cliente"}
                </option>

                {clientes.map(cliente => (
                  <option
                    key={cliente.idCliente}
                    value={cliente.idCliente}
                  >
                    {cliente.nombreCompleto ||
                      `Cliente #${cliente.idCliente}`}
                    {" · "}
                    {cliente.correo || "Sin correo"}
                  </option>
                ))}
              </select>

              <button
                type="button"
                className="am-btn-analizar"
                onClick={analizar}
                disabled={
                  analizando ||
                  cargandoClientes ||
                  !idCliente
                }
              >
                {analizando ? (
                  <>
                    <span className="spinner-border spinner-border-sm" />
                    Analizando...
                  </>
                ) : (
                  <>
                    <i className="bi bi-graph-up-arrow" />
                    Analizar cliente
                  </>
                )}
              </button>
            </div>
          </div>

          {errorClientes && (
            <div className="am-alerta error" role="alert">
              {errorClientes}
            </div>
          )}
        </section>

        {errorGeneral && (
          <div className="am-alerta error" role="alert">
            <i className="bi bi-exclamation-triangle" />
            {errorGeneral}
          </div>
        )}

        {!resultado && !analizando && (
          <section className="am-inicio">
            <div className="am-inicio-icono">
              <i className="bi bi-stars" />
            </div>
            <h2>Explora el comportamiento de tus clientes</h2>
            <p>
              Consulta la probabilidad de recurrencia,
              identifica segmentos y descubre productos
              recomendados según el historial disponible.
            </p>
            {clienteSeleccionado && (
              <span>
                Cliente seleccionado:{" "}
                <strong>
                  {clienteSeleccionado.nombreCompleto}
                </strong>
              </span>
            )}
          </section>
        )}

        {analizando && (
          <section className="am-inicio" role="status">
            <span className="spinner-border text-primary" />
            <h2>Ejecutando análisis</h2>
            <p>
              Consultando los modelos y los datos del cliente.
            </p>
          </section>
        )}

        {resultado && (
          <>
            <div className="am-resultados-header">
              <div>
                <span className="am-eyebrow">
                  RESULTADOS DEL ANÁLISIS
                </span>
                <h2>
                  {clienteSeleccionado?.nombreCompleto ||
                    `Cliente #${idCliente}`}
                </h2>
                <p>
                  ID de cliente #{idCliente}
                </p>
              </div>
            </div>

            {Object.keys(erroresAnalisis).length > 0 && (
              <div className="am-alerta aviso" role="status">
                <i className="bi bi-info-circle" />
                <div>
                  <strong>
                    Algunos análisis no están disponibles
                  </strong>
                  {Object.entries(erroresAnalisis).map(
                    ([clave, mensaje]) => (
                      <p key={clave}>
                        <b>{formatos[clave]}:</b> {mensaje}
                      </p>
                    )
                  )}
                </div>
              </div>
            )}

            <section className="am-principales">
              <TarjetaAnalisis
                titulo="Probabilidad de recurrencia"
                icono="bi-arrow-repeat"
              >
                {probabilidadValida ? (
                  <>
                    <strong className="am-probabilidad">
                      {porcentaje(probabilidad)}
                    </strong>

                    <div className="am-barra">
                      <div
                        style={{
                          width: `${
                            Math.max(
                              0,
                              Math.min(100, probabilidad * 100)
                            )
                          }%`
                        }}
                      />
                    </div>

                    <span className="am-ayuda">
                      Estimación del modelo, no garantía
                      de una compra futura.
                    </span>
                  </>
                ) : (
                  <p className="am-no-datos">
                    Predicción no disponible.
                  </p>
                )}
              </TarjetaAnalisis>

              <TarjetaAnalisis
                titulo="Predicción del cliente"
                icono="bi-person-check"
              >
                <strong className="am-resultado-texto">
                  {prediccion?.clienteRecurrentePredicho == null
                    ? "Sin predicción"
                    : Number(
                        prediccion.clienteRecurrentePredicho
                      ) === 1
                      ? "Cliente recurrente"
                      : "Cliente no recurrente"}
                </strong>
              </TarjetaAnalisis>

              <TarjetaAnalisis
                titulo="Segmentación"
                icono="bi-diagram-3"
              >
                <strong className="am-resultado-texto">
                  {segmento?.segmento ?? "Sin datos"}
                </strong>
              </TarjetaAnalisis>

              <TarjetaAnalisis
                titulo="Comportamiento"
                icono="bi-activity"
              >
                <strong className="am-resultado-texto">
                  {comportamiento?.patronComportamiento ??
                    "Sin datos"}
                </strong>
              </TarjetaAnalisis>
            </section>

            <div className="am-seccion-titulo">
              <h2>
                <i className="bi bi-bar-chart" />
                Métricas del cliente
              </h2>
              <p>
                Indicadores calculados a partir del
                historial disponible.
              </p>
            </div>

            <section className="am-metricas">
              <Metrica
                icono="bi-bag-check"
                titulo="Pedidos"
                valor={datosCliente?.cantidadPedidos}
              />
              <Metrica
                icono="bi-cash-stack"
                titulo="Total gastado"
                valor={
                  datosCliente
                    ? dinero(datosCliente.totalGastado)
                    : "N/D"
                }
                tono="verde"
              />
              <Metrica
                icono="bi-calendar3"
                titulo="Recencia"
                valor={
                  comportamiento?.segmentoRecencia ??
                  "N/D"
                }
                tono="morado"
              />
              <Metrica
                icono="bi-award"
                titulo="Nivel de valor"
                valor={
                  comportamiento?.segmentoValor ??
                  "N/D"
                }
                tono="naranja"
              />
            </section>

            <section className="am-recomendaciones">
              <div className="am-recomendaciones-header">
                <div>
                  <h2>
                    <i className="bi bi-stars" />
                    Productos recomendados
                  </h2>
                  <p>
                    Sugerencias generadas con los datos
                    disponibles del cliente.
                  </p>
                </div>
              </div>

              {Array.isArray(recomendaciones) &&
              recomendaciones.length > 0 ? (
                <div className="am-lista-productos">
                  {recomendaciones.map((producto, index) => (
                    <article
                      key={`${producto.idProducto}-${index}`}
                      className="am-producto"
                    >
                      <span className="am-producto-numero">
                        {index + 1}
                      </span>

                      <div className="am-producto-info">
                        <strong>
                          {producto.nombreProducto}
                        </strong>
                        <small>
                          Producto #{producto.idProducto}
                        </small>
                      </div>

                      <div className="am-producto-valores">
                        <strong>
                          {dinero(producto.precio)}
                        </strong>
                        <small>
                          Stock: {producto.stock ?? "N/D"}
                        </small>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="am-recomendaciones-vacias">
                  <i className="bi bi-inboxes" />
                  <p>
                    No hay recomendaciones disponibles
                    para este cliente.
                  </p>
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}
