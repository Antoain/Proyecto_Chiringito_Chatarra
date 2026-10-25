
import React, {
  useEffect,
  useMemo,
  useState
} from "react";

import {
  obtenerProductos,
  obtenerCategorias,
  obtenerTiendas,
  actualizarProductos,
  eliminarProductos
} from "../../services/data";

import "./AdminPagesCss/AdminProducto.css";

const POR_PAGINA = 8;

const dinero = valor =>
  new Intl.NumberFormat("es-SV", {
    style: "currency",
    currency: "USD"
  }).format(Number(valor || 0));

const normalizar = valor =>
  String(valor ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

function ImagenProducto({ producto }) {
  const [fallo, setFallo] = useState(false);

  useEffect(() => {
    setFallo(false);
  }, [producto.rutaImagen]);

  return (
    <div className="ap-imagen">
      {producto.rutaImagen && !fallo ? (
        <img
          src={producto.rutaImagen}
          alt={producto.nombre}
          loading="lazy"
          onError={() => setFallo(true)}
        />
      ) : (
        <i className="bi bi-box-seam" />
      )}
    </div>
  );
}

export default function AdministrarProductos() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [tiendas, setTiendas] = useState([]);

  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [errorModal, setErrorModal] = useState("");

  const [busqueda, setBusqueda] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [filtroTienda, setFiltroTienda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [pagina, setPagina] = useState(1);

  const [editar, setEditar] = useState(null);
  const [eliminar, setEliminar] = useState(null);
  const [formulario, setFormulario] = useState({});

  const cargarDatos = async () => {
    setCargando(true);
    setError("");

    try {
      const resultados = await Promise.allSettled([
        obtenerProductos(),
        obtenerCategorias(),
        obtenerTiendas()
      ]);

      if (resultados[0].status !== "fulfilled") {
        throw resultados[0].reason;
      }

      setProductos(
        Array.isArray(resultados[0].value)
          ? resultados[0].value
          : []
      );

      setCategorias(
        resultados[1].status === "fulfilled" &&
        Array.isArray(resultados[1].value)
          ? resultados[1].value
          : []
      );

      setTiendas(
        resultados[2].status === "fulfilled" &&
        Array.isArray(resultados[2].value)
          ? resultados[2].value
          : []
      );
    } catch (err) {
      setError(
        err?.message ||
        "No se pudo cargar el catálogo de productos."
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
  }, [
    busqueda,
    filtroCategoria,
    filtroTienda,
    filtroEstado
  ]);

  const categoriasMapa = useMemo(
    () => new Map(
      categorias.map(c => [
        Number(c.idCategoria),
        c.descripcion
      ])
    ),
    [categorias]
  );

  const tiendasMapa = useMemo(
    () => new Map(
      tiendas.map(t => [
        Number(t.idTienda),
        t.nombreNegocio
      ])
    ),
    [tiendas]
  );

  const resumen = useMemo(() => ({
    total: productos.length,
    activos: productos.filter(p => p.activo === true).length,
    sinStock: productos.filter(
      p => Number(p.stock || 0) <= 0
    ).length,
    stockBajo: productos.filter(
      p => Number(p.stock || 0) > 0 &&
        Number(p.stock || 0) <= 5
    ).length
  }), [productos]);

  const filtrados = useMemo(() => {
    const termino = normalizar(busqueda.trim());

    return productos.filter(producto => {
      const nombreTienda = tiendasMapa.get(
        Number(producto.idTienda)
      ) || "";

      const nombreCategoria = categoriasMapa.get(
        Number(producto.idCategoria)
      ) || "";

      const contenido = normalizar([
        producto.idProducto,
        producto.nombre,
        producto.descripcion,
        producto.sku,
        nombreTienda,
        nombreCategoria
      ].join(" "));

      if (termino && !contenido.includes(termino)) {
        return false;
      }

      if (
        filtroCategoria &&
        String(producto.idCategoria) !== filtroCategoria
      ) {
        return false;
      }

      if (
        filtroTienda &&
        String(producto.idTienda) !== filtroTienda
      ) {
        return false;
      }

      if (
        filtroEstado === "activos" &&
        producto.activo !== true
      ) {
        return false;
      }

      if (
        filtroEstado === "inactivos" &&
        producto.activo === true
      ) {
        return false;
      }

      if (
        filtroEstado === "sinStock" &&
        Number(producto.stock || 0) > 0
      ) {
        return false;
      }

      if (
        filtroEstado === "stockBajo" &&
        !(
          Number(producto.stock || 0) > 0 &&
          Number(producto.stock || 0) <= 5
        )
      ) {
        return false;
      }

      return true;
    });
  }, [
    productos,
    busqueda,
    filtroCategoria,
    filtroTienda,
    filtroEstado,
    categoriasMapa,
    tiendasMapa
  ]);

  const totalPaginas = Math.max(
    1,
    Math.ceil(filtrados.length / POR_PAGINA)
  );

  const paginaActual = Math.min(pagina, totalPaginas);
  const inicio = (paginaActual - 1) * POR_PAGINA;

  const paginaDatos = filtrados.slice(
    inicio,
    inicio + POR_PAGINA
  );

  const abrirEditar = producto => {
    setErrorModal("");

    setFormulario({
      nombre: producto.nombre || "",
      descripcion: producto.descripcion || "",
      sku: producto.sku || "",
      rutaImagen: producto.rutaImagen || "",
      idCategoria: String(producto.idCategoria || ""),
      precio: String(producto.precio ?? ""),
      stock: String(producto.stock ?? ""),
      activo: producto.activo === true
    });

    setEditar(producto);
  };

  const cerrarModal = () => {
    if (procesando) return;

    setEditar(null);
    setEliminar(null);
    setErrorModal("");
  };

  const cambiarCampo = (campo, valor) => {
    setFormulario(prev => ({
      ...prev,
      [campo]: valor
    }));
    setErrorModal("");
  };

  useEffect(() => {
    if (!editar && !eliminar) return;

    const anterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = evento => {
      if (evento.key === "Escape" && !procesando) {
        cerrarModal();
      }
    };

    document.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = anterior;
      document.removeEventListener("keydown", onKey);
    };
  }, [editar, eliminar, procesando]);

  const guardar = async evento => {
    evento.preventDefault();
    if (!editar || procesando) return;

    const precio = Number(formulario.precio);
    const stock = Number(formulario.stock);
    const idCategoria = Number(formulario.idCategoria);

    if (formulario.nombre.trim().length < 2) {
      setErrorModal("El nombre debe tener al menos 2 caracteres.");
      return;
    }

    if (
      formulario.precio === "" ||
      !Number.isFinite(precio) ||
      precio < 0
    ) {
      setErrorModal("Introduce un precio válido.");
      return;
    }

    if (
      formulario.stock === "" ||
      !Number.isInteger(stock) ||
      stock < 0
    ) {
      setErrorModal(
        "El stock debe ser un número entero no negativo."
      );
      return;
    }

    if (
      !categorias.some(
        c => Number(c.idCategoria) === idCategoria
      )
    ) {
      setErrorModal("Selecciona una categoría válida.");
      return;
    }

    if (formulario.rutaImagen.trim()) {
      try {
        const url = new URL(formulario.rutaImagen.trim());

        if (!["http:", "https:"].includes(url.protocol)) {
          throw new Error();
        }
      } catch {
        setErrorModal(
          "La imagen debe tener una URL http:// o https://."
        );
        return;
      }
    }

    const payload = {
      nombre: formulario.nombre.trim(),
      descripcion: formulario.descripcion.trim() || null,
      sku: formulario.sku.trim() || null,
      rutaImagen: formulario.rutaImagen.trim() || null,
      idCategoria,
      precio,
      stock,
      activo: formulario.activo
    };

    setProcesando(true);
    setErrorModal("");

    try {
      await actualizarProductos(
        editar.idProducto,
        payload
      );

      const datos = await obtenerProductos();
      setProductos(Array.isArray(datos) ? datos : []);

      setMensaje("Producto actualizado correctamente.");
      setEditar(null);
    } catch (err) {
      setErrorModal(
        err?.message ||
        "No se pudo actualizar el producto."
      );
    } finally {
      setProcesando(false);
    }
  };

  const borrar = async () => {
    if (!eliminar || procesando) return;

    setProcesando(true);
    setErrorModal("");

    try {
      await eliminarProductos(eliminar.idProducto);

      setProductos(prev =>
        prev.filter(
          p => p.idProducto !== eliminar.idProducto
        )
      );

      setMensaje("Producto eliminado correctamente.");
      setEliminar(null);
    } catch (err) {
      setErrorModal(
        err?.message ||
        "No se pudo eliminar. El producto podría tener " +
        "registros de inventario, ventas o pedidos asociados."
      );
    } finally {
      setProcesando(false);
    }
  };

  return (
    <main className="ap-pagina">
      <div className="ap-contenedor">
        <header className="ap-header">
          <div>
            <span className="ap-eyebrow">
              ADMINISTRACIÓN · CATÁLOGO
            </span>
            <h1>
              <i className="bi bi-box-seam" />
              Productos
            </h1>
            <p>
              Supervisa precios, inventario, categorías
              y disponibilidad del catálogo.
            </p>
          </div>

          <button
            type="button"
            className="ap-btn secundario"
            onClick={cargarDatos}
            disabled={cargando}
          >
            <i className="bi bi-arrow-clockwise" />
            Actualizar
          </button>
        </header>

        {mensaje && (
          <div className="ap-alerta exito" role="status">
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
          <div className="ap-alerta error" role="alert">
            <i className="bi bi-exclamation-triangle" />
            {error}
          </div>
        )}

        <section className="ap-resumen">
          {[
            {
              titulo: "Productos",
              valor: resumen.total,
              icono: "bi-boxes",
              tono: "azul"
            },
            {
              titulo: "Activos",
              valor: resumen.activos,
              icono: "bi-check-circle",
              tono: "verde"
            },
            {
              titulo: "Sin existencias",
              valor: resumen.sinStock,
              icono: "bi-exclamation-triangle",
              tono: "rojo"
            },
            {
              titulo: "Stock bajo (1–5)",
              valor: resumen.stockBajo,
              icono: "bi-box-seam",
              tono: "naranja"
            }
          ].map(kpi => (
            <article key={kpi.titulo}>
              <span className={`ap-icono ${kpi.tono}`}>
                <i className={`bi ${kpi.icono}`} />
              </span>
              <div>
                <small>{kpi.titulo}</small>
                <strong>{kpi.valor}</strong>
              </div>
            </article>
          ))}
        </section>

        <section className="ap-panel">
          <div className="ap-panel-header">
            <div>
              <h2>Catálogo general</h2>
              <p>{filtrados.length} productos encontrados</p>
            </div>

            <span className="ap-nota">
              <i className="bi bi-info-circle" />
              Los vendedores crean los productos
            </span>
          </div>

          <div className="ap-filtros">
            <label className="ap-buscador">
              <i className="bi bi-search" />
              <input
                type="search"
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                placeholder="Producto, SKU, tienda..."
                aria-label="Buscar productos"
              />
            </label>

            <select
              value={filtroTienda}
              onChange={e => setFiltroTienda(e.target.value)}
              aria-label="Filtrar por tienda"
            >
              <option value="">Todas las tiendas</option>
              {tiendas.map(tienda => (
                <option
                  key={tienda.idTienda}
                  value={tienda.idTienda}
                >
                  {tienda.nombreNegocio}
                </option>
              ))}
            </select>

            <select
              value={filtroCategoria}
              onChange={e => setFiltroCategoria(e.target.value)}
              aria-label="Filtrar por categoría"
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
              value={filtroEstado}
              onChange={e => setFiltroEstado(e.target.value)}
              aria-label="Filtrar por disponibilidad"
            >
              <option value="todos">Todos los productos</option>
              <option value="activos">Activos</option>
              <option value="inactivos">Inactivos</option>
              <option value="sinStock">Sin existencias</option>
              <option value="stockBajo">Stock bajo (1–5)</option>
            </select>
          </div>

          {cargando ? (
            <div className="ap-vacio">
              <span className="spinner-border text-primary" />
              Cargando catálogo...
            </div>
          ) : filtrados.length === 0 ? (
            <div className="ap-vacio">
              <i className="bi bi-box-seam" />
              <strong>No se encontraron productos</strong>
              <span>
                Prueba cambiando los filtros.
              </span>
            </div>
          ) : (
            <>
              <div className="ap-tabla-scroll">
                <table className="ap-tabla">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Tienda</th>
                      <th>Categoría</th>
                      <th>Precio</th>
                      <th>Stock</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginaDatos.map(producto => {
                      const stock = Number(producto.stock || 0);

                      return (
                        <tr key={producto.idProducto}>
                          <td>
                            <div className="ap-producto">
                              <ImagenProducto
                                producto={producto}
                              />
                              <div>
                                <strong>
                                  {producto.nombre}
                                </strong>
                                <small>
                                  #{producto.idProducto}
                                  {producto.sku
                                    ? ` · SKU ${producto.sku}`
                                    : ""}
                                </small>
                              </div>
                            </div>
                          </td>

                          <td>
                            {tiendasMapa.get(
                              Number(producto.idTienda)
                            ) ||
                            `Tienda #${producto.idTienda}`}
                          </td>

                          <td>
                            {categoriasMapa.get(
                              Number(producto.idCategoria)
                            ) ||
                            `Categoría #${producto.idCategoria}`}
                          </td>

                          <td className="ap-precio">
                            {dinero(producto.precio)}
                          </td>

                          <td>
                            <span
                              className={
                                stock === 0
                                  ? "ap-stock agotado"
                                  : stock <= 5
                                    ? "ap-stock bajo"
                                    : "ap-stock normal"
                              }
                            >
                              {stock} unidades
                            </span>
                          </td>

                          <td>
                            <span
                              className={
                                producto.activo
                                  ? "ap-estado activo"
                                  : "ap-estado inactivo"
                              }
                            >
                              {producto.activo
                                ? "Activo"
                                : "Inactivo"}
                            </span>
                          </td>

                          <td>
                            <div className="ap-acciones">
                              <button
                                type="button"
                                className="ap-accion editar"
                                onClick={() =>
                                  abrirEditar(producto)
                                }
                              >
                                <i className="bi bi-pencil-square" />
                                Editar
                              </button>

                              <button
                                type="button"
                                className="ap-accion eliminar"
                                onClick={() => {
                                  setErrorModal("");
                                  setEliminar(producto);
                                }}
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

              <div className="ap-paginacion">
                <span>
                  Mostrando {inicio + 1}–
                  {Math.min(
                    inicio + POR_PAGINA,
                    filtrados.length
                  )} de {filtrados.length}
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

      {/* EDITAR */}

      {editar && (
        <div className="ap-modal-fondo">
          <div
            className="ap-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ap-editar-titulo"
          >
            <header className="ap-modal-header">
              <div>
                <span>CATÁLOGO</span>
                <h2 id="ap-editar-titulo">
                  Editar producto #{editar.idProducto}
                </h2>
              </div>
              <button
                type="button"
                onClick={cerrarModal}
                disabled={procesando}
                aria-label="Cerrar"
              >
                <i className="bi bi-x-lg" />
              </button>
            </header>

            <form onSubmit={guardar} noValidate>
              <div className="ap-modal-body">
                {errorModal && (
                  <div className="ap-alerta error" role="alert">
                    {errorModal}
                  </div>
                )}

                <div className="ap-campos">
                  <div className="ap-campo ap-completo">
                    <label htmlFor="ap-nombre">
                      Nombre *
                    </label>
                    <input
                      id="ap-nombre"
                      value={formulario.nombre}
                      onChange={e =>
                        cambiarCampo("nombre", e.target.value)
                      }
                      disabled={procesando}
                      maxLength={150}
                    />
                  </div>

                  <div className="ap-campo ap-completo">
                    <label htmlFor="ap-descripcion">
                      Descripción
                    </label>
                    <textarea
                      id="ap-descripcion"
                      rows={3}
                      value={formulario.descripcion}
                      onChange={e =>
                        cambiarCampo(
                          "descripcion",
                          e.target.value
                        )
                      }
                      disabled={procesando}
                    />
                  </div>

                  <div className="ap-campo">
                    <label htmlFor="ap-sku">
                      SKU
                    </label>
                    <input
                      id="ap-sku"
                      value={formulario.sku}
                      onChange={e =>
                        cambiarCampo("sku", e.target.value)
                      }
                      disabled={procesando}
                    />
                  </div>

                  <div className="ap-campo">
                    <label htmlFor="ap-categoria">
                      Categoría *
                    </label>
                    <select
                      id="ap-categoria"
                      value={formulario.idCategoria}
                      onChange={e =>
                        cambiarCampo(
                          "idCategoria",
                          e.target.value
                        )
                      }
                      disabled={procesando}
                    >
                      <option value="">
                        Selecciona una categoría
                      </option>
                      {categorias.map(categoria => (
                        <option
                          value={categoria.idCategoria}
                          key={categoria.idCategoria}
                        >
                          {categoria.descripcion}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="ap-campo">
                    <label htmlFor="ap-precio">
                      Precio (USD) *
                    </label>
                    <input
                      id="ap-precio"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formulario.precio}
                      onChange={e =>
                        cambiarCampo("precio", e.target.value)
                      }
                      disabled={procesando}
                    />
                  </div>

                  <div className="ap-campo">
                    <label htmlFor="ap-stock">
                      Stock *
                    </label>
                    <input
                      id="ap-stock"
                      type="number"
                      min="0"
                      step="1"
                      value={formulario.stock}
                      onChange={e =>
                        cambiarCampo("stock", e.target.value)
                      }
                      disabled={procesando}
                    />
                    <small>
                      Los cambios de stock generan movimientos
                      de inventario en el backend.
                    </small>
                  </div>

                  <div className="ap-campo ap-completo">
                    <label htmlFor="ap-imagen">
                      URL de la imagen
                    </label>
                    <input
                      id="ap-imagen"
                      type="url"
                      value={formulario.rutaImagen}
                      onChange={e =>
                        cambiarCampo(
                          "rutaImagen",
                          e.target.value
                        )
                      }
                      placeholder="https://..."
                      disabled={procesando}
                    />
                  </div>

                  <label className="ap-check ap-completo">
                    <input
                      type="checkbox"
                      checked={formulario.activo}
                      onChange={e =>
                        cambiarCampo(
                          "activo",
                          e.target.checked
                        )
                      }
                      disabled={procesando}
                    />
                    <span>
                      <strong>Producto activo</strong>
                      <small>
                        Desactívalo para retirarlo
                        del catálogo público.
                      </small>
                    </span>
                  </label>

                  <div className="ap-nota ap-completo">
                    <i className="bi bi-lock" />
                    Tienda:{" "}
                    {tiendasMapa.get(
                      Number(editar.idTienda)
                    ) || `#${editar.idTienda}`}
                    . La propiedad del producto no se modifica.
                  </div>
                </div>
              </div>

              <footer className="ap-modal-footer">
                <button
                  className="ap-btn secundario"
                  type="button"
                  onClick={cerrarModal}
                  disabled={procesando}
                >
                  Cancelar
                </button>
                <button
                  className="ap-btn primario"
                  type="submit"
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

      {/* ELIMINAR */}

      {eliminar && (
        <div className="ap-modal-fondo">
          <div
            className="ap-modal ap-modal-pequeno"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="ap-eliminar-titulo"
          >
            <div className="ap-confirmacion">
              <i className="bi bi-exclamation-triangle" />
              <h2 id="ap-eliminar-titulo">
                ¿Eliminar producto?
              </h2>
              <p>
                Vas a eliminar{" "}
                <strong>{eliminar.nombre}</strong>.
                Esta operación puede afectar inventario
                e historial de ventas.
              </p>

              {errorModal && (
                <div className="ap-alerta error">
                  {errorModal}
                </div>
              )}

              <div className="ap-modal-footer">
                <button
                  type="button"
                  className="ap-btn secundario"
                  onClick={cerrarModal}
                  disabled={procesando}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="ap-btn peligro"
                  onClick={borrar}
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
