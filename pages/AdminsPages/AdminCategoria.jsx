
import React, { useEffect, useMemo, useState } from "react";

import {
  obtenerCategorias,
  crearCategoria,
  actualizarCategoria,
  eliminarCategoria,
  obtenerProductos,
  obtenerTiendas
} from "../../services/data";

import "./AdminPagesCss/AdminCategoria.css";

const POR_PAGINA = 8;

const normalizar = valor =>
  String(valor ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

export default function AdministrarCategorias() {
  const [categorias, setCategorias] = useState([]);
  const [productos, setProductos] = useState([]);
  const [tiendas, setTiendas] = useState([]);

  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(false);

  const [busqueda, setBusqueda] = useState("");
  const [estado, setEstado] = useState("todos");
  const [pagina, setPagina] = useState(1);

  const [modal, setModal] = useState(null);
  const [confirmar, setConfirmar] = useState(null);

  const [formulario, setFormulario] = useState({
    idCategoria: null,
    descripcion: "",
    activo: true
  });

  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [errorModal, setErrorModal] = useState("");

  const cargarDatos = async () => {
    setCargando(true);
    setError("");

    try {
      const resultado = await Promise.allSettled([
        obtenerCategorias(),
        obtenerProductos(),
        obtenerTiendas()
      ]);

      if (resultado[0].status !== "fulfilled") {
        throw resultado[0].reason;
      }

      setCategorias(
        Array.isArray(resultado[0].value)
          ? resultado[0].value
          : []
      );

      setProductos(
        resultado[1].status === "fulfilled" &&
        Array.isArray(resultado[1].value)
          ? resultado[1].value
          : []
      );

      setTiendas(
        resultado[2].status === "fulfilled" &&
        Array.isArray(resultado[2].value)
          ? resultado[2].value
          : []
      );
    } catch (err) {
      setError(
        err?.message ||
        "No fue posible cargar las categorías."
      );
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    setPagina(1);
  }, [busqueda, estado]);

  const resumen = useMemo(() => ({
    total: categorias.length,
    activas: categorias.filter(c => c.activo === true).length,
    inactivas: categorias.filter(c => c.activo !== true).length
  }), [categorias]);

  const usoPorCategoria = useMemo(() => {
    const mapa = new Map();

    productos.forEach(producto => {
      const id = Number(producto.idCategoria);
      mapa.set(id, (mapa.get(id) || 0) + 1);
    });

    return mapa;
  }, [productos]);

  const tiendasPorCategoria = useMemo(() => {
    const mapa = new Map();

    tiendas.forEach(tienda => {
      const id = Number(tienda.idCategoria);
      mapa.set(id, (mapa.get(id) || 0) + 1);
    });

    return mapa;
  }, [tiendas]);

  const filtradas = useMemo(() => {
    const termino = normalizar(busqueda.trim());

    return categorias.filter(categoria => {
      if (
        estado === "activas" &&
        categoria.activo !== true
      ) {
        return false;
      }

      if (
        estado === "inactivas" &&
        categoria.activo === true
      ) {
        return false;
      }

      return normalizar(
        `${categoria.idCategoria} ${categoria.descripcion}`
      ).includes(termino);
    });
  }, [categorias, busqueda, estado]);

  const totalPaginas = Math.max(
    1,
    Math.ceil(filtradas.length / POR_PAGINA)
  );

  const paginaActual = Math.min(pagina, totalPaginas);

  const inicio = (paginaActual - 1) * POR_PAGINA;

  const paginaDatos = filtradas.slice(
    inicio,
    inicio + POR_PAGINA
  );

  const abrirCrear = () => {
    setErrorModal("");
    setFormulario({
      idCategoria: null,
      descripcion: "",
      activo: true
    });
    setModal("crear");
  };

  const abrirEditar = categoria => {
    setErrorModal("");
    setFormulario({
      idCategoria: categoria.idCategoria,
      descripcion: categoria.descripcion || "",
      activo: categoria.activo === true
    });
    setModal("editar");
  };

  const cerrar = () => {
    if (procesando) return;

    setModal(null);
    setConfirmar(null);
    setErrorModal("");
  };

  useEffect(() => {
    if (!modal && !confirmar) return;

    const anterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const escape = evento => {
      if (evento.key === "Escape" && !procesando) {
        cerrar();
      }
    };

    document.addEventListener("keydown", escape);

    return () => {
      document.body.style.overflow = anterior;
      document.removeEventListener("keydown", escape);
    };
  }, [modal, confirmar, procesando]);

  const guardar = async evento => {
    evento.preventDefault();
    if (procesando) return;

    const descripcion = formulario.descripcion.trim();

    if (descripcion.length < 2) {
      setErrorModal(
        "La descripción debe contener al menos 2 caracteres."
      );
      return;
    }

    const duplicada = categorias.some(
      categoria =>
        normalizar(categoria.descripcion) ===
          normalizar(descripcion) &&
        Number(categoria.idCategoria) !==
          Number(formulario.idCategoria)
    );

    if (duplicada) {
      setErrorModal(
        "Ya existe una categoría con esa descripción."
      );
      return;
    }

    setProcesando(true);
    setErrorModal("");

    try {
      if (modal === "crear") {
        await crearCategoria({
          descripcion,
          activo: formulario.activo
        });
      } else {
        await actualizarCategoria(
          formulario.idCategoria,
          {
            idCategoria: Number(formulario.idCategoria),
            descripcion,
            activo: formulario.activo
          }
        );
      }

      const datos = await obtenerCategorias();
      setCategorias(Array.isArray(datos) ? datos : []);

      setMensaje(
        modal === "crear"
          ? "Categoría creada correctamente."
          : "Categoría actualizada correctamente."
      );

      setModal(null);
    } catch (err) {
      setErrorModal(
        err?.message ||
        "No se pudo guardar la categoría."
      );
    } finally {
      setProcesando(false);
    }
  };

  const borrar = async () => {
    if (!confirmar || procesando) return;

    setProcesando(true);
    setErrorModal("");

    try {
      await eliminarCategoria(confirmar.idCategoria);

      setCategorias(anterior =>
        anterior.filter(
          categoria =>
            categoria.idCategoria !== confirmar.idCategoria
        )
      );

      setMensaje("Categoría eliminada correctamente.");
      setConfirmar(null);
    } catch (err) {
      setErrorModal(
        err?.message ||
        "No se pudo eliminar la categoría."
      );
    } finally {
      setProcesando(false);
    }
  };

  return (
    <main className="ac-pagina">
      <div className="ac-contenedor">

        <header className="ac-header">
          <div>
            <span className="ac-eyebrow">
              ADMINISTRACIÓN · CATÁLOGO
            </span>
            <h1>
              <i className="bi bi-grid-3x3-gap" />
              Categorías
            </h1>
            <p>
              Organiza el catálogo y controla cuáles
              categorías están habilitadas.
            </p>
          </div>

          <div className="ac-header-acciones">
            <button
              className="ac-btn secundario"
              type="button"
              onClick={cargarDatos}
              disabled={cargando}
            >
              <i className="bi bi-arrow-clockwise" />
              Actualizar
            </button>
            <button
              className="ac-btn primario"
              type="button"
              onClick={abrirCrear}
            >
              <i className="bi bi-plus-lg" />
              Nueva categoría
            </button>
          </div>
        </header>

        {mensaje && (
          <div className="ac-alerta exito" role="status">
            <i className="bi bi-check-circle-fill" />
            <span>{mensaje}</span>
            <button
              type="button"
              onClick={() => setMensaje("")}
              aria-label="Cerrar aviso"
            >
              <i className="bi bi-x-lg" />
            </button>
          </div>
        )}

        {error && (
          <div className="ac-alerta error" role="alert">
            <i className="bi bi-exclamation-triangle" />
            <span>{error}</span>
          </div>
        )}

        <section className="ac-resumen">
          <article>
            <span className="ac-resumen-icono azul">
              <i className="bi bi-collection" />
            </span>
            <div>
              <small>Total de categorías</small>
              <strong>{resumen.total}</strong>
            </div>
          </article>

          <article>
            <span className="ac-resumen-icono verde">
              <i className="bi bi-check-circle" />
            </span>
            <div>
              <small>Activas</small>
              <strong>{resumen.activas}</strong>
            </div>
          </article>

          <article>
            <span className="ac-resumen-icono naranja">
              <i className="bi bi-pause-circle" />
            </span>
            <div>
              <small>Inactivas</small>
              <strong>{resumen.inactivas}</strong>
            </div>
          </article>
        </section>

        <section className="ac-panel">
          <div className="ac-panel-header">
            <div>
              <h2>Directorio de categorías</h2>
              <p>
                {filtradas.length} categorías encontradas
              </p>
            </div>

            <div className="ac-filtros">
              <label className="ac-buscador">
                <i className="bi bi-search" />
                <input
                  value={busqueda}
                  type="search"
                  onChange={e => setBusqueda(e.target.value)}
                  placeholder="Buscar por nombre o ID..."
                  aria-label="Buscar categorías"
                />
              </label>

              <select
                aria-label="Filtrar por estado"
                value={estado}
                onChange={e => setEstado(e.target.value)}
              >
                <option value="todos">Todos los estados</option>
                <option value="activas">Activas</option>
                <option value="inactivas">Inactivas</option>
              </select>
            </div>
          </div>

          {cargando ? (
            <div className="ac-vacio">
              <span className="spinner-border text-primary" />
              <p>Cargando categorías...</p>
            </div>
          ) : filtradas.length === 0 ? (
            <div className="ac-vacio">
              <i className="bi bi-search" />
              <strong>Sin resultados</strong>
              <p>No hay categorías para estos filtros.</p>
            </div>
          ) : (
            <>
              <div className="ac-tabla-scroll">
                <table className="ac-tabla">
                  <thead>
                    <tr>
                      <th>Categoría</th>
                      <th>Productos</th>
                      <th>Tiendas</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginaDatos.map(categoria => {
                      const productosAsociados =
                        usoPorCategoria.get(
                          Number(categoria.idCategoria)
                        ) || 0;

                      const tiendasAsociadas =
                        tiendasPorCategoria.get(
                          Number(categoria.idCategoria)
                        ) || 0;

                      return (
                        <tr key={categoria.idCategoria}>
                          <td>
                            <div className="ac-identidad">
                              <span>
                                <i className="bi bi-tag" />
                              </span>
                              <div>
                                <strong>
                                  {categoria.descripcion}
                                </strong>
                                <small>
                                  ID #{categoria.idCategoria}
                                </small>
                              </div>
                            </div>
                          </td>

                          <td>{productosAsociados}</td>
                          <td>{tiendasAsociadas}</td>

                          <td>
                            <span
                              className={
                                categoria.activo
                                  ? "ac-estado activo"
                                  : "ac-estado inactivo"
                              }
                            >
                              <i
                                className={
                                  categoria.activo
                                    ? "bi bi-check-circle"
                                    : "bi bi-dash-circle"
                                }
                              />
                              {categoria.activo
                                ? "Activa"
                                : "Inactiva"}
                            </span>
                          </td>

                          <td>
                            <div className="ac-acciones">
                              <button
                                type="button"
                                className="ac-accion editar"
                                onClick={() =>
                                  abrirEditar(categoria)
                                }
                              >
                                <i className="bi bi-pencil-square" />
                                Editar
                              </button>

                              <button
                                type="button"
                                className="ac-accion borrar"
                                onClick={() => {
                                  setErrorModal("");
                                  setConfirmar({
                                    ...categoria,
                                    productosAsociados,
                                    tiendasAsociadas
                                  });
                                }}
                                disabled={
                                  productosAsociados > 0 ||
                                  tiendasAsociadas > 0
                                }
                                title={
                                  productosAsociados ||
                                  tiendasAsociadas
                                    ? "Tiene productos o tiendas vinculados"
                                    : "Eliminar categoría"
                                }
                              >
                                <i className="bi bi-trash3" />
                                Eliminar
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="ac-paginacion">
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
                    onClick={() =>
                      setPagina(paginaActual - 1)
                    }
                    aria-label="Anterior"
                  >
                    <i className="bi bi-chevron-left" />
                  </button>
                  <span>
                    {paginaActual} / {totalPaginas}
                  </span>
                  <button
                    type="button"
                    disabled={
                      paginaActual === totalPaginas
                    }
                    onClick={() =>
                      setPagina(paginaActual + 1)
                    }
                    aria-label="Siguiente"
                  >
                    <i className="bi bi-chevron-right" />
                  </button>
                </div>
              </div>
            </>
          )}
        </section>
      </div>

      {modal && (
        <div className="ac-modal-fondo">
          <div
            className="ac-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ac-modal-titulo"
          >
            <header className="ac-modal-header">
              <div>
                <span>CATÁLOGO</span>
                <h2 id="ac-modal-titulo">
                  {modal === "crear"
                    ? "Nueva categoría"
                    : "Editar categoría"}
                </h2>
              </div>

              <button
                type="button"
                disabled={procesando}
                onClick={cerrar}
                aria-label="Cerrar"
              >
                <i className="bi bi-x-lg" />
              </button>
            </header>

            <form onSubmit={guardar} noValidate>
              <div className="ac-modal-body">
                {errorModal && (
                  <div className="ac-alerta error" role="alert">
                    {errorModal}
                  </div>
                )}

                <label htmlFor="ac-descripcion">
                  Nombre de categoría *
                </label>
                <input
                  id="ac-descripcion"
                  value={formulario.descripcion}
                  onChange={e =>
                    setFormulario(prev => ({
                      ...prev,
                      descripcion: e.target.value
                    }))
                  }
                  maxLength={120}
                  disabled={procesando}
                  autoFocus
                  placeholder="Ej. Electrónica"
                />

                <label htmlFor="ac-activo">
                  Estado
                </label>
                <select
                  id="ac-activo"
                  value={String(formulario.activo)}
                  disabled={procesando}
                  onChange={e =>
                    setFormulario(prev => ({
                      ...prev,
                      activo: e.target.value === "true"
                    }))
                  }
                >
                  <option value="true">Activa</option>
                  <option value="false">Inactiva</option>
                </select>
              </div>

              <footer className="ac-modal-footer">
                <button
                  type="button"
                  className="ac-btn secundario"
                  disabled={procesando}
                  onClick={cerrar}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="ac-btn primario"
                  disabled={procesando}
                >
                  {procesando
                    ? "Guardando..."
                    : modal === "crear"
                      ? "Crear categoría"
                      : "Guardar cambios"}
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}

      {confirmar && (
        <div className="ac-modal-fondo">
          <div
            className="ac-modal ac-modal-pequeno"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="ac-eliminar-titulo"
          >
            <div className="ac-confirmacion">
              <i className="bi bi-exclamation-triangle" />
              <h2 id="ac-eliminar-titulo">
                ¿Eliminar categoría?
              </h2>

              <p>
                Vas a eliminar{" "}
                <strong>{confirmar.descripcion}</strong>.
                Esta operación es permanente.
              </p>

              {errorModal && (
                <div className="ac-alerta error">
                  {errorModal}
                </div>
              )}

              <div className="ac-modal-footer">
                <button
                  className="ac-btn secundario"
                  type="button"
                  disabled={procesando}
                  onClick={cerrar}
                >
                  Cancelar
                </button>
                <button
                  className="ac-btn peligro"
                  type="button"
                  disabled={procesando}
                  onClick={borrar}
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
