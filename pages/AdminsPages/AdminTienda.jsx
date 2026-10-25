
import React, {
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";

import {
  obtenerTiendas,
  obtenerVendedores,
  obtenerUsuarios,
  obtenerCategorias,
  actualizarTienda,
  eliminarTienda
} from "../../services/data";

import "./AdminPagesCss/AdminTienda.css";

const POR_PAGINA = 8;

const FORMULARIO_VACIO = {
  nombreNegocio: "",
  registroNegocio: "",
  horario: "",
  fotoFachadaUrl: "",
  idCategoria: "",
  eslogan: "",
  numeroContacto: "",
  facebookUrl: "",
  paginaWebUrl: "",
  cuentaEnvio: false
};

const lista = valor =>
  Array.isArray(valor) ? valor : [];

const texto = valor =>
  String(valor ?? "");

const normalizar = valor =>
  texto(valor)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const nombreCompleto = usuario =>
  [usuario?.nombres, usuario?.apellidos]
    .filter(Boolean)
    .join(" ");

const fechaBonita = valor => {
  if (!valor) return "Sin fecha";

  const partes = texto(valor).slice(0, 10).split("-");

  if (partes.length !== 3) return texto(valor);

  return `${partes[2]}/${partes[1]}/${partes[0]}`;
};

const urlValida = valor => {
  if (!valor?.trim()) return true;

  try {
    const url = new URL(valor.trim());
    return ["http:", "https:"].includes(url.protocol);
  } catch {
    return false;
  }
};

function ImagenTienda({ tienda }) {
  const [fallo, setFallo] = useState(false);

  useEffect(() => {
    setFallo(false);
  }, [tienda.fotoFachadaUrl]);

  return (
    <div className="at-foto">
      {tienda.fotoFachadaUrl && !fallo ? (
        <img
          src={tienda.fotoFachadaUrl}
          alt={`Fachada de ${tienda.nombreNegocio}`}
          loading="lazy"
          onError={() => setFallo(true)}
        />
      ) : (
        <i className="bi bi-shop-window" />
      )}
    </div>
  );
}

function ResumenCard({
  icono,
  etiqueta,
  valor,
  tono = "azul"
}) {
  return (
    <article className="at-resumen-card">
      <span className={`at-resumen-icono ${tono}`}>
        <i className={`bi ${icono}`} />
      </span>

      <div>
        <span>{etiqueta}</span>
        <strong>{valor}</strong>
      </div>
    </article>
  );
}

export default function AdministrarTiendas() {
  const [tiendas, setTiendas] = useState([]);
  const [vendedores, setVendedores] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [categorias, setCategorias] = useState([]);

  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(false);

  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");
  const [mensaje, setMensaje] = useState("");

  const [busqueda, setBusqueda] = useState("");
  const [filtroVendedor, setFiltroVendedor] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [filtroEnvio, setFiltroEnvio] = useState("todos");
  const [pagina, setPagina] = useState(1);

  const [tiendaEditar, setTiendaEditar] = useState(null);
  const [tiendaEliminar, setTiendaEliminar] = useState(null);

  const [formulario, setFormulario] = useState({
    ...FORMULARIO_VACIO
  });
  const [errorModal, setErrorModal] = useState("");

  const dialogoRef = useRef(null);
  const operandoRef = useRef(false);

  // =====================================================
  // CARGAR DATOS
  // =====================================================

  const cargarDatos = async () => {
    setCargando(true);
    setError("");
    setAviso("");

    const resultados = await Promise.allSettled([
      obtenerTiendas(),
      obtenerVendedores(),
      obtenerUsuarios(),
      obtenerCategorias()
    ]);

    const [
      tiendasResultado,
      vendedoresResultado,
      usuariosResultado,
      categoriasResultado
    ] = resultados;

    if (tiendasResultado.status === "fulfilled") {
      setTiendas(lista(tiendasResultado.value));
    } else {
      setError(
        tiendasResultado.reason?.message ||
        "No se pudieron cargar las tiendas."
      );
    }

    setVendedores(
      vendedoresResultado.status === "fulfilled"
        ? lista(vendedoresResultado.value)
        : []
    );

    setUsuarios(
      usuariosResultado.status === "fulfilled"
        ? lista(usuariosResultado.value)
        : []
    );

    setCategorias(
      categoriasResultado.status === "fulfilled"
        ? lista(categoriasResultado.value)
        : []
    );

    if (
      vendedoresResultado.status === "rejected" ||
      usuariosResultado.status === "rejected" ||
      categoriasResultado.status === "rejected"
    ) {
      setAviso(
        "Algunos datos auxiliares no se pudieron cargar. " +
        "Puedes consultar las tiendas y volver a actualizar."
      );
    }

    setCargando(false);
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // =====================================================
  // CATÁLOGOS AUXILIARES
  // =====================================================

  const usuariosPorId = useMemo(() => {
    return new Map(
      usuarios.map(usuario => [
        Number(usuario.idUsuario),
        usuario
      ])
    );
  }, [usuarios]);

  const vendedoresPorId = useMemo(() => {
    return new Map(
      vendedores.map(vendedor => [
        Number(vendedor.idUsuario),
        vendedor
      ])
    );
  }, [vendedores]);

  const categoriasPorId = useMemo(() => {
    return new Map(
      categorias.map(categoria => [
        Number(categoria.idCategoria),
        categoria
      ])
    );
  }, [categorias]);

  const obtenerNombreVendedor = idVendedor => {
    const id = Number(idVendedor);

    const usuario = usuariosPorId.get(id);

    if (usuario) {
      return nombreCompleto(usuario) || `Vendedor #${id}`;
    }

    const vendedor = vendedoresPorId.get(id);

    const usuarioAnidado =
      vendedor?.idUsuarioNavigation ||
      vendedor?.IdUsuarioNavigation;

    return nombreCompleto(usuarioAnidado) ||
      `Vendedor #${id}`;
  };

  const obtenerCategoria = idCategoria => {
    return categoriasPorId.get(
      Number(idCategoria)
    )?.descripcion || `Categoría #${idCategoria}`;
  };

  // =====================================================
  // RESUMEN Y FILTROS
  // =====================================================

  const resumen = useMemo(() => ({
    total: tiendas.length,
    conEnvio: tiendas.filter(
      tienda => tienda.cuentaEnvio === true
    ).length,
    sinEnvio: tiendas.filter(
      tienda => tienda.cuentaEnvio !== true
    ).length,
    vendedoresConTienda: new Set(
      tiendas.map(tienda => tienda.idVendedor)
    ).size
  }), [tiendas]);

  const vendedoresDisponibles = useMemo(() => {
    return [...new Set(
      tiendas.map(tienda => Number(tienda.idVendedor))
    )].sort((a, b) => a - b);
  }, [tiendas]);

  const tiendasFiltradas = useMemo(() => {
    const termino = normalizar(busqueda.trim());

    return tiendas.filter(tienda => {
      const idVendedor = Number(tienda.idVendedor);

      const vendedor = usuariosPorId.get(idVendedor);
      const vendedorAnidado =
        vendedoresPorId.get(idVendedor)
          ?.idUsuarioNavigation ||
        vendedoresPorId.get(idVendedor)
          ?.IdUsuarioNavigation;

      const nombreVendedor = nombreCompleto(
        vendedor || vendedorAnidado
      );

      const categoria = categoriasPorId.get(
        Number(tienda.idCategoria)
      );

      const contenido = normalizar([
        tienda.idTienda,
        tienda.nombreNegocio,
        tienda.registroNegocio,
        tienda.numeroContacto,
        tienda.eslogan,
        tienda.idVendedor,
        nombreVendedor,
        categoria?.descripcion
      ].join(" "));

      if (termino && !contenido.includes(termino)) {
        return false;
      }

      if (
        filtroVendedor &&
        texto(tienda.idVendedor) !== filtroVendedor
      ) {
        return false;
      }

      if (
        filtroCategoria &&
        texto(tienda.idCategoria) !== filtroCategoria
      ) {
        return false;
      }

      if (
        filtroEnvio === "si" &&
        tienda.cuentaEnvio !== true
      ) {
        return false;
      }

      if (
        filtroEnvio === "no" &&
        tienda.cuentaEnvio === true
      ) {
        return false;
      }

      return true;
    });
  }, [
    tiendas,
    busqueda,
    filtroVendedor,
    filtroCategoria,
    filtroEnvio,
    usuariosPorId,
    vendedoresPorId,
    categoriasPorId
  ]);

  useEffect(() => {
    setPagina(1);
  }, [
    busqueda,
    filtroVendedor,
    filtroCategoria,
    filtroEnvio
  ]);

  const totalPaginas = Math.max(
    1,
    Math.ceil(tiendasFiltradas.length / POR_PAGINA)
  );

  const paginaActual = Math.min(
    pagina,
    totalPaginas
  );

  const inicio = (paginaActual - 1) * POR_PAGINA;

  const tiendasPagina = tiendasFiltradas.slice(
    inicio,
    inicio + POR_PAGINA
  );

  const limpiarFiltros = () => {
    setBusqueda("");
    setFiltroVendedor("");
    setFiltroCategoria("");
    setFiltroEnvio("todos");
  };

  // =====================================================
  // MODALES
  // =====================================================

  const abrirEdicion = tienda => {
    setErrorModal("");

    setFormulario({
      nombreNegocio: tienda.nombreNegocio || "",
      registroNegocio: tienda.registroNegocio || "",
      horario: tienda.horario || "",
      fotoFachadaUrl: tienda.fotoFachadaUrl || "",
      idCategoria: texto(tienda.idCategoria || ""),
      eslogan: tienda.eslogan || "",
      numeroContacto: tienda.numeroContacto || "",
      facebookUrl: tienda.facebookUrl || "",
      paginaWebUrl: tienda.paginaWebUrl || "",
      cuentaEnvio: tienda.cuentaEnvio === true
    });

    setTiendaEditar(tienda);
  };

  const cerrarModal = () => {
    if (operandoRef.current) return;

    setTiendaEditar(null);
    setTiendaEliminar(null);
    setErrorModal("");
  };

  const actualizarCampo = (campo, valor) => {
    setFormulario(prev => ({
      ...prev,
      [campo]: valor
    }));

    setErrorModal("");
  };

  useEffect(() => {
    if (!tiendaEditar && !tiendaEliminar) {
      return;
    }

    const overflowAnterior =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";
    dialogoRef.current?.focus();

    const onKeyDown = evento => {
      if (
        evento.key === "Escape" &&
        !operandoRef.current
      ) {
        setTiendaEditar(null);
        setTiendaEliminar(null);
      }

      if (
        evento.key !== "Tab" ||
        !dialogoRef.current
      ) {
        return;
      }

      const controles = Array.from(
        dialogoRef.current.querySelectorAll(
          "button:not(:disabled), input:not(:disabled), " +
          "select:not(:disabled), a[href]"
        )
      );

      if (controles.length === 0) return;

      const primero = controles[0];
      const ultimo = controles[controles.length - 1];

      if (
        evento.shiftKey &&
        document.activeElement === primero
      ) {
        evento.preventDefault();
        ultimo.focus();
      }

      if (
        !evento.shiftKey &&
        document.activeElement === ultimo
      ) {
        evento.preventDefault();
        primero.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = overflowAnterior;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [tiendaEditar, tiendaEliminar]);

  // =====================================================
  // GUARDAR EDICIÓN
  // =====================================================

  const guardarTienda = async evento => {
    evento.preventDefault();

    if (
      !tiendaEditar ||
      operandoRef.current
    ) return;

    if (
      formulario.nombreNegocio.trim().length < 2
    ) {
      setErrorModal(
        "El negocio debe tener un nombre de al menos 2 caracteres."
      );
      return;
    }

    if (
      !Number.isInteger(
        Number(formulario.idCategoria)
      ) ||
      Number(formulario.idCategoria) <= 0
    ) {
      setErrorModal("Selecciona una categoría válida.");
      return;
    }

    const categoriaExiste = categorias.some(
      categoria =>
        Number(categoria.idCategoria) ===
        Number(formulario.idCategoria)
    );

    if (!categoriaExiste) {
      setErrorModal(
        "La categoría seleccionada no está disponible."
      );
      return;
    }

    const camposUrl = [
      ["fotoFachadaUrl", "La URL de la fachada"],
      ["facebookUrl", "La URL de Facebook"],
      ["paginaWebUrl", "La URL de la página web"]
    ];

    const urlInvalida = camposUrl.find(
      ([campo]) => !urlValida(formulario[campo])
    );

    if (urlInvalida) {
      setErrorModal(
        `${urlInvalida[1]} debe comenzar con http:// o https://.`
      );
      return;
    }

    const payload = {
      nombreNegocio: formulario.nombreNegocio.trim(),
      registroNegocio:
        formulario.registroNegocio.trim() || null,
      horario: formulario.horario.trim() || null,
      fotoFachadaUrl:
        formulario.fotoFachadaUrl.trim() || null,
      idCategoria: Number(formulario.idCategoria),
      eslogan: formulario.eslogan.trim() || null,
      numeroContacto:
        formulario.numeroContacto.trim() || null,
      facebookUrl:
        formulario.facebookUrl.trim() || null,
      paginaWebUrl:
        formulario.paginaWebUrl.trim() || null,
      cuentaEnvio: formulario.cuentaEnvio
    };

    operandoRef.current = true;
    setProcesando(true);
    setErrorModal("");

    try {
      await actualizarTienda(
        tiendaEditar.idTienda,
        payload
      );

      // Actualizar el listado con lo que devuelve la API.
      const nuevasTiendas = await obtenerTiendas();
      setTiendas(lista(nuevasTiendas));

      setTiendaEditar(null);
      setMensaje("Tienda actualizada correctamente.");
      setError("");
    } catch (err) {
      setErrorModal(
        err?.message ||
        "No se pudo actualizar la tienda."
      );
    } finally {
      operandoRef.current = false;
      setProcesando(false);
    }
  };

  // =====================================================
  // ELIMINAR
  // =====================================================

  const confirmarEliminar = tienda => {
    setErrorModal("");
    setTiendaEliminar(tienda);
  };

  const ejecutarEliminar = async () => {
    if (
      !tiendaEliminar ||
      operandoRef.current
    ) return;

    operandoRef.current = true;
    setProcesando(true);
    setErrorModal("");

    try {
      await eliminarTienda(
        tiendaEliminar.idTienda
      );

      setTiendas(prev =>
        prev.filter(
          tienda =>
            Number(tienda.idTienda) !==
            Number(tiendaEliminar.idTienda)
        )
      );

      setMensaje("Tienda eliminada correctamente.");
      setTiendaEliminar(null);
      setError("");
    } catch (err) {
      setErrorModal(
        err?.message ||
        "No se pudo eliminar la tienda. " +
        "Puede tener productos, pedidos u otros datos relacionados."
      );
    } finally {
      operandoRef.current = false;
      setProcesando(false);
    }
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <main className="at-pagina">
      <div className="at-contenedor">
        <header className="at-header">
          <div>
            <span className="at-eyebrow">
              ADMINISTRACIÓN · COMERCIOS
            </span>
            <h1>
              <i className="bi bi-shop" />
              Tiendas y vendedores
            </h1>
            <p>
              Consulta tiendas, identifica responsables y
              administra sus datos comerciales.
            </p>
          </div>

          <button
            type="button"
            className="at-btn at-btn-outline"
            onClick={cargarDatos}
            disabled={cargando}
          >
            <i className="bi bi-arrow-clockwise" />
            {cargando ? "Actualizando..." : "Actualizar"}
          </button>
        </header>

        {mensaje && (
          <div className="at-alerta exito" role="status">
            <i className="bi bi-check-circle-fill" />
            <span>{mensaje}</span>
            <button
              type="button"
              onClick={() => setMensaje("")}
              aria-label="Cerrar mensaje"
            >
              <i className="bi bi-x-lg" />
            </button>
          </div>
        )}

        {error && (
          <div className="at-alerta error" role="alert">
            <i className="bi bi-exclamation-triangle" />
            <span>{error}</span>
          </div>
        )}

        {aviso && (
          <div className="at-alerta aviso" role="status">
            <i className="bi bi-info-circle" />
            <span>{aviso}</span>
          </div>
        )}

        <section className="at-resumen">
          <ResumenCard
            icono="bi-shop-window"
            etiqueta="Tiendas registradas"
            valor={resumen.total}
          />
          <ResumenCard
            icono="bi-truck"
            etiqueta="Con servicio de envío"
            valor={resumen.conEnvio}
            tono="verde"
          />
          <ResumenCard
            icono="bi-bag"
            etiqueta="Sin servicio de envío"
            valor={resumen.sinEnvio}
            tono="naranja"
          />
          <ResumenCard
            icono="bi-people"
            etiqueta="Vendedores con tiendas"
            valor={resumen.vendedoresConTienda}
            tono="morado"
          />
        </section>

        <section className="at-panel">
          <div className="at-panel-header">
            <div>
              <h2>Directorio de tiendas</h2>
              <p>
                {tiendasFiltradas.length}{" "}
                {tiendasFiltradas.length === 1
                  ? "tienda encontrada"
                  : "tiendas encontradas"}
              </p>
            </div>

            <span className="at-nota">
              <i className="bi bi-shield-check" />
              Gestión administrativa
            </span>
          </div>

          <div className="at-filtros">
            <label className="at-busqueda">
              <i className="bi bi-search" />
              <input
                type="search"
                value={busqueda}
                onChange={e =>
                  setBusqueda(e.target.value)
                }
                placeholder="Negocio, vendedor, contacto..."
                aria-label="Buscar tiendas"
              />
            </label>

            <select
              aria-label="Filtrar por vendedor"
              value={filtroVendedor}
              onChange={e =>
                setFiltroVendedor(e.target.value)
              }
            >
              <option value="">Todos los vendedores</option>
              {vendedoresDisponibles.map(id => (
                <option key={id} value={id}>
                  {obtenerNombreVendedor(id)}
                </option>
              ))}
            </select>

            <select
              aria-label="Filtrar por categoría"
              value={filtroCategoria}
              onChange={e =>
                setFiltroCategoria(e.target.value)
              }
            >
              <option value="">Todas las categorías</option>
              {categorias.map(categoria => (
                <option
                  key={categoria.idCategoria}
                  value={categoria.idCategoria}
                >
                  {categoria.descripcion}
                </option>
              ))}
            </select>

            <select
              aria-label="Filtrar por envíos"
              value={filtroEnvio}
              onChange={e =>
                setFiltroEnvio(e.target.value)
              }
            >
              <option value="todos">
                Todos los envíos
              </option>
              <option value="si">
                Con envío
              </option>
              <option value="no">
                Sin envío
              </option>
            </select>
          </div>

          {cargando ? (
            <div className="at-vacio">
              <span className="spinner-border text-primary" />
              <p>Cargando tiendas...</p>
            </div>
          ) : tiendasFiltradas.length === 0 ? (
            <div className="at-vacio">
              <i className="bi bi-shop-window" />
              <h3>No encontramos tiendas</h3>
              <p>
                Cambia los filtros o actualiza
                la información.
              </p>
              <button
                type="button"
                className="at-btn at-btn-primary"
                onClick={limpiarFiltros}
              >
                Limpiar filtros
              </button>
            </div>
          ) : (
            <>
              <div className="at-tabla-scroll">
                <table className="at-tabla">
                  <thead>
                    <tr>
                      <th>Negocio</th>
                      <th>Vendedor</th>
                      <th>Categoría</th>
                      <th>Contacto</th>
                      <th>Envíos</th>
                      <th>Registro</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>

                  <tbody>
                    {tiendasPagina.map(tienda => (
                      <tr key={tienda.idTienda}>
                        <td>
                          <div className="at-negocio">
                            <ImagenTienda tienda={tienda} />
                            <div>
                              <strong>
                                {tienda.nombreNegocio}
                              </strong>
                              <small>
                                ID #{tienda.idTienda}
                              </small>
                              {tienda.eslogan && (
                                <span title={tienda.eslogan}>
                                  {tienda.eslogan}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        <td>
                          <span className="at-celda-principal">
                            {obtenerNombreVendedor(
                              tienda.idVendedor
                            )}
                          </span>
                          <small className="at-celda-secundaria">
                            ID #{tienda.idVendedor}
                          </small>
                        </td>

                        <td>
                          <span className="at-categoria">
                            {obtenerCategoria(
                              tienda.idCategoria
                            )}
                          </span>
                        </td>

                        <td>
                          {tienda.numeroContacto || "Sin contacto"}
                        </td>

                        <td>
                          <span
                            className={
                              tienda.cuentaEnvio
                                ? "at-estado si"
                                : "at-estado no"
                            }
                          >
                            <i
                              className={
                                tienda.cuentaEnvio
                                  ? "bi bi-check-circle"
                                  : "bi bi-dash-circle"
                              }
                            />
                            {tienda.cuentaEnvio
                              ? "Sí"
                              : "No"}
                          </span>
                        </td>

                        <td>
                          {fechaBonita(
                            tienda.fechaRegistro
                          )}
                        </td>

                        <td>
                          <div className="at-acciones">
                            <button
                              type="button"
                              className="at-accion editar"
                              onClick={() =>
                                abrirEdicion(tienda)
                              }
                            >
                              <i className="bi bi-pencil-square" />
                              Editar
                            </button>
                            <button
                              type="button"
                              className="at-accion eliminar"
                              onClick={() =>
                                confirmarEliminar(tienda)
                              }
                            >
                              <i className="bi bi-trash3" />
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="at-paginacion">
                <span>
                  Mostrando{" "}
                  <strong>
                    {inicio + 1}–
                    {Math.min(
                      inicio + POR_PAGINA,
                      tiendasFiltradas.length
                    )}
                  </strong>{" "}
                  de {tiendasFiltradas.length}
                </span>

                <div>
                  <button
                    type="button"
                    disabled={paginaActual <= 1}
                    onClick={() =>
                      setPagina(paginaActual - 1)
                    }
                    aria-label="Página anterior"
                  >
                    <i className="bi bi-chevron-left" />
                  </button>

                  <span>
                    {paginaActual} / {totalPaginas}
                  </span>

                  <button
                    type="button"
                    disabled={paginaActual >= totalPaginas}
                    onClick={() =>
                      setPagina(paginaActual + 1)
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

      {/* MODAL EDITAR */}

      {tiendaEditar && (
        <div
          className="at-modal-fondo"
          onMouseDown={e => {
            if (e.target === e.currentTarget) {
              cerrarModal();
            }
          }}
        >
          <div
            ref={dialogoRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby="at-titulo-editar"
            className="at-modal"
          >
            <header className="at-modal-header">
              <div>
                <span>ADMINISTRACIÓN DE TIENDAS</span>
                <h2 id="at-titulo-editar">
                  Editar tienda #{tiendaEditar.idTienda}
                </h2>
                <p>
                  Vendedor:{" "}
                  {obtenerNombreVendedor(
                    tiendaEditar.idVendedor
                  )}
                </p>
              </div>

              <button
                type="button"
                disabled={procesando}
                onClick={cerrarModal}
                aria-label="Cerrar"
              >
                <i className="bi bi-x-lg" />
              </button>
            </header>

            <form onSubmit={guardarTienda} noValidate>
              <div className="at-modal-body">
                {errorModal && (
                  <div className="at-alerta error" role="alert">
                    <span>{errorModal}</span>
                  </div>
                )}

                <div className="at-campos">
                  <div className="at-campo at-completo">
                    <label htmlFor="at-nombre">
                      Nombre del negocio *
                    </label>
                    <input
                      id="at-nombre"
                      value={formulario.nombreNegocio}
                      maxLength={150}
                      disabled={procesando}
                      onChange={e =>
                        actualizarCampo(
                          "nombreNegocio",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div className="at-campo">
                    <label htmlFor="at-categoria">
                      Categoría *
                    </label>
                    <select
                      id="at-categoria"
                      value={formulario.idCategoria}
                      disabled={procesando}
                      onChange={e =>
                        actualizarCampo(
                          "idCategoria",
                          e.target.value
                        )
                      }
                    >
                      <option value="">
                        Selecciona una categoría
                      </option>

                      {categorias.map(categoria => (
                        <option
                          key={categoria.idCategoria}
                          value={categoria.idCategoria}
                        >
                          {categoria.descripcion}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="at-campo">
                    <label htmlFor="at-registro">
                      Registro de negocio
                    </label>
                    <input
                      id="at-registro"
                      value={formulario.registroNegocio}
                      disabled={procesando}
                      onChange={e =>
                        actualizarCampo(
                          "registroNegocio",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div className="at-campo">
                    <label htmlFor="at-horario">
                      Horario
                    </label>
                    <input
                      id="at-horario"
                      value={formulario.horario}
                      disabled={procesando}
                      placeholder="Ej. Lun–Sáb, 8:00 a 18:00"
                      onChange={e =>
                        actualizarCampo(
                          "horario",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div className="at-campo">
                    <label htmlFor="at-contacto">
                      Número de contacto
                    </label>
                    <input
                      id="at-contacto"
                      value={formulario.numeroContacto}
                      disabled={procesando}
                      onChange={e =>
                        actualizarCampo(
                          "numeroContacto",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div className="at-campo at-completo">
                    <label htmlFor="at-eslogan">
                      Eslogan
                    </label>
                    <input
                      id="at-eslogan"
                      value={formulario.eslogan}
                      disabled={procesando}
                      onChange={e =>
                        actualizarCampo(
                          "eslogan",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div className="at-campo at-completo">
                    <label htmlFor="at-foto">
                      URL de la fachada
                    </label>
                    <input
                      id="at-foto"
                      type="url"
                      value={formulario.fotoFachadaUrl}
                      disabled={procesando}
                      placeholder="https://..."
                      onChange={e =>
                        actualizarCampo(
                          "fotoFachadaUrl",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div className="at-campo">
                    <label htmlFor="at-facebook">
                      Facebook
                    </label>
                    <input
                      id="at-facebook"
                      type="url"
                      value={formulario.facebookUrl}
                      disabled={procesando}
                      placeholder="https://..."
                      onChange={e =>
                        actualizarCampo(
                          "facebookUrl",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div className="at-campo">
                    <label htmlFor="at-web">
                      Página web
                    </label>
                    <input
                      id="at-web"
                      type="url"
                      value={formulario.paginaWebUrl}
                      disabled={procesando}
                      placeholder="https://..."
                      onChange={e =>
                        actualizarCampo(
                          "paginaWebUrl",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <label className="at-check at-completo">
                    <input
                      type="checkbox"
                      checked={formulario.cuentaEnvio}
                      disabled={procesando}
                      onChange={e =>
                        actualizarCampo(
                          "cuentaEnvio",
                          e.target.checked
                        )
                      }
                    />
                    <span>
                      <strong>Cuenta con servicio de envío</strong>
                      <small>
                        Indica si la tienda ofrece entregas.
                      </small>
                    </span>
                  </label>

                  <div className="at-nota-modal at-completo">
                    <i className="bi bi-lock" />
                    El propietario y la fecha de registro no
                    se modifican desde este formulario.
                  </div>
                </div>
              </div>

              <footer className="at-modal-footer">
                <button
                  type="button"
                  className="at-btn at-btn-outline"
                  onClick={cerrarModal}
                  disabled={procesando}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="at-btn at-btn-primary"
                  disabled={procesando}
                >
                  {procesando
                    ? "Guardando..."
                    : "Guardar cambios"}
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}

      {/* MODAL ELIMINAR */}

      {tiendaEliminar && (
        <div
          className="at-modal-fondo"
          onMouseDown={e => {
            if (e.target === e.currentTarget) {
              cerrarModal();
            }
          }}
        >
          <div
            ref={dialogoRef}
            tabIndex={-1}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="at-titulo-eliminar"
            className="at-modal at-modal-pequeno"
          >
            <div className="at-confirmacion">
              <span className="at-confirmacion-icono">
                <i className="bi bi-exclamation-triangle" />
              </span>

              <h2 id="at-titulo-eliminar">
                ¿Eliminar esta tienda?
              </h2>

              <p>
                Estás a punto de eliminar{" "}
                <strong>
                  {tiendaEliminar.nombreNegocio}
                </strong>.
                Esta acción puede afectar productos,
                pedidos y registros relacionados.
              </p>

              {errorModal && (
                <div className="at-alerta error" role="alert">
                  {errorModal}
                </div>
              )}

              <div className="at-confirmacion-acciones">
                <button
                  type="button"
                  className="at-btn at-btn-outline"
                  onClick={cerrarModal}
                  disabled={procesando}
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  className="at-btn at-btn-danger"
                  onClick={ejecutarEliminar}
                  disabled={procesando}
                >
                  {procesando
                    ? "Eliminando..."
                    : "Sí, eliminar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
