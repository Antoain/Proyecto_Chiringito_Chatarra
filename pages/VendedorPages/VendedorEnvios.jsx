import React, {
  useEffect,
  useMemo,
  useState
} from "react";

import {
  obtenerTiendasPorVendedor,
  obtenerDepartamentos,
  obtenerProvincias,
  obtenerDistritos,

  obtenerMisCoberturas,
  crearCobertura,
  actualizarCobertura,
  eliminarCobertura,

  obtenerMisMetodosEntrega,
  crearMetodoEntrega,
  actualizarMetodoEntrega,
  eliminarMetodoEntrega
} from "../../services/data";

import "./VendedorPagesCss/VendedorEnvios.css";


const TIPOS_METODO = [
  {
    tipo: "TIENDA",
    titulo: "Entrega de la tienda",
    descripcion:
      "La tienda se encarga directamente de entregar el pedido.",
    icono: "bi bi-truck"
  },
  {
    tipo: "ALIADO",
    titulo: "Entrega con aliado",
    descripcion:
      "El pedido será entregado mediante un proveedor o aliado logístico.",
    icono: "bi bi-box-arrow-up-right"
  },
  {
    tipo: "RECOGER_TIENDA",
    titulo: "Recoger en tienda",
    descripcion:
      "El cliente podrá recoger personalmente su pedido en la tienda.",
    icono: "bi bi-shop"
  }
];


export default function VendedorEnvios() {

  const idVendedor =
    localStorage.getItem("idVendedor") || "";

  // ==========================================
  // DATOS GENERALES
  // ==========================================

  const [tiendas, setTiendas] =
    useState([]);

  const [tiendaSeleccionada, setTiendaSeleccionada] =
    useState("");

  const [coberturas, setCoberturas] =
    useState([]);

  const [metodos, setMetodos] =
    useState([]);

  const [cargando, setCargando] =
    useState(true);

  const [error, setError] =
    useState("");

  const [mensaje, setMensaje] =
    useState("");


  // ==========================================
  // LOCALIZACIÓN
  // ==========================================

  const [departamentos, setDepartamentos] =
    useState([]);

  const [provincias, setProvincias] =
    useState([]);

  const [distritos, setDistritos] =
    useState([]);

  const [idDepartamento, setIdDepartamento] =
    useState("");

  const [idProvincia, setIdProvincia] =
    useState("");

  const [idDistrito, setIdDistrito] =
    useState("");


  // ==========================================
  // MODAL COBERTURA
  // ==========================================

  const [modalCobertura, setModalCobertura] =
    useState(false);

  const [modoEdicion, setModoEdicion] =
    useState(false);

  const [coberturaEditando, setCoberturaEditando] =
    useState(null);

  const [costoEnvio, setCostoEnvio] =
    useState("");

  const [guardandoCobertura, setGuardandoCobertura] =
    useState(false);


  // ==========================================
  // PAGINACIÓN
  // ==========================================

  const [paginaCoberturas, setPaginaCoberturas] =
    useState(1);

  const registrosPorPagina = 10;


  // ==========================================
  // CARGAR INFORMACIÓN
  // ==========================================

  const cargarDatos = async () => {

    if (!idVendedor) {

      setError(
        "No se encontró el vendedor activo."
      );

      setCargando(false);

      return;
    }

    try {

      setCargando(true);
      setError("");

      const [
        tiendasData,
        coberturasData,
        metodosData,
        departamentosData
      ] = await Promise.all([
        obtenerTiendasPorVendedor(
          idVendedor
        ),

        obtenerMisCoberturas(),

        obtenerMisMetodosEntrega(),

        obtenerDepartamentos()
      ]);


      const listaTiendas =
        Array.isArray(tiendasData)
          ? tiendasData
          : [];

      setTiendas(listaTiendas);

      setCoberturas(
        Array.isArray(coberturasData)
          ? coberturasData
          : []
      );

      setMetodos(
        Array.isArray(metodosData)
          ? metodosData
          : []
      );

      setDepartamentos(
        Array.isArray(departamentosData)
          ? departamentosData
          : []
      );


      if (
        listaTiendas.length > 0 &&
        !tiendaSeleccionada
      ) {

        setTiendaSeleccionada(
          String(
            listaTiendas[0].idTienda
          )
        );
      }

    } catch (err) {

      console.error(
        "Error cargando configuración de envíos:",
        err
      );

      setError(
        err.message ||
        "No se pudo cargar la configuración de envíos."
      );

    } finally {

      setCargando(false);
    }
  };


  useEffect(() => {

    cargarDatos();

  }, [idVendedor]);


  // ==========================================
  // COBERTURAS DE LA TIENDA
  // ==========================================

  const coberturasTienda =
    useMemo(() => {

      return coberturas.filter(
        cobertura =>
          Number(
            cobertura.idTienda
          ) ===
          Number(
            tiendaSeleccionada
          )
      );

    }, [
      coberturas,
      tiendaSeleccionada
    ]);


  // ==========================================
  // MÉTODOS DE LA TIENDA
  // ==========================================

  const metodosTienda =
    useMemo(() => {

      return metodos.filter(
        metodo =>
          Number(
            metodo.idTienda
          ) ===
          Number(
            tiendaSeleccionada
          )
      );

    }, [
      metodos,
      tiendaSeleccionada
    ]);


  // ==========================================
  // PAGINACIÓN COBERTURAS
  // ==========================================

  const totalPaginasCoberturas =
    Math.ceil(
      coberturasTienda.length /
      registrosPorPagina
    );

  const inicioCoberturas =
    (paginaCoberturas - 1) *
    registrosPorPagina;

  const finCoberturas =
    inicioCoberturas +
    registrosPorPagina;

  const coberturasPaginadas =
    coberturasTienda.slice(
      inicioCoberturas,
      finCoberturas
    );


  useEffect(() => {

    setPaginaCoberturas(1);

  }, [tiendaSeleccionada]);


  // ==========================================
  // TIENDA ACTUAL
  // ==========================================

  const tiendaActual =
    tiendas.find(
      tienda =>
        Number(tienda.idTienda) ===
        Number(tiendaSeleccionada)
    );


  // ==========================================
  // DEPARTAMENTO
  // ==========================================

  const cambiarDepartamento =
    async valor => {

      setIdDepartamento(valor);

      setIdProvincia("");
      setIdDistrito("");

      setProvincias([]);
      setDistritos([]);

      if (!valor) {
        return;
      }

      try {

        const data =
          await obtenerProvincias(
            valor
          );

        setProvincias(
          Array.isArray(data)
            ? data
            : []
        );

      } catch (err) {

        console.error(err);

        setError(
          "No se pudieron cargar los municipios."
        );
      }
    };


  // ==========================================
  // PROVINCIA / MUNICIPIO
  // ==========================================

  const cambiarProvincia =
    async valor => {

      setIdProvincia(valor);

      setIdDistrito("");

      setDistritos([]);

      if (!valor) {
        return;
      }

      try {

        const data =
          await obtenerDistritos(
            valor
          );

        setDistritos(
          Array.isArray(data)
            ? data
            : []
        );

      } catch (err) {

        console.error(err);

        setError(
          "No se pudieron cargar los distritos."
        );
      }
    };


  // ==========================================
  // ABRIR NUEVA COBERTURA
  // ==========================================

  const abrirNuevaCobertura = () => {

    if (!tiendaSeleccionada) {

      setError(
        "Selecciona una tienda primero."
      );

      return;
    }

    setModoEdicion(false);

    setCoberturaEditando(null);

    setIdDepartamento("");
    setIdProvincia("");
    setIdDistrito("");

    setProvincias([]);
    setDistritos([]);

    setCostoEnvio("");

    setError("");

    setModalCobertura(true);
  };


  // ==========================================
  // ABRIR EDITAR COBERTURA
  // ==========================================

  const abrirEditarCobertura =
    cobertura => {

      setModoEdicion(true);

      setCoberturaEditando(
        cobertura
      );

      setCostoEnvio(
        cobertura.costoEnvio
      );

      setError("");

      setModalCobertura(true);
    };


  // ==========================================
  // CERRAR MODAL
  // ==========================================

  const cerrarModalCobertura = () => {

    if (guardandoCobertura) {
      return;
    }

    setModalCobertura(false);

    setCoberturaEditando(null);

    setModoEdicion(false);

    setCostoEnvio("");

    setIdDepartamento("");
    setIdProvincia("");
    setIdDistrito("");

    setProvincias([]);
    setDistritos([]);
  };


  // ==========================================
  // GUARDAR COBERTURA
  // ==========================================

  const guardarCobertura =
    async e => {

      e.preventDefault();

      const costo =
        Number(costoEnvio);


      if (
        costoEnvio === "" ||
        costo < 0
      ) {

        setError(
          "Ingresa un costo de envío válido."
        );

        return;
      }


      if (
        !modoEdicion &&
        !idDistrito
      ) {

        setError(
          "Selecciona un distrito."
        );

        return;
      }


      try {

        setGuardandoCobertura(true);

        setError("");
        setMensaje("");


        if (
          modoEdicion &&
          coberturaEditando
        ) {

          await actualizarCobertura(
            coberturaEditando.idCobertura,
            {
              costoEnvio: costo,
              activo:
                coberturaEditando.activo
            }
          );

          setMensaje(
            "Cobertura actualizada correctamente."
          );

        } else {

          await crearCobertura({
            idTienda:
              tiendaSeleccionada,

            idDistrito,

            costoEnvio:
              costo
          });

          setMensaje(
            "Cobertura creada correctamente."
          );
        }


        const data =
          await obtenerMisCoberturas();

        setCoberturas(
          Array.isArray(data)
            ? data
            : []
        );

        setModalCobertura(false);

        setCoberturaEditando(null);

        setCostoEnvio("");

        setIdDepartamento("");
        setIdProvincia("");
        setIdDistrito("");

        setProvincias([]);
        setDistritos([]);


        setTimeout(
          () => setMensaje(""),
          3000
        );

      } catch (err) {

        console.error(
          "Error guardando cobertura:",
          err
        );

        setError(
          err.message ||
          "No se pudo guardar la cobertura."
        );

      } finally {

        setGuardandoCobertura(false);
      }
    };


  // ==========================================
  // ACTIVAR / DESACTIVAR COBERTURA
  // ==========================================

  const cambiarEstadoCobertura =
    async cobertura => {

      try {

        setError("");
        setMensaje("");

        const nuevoEstado =
          !cobertura.activo;

        await actualizarCobertura(
          cobertura.idCobertura,
          {
            costoEnvio:
              cobertura.costoEnvio,

            activo:
              nuevoEstado
          }
        );


        setCoberturas(prev =>
          prev.map(item =>
            item.idCobertura ===
            cobertura.idCobertura
              ? {
                  ...item,
                  activo:
                    nuevoEstado
                }
              : item
          )
        );


        setMensaje(
          nuevoEstado
            ? "Cobertura activada correctamente."
            : "Cobertura desactivada correctamente."
        );


        setTimeout(
          () => setMensaje(""),
          3000
        );

      } catch (err) {

        console.error(err);

        setError(
          err.message ||
          "No se pudo actualizar la cobertura."
        );
      }
    };


  // ==========================================
  // ELIMINAR COBERTURA
  // ==========================================

  const manejarEliminarCobertura =
    async cobertura => {

      const confirmar =
        window.confirm(
          `¿Eliminar la cobertura de ${cobertura.distrito}?`
        );

      if (!confirmar) {
        return;
      }

      try {

        setError("");

        await eliminarCobertura(
          cobertura.idCobertura
        );

        setCoberturas(prev =>
          prev.filter(
            item =>
              item.idCobertura !==
              cobertura.idCobertura
          )
        );

        setMensaje(
          "Cobertura eliminada correctamente."
        );

        setTimeout(
          () => setMensaje(""),
          3000
        );

      } catch (err) {

        console.error(err);

        setError(
          err.message ||
          "No se pudo eliminar la cobertura."
        );
      }
    };


  // ==========================================
  // OBTENER MÉTODO
  // ==========================================

  const obtenerMetodo =
    tipoMetodo => {

      return metodosTienda.find(
        metodo =>
          metodo.tipoMetodo ===
          tipoMetodo
      );
    };


  // ==========================================
  // CREAR MÉTODO
  // ==========================================

  const manejarCrearMetodo =
    async tipoMetodo => {

      if (!tiendaSeleccionada) {

        setError(
          "Selecciona una tienda."
        );

        return;
      }

      try {

        setError("");
        setMensaje("");

        await crearMetodoEntrega({
          idTienda:
            tiendaSeleccionada,

          tipoMetodo
        });

        const data =
          await obtenerMisMetodosEntrega();

        setMetodos(
          Array.isArray(data)
            ? data
            : []
        );

        setMensaje(
          "Método de entrega agregado correctamente."
        );

        setTimeout(
          () => setMensaje(""),
          3000
        );

      } catch (err) {

        console.error(err);

        setError(
          err.message ||
          "No se pudo agregar el método de entrega."
        );
      }
    };


  // ==========================================
  // ACTIVAR / DESACTIVAR MÉTODO
  // ==========================================

  const cambiarEstadoMetodo =
    async metodo => {

      try {

        setError("");
        setMensaje("");

        const nuevoEstado =
          !metodo.activo;

        await actualizarMetodoEntrega(
          metodo.idMetodoEntrega,
          nuevoEstado
        );


        setMetodos(prev =>
          prev.map(item =>
            item.idMetodoEntrega ===
            metodo.idMetodoEntrega
              ? {
                  ...item,
                  activo:
                    nuevoEstado
                }
              : item
          )
        );


        setMensaje(
          nuevoEstado
            ? "Método de entrega activado."
            : "Método de entrega desactivado."
        );

        setTimeout(
          () => setMensaje(""),
          3000
        );

      } catch (err) {

        console.error(err);

        setError(
          err.message ||
          "No se pudo actualizar el método."
        );
      }
    };


  // ==========================================
  // ELIMINAR MÉTODO
  // ==========================================

  const manejarEliminarMetodo =
    async metodo => {

      const confirmar =
        window.confirm(
          "¿Eliminar este método de entrega?"
        );

      if (!confirmar) {
        return;
      }


      try {

        setError("");

        await eliminarMetodoEntrega(
          metodo.idMetodoEntrega
        );

        setMetodos(prev =>
          prev.filter(
            item =>
              item.idMetodoEntrega !==
              metodo.idMetodoEntrega
          )
        );

        setMensaje(
          "Método de entrega eliminado."
        );

        setTimeout(
          () => setMensaje(""),
          3000
        );

      } catch (err) {

        console.error(err);

        setError(
          err.message ||
          "No se pudo eliminar el método."
        );
      }
    };


  // ==========================================
  // LOADING
  // ==========================================

  if (cargando) {

    return (

      <div className="envios-page">

        <div className="envios-loading">

          <div className="spinner-border" />

          <p>
            Cargando configuración de envíos...
          </p>

        </div>

      </div>
    );
  }


  return (

    <div className="envios-page">

      <div className="envios-container">


        {/* ====================================== */}
        {/* HEADER */}
        {/* ====================================== */}

        <div className="envios-header">

          <div>

            <span className="envios-eyebrow">
              LOGÍSTICA
            </span>

            <h1>
              Configuración de envíos
            </h1>

            <p>
              Configura las zonas de cobertura,
              costos y métodos de entrega de cada
              tienda.
            </p>

          </div>

        </div>


        {/* ====================================== */}
        {/* ALERTAS */}
        {/* ====================================== */}

        {error && !modalCobertura && (

          <div className="envios-alert error">

            <i className="bi bi-exclamation-circle"></i>

            {error}

          </div>
        )}


        {mensaje && (

          <div className="envios-alert success">

            <i className="bi bi-check-circle"></i>

            {mensaje}

          </div>
        )}


        {/* ====================================== */}
        {/* SIN TIENDAS */}
        {/* ====================================== */}

        {tiendas.length === 0 ? (

          <div className="envios-empty-global">

            <i className="bi bi-shop"></i>

            <h2>
              Primero necesitas una tienda
            </h2>

            <p>
              Crea una tienda antes de configurar
              coberturas y métodos de entrega.
            </p>

          </div>

        ) : (

          <>


            {/* ====================================== */}
            {/* SELECTOR TIENDA */}
            {/* ====================================== */}

            <section className="envios-store-card">

              <div className="envios-store-info">

                <div className="envios-store-icon">

                  <i className="bi bi-shop-window"></i>

                </div>


                <div>

                  <span>
                    TIENDA SELECCIONADA
                  </span>

                  <strong>
                    {
                      tiendaActual
                        ?.nombreNegocio ||
                      "Selecciona una tienda"
                    }
                  </strong>

                </div>

              </div>


              <select
                value={tiendaSeleccionada}
                onChange={e =>
                  setTiendaSeleccionada(
                    e.target.value
                  )
                }
              >

                {tiendas.map(
                  tienda => (

                    <option
                      key={tienda.idTienda}
                      value={tienda.idTienda}
                    >
                      {tienda.nombreNegocio}
                    </option>

                  )
                )}

              </select>

            </section>


            {/* ====================================== */}
            {/* RESUMEN */}
            {/* ====================================== */}

            <div className="envios-summary">


              <div className="envios-summary-card">

                <span>
                  Coberturas
                </span>

                <strong>
                  {coberturasTienda.length}
                </strong>

                <i className="bi bi-geo-alt"></i>

              </div>


              <div className="envios-summary-card">

                <span>
                  Coberturas activas
                </span>

                <strong>
                  {
                    coberturasTienda.filter(
                      item => item.activo
                    ).length
                  }
                </strong>

                <i className="bi bi-pin-map"></i>

              </div>


              <div className="envios-summary-card">

                <span>
                  Métodos configurados
                </span>

                <strong>
                  {metodosTienda.length}
                </strong>

                <i className="bi bi-truck"></i>

              </div>


              <div className="envios-summary-card">

                <span>
                  Métodos activos
                </span>

                <strong>
                  {
                    metodosTienda.filter(
                      item => item.activo
                    ).length
                  }
                </strong>

                <i className="bi bi-check2-circle"></i>

              </div>


            </div>


            {/* ====================================== */}
            {/* COBERTURAS */}
            {/* ====================================== */}

            <section className="envios-card">

              <div className="envios-card-header">

                <div>

                  <span className="envios-card-eyebrow">
                    ZONAS DE ENTREGA
                  </span>

                  <h2>
                    Coberturas
                  </h2>

                  <p>
                    Define los distritos a los que
                    puede realizar entregas esta tienda.
                  </p>

                </div>


                <button
                  type="button"
                  className="envios-btn-primary"
                  onClick={
                    abrirNuevaCobertura
                  }
                >

                  <i className="bi bi-plus-lg"></i>

                  Nueva cobertura

                </button>

              </div>


              {coberturasTienda.length === 0 ? (

                <div className="envios-empty">

                  <i className="bi bi-geo-alt"></i>

                  <h3>
                    Sin coberturas configuradas
                  </h3>

                  <p>
                    Agrega una zona para comenzar
                    a realizar entregas.
                  </p>

                </div>

              ) : (

                <div className="table-responsive">

                  <table className="envios-table">

                    <thead>

                      <tr>
                        <th>Distrito</th>
                        <th>Costo</th>
                        <th>Estado</th>
                        <th>Registro</th>
                        <th>Acciones</th>
                      </tr>

                    </thead>


                    <tbody>

                      {coberturasPaginadas.map(
                        cobertura => (

                          <tr
                            key={
                              cobertura.idCobertura
                            }
                          >

                            <td>

                              <div className="envios-location">

                                <i className="bi bi-geo-alt-fill"></i>

                                <div>

                                  <strong>
                                    {
                                      cobertura.distrito
                                    }
                                  </strong>

                                  <small>
                                    {
                                      cobertura.tienda
                                    }
                                  </small>

                                </div>

                              </div>

                            </td>


                            <td>

                              <strong className="envios-price">
                                $
                                {
                                  Number(
                                    cobertura.costoEnvio
                                  ).toFixed(2)
                                }
                              </strong>

                            </td>


                            <td>

                              <span
                                className={
                                  cobertura.activo
                                    ? "envios-status active"
                                    : "envios-status inactive"
                                }
                              >

                                {
                                  cobertura.activo
                                    ? "Activa"
                                    : "Inactiva"
                                }

                              </span>

                            </td>


                            <td>

                              {
                                cobertura.fechaRegistro
                                  ? new Date(
                                      cobertura.fechaRegistro
                                    ).toLocaleDateString(
                                      "es-SV"
                                    )
                                  : "Sin fecha"
                              }

                            </td>


                            <td>

                              <div className="envios-actions">


                                <button
                                  type="button"
                                  className="envios-action edit"
                                  onClick={() =>
                                    abrirEditarCobertura(
                                      cobertura
                                    )
                                  }
                                  title="Editar"
                                >

                                  <i className="bi bi-pencil"></i>

                                </button>


                                <button
                                  type="button"
                                  className={
                                    cobertura.activo
                                      ? "envios-action disable"
                                      : "envios-action enable"
                                  }
                                  onClick={() =>
                                    cambiarEstadoCobertura(
                                      cobertura
                                    )
                                  }
                                  title={
                                    cobertura.activo
                                      ? "Desactivar"
                                      : "Activar"
                                  }
                                >

                                  <i
                                    className={
                                      cobertura.activo
                                        ? "bi bi-pause-circle"
                                        : "bi bi-play-circle"
                                    }
                                  ></i>

                                </button>


                                <button
                                  type="button"
                                  className="envios-action delete"
                                  onClick={() =>
                                    manejarEliminarCobertura(
                                      cobertura
                                    )
                                  }
                                  title="Eliminar"
                                >

                                  <i className="bi bi-trash"></i>

                                </button>


                              </div>

                            </td>

                          </tr>
                        )
                      )}

                    </tbody>

                  </table>


                  {coberturasTienda.length > 0 && (

                    <div className="envios-pagination">

                      <span>

                        Mostrando{" "}

                        <strong>
                          {inicioCoberturas + 1}
                        </strong>

                        {" - "}

                        <strong>
                          {
                            Math.min(
                              finCoberturas,
                              coberturasTienda.length
                            )
                          }
                        </strong>

                        {" de "}

                        <strong>
                          {coberturasTienda.length}
                        </strong>

                      </span>


                      <div className="envios-pagination-controls">

                        <button
                          type="button"
                          disabled={
                            paginaCoberturas === 1
                          }
                          onClick={() =>
                            setPaginaCoberturas(
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
                            {paginaCoberturas}
                          </strong>

                          {" de "}

                          <strong>
                            {
                              totalPaginasCoberturas ||
                              1
                            }
                          </strong>

                        </span>


                        <button
                          type="button"
                          disabled={
                            paginaCoberturas >=
                            totalPaginasCoberturas
                          }
                          onClick={() =>
                            setPaginaCoberturas(
                              pagina =>
                                Math.min(
                                  pagina + 1,
                                  totalPaginasCoberturas
                                )
                            )
                          }
                        >

                          <i className="bi bi-chevron-right"></i>

                        </button>

                      </div>

                    </div>
                  )}

                </div>
              )}

            </section>


            {/* ====================================== */}
            {/* MÉTODOS DE ENTREGA */}
            {/* ====================================== */}

            <section className="envios-card">

              <div className="envios-card-header">

                <div>

                  <span className="envios-card-eyebrow">
                    LOGÍSTICA
                  </span>

                  <h2>
                    Métodos de entrega
                  </h2>

                  <p>
                    Selecciona cómo pueden recibir
                    sus pedidos los clientes.
                  </p>

                </div>

              </div>


              <div className="envios-method-grid">

                {TIPOS_METODO.map(
                  tipo => {

                    const metodo =
                      obtenerMetodo(
                        tipo.tipo
                      );

                    return (

                      <article
                        key={tipo.tipo}
                        className={
                          metodo?.activo
                            ? "envios-method active"
                            : "envios-method"
                        }
                      >


                        <div className="envios-method-top">

                          <div className="envios-method-icon">

                            <i
                              className={
                                tipo.icono
                              }
                            ></i>

                          </div>


                          {metodo && (

                            <span
                              className={
                                metodo.activo
                                  ? "envios-status active"
                                  : "envios-status inactive"
                              }
                            >

                              {
                                metodo.activo
                                  ? "Activo"
                                  : "Inactivo"
                              }

                            </span>

                          )}

                        </div>


                        <h3>
                          {tipo.titulo}
                        </h3>

                        <p>
                          {tipo.descripcion}
                        </p>


                        {!metodo ? (

                          <button
                            type="button"
                            className="envios-method-add"
                            onClick={() =>
                              manejarCrearMetodo(
                                tipo.tipo
                              )
                            }
                          >

                            <i className="bi bi-plus-lg"></i>

                            Configurar

                          </button>

                        ) : (

                          <div className="envios-method-actions">


                            <button
                              type="button"
                              className={
                                metodo.activo
                                  ? "envios-method-toggle disable"
                                  : "envios-method-toggle enable"
                              }
                              onClick={() =>
                                cambiarEstadoMetodo(
                                  metodo
                                )
                              }
                            >

                              <i
                                className={
                                  metodo.activo
                                    ? "bi bi-pause-circle"
                                    : "bi bi-play-circle"
                                }
                              ></i>

                              {
                                metodo.activo
                                  ? "Desactivar"
                                  : "Activar"
                              }

                            </button>


                            <button
                              type="button"
                              className="envios-method-delete"
                              onClick={() =>
                                manejarEliminarMetodo(
                                  metodo
                                )
                              }
                              title="Eliminar método"
                            >

                              <i className="bi bi-trash"></i>

                            </button>


                          </div>

                        )}

                      </article>
                    );
                  }
                )}

              </div>

            </section>


          </>
        )}


      </div>


      {/* ====================================== */}
      {/* MODAL COBERTURA */}
      {/* ====================================== */}

      {modalCobertura && (

        <div className="envios-modal-backdrop">

          <div className="envios-modal">


            <div className="envios-modal-header">

              <div>

                <span>
                  {
                    modoEdicion
                      ? "EDITAR COBERTURA"
                      : "NUEVA COBERTURA"
                  }
                </span>

                <h2>

                  {
                    modoEdicion
                      ? coberturaEditando
                          ?.distrito
                      : tiendaActual
                          ?.nombreNegocio
                  }

                </h2>

              </div>


              <button
                type="button"
                onClick={
                  cerrarModalCobertura
                }
                disabled={
                  guardandoCobertura
                }
              >

                <i className="bi bi-x-lg"></i>

              </button>

            </div>


            <form
              onSubmit={
                guardarCobertura
              }
            >


              {error && (

                <div className="envios-modal-error">

                  <i className="bi bi-exclamation-circle"></i>

                  {error}

                </div>

              )}


              {!modoEdicion && (

                <>


                  <div className="envios-field">

                    <label>
                      Departamento
                    </label>

                    <select
                      value={
                        idDepartamento
                      }
                      required
                      onChange={e =>
                        cambiarDepartamento(
                          e.target.value
                        )
                      }
                    >

                      <option value="">
                        Selecciona un departamento
                      </option>


                      {departamentos.map(
                        departamento => (

                          <option
                            key={
                              departamento.idDepartamento
                            }
                            value={
                              departamento.idDepartamento
                            }
                          >

                            {
                              departamento.descripcion
                            }

                          </option>

                        )
                      )}

                    </select>

                  </div>


                  <div className="envios-field">

                    <label>
                      Municipio
                    </label>

                    <select
                      value={
                        idProvincia
                      }
                      required
                      disabled={
                        !idDepartamento
                      }
                      onChange={e =>
                        cambiarProvincia(
                          e.target.value
                        )
                      }
                    >

                      <option value="">
                        Selecciona un municipio
                      </option>


                      {provincias.map(
                        provincia => (

                          <option
                            key={
                              provincia.idProvincia
                            }
                            value={
                              provincia.idProvincia
                            }
                          >

                            {
                              provincia.descripcion
                            }

                          </option>

                        )
                      )}

                    </select>

                  </div>


                  <div className="envios-field">

                    <label>
                      Distrito
                    </label>

                    <select
                      value={
                        idDistrito
                      }
                      required
                      disabled={
                        !idProvincia
                      }
                      onChange={e =>
                        setIdDistrito(
                          e.target.value
                        )
                      }
                    >

                      <option value="">
                        Selecciona un distrito
                      </option>


                      {distritos.map(
                        distrito => (

                          <option
                            key={
                              distrito.idDistrito
                            }
                            value={
                              distrito.idDistrito
                            }
                          >

                            {
                              distrito.descripcion
                            }

                          </option>

                        )
                      )}

                    </select>

                  </div>


                </>
              )}


              {modoEdicion && (

                <div className="envios-modal-location">

                  <i className="bi bi-geo-alt-fill"></i>

                  <div>

                    <span>
                      Distrito
                    </span>

                    <strong>
                      {
                        coberturaEditando
                          ?.distrito
                      }
                    </strong>

                  </div>

                </div>

              )}


              <div className="envios-field">

                <label>
                  Costo de envío ($)
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={costoEnvio}
                  onChange={e =>
                    setCostoEnvio(
                      e.target.value
                    )
                  }
                  placeholder="Ej. 3.50"
                />

              </div>


              <div className="envios-modal-actions">

                <button
                  type="button"
                  className="envios-btn-secondary"
                  onClick={
                    cerrarModalCobertura
                  }
                  disabled={
                    guardandoCobertura
                  }
                >

                  Cancelar

                </button>


                <button
                  type="submit"
                  className="envios-btn-primary"
                  disabled={
                    guardandoCobertura
                  }
                >

                  {
                    guardandoCobertura
                      ? "Guardando..."
                      : modoEdicion
                        ? "Guardar cambios"
                        : "Crear cobertura"
                  }

                </button>

              </div>


            </form>

          </div>

        </div>
      )}


    </div>
  );
}