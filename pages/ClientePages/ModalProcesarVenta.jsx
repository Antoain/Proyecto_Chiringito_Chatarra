
import React, {
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";

import {
  obtenerDepartamentos,
  obtenerProvincias,
  obtenerDistritos,
  obtenerMetodosEntregaPorTienda
} from "../../services/data";

import "./ClientePagesCss/ModalProcesarVenta.css";

// =====================================================
// HELPERS
// =====================================================

const nombresMetodos = {
  TIENDA: "Envío de la tienda",
  ALIADO: "Entrega con aliado",
  RECOGER_TIENDA: "Recoger en tienda"
};

const descripcionesMetodos = {
  TIENDA: "La tienda organiza el envío.",
  ALIADO: "La entrega se realiza con un aliado.",
  RECOGER_TIENDA: "Recibirás el pedido en la tienda."
};

const iconosMetodos = {
  TIENDA: "bi-truck",
  ALIADO: "bi-box-seam",
  RECOGER_TIENDA: "bi-shop"
};

const dinero = valor =>
  `$${Number(valor || 0).toFixed(2)}`;

const obtenerLista = data =>
  Array.isArray(data) ? data : [];

const ModalProcesarVenta = ({
  onClose,
  onConfirm,
  carrito = []
}) => {
  // =====================================================
  // UBICACIÓN
  // =====================================================

  const [departamentos, setDepartamentos] = useState([]);
  const [provincias, setProvincias] = useState([]);
  const [distritos, setDistritos] = useState([]);

  const [
    selectedDepartamento,
    setSelectedDepartamento
  ] = useState("");

  const [
    selectedProvincia,
    setSelectedProvincia
  ] = useState("");

  const [
    selectedDistrito,
    setSelectedDistrito
  ] = useState("");

  const [cargandoDepartamentos, setCargandoDepartamentos] =
    useState(true);

  const [cargandoProvincias, setCargandoProvincias] =
    useState(false);

  const [cargandoDistritos, setCargandoDistritos] =
    useState(false);

  // =====================================================
  // DATOS DEL CLIENTE
  // =====================================================

  const [direccion, setDireccion] = useState("");
  const [telefono, setTelefono] = useState("");
  const [metodoPago, setMetodoPago] = useState("EFECTIVO");

  // =====================================================
  // MÉTODOS DE ENTREGA
  // =====================================================

  const [
    metodosDisponibles,
    setMetodosDisponibles
  ] = useState({});

  const [
    metodosEntrega,
    setMetodosEntrega
  ] = useState({});

  const [
    cargandoMetodos,
    setCargandoMetodos
  ] = useState(true);

  const [errorMetodos, setErrorMetodos] = useState("");

  // =====================================================
  // ESTADO GENERAL
  // =====================================================

  const [error, setError] = useState("");
  const [procesando, setProcesando] = useState(false);

  const dialogoRef = useRef(null);
  const enviandoRef = useRef(false);

  // =====================================================
  // TIENDAS DEL CARRITO
  // =====================================================

  const tiendas = useMemo(() => {
    const mapa = new Map();

    carrito.forEach(item => {
      const producto = item?.idProductoNavigation;
      const idTienda = Number(producto?.idTienda);

      if (!Number.isInteger(idTienda) || idTienda <= 0) {
        return;
      }

      if (!mapa.has(idTienda)) {
        mapa.set(idTienda, {
          idTienda,
          nombre:
            producto?.idTiendaNavigation?.nombreNegocio ||
            `Tienda ${idTienda}`,
          productos: 0
        });
      }

      mapa.get(idTienda).productos++;
    });

    return Array.from(mapa.values());
  }, [carrito]);

  const resumenCarrito = useMemo(() => {
    let unidades = 0;
    let subtotal = 0;

    carrito.forEach(item => {
      const cantidad = Math.max(
        0,
        Number(item.cantidad || 0)
      );

      unidades += cantidad;

      // Precio referencial original.
      // El precio promocional definitivo lo calcula
      // nuevamente el backend durante el checkout.
      subtotal +=
        cantidad *
        Number(item?.idProductoNavigation?.precio || 0);
    });

    return {
      unidades,
      subtotal
    };
  }, [carrito]);

  // =====================================================
  // ACCESIBILIDAD DEL MODAL
  // =====================================================

  useEffect(() => {
    const overflowAnterior = document.body.style.overflow;
    const elementoAnterior = document.activeElement;

    document.body.style.overflow = "hidden";

    dialogoRef.current?.focus();

    return () => {
      document.body.style.overflow = overflowAnterior;
      elementoAnterior?.focus?.();
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = evento => {
      if (evento.key === "Escape" && !enviandoRef.current) {
        onClose();
      }

      if (evento.key === "Tab" && dialogoRef.current) {
        const elementos = Array.from(
          dialogoRef.current.querySelectorAll(
            'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href]'
          )
        );

        if (elementos.length === 0) return;

        const primero = elementos[0];
        const ultimo = elementos[elementos.length - 1];

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

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  // =====================================================
  // CARGAR DEPARTAMENTOS
  // =====================================================

  useEffect(() => {
    let activo = true;

    const cargar = async () => {
      setCargandoDepartamentos(true);

      try {
        const data = await obtenerDepartamentos();

        if (activo) {
          setDepartamentos(obtenerLista(data));
        }
      } catch (err) {
        if (activo) {
          setError(
            err.message ||
            "No se pudieron cargar los departamentos."
          );
        }
      } finally {
        if (activo) {
          setCargandoDepartamentos(false);
        }
      }
    };

    cargar();

    return () => {
      activo = false;
    };
  }, []);

  // =====================================================
  // CARGAR PROVINCIAS
  // =====================================================

  useEffect(() => {
    let activo = true;

    setProvincias([]);
    setDistritos([]);

    if (!selectedDepartamento) {
      setCargandoProvincias(false);
      return;
    }

    const cargar = async () => {
      setCargandoProvincias(true);

      try {
        const data = await obtenerProvincias(
          selectedDepartamento
        );

        if (activo) {
          setProvincias(obtenerLista(data));
        }
      } catch (err) {
        if (activo) {
          setError(
            err.message ||
            "No se pudieron cargar las provincias."
          );
        }
      } finally {
        if (activo) setCargandoProvincias(false);
      }
    };

    cargar();

    return () => {
      activo = false;
    };
  }, [selectedDepartamento]);

  // =====================================================
  // CARGAR DISTRITOS
  // =====================================================

  useEffect(() => {
    let activo = true;

    setDistritos([]);

    if (!selectedProvincia) {
      setCargandoDistritos(false);
      return;
    }

    const cargar = async () => {
      setCargandoDistritos(true);

      try {
        const data = await obtenerDistritos(
          selectedProvincia
        );

        if (activo) {
          setDistritos(obtenerLista(data));
        }
      } catch (err) {
        if (activo) {
          setError(
            err.message ||
            "No se pudieron cargar los distritos."
          );
        }
      } finally {
        if (activo) setCargandoDistritos(false);
      }
    };

    cargar();

    return () => {
      activo = false;
    };
  }, [selectedProvincia]);

  // =====================================================
  // CARGAR MÉTODOS DE ENTREGA POR TIENDA
  // =====================================================

  useEffect(() => {
    let activo = true;

    const cargar = async () => {
      if (tiendas.length === 0) {
        setCargandoMetodos(false);
        setErrorMetodos(
          "No se encontraron tiendas en el carrito."
        );
        return;
      }

      setCargandoMetodos(true);
      setErrorMetodos("");

      const resultados = await Promise.all(
        tiendas.map(async tienda => {
          try {
            const data =
              await obtenerMetodosEntregaPorTienda(
                tienda.idTienda
              );

            return {
              idTienda: tienda.idTienda,
              metodos: obtenerLista(data),
              error: false
            };
          } catch (err) {
            console.error(
              `Error en métodos de tienda ${tienda.idTienda}:`,
              err
            );

            return {
              idTienda: tienda.idTienda,
              metodos: [],
              error: true
            };
          }
        })
      );

      if (!activo) return;

      const mapa = {};
      const seleccionInicial = {};

      resultados.forEach(resultado => {
        mapa[resultado.idTienda] = resultado.metodos;

        if (resultado.metodos.length === 1) {
          seleccionInicial[resultado.idTienda] =
            resultado.metodos[0].tipoMetodo;
        }
      });

      setMetodosDisponibles(mapa);
      setMetodosEntrega(seleccionInicial);

      const huboError = resultados.some(r => r.error);
      const hayTiendasSinMetodos = resultados.some(
        r => r.metodos.length === 0
      );

      if (huboError) {
        setErrorMetodos(
          "No se pudieron consultar todas las opciones de entrega. Cierra y vuelve a abrir el checkout para reintentar."
        );
      } else if (hayTiendasSinMetodos) {
        setErrorMetodos(
          "Una o más tiendas no tienen métodos de entrega activos."
        );
      }

      setCargandoMetodos(false);
    };

    cargar();

    return () => {
      activo = false;
    };
  }, [tiendas]);

  // =====================================================
  // CAMBIOS DEL FORMULARIO
  // =====================================================

  const cambiarDepartamento = valor => {
    setSelectedDepartamento(valor);
    setSelectedProvincia("");
    setSelectedDistrito("");
    setProvincias([]);
    setDistritos([]);
    setError("");
  };

  const cambiarProvincia = valor => {
    setSelectedProvincia(valor);
    setSelectedDistrito("");
    setDistritos([]);
    setError("");
  };

  const cambiarMetodoEntrega = (idTienda, tipoMetodo) => {
    setMetodosEntrega(prev => ({
      ...prev,
      [idTienda]: tipoMetodo
    }));

    setError("");
  };

  // =====================================================
  // VALIDACIONES
  // =====================================================

  const validarFormulario = () => {
    if (!selectedDepartamento) {
      return "Selecciona un departamento.";
    }

    if (!selectedProvincia) {
      return "Selecciona una provincia.";
    }

    if (!selectedDistrito) {
      return "Selecciona un distrito.";
    }

    if (direccion.trim().length < 5) {
      return "La dirección debe tener al menos 5 caracteres.";
    }

    const telefonoLimpio = telefono.replace(
      /[\s()-]/g,
      ""
    );

    if (!/^\d{8}$/.test(telefonoLimpio)) {
      return "Introduce un teléfono válido de 8 dígitos.";
    }

    if (!["EFECTIVO", "TRANSFERENCIA"].includes(
      metodoPago
    )) {
      return "Selecciona un método de pago válido.";
    }

    if (tiendas.length === 0) {
      return "No hay tiendas disponibles para procesar.";
    }

    for (const tienda of tiendas) {
      const disponibles =
        metodosDisponibles[tienda.idTienda] || [];

      const seleccionado =
        metodosEntrega[tienda.idTienda];

      if (!seleccionado) {
        return `Selecciona un método de entrega para ${tienda.nombre}.`;
      }

      const permitido = disponibles.some(
        metodo =>
          metodo.tipoMetodo === seleccionado
      );

      if (!permitido) {
        return `El método seleccionado para ${tienda.nombre} ya no está disponible.`;
      }
    }

    return "";
  };

  // =====================================================
  // CONFIRMAR COMPRA
  // =====================================================

  const handleConfirm = async evento => {
    evento.preventDefault();

    if (enviandoRef.current) return;

    setError("");

    if (cargandoMetodos) {
      setError(
        "Espera a que terminen de cargar las entregas."
      );
      return;
    }

    if (errorMetodos) {
      setError(errorMetodos);
      return;
    }

    const mensajeValidacion = validarFormulario();

    if (mensajeValidacion) {
      setError(mensajeValidacion);
      return;
    }

    const telefonoLimpio = telefono.replace(
      /[\s()-]/g,
      ""
    );

    const checkout = {
      idDistrito: Number(selectedDistrito),
      direccionEntrega: direccion.trim(),
      telefono: telefonoLimpio,
      metodoPago,
      metodosEntrega: tiendas.map(tienda => ({
        idTienda: tienda.idTienda,
        tipoMetodo:
          metodosEntrega[tienda.idTienda]
      }))
    };

    enviandoRef.current = true;
    setProcesando(true);

    try {
      // onConfirm es el checkout real del carrito.
      // El modal se cerrará desde el componente padre
      // cuando el backend confirme el pedido.
      await onConfirm(checkout);
    } catch (err) {
      setError(
        err?.message ||
        "No se pudo completar la compra."
      );
    } finally {
      enviandoRef.current = false;
      setProcesando(false);
    }
  };

  const metodosIncompletos = tiendas.some(tienda => {
    const opciones =
      metodosDisponibles[tienda.idTienda] || [];

    const seleccionado =
      metodosEntrega[tienda.idTienda];

    return (
      opciones.length === 0 ||
      !opciones.some(
        metodo => metodo.tipoMetodo === seleccionado
      )
    );
  });

  const bloqueado =
    procesando ||
    cargandoMetodos ||
    cargandoDepartamentos ||
    cargandoProvincias ||
    cargandoDistritos ||
    !!errorMetodos ||
    metodosIncompletos ||
    tiendas.length === 0;

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div
      className="cmv-overlay"
      onMouseDown={evento => {
        if (
          evento.target === evento.currentTarget &&
          !procesando
        ) {
          onClose();
        }
      }}
    >
      <div
        className="cmv-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cmv-titulo"
        tabIndex={-1}
        ref={dialogoRef}
      >
        {/* ENCABEZADO */}

        <div className="cmv-header">
          <div className="cmv-header-icon">
            <i className="bi bi-bag-check"></i>
          </div>

          <div className="cmv-header-text">
            <span>ÚLTIMO PASO</span>

            <h2 id="cmv-titulo">
              Finalizar compra
            </h2>

            <p>
              Completa los datos para confirmar
              tu pedido.
            </p>
          </div>

          <button
            type="button"
            className="cmv-close"
            onClick={onClose}
            disabled={procesando}
            aria-label="Cerrar ventana"
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        {/* CONTENIDO */}

        <form
          className="cmv-form"
          onSubmit={handleConfirm}
          noValidate
        >
          <div className="cmv-body">

            {error && (
              <div
                className="cmv-alert cmv-alert-error"
                role="alert"
              >
                <i className="bi bi-exclamation-triangle"></i>
                <span>{error}</span>

                <button
                  type="button"
                  onClick={() => setError("")}
                  aria-label="Cerrar error"
                >
                  <i className="bi bi-x"></i>
                </button>
              </div>
            )}

            {/* ======================================
                UBICACIÓN
            ====================================== */}

            <section className="cmv-section">
              <div className="cmv-section-heading">
                <span className="cmv-step">01</span>

                <div>
                  <h3>
                    <i className="bi bi-geo-alt"></i>
                    Ubicación de entrega
                  </h3>

                  <p>
                    Selecciona el departamento,
                    provincia y distrito.
                  </p>
                </div>
              </div>

              <div className="cmv-fields">
                <div className="cmv-field">
                  <label htmlFor="cmv-departamento">
                    Departamento *
                  </label>

                  <select
                    id="cmv-departamento"
                    value={selectedDepartamento}
                    disabled={
                      procesando ||
                      cargandoDepartamentos
                    }
                    onChange={e =>
                      cambiarDepartamento(e.target.value)
                    }
                  >
                    <option value="">
                      {cargandoDepartamentos
                        ? "Cargando departamentos..."
                        : "Selecciona un departamento"}
                    </option>

                    {departamentos.map(dep => (
                      <option
                        key={dep.idDepartamento}
                        value={dep.idDepartamento}
                      >
                        {dep.descripcion}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="cmv-field">
                  <label htmlFor="cmv-provincia">
                    Provincia *
                  </label>

                  <select
                    id="cmv-provincia"
                    value={selectedProvincia}
                    disabled={
                      procesando ||
                      !selectedDepartamento ||
                      cargandoProvincias
                    }
                    onChange={e =>
                      cambiarProvincia(e.target.value)
                    }
                  >
                    <option value="">
                      {cargandoProvincias
                        ? "Cargando provincias..."
                        : "Selecciona una provincia"}
                    </option>

                    {provincias.map(prov => (
                      <option
                        key={prov.idProvincia}
                        value={prov.idProvincia}
                      >
                        {prov.descripcion}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="cmv-field cmv-field-full">
                  <label htmlFor="cmv-distrito">
                    Distrito *
                  </label>

                  <select
                    id="cmv-distrito"
                    value={selectedDistrito}
                    disabled={
                      procesando ||
                      !selectedProvincia ||
                      cargandoDistritos
                    }
                    onChange={e => {
                      setSelectedDistrito(e.target.value);
                      setError("");
                    }}
                  >
                    <option value="">
                      {cargandoDistritos
                        ? "Cargando distritos..."
                        : "Selecciona un distrito"}
                    </option>

                    {distritos.map(dist => (
                      <option
                        key={dist.idDistrito}
                        value={dist.idDistrito}
                      >
                        {dist.descripcion}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            {/* ======================================
                DATOS DE CONTACTO
            ====================================== */}

            <section className="cmv-section">
              <div className="cmv-section-heading">
                <span className="cmv-step">02</span>

                <div>
                  <h3>
                    <i className="bi bi-house-door"></i>
                    Datos de contacto
                  </h3>

                  <p>
                    Información para identificar
                    y entregar tu pedido.
                  </p>
                </div>
              </div>

              <div className="cmv-fields">
                <div className="cmv-field cmv-field-full">
                  <label htmlFor="cmv-direccion">
                    Dirección de referencia *
                  </label>

                  <textarea
                    id="cmv-direccion"
                    value={direccion}
                    disabled={procesando}
                    onChange={e => {
                      setDireccion(e.target.value);
                      setError("");
                    }}
                    rows={3}
                    maxLength={250}
                    placeholder="Colonia, calle, número de casa o punto de referencia..."
                  />
                </div>

                <div className="cmv-field cmv-field-full">
                  <label htmlFor="cmv-telefono">
                    Teléfono de contacto *
                  </label>

                  <input
                    id="cmv-telefono"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    maxLength={15}
                    value={telefono}
                    disabled={procesando}
                    onChange={e => {
                      setTelefono(e.target.value);
                      setError("");
                    }}
                    placeholder="Ejemplo: 7000-0000"
                  />

                  <small>
                    Introduce un número de 8 dígitos.
                  </small>
                </div>
              </div>
            </section>

            {/* ======================================
                MÉTODOS DE ENTREGA
            ====================================== */}

            <section className="cmv-section">
              <div className="cmv-section-heading">
                <span className="cmv-step">03</span>

                <div>
                  <h3>
                    <i className="bi bi-truck"></i>
                    Método de entrega
                  </h3>

                  <p>
                    Cada tienda puede ofrecer
                    diferentes opciones.
                  </p>
                </div>
              </div>

              {cargandoMetodos && (
                <div className="cmv-loading">
                  <span className="spinner-border spinner-border-sm" />
                  Consultando entregas disponibles...
                </div>
              )}

              {errorMetodos && (
                <div
                  className="cmv-alert cmv-alert-warning"
                  role="alert"
                >
                  <i className="bi bi-exclamation-circle"></i>
                  <span>{errorMetodos}</span>
                </div>
              )}

              {!cargandoMetodos && (
                <div className="cmv-shops">
                  {tiendas.map(tienda => {
                    const opciones =
                      metodosDisponibles[tienda.idTienda] ||
                      [];

                    const seleccionado =
                      metodosEntrega[tienda.idTienda] || "";

                    return (
                      <div
                        className="cmv-shop"
                        key={tienda.idTienda}
                      >
                        <div className="cmv-shop-heading">
                          <div className="cmv-shop-icon">
                            <i className="bi bi-shop"></i>
                          </div>

                          <div>
                            <strong>{tienda.nombre}</strong>
                            <small>
                              {tienda.productos}{" "}
                              {tienda.productos === 1
                                ? "producto"
                                : "productos"}
                            </small>
                          </div>
                        </div>

                        {opciones.length === 0 ? (
                          <div className="cmv-shop-empty">
                            Esta tienda no tiene métodos
                            de entrega disponibles.
                          </div>
                        ) : (
                          <div className="cmv-methods">
                            {opciones.map(metodo => {
                              const tipo =
                                metodo.tipoMetodo;

                              const activo =
                                seleccionado === tipo;

                              return (
                                <label
                                  key={
                                    metodo.idMetodoEntrega ??
                                    tipo
                                  }
                                  className={
                                    `cmv-method ${activo
                                      ? "cmv-method-active"
                                      : ""}`
                                  }
                                >
                                  <input
                                    type="radio"
                                    name={
                                      `metodo-${tienda.idTienda}`
                                    }
                                    value={tipo}
                                    checked={activo}
                                    disabled={procesando}
                                    onChange={() =>
                                      cambiarMetodoEntrega(
                                        tienda.idTienda,
                                        tipo
                                      )
                                    }
                                  />

                                  <span className="cmv-method-icon">
                                    <i
                                      className={
                                        `bi ${iconosMetodos[tipo] ||
                                          "bi-box"}`
                                      }
                                    ></i>
                                  </span>

                                  <span className="cmv-method-info">
                                    <strong>
                                      {metodo.nombre ||
                                        nombresMetodos[tipo] ||
                                        tipo}
                                    </strong>

                                    <small>
                                      {descripcionesMetodos[tipo] ||
                                        "Método disponible para esta tienda."}
                                    </small>
                                  </span>

                                  <i
                                    className={
                                      `bi ${activo
                                        ? "bi-check-circle-fill"
                                        : "bi-circle"} cmv-method-check`
                                    }
                                  ></i>
                                </label>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* ======================================
                MÉTODO DE PAGO
            ====================================== */}

            <section className="cmv-section">
              <div className="cmv-section-heading">
                <span className="cmv-step">04</span>

                <div>
                  <h3>
                    <i className="bi bi-wallet2"></i>
                    Método de pago
                  </h3>

                  <p>
                    Selecciona cómo deseas pagar
                    tu pedido.
                  </p>
                </div>
              </div>

              <div className="cmv-payment-options">
                <label
                  className={
                    `cmv-payment ${metodoPago === "EFECTIVO"
                      ? "cmv-payment-active"
                      : ""}`
                  }
                >
                  <input
                    type="radio"
                    name="metodoPago"
                    value="EFECTIVO"
                    checked={metodoPago === "EFECTIVO"}
                    disabled={procesando}
                    onChange={() =>
                      setMetodoPago("EFECTIVO")
                    }
                  />

                  <i className="bi bi-cash-coin"></i>

                  <span>
                    <strong>Efectivo</strong>
                    <small>Pago en efectivo</small>
                  </span>
                </label>

                <label
                  className={
                    `cmv-payment ${metodoPago === "TRANSFERENCIA"
                      ? "cmv-payment-active"
                      : ""}`
                  }
                >
                  <input
                    type="radio"
                    name="metodoPago"
                    value="TRANSFERENCIA"
                    checked={metodoPago === "TRANSFERENCIA"}
                    disabled={procesando}
                    onChange={() =>
                      setMetodoPago("TRANSFERENCIA")
                    }
                  />

                  <i className="bi bi-bank"></i>

                  <span>
                    <strong>Transferencia</strong>
                    <small>Pago por transferencia</small>
                  </span>
                </label>
              </div>
            </section>

            {/* ======================================
                RESUMEN
            ====================================== */}

            <section className="cmv-summary">
              <div className="cmv-summary-title">
                <i className="bi bi-receipt"></i>
                <strong>Resumen del pedido</strong>
              </div>

              <div className="cmv-summary-row">
                <span>Productos</span>
                <strong>
                  {resumenCarrito.unidades}
                </strong>
              </div>

              <div className="cmv-summary-row">
                <span>Tiendas</span>
                <strong>{tiendas.length}</strong>
              </div>

              <div className="cmv-summary-row">
                <span>Subtotal sin descuentos</span>
                <strong>
                  {dinero(resumenCarrito.subtotal)}
                </strong>
              </div>

              <div className="cmv-summary-row">
                <span>Descuentos y envío</span>
                <span>Al confirmar</span>
              </div>

              <p className="cmv-summary-note">
                <i className="bi bi-info-circle"></i>
                Este es un resumen referencial.
                El servidor recalcula las promociones,
                existencias y costos de envío antes
                de registrar tu pedido.
              </p>
            </section>
          </div>

          {/* ======================================
              PIE DEL MODAL
          ====================================== */}

          <footer className="cmv-footer">
            <button
              type="button"
              className="cmv-cancel"
              onClick={onClose}
              disabled={procesando}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="cmv-submit"
              disabled={bloqueado}
            >
              {procesando ? (
                <>
                  <span className="spinner-border spinner-border-sm" />
                  Procesando pedido...
                </>
              ) : (
                <>
                  <i className="bi bi-lock"></i>
                  Confirmar compra
                  <i className="bi bi-arrow-right"></i>
                </>
              )}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
};

export default ModalProcesarVenta;
