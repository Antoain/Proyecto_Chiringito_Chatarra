
import React, {
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";

import {
  obtenerUsuarios,
  crearUsuarioAdministrador,
  actualizarUsuario,
  eliminarUsuario
} from "../../services/data";

import "./AdminPagesCss/AdminUsuarios.css";

const ROLES = ["Cliente", "Vendedor", "Administrador"];
const POR_PAGINA = 8;

const FORMULARIO_VACIO = {
  idUsuario: null,
  nombres: "",
  apellidos: "",
  correo: "",
  rol: "Cliente",
  clave: ""
};

const normalizar = texto =>
  String(texto ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const fecha = valor => {
  if (!valor) return "Sin fecha";

  const partes = String(valor).slice(0, 10).split("-");

  if (partes.length !== 3) return String(valor);

  const [anio, mes, dia] = partes;

  return `${dia}/${mes}/${anio}`;
};

const iniciales = usuario =>
  `${String(usuario.nombres || "").charAt(0)}${
    String(usuario.apellidos || "").charAt(0)
  }`.toUpperCase() || "U";

function EtiquetaRol({ rol }) {
  const tipo = normalizar(rol);

  return (
    <span className={`au-rol au-rol-${tipo}`}>
      <i
        className={
          `bi ${
            rol === "Administrador"
              ? "bi-shield-check"
              : rol === "Vendedor"
                ? "bi-shop"
                : "bi-person"
          }`
        }
      />
      {rol || "Sin rol"}
    </span>
  );
}

export default function AdministrarUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(false);

  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const [busqueda, setBusqueda] = useState("");
  const [filtroRol, setFiltroRol] = useState("Todos");
  const [pagina, setPagina] = useState(1);

  const [modal, setModal] = useState(null);
  const [formulario, setFormulario] = useState(FORMULARIO_VACIO);
  const [errorFormulario, setErrorFormulario] = useState("");

  const [usuarioEliminar, setUsuarioEliminar] = useState(null);

  const dialogoRef = useRef(null);
  const anteriorFoco = useRef(null);
  const operandoRef = useRef(false);

  const idSesion = Number(localStorage.getItem("idUsuario"));

  // =====================================================
  // CARGAR USUARIOS
  // =====================================================

  const cargarUsuarios = async () => {
    setCargando(true);
    setError("");

    try {
      const respuesta = await obtenerUsuarios();

      setUsuarios(
        Array.isArray(respuesta) ? respuesta : []
      );
    } catch (err) {
      setError(
        err?.message ||
        "No se pudo consultar la lista de usuarios."
      );
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    let activo = true;

    const cargar = async () => {
      try {
        const respuesta = await obtenerUsuarios();

        if (activo) {
          setUsuarios(
            Array.isArray(respuesta) ? respuesta : []
          );
        }
      } catch (err) {
        if (activo) {
          setError(
            err?.message ||
            "No se pudieron cargar los usuarios."
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

  // =====================================================
  // FILTROS
  // =====================================================

  useEffect(() => {
    setPagina(1);
  }, [busqueda, filtroRol]);

  const usuariosFiltrados = useMemo(() => {
    const texto = normalizar(busqueda.trim());

    return usuarios.filter(usuario => {
      if (
        filtroRol !== "Todos" &&
        usuario.rol !== filtroRol
      ) {
        return false;
      }

      const contenido = normalizar([
        usuario.idUsuario,
        usuario.nombres,
        usuario.apellidos,
        usuario.correo,
        usuario.rol
      ].join(" "));

      return !texto || contenido.includes(texto);
    });
  }, [usuarios, busqueda, filtroRol]);

  const totalPaginas = Math.max(
    1,
    Math.ceil(usuariosFiltrados.length / POR_PAGINA)
  );

  const paginaActual = Math.min(pagina, totalPaginas);

  const inicio = (paginaActual - 1) * POR_PAGINA;

  const usuariosPagina = usuariosFiltrados.slice(
    inicio,
    inicio + POR_PAGINA
  );

  const resumen = useMemo(() => ({
    total: usuarios.length,
    clientes: usuarios.filter(u => u.rol === "Cliente").length,
    vendedores: usuarios.filter(u => u.rol === "Vendedor").length,
    administradores: usuarios.filter(
      u => u.rol === "Administrador"
    ).length
  }), [usuarios]);

  // =====================================================
  // MODALES
  // =====================================================

  const abrirCrear = () => {
    setMensaje("");
    setErrorFormulario("");
    setFormulario({ ...FORMULARIO_VACIO });
    setModal("crear");
  };

  const abrirEditar = usuario => {
    setMensaje("");
    setErrorFormulario("");

    setFormulario({
      idUsuario: usuario.idUsuario,
      nombres: usuario.nombres || "",
      apellidos: usuario.apellidos || "",
      correo: usuario.correo || "",
      rol: usuario.rol || "Cliente",
      clave: ""
    });

    setModal("editar");
  };

  const cerrarModal = () => {
    if (operandoRef.current) return;

    setModal(null);
    setUsuarioEliminar(null);
    setErrorFormulario("");
  };

  useEffect(() => {
    if (!modal && !usuarioEliminar) return;

    anteriorFoco.current = document.activeElement;

    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    dialogoRef.current?.focus();

    const manejarTecla = evento => {
      if (evento.key === "Escape" && !operandoRef.current) {
        setModal(null);
        setUsuarioEliminar(null);
        setErrorFormulario("");
      }

      if (evento.key !== "Tab" || !dialogoRef.current) {
        return;
      }

      const elementos = Array.from(
        dialogoRef.current.querySelectorAll(
          "button:not([disabled]), input:not([disabled]), select:not([disabled])"
        )
      );

      if (!elementos.length) return;

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
    };

    document.addEventListener("keydown", manejarTecla);

    return () => {
      document.body.style.overflow = overflowAnterior;
      document.removeEventListener("keydown", manejarTecla);
      anteriorFoco.current?.focus?.();
    };
  }, [modal, usuarioEliminar]);

  // =====================================================
  // VALIDAR
  // =====================================================

  const validarFormulario = () => {
    if (formulario.nombres.trim().length < 2) {
      return "Los nombres deben tener al menos 2 caracteres.";
    }

    if (formulario.apellidos.trim().length < 2) {
      return "Los apellidos deben tener al menos 2 caracteres.";
    }

    const correo = formulario.correo.trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      return "Introduce un correo electrónico válido.";
    }

    if (!ROLES.includes(formulario.rol)) {
      return "Selecciona un rol válido.";
    }

    if (
      modal === "crear" &&
      formulario.clave.length < 8
    ) {
      return "La contraseña debe tener al menos 8 caracteres.";
    }

    const correoExiste = usuarios.some(
      usuario =>
        Number(usuario.idUsuario) !==
          Number(formulario.idUsuario) &&
        normalizar(usuario.correo) === normalizar(correo)
    );

    if (correoExiste) {
      return "Ya existe un usuario con ese correo.";
    }

    return "";
  };

  const cambiarCampo = (campo, valor) => {
    setFormulario(anterior => ({
      ...anterior,
      [campo]: valor
    }));

    setErrorFormulario("");
  };

  // =====================================================
  // CREAR / EDITAR
  // =====================================================

  const guardarUsuario = async evento => {
    evento.preventDefault();

    if (operandoRef.current) return;

    const validacion = validarFormulario();

    if (validacion) {
      setErrorFormulario(validacion);
      return;
    }

    const datos = {
      nombres: formulario.nombres.trim(),
      apellidos: formulario.apellidos.trim(),
      correo: formulario.correo.trim(),
      rol: formulario.rol
    };

    operandoRef.current = true;
    setProcesando(true);
    setErrorFormulario("");

    try {
      if (modal === "crear") {
        await crearUsuarioAdministrador({
          ...datos,
          clave: formulario.clave
        });

        setMensaje("Usuario creado correctamente.");
      } else {
        await actualizarUsuario({
          ...datos,
          idUsuario: Number(formulario.idUsuario)
        });

        setMensaje("Usuario actualizado correctamente.");
      }

      // Recuperar siempre el listado real del servidor.
      const respuesta = await obtenerUsuarios();

      setUsuarios(
        Array.isArray(respuesta) ? respuesta : []
      );

      setModal(null);
      setFormulario({ ...FORMULARIO_VACIO });
    } catch (err) {
      setErrorFormulario(
        err?.message ||
        "No se pudo guardar el usuario."
      );
    } finally {
      operandoRef.current = false;
      setProcesando(false);
    }
  };

  // =====================================================
  // ELIMINAR
  // =====================================================

  const confirmarEliminar = usuario => {
    if (Number(usuario.idUsuario) === idSesion) {
      setError(
        "No puedes eliminar tu propia cuenta desde esta pantalla."
      );
      return;
    }

    setUsuarioEliminar(usuario);
    setMensaje("");
    setError("");
  };

  const ejecutarEliminacion = async () => {
    if (!usuarioEliminar || operandoRef.current) return;

    operandoRef.current = true;
    setProcesando(true);
    setErrorFormulario("");

    try {
      await eliminarUsuario(usuarioEliminar.idUsuario);

      setUsuarios(anterior =>
        anterior.filter(
          u => u.idUsuario !== usuarioEliminar.idUsuario
        )
      );

      setMensaje("Usuario eliminado correctamente.");
      setUsuarioEliminar(null);
    } catch (err) {
      setErrorFormulario(
        err?.message ||
        "No se pudo eliminar el usuario."
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
    <main className="au-pagina">
      <div className="au-contenedor">

        <header className="au-header">
          <div>
            <span className="au-eyebrow">
              GESTIÓN ADMINISTRATIVA
            </span>

            <h1>
              <i className="bi bi-people" />
              Usuarios
            </h1>

            <p>
              Administra las cuentas y permisos
              de Chiringuito Chatarra.
            </p>
          </div>

          <div className="au-header-acciones">
            <button
              type="button"
              className="au-boton-secundario"
              disabled={cargando}
              onClick={cargarUsuarios}
            >
              <i className="bi bi-arrow-clockwise" />
              Actualizar
            </button>

            <button
              type="button"
              className="au-boton-primario"
              onClick={abrirCrear}
            >
              <i className="bi bi-person-plus" />
              Nuevo usuario
            </button>
          </div>
        </header>

        {mensaje && (
          <div className="au-alerta exito" role="status">
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
          <div className="au-alerta error" role="alert">
            <i className="bi bi-exclamation-triangle" />
            <span>{error}</span>
            <button
              type="button"
              onClick={() => setError("")}
              aria-label="Cerrar error"
            >
              <i className="bi bi-x-lg" />
            </button>
          </div>
        )}

        {/* ESTADÍSTICAS */}

        <section className="au-resumen">
          {[
            {
              titulo: "Usuarios totales",
              valor: resumen.total,
              icono: "bi-people",
              tono: "azul"
            },
            {
              titulo: "Clientes",
              valor: resumen.clientes,
              icono: "bi-person",
              tono: "verde"
            },
            {
              titulo: "Vendedores",
              valor: resumen.vendedores,
              icono: "bi-shop",
              tono: "naranja"
            },
            {
              titulo: "Administradores",
              valor: resumen.administradores,
              icono: "bi-shield-check",
              tono: "morado"
            }
          ].map(item => (
            <article className="au-resumen-card" key={item.titulo}>
              <span className={`au-resumen-icono ${item.tono}`}>
                <i className={`bi ${item.icono}`} />
              </span>
              <div>
                <small>{item.titulo}</small>
                <strong>{item.valor}</strong>
              </div>
            </article>
          ))}
        </section>

        {/* TABLA */}

        <section className="au-panel">
          <div className="au-panel-header">
            <div>
              <h2>Directorio de usuarios</h2>
              <p>
                Consulta, filtra y administra las cuentas.
              </p>
            </div>

            <div className="au-filtros">
              <label className="au-buscador">
                <i className="bi bi-search" />
                <input
                  type="search"
                  value={busqueda}
                  onChange={e => setBusqueda(e.target.value)}
                  placeholder="Nombre, correo o ID..."
                  aria-label="Buscar usuarios"
                />
              </label>

              <select
                value={filtroRol}
                onChange={e => setFiltroRol(e.target.value)}
                aria-label="Filtrar por rol"
              >
                <option value="Todos">Todos los roles</option>
                {ROLES.map(rol => (
                  <option value={rol} key={rol}>{rol}</option>
                ))}
              </select>
            </div>
          </div>

          {cargando ? (
            <div className="au-vacio">
              <span className="spinner-border text-primary" />
              <p>Cargando usuarios...</p>
            </div>
          ) : usuariosFiltrados.length === 0 ? (
            <div className="au-vacio">
              <i className="bi bi-person-x" />
              <h3>No se encontraron usuarios</h3>
              <p>
                {usuarios.length === 0
                  ? "Todavía no hay usuarios registrados."
                  : "Prueba cambiando los filtros o la búsqueda."}
              </p>
              {usuarios.length > 0 && (
                <button
                  className="au-boton-secundario"
                  type="button"
                  onClick={() => {
                    setBusqueda("");
                    setFiltroRol("Todos");
                  }}
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="au-tabla-contenedor">
                <table className="au-tabla">
                  <thead>
                    <tr>
                      <th>Usuario</th>
                      <th>Correo electrónico</th>
                      <th>Rol</th>
                      <th>Registro</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>

                  <tbody>
                    {usuariosPagina.map(usuario => (
                      <tr key={usuario.idUsuario}>
                        <td>
                          <div className="au-identidad">
                            <span className="au-avatar">
                              {iniciales(usuario)}
                            </span>
                            <div>
                              <strong>
                                {usuario.nombres}{" "}
                                {usuario.apellidos}
                              </strong>
                              <small>
                                ID #{usuario.idUsuario}
                                {Number(usuario.idUsuario) ===
                                  idSesion && " · Tu cuenta"}
                              </small>
                            </div>
                          </div>
                        </td>

                        <td className="au-correo">
                          {usuario.correo}
                        </td>

                        <td>
                          <EtiquetaRol rol={usuario.rol} />
                        </td>

                        <td className="au-fecha">
                          {fecha(usuario.fechaRegistro)}
                        </td>

                        <td>
                          <div className="au-acciones">
                            <button
                              type="button"
                              className="au-accion editar"
                              onClick={() => abrirEditar(usuario)}
                              title="Editar usuario"
                              aria-label={
                                `Editar ${usuario.nombres}`
                              }
                            >
                              <i className="bi bi-pencil-square" />
                              <span>Editar</span>
                            </button>

                            <button
                              type="button"
                              className="au-accion eliminar"
                              onClick={() =>
                                confirmarEliminar(usuario)
                              }
                              disabled={
                                Number(usuario.idUsuario) ===
                                idSesion
                              }
                              title={
                                Number(usuario.idUsuario) === idSesion
                                  ? "No puedes eliminar tu cuenta"
                                  : "Eliminar usuario"
                              }
                              aria-label={
                                `Eliminar ${usuario.nombres}`
                              }
                            >
                              <i className="bi bi-trash3" />
                              <span>Eliminar</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="au-paginacion">
                <span>
                  Mostrando{" "}
                  <strong>
                    {inicio + 1}–
                    {Math.min(
                      inicio + POR_PAGINA,
                      usuariosFiltrados.length
                    )}
                  </strong>{" "}
                  de <strong>{usuariosFiltrados.length}</strong>
                </span>

                <div>
                  <button
                    type="button"
                    disabled={paginaActual <= 1}
                    onClick={() => setPagina(paginaActual - 1)}
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

      {/* CREACIÓN Y EDICIÓN */}

      {modal && (
        <div
          className="au-modal-fondo"
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
            aria-labelledby="au-modal-titulo"
            className="au-modal"
          >
            <header className="au-modal-header">
              <div>
                <span>
                  {modal === "crear"
                    ? "NUEVA CUENTA"
                    : "MODIFICAR CUENTA"}
                </span>
                <h2 id="au-modal-titulo">
                  {modal === "crear"
                    ? "Crear usuario"
                    : `Editar usuario #${formulario.idUsuario}`}
                </h2>
              </div>

              <button
                type="button"
                onClick={cerrarModal}
                disabled={procesando}
                aria-label="Cerrar formulario"
              >
                <i className="bi bi-x-lg" />
              </button>
            </header>

            <form onSubmit={guardarUsuario} noValidate>
              <div className="au-modal-body">
                {errorFormulario && (
                  <div className="au-alerta error" role="alert">
                    <i className="bi bi-exclamation-triangle" />
                    <span>{errorFormulario}</span>
                  </div>
                )}

                <div className="au-campos">
                  <div className="au-campo">
                    <label htmlFor="au-nombres">
                      Nombres *
                    </label>
                    <input
                      id="au-nombres"
                      value={formulario.nombres}
                      onChange={e =>
                        cambiarCampo("nombres", e.target.value)
                      }
                      maxLength={100}
                      disabled={procesando}
                      autoComplete="given-name"
                      placeholder="Nombres del usuario"
                    />
                  </div>

                  <div className="au-campo">
                    <label htmlFor="au-apellidos">
                      Apellidos *
                    </label>
                    <input
                      id="au-apellidos"
                      value={formulario.apellidos}
                      onChange={e =>
                        cambiarCampo("apellidos", e.target.value)
                      }
                      maxLength={100}
                      disabled={procesando}
                      autoComplete="family-name"
                      placeholder="Apellidos del usuario"
                    />
                  </div>

                  <div className="au-campo au-campo-completo">
                    <label htmlFor="au-correo">
                      Correo electrónico *
                    </label>
                    <input
                      id="au-correo"
                      type="email"
                      value={formulario.correo}
                      onChange={e =>
                        cambiarCampo("correo", e.target.value)
                      }
                      maxLength={150}
                      disabled={procesando}
                      autoComplete="email"
                      placeholder="correo@ejemplo.com"
                    />
                  </div>

                  <div className="au-campo au-campo-completo">
                    <label htmlFor="au-rol">
                      Rol asignado *
                    </label>
                    <select
                      id="au-rol"
                      value={formulario.rol}
                      onChange={e =>
                        cambiarCampo("rol", e.target.value)
                      }
                      disabled={procesando}
                    >
                      {ROLES.map(rol => (
                        <option key={rol} value={rol}>
                          {rol}
                        </option>
                      ))}
                    </select>

                    <small>
                      El rol controla qué módulos puede utilizar
                      esta cuenta.
                    </small>
                  </div>

                  {modal === "crear" && (
                    <div className="au-campo au-campo-completo">
                      <label htmlFor="au-clave">
                        Contraseña inicial *
                      </label>
                      <input
                        id="au-clave"
                        type="password"
                        value={formulario.clave}
                        onChange={e =>
                          cambiarCampo("clave", e.target.value)
                        }
                        minLength={8}
                        maxLength={128}
                        disabled={procesando}
                        autoComplete="new-password"
                        placeholder="Mínimo 8 caracteres"
                      />
                      <small>
                        Se enviará por HTTPS cuando el proyecto
                        esté desplegado. No se muestra ni se guarda
                        en el listado de usuarios.
                      </small>
                    </div>
                  )}

                  {modal === "editar" && (
                    <div className="au-nota">
                      <i className="bi bi-lock" />
                      <span>
                        La contraseña no se modifica desde este
                        formulario. El endpoint de edición actual
                        solo actualiza nombres, apellidos, correo
                        y rol.
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <footer className="au-modal-footer">
                <button
                  type="button"
                  className="au-boton-secundario"
                  onClick={cerrarModal}
                  disabled={procesando}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="au-boton-primario"
                  disabled={procesando}
                >
                  {procesando ? (
                    <>
                      <span className="spinner-border spinner-border-sm" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-lg" />
                      {modal === "crear"
                        ? "Crear usuario"
                        : "Guardar cambios"}
                    </>
                  )}
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRMACIÓN DE ELIMINACIÓN */}

      {usuarioEliminar && (
        <div
          className="au-modal-fondo"
          onMouseDown={e => {
            if (e.target === e.currentTarget) {
              cerrarModal();
            }
          }}
        >
          <div
            ref={dialogoRef}
            className="au-modal au-modal-pequeno"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="au-eliminar-titulo"
            aria-describedby="au-eliminar-descripcion"
            tabIndex={-1}
          >
            <div className="au-confirmacion">
              <span className="au-confirmacion-icono">
                <i className="bi bi-exclamation-triangle" />
              </span>

              <h2 id="au-eliminar-titulo">
                ¿Eliminar usuario?
              </h2>

              <p id="au-eliminar-descripcion">
                Estás a punto de eliminar a{" "}
                <strong>
                  {usuarioEliminar.nombres}{" "}
                  {usuarioEliminar.apellidos}
                </strong>.
                Esta acción puede afectar registros relacionados.
              </p>

              {errorFormulario && (
                <div className="au-alerta error" role="alert">
                  <span>{errorFormulario}</span>
                </div>
              )}

              <div className="au-confirmacion-acciones">
                <button
                  type="button"
                  className="au-boton-secundario"
                  onClick={cerrarModal}
                  disabled={procesando}
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  className="au-boton-peligro"
                  onClick={ejecutarEliminacion}
                  disabled={procesando}
                >
                  {procesando
                    ? "Eliminando..."
                    : "Sí, eliminar usuario"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
