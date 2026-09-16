import React, { useEffect, useState } from "react";

import {
  obtenerProductosPorVendedor,
  crearProductos,
  actualizarProductos,
  eliminarProductos,
  obtenerCategorias,
  obtenerTiendasPorVendedor
} from "../../services/data";

import "./VendedorPagesCss/VendedorProductos.css";


export default function VendedorProductos() {

  const vendedorId =
    localStorage.getItem("idVendedor") || "";

  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [tiendas, setTiendas] = useState([]);

  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);

  const [busqueda, setBusqueda] = useState("");


  const crearProductoVacio = () => ({
    idProducto: "",
    nombre: "",
    descripcion: "",
    idTienda:
      tiendas.length > 0
        ? tiendas[0].idTienda
        : "",
    idCategoria: "",
    precio: "",
    stock: "",
    sku: "",
    rutaImagen: "",
    activo: true,
    idVendedor: vendedorId,
  });


  const [productoActual, setProductoActual] =
    useState(crearProductoVacio());


  useEffect(() => {

    const fetchDatos = async () => {

      try {

        const [
          dataTiendas,
          dataCategorias,
          dataProductos
        ] = await Promise.all([
          obtenerTiendasPorVendedor(vendedorId),
          obtenerCategorias(),
          obtenerProductosPorVendedor(vendedorId)
        ]);

        setTiendas(dataTiendas);
        setCategorias(dataCategorias);
        setProductos(dataProductos);

      } catch (err) {

        console.error(err);

        setError(
          "Error al cargar los productos."
        );
      }
    };


    if (vendedorId) {
      fetchDatos();
    }

  }, [vendedorId]);


  const manejarAbrirModalCrear = () => {

    setModoEdicion(false);

    setProductoActual({
      ...crearProductoVacio(),
      idTienda:
        tiendas.length > 0
          ? tiendas[0].idTienda
          : ""
    });

    setError("");
    setShowModal(true);
  };


  const manejarEditarProducto = (
    producto
  ) => {

    setModoEdicion(true);

    setProductoActual({
      ...producto,
      idTienda:
        producto.idTienda ?? "",
      idCategoria:
        producto.idCategoria ?? "",
      precio:
        producto.precio ?? "",
      stock:
        producto.stock ?? 0,
      rutaImagen:
        producto.rutaImagen ?? "",
      sku:
        producto.sku ?? "",
      activo:
        producto.activo ?? true
    });

    setError("");
    setShowModal(true);
  };


  const manejarGuardarCambios =
    async () => {

      if (
        !productoActual.nombre ||
        !productoActual.idTienda ||
        !productoActual.idCategoria ||
        productoActual.precio === ""
      ) {

        setError(
          "Completa todos los campos obligatorios."
        );

        return;
      }


      const productoProcesado = {
        ...productoActual,

        idTienda:
          Number(productoActual.idTienda),

        idCategoria:
          Number(productoActual.idCategoria),

        precio:
          Number(productoActual.precio),

        stock:
          Number(productoActual.stock || 0),

        sku:
          productoActual.sku?.trim()
            ? productoActual.sku.trim()
            : `SKU-${Date.now()}`,

        rutaImagen:
          productoActual.rutaImagen?.trim()
            ? productoActual.rutaImagen.trim()
            : "",

        activo:
          Boolean(productoActual.activo)
      };


      try {

        if (modoEdicion) {

          await actualizarProductos(
            productoActual.idProducto,
            productoProcesado
          );

          setMensaje(
            "Producto actualizado correctamente."
          );

        } else {

          await crearProductos(
            productoProcesado
          );

          setMensaje(
            "Producto creado correctamente."
          );
        }


        const dataProductos =
          await obtenerProductosPorVendedor(
            vendedorId
          );

        setProductos(dataProductos);

        setShowModal(false);
        setError("");


        setTimeout(
          () => setMensaje(""),
          3000
        );

      } catch (err) {

        console.error(err);

        setError(
          err.message ||
          "Error al guardar el producto."
        );

        setTimeout(
          () => setError(""),
          3000
        );
      }
    };


  const manejarEliminarProducto =
    async (id) => {

      const confirmar =
        window.confirm(
          "¿Estás seguro de eliminar este producto?"
        );


      if (!confirmar) {
        return;
      }


      try {

        await eliminarProductos(id);

        setProductos(prev =>
          prev.filter(
            producto =>
              producto.idProducto !== id
          )
        );

        setMensaje(
          "Producto eliminado correctamente."
        );

        setTimeout(
          () => setMensaje(""),
          3000
        );

      } catch (err) {

        console.error(err);

        setError(
          err.message ||
          "Error al eliminar el producto."
        );

        setTimeout(
          () => setError(""),
          3000
        );
      }
    };


  const obtenerTienda = idTienda =>
    tiendas.find(
      tienda =>
        Number(tienda.idTienda) ===
        Number(idTienda)
    )?.nombreNegocio ||
    "Sin tienda";


  const obtenerCategoria = idCategoria =>
    categorias.find(
      categoria =>
        Number(categoria.idCategoria) ===
        Number(idCategoria)
    )?.descripcion ||
    "Sin categoría";


  const productosFiltrados =
    productos.filter(producto => {

      const texto =
        `${producto.nombre} ${producto.sku || ""}`
          .toLowerCase();

      return texto.includes(
        busqueda.toLowerCase()
      );
    });


  const productosActivos =
    productos.filter(
      producto =>
        producto.activo
    ).length;


  const productosSinStock =
    productos.filter(
      producto =>
        Number(producto.stock) <= 0
    ).length;


  return (

    <div className="productos-page">

      <div className="productos-container">


        {/* HEADER */}

        <div className="productos-header">

          <div>

            <span className="productos-eyebrow">
              GESTIÓN DE INVENTARIO
            </span>

            <h1>
              Mis productos
            </h1>

            <p>
              Administra el catálogo,
              precios, existencias y estado
              de tus productos.
            </p>

          </div>


          <button
            className="productos-btn-primary"
            onClick={
              manejarAbrirModalCrear
            }
          >

            <i className="bi bi-plus-lg"></i>

            Nuevo producto

          </button>

        </div>


        {/* ALERTAS */}

        {mensaje && (

          <div className="productos-alert productos-alert-success">

            <i className="bi bi-check-circle"></i>

            {mensaje}

          </div>
        )}


        {error && !showModal && (

          <div className="productos-alert productos-alert-error">

            <i className="bi bi-exclamation-circle"></i>

            {error}

          </div>
        )}


        {/* RESUMEN */}

        <div className="productos-summary">

          <div className="productos-summary-card">

            <span>
              Productos registrados
            </span>

            <strong>
              {productos.length}
            </strong>

            <i className="bi bi-box-seam"></i>

          </div>


          <div className="productos-summary-card">

            <span>
              Productos activos
            </span>

            <strong>
              {productosActivos}
            </strong>

            <i className="bi bi-check-circle"></i>

          </div>


          <div className="productos-summary-card">

            <span>
              Sin existencias
            </span>

            <strong>
              {productosSinStock}
            </strong>

            <i className="bi bi-exclamation-triangle"></i>

          </div>

        </div>


        {/* TABLA */}

        <section className="productos-card">

          <div className="productos-card-header">

            <div>

              <h2>
                Catálogo de productos
              </h2>

              <p>
                Productos registrados
                en tus tiendas
              </p>

            </div>


            <div className="productos-search">

              <i className="bi bi-search"></i>

              <input
                type="text"
                placeholder="Buscar producto..."
                value={busqueda}
                onChange={e =>
                  setBusqueda(
                    e.target.value
                  )
                }
              />

            </div>

          </div>


          {productosFiltrados.length === 0 ? (

            <div className="productos-empty">

              <i className="bi bi-box"></i>

              <h3>
                No hay productos
              </h3>

              <p>
                Registra un producto
                para comenzar tu catálogo.
              </p>

            </div>

          ) : (

            <div className="table-responsive">

              <table className="productos-table">

                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>SKU</th>
                    <th>Tienda</th>
                    <th>Categoría</th>
                    <th>Precio</th>
                    <th>Stock</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>


                <tbody>

                  {productosFiltrados.map(
                    producto => (

                      <tr
                        key={
                          producto.idProducto
                        }
                      >

                        <td>

                          <div className="producto-info">

                            <div className="producto-thumb">

                              {producto.rutaImagen ? (

                                <img
                                  src={
                                    producto.rutaImagen
                                  }
                                  alt={
                                    producto.nombre
                                  }
                                  onError={e => {
                                    e.currentTarget.style.display =
                                      "none";
                                  }}
                                />

                              ) : (

                                <i className="bi bi-image"></i>
                              )}

                            </div>


                            <div>

                              <strong>
                                {producto.nombre}
                              </strong>

                              <small>
                                {
                                  producto.descripcion ||
                                  "Sin descripción"
                                }
                              </small>

                            </div>

                          </div>

                        </td>


                        <td>
                          {
                            producto.sku ||
                            "—"
                          }
                        </td>


                        <td>
                          {
                            obtenerTienda(
                              producto.idTienda
                            )
                          }
                        </td>


                        <td>
                          {
                            obtenerCategoria(
                              producto.idCategoria
                            )
                          }
                        </td>


                        <td className="producto-precio">

                          $
                          {Number(
                            producto.precio || 0
                          ).toFixed(2)}

                        </td>


                        <td>

                          <span
                            className={
                              Number(
                                producto.stock
                              ) <= 0
                                ? "producto-stock agotado"
                                : Number(
                                    producto.stock
                                  ) <= 5
                                  ? "producto-stock bajo"
                                  : "producto-stock"
                            }
                          >

                            {producto.stock}

                          </span>

                        </td>


                        <td>

                          <span
                            className={
                              producto.activo
                                ? "producto-status activo"
                                : "producto-status inactivo"
                            }
                          >

                            {
                              producto.activo
                                ? "Activo"
                                : "Inactivo"
                            }

                          </span>

                        </td>


                        <td>

                          <div className="producto-actions">

                            <button
                              className="producto-action editar"
                              title="Editar"
                              onClick={() =>
                                manejarEditarProducto(
                                  producto
                                )
                              }
                            >

                              <i className="bi bi-pencil"></i>

                            </button>


                            <button
                              className="producto-action eliminar"
                              title="Eliminar"
                              onClick={() =>
                                manejarEliminarProducto(
                                  producto.idProducto
                                )
                              }
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

            </div>
          )}

        </section>


        {/* MODAL */}

        {showModal && (

          <div className="productos-modal-backdrop">

            <div className="productos-modal">

              <div className="productos-modal-header">

                <div>

                  <span>
                    {
                      modoEdicion
                        ? "ACTUALIZAR PRODUCTO"
                        : "NUEVO PRODUCTO"
                    }
                  </span>

                  <h2>
                    {
                      modoEdicion
                        ? "Editar producto"
                        : "Crear producto"
                    }
                  </h2>

                </div>


                <button
                  className="productos-modal-close"
                  onClick={() =>
                    setShowModal(false)
                  }
                >

                  <i className="bi bi-x-lg"></i>

                </button>

              </div>


              {error && (

                <div className="productos-alert productos-alert-error">
                  {error}
                </div>
              )}


              <div className="productos-form-grid">


                <div className="productos-field span-2">

                  <label>
                    Nombre *
                  </label>

                  <input
                    type="text"
                    value={
                      productoActual.nombre
                    }
                    onChange={e =>
                      setProductoActual({
                        ...productoActual,
                        nombre:
                          e.target.value
                      })
                    }
                  />

                </div>


                <div className="productos-field span-2">

                  <label>
                    Descripción
                  </label>

                  <textarea
                    value={
                      productoActual.descripcion || ""
                    }
                    onChange={e =>
                      setProductoActual({
                        ...productoActual,
                        descripcion:
                          e.target.value
                      })
                    }
                  />

                </div>


                <div className="productos-field">

                  <label>
                    SKU
                  </label>

                  <input
                    type="text"
                    value={
                      productoActual.sku || ""
                    }
                    onChange={e =>
                      setProductoActual({
                        ...productoActual,
                        sku:
                          e.target.value
                      })
                    }
                    placeholder="Automático si se deja vacío"
                  />

                </div>


                <div className="productos-field">

                  <label>
                    Precio *
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={
                      productoActual.precio
                    }
                    onChange={e =>
                      setProductoActual({
                        ...productoActual,
                        precio:
                          e.target.value
                      })
                    }
                  />

                </div>


                <div className="productos-field">

                  <label>
                    Stock
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={
                      productoActual.stock
                    }
                    onChange={e =>
                      setProductoActual({
                        ...productoActual,
                        stock:
                          e.target.value
                      })
                    }
                  />

                </div>


                <div className="productos-field">

                  <label>
                    Tienda *
                  </label>

                  <select
                    value={
                      productoActual.idTienda
                    }
                    onChange={e =>
                      setProductoActual({
                        ...productoActual,
                        idTienda:
                          e.target.value
                      })
                    }
                  >

                    <option value="">
                      Selecciona una tienda
                    </option>

                    {tiendas.map(
                      tienda => (

                        <option
                          key={
                            tienda.idTienda
                          }
                          value={
                            tienda.idTienda
                          }
                        >

                          {
                            tienda.nombreNegocio
                          }

                        </option>

                      )
                    )}

                  </select>

                </div>


                <div className="productos-field">

                  <label>
                    Categoría *
                  </label>

                  <select
                    value={
                      productoActual.idCategoria
                    }
                    onChange={e =>
                      setProductoActual({
                        ...productoActual,
                        idCategoria:
                          e.target.value
                      })
                    }
                  >

                    <option value="">
                      Selecciona una categoría
                    </option>

                    {categorias.map(
                      categoria => (

                        <option
                          key={
                            categoria.idCategoria
                          }
                          value={
                            categoria.idCategoria
                          }
                        >

                          {
                            categoria.descripcion
                          }

                        </option>

                      )
                    )}

                  </select>

                </div>


                <div className="productos-field span-2">

                  <label>
                    URL de imagen
                  </label>

                  <input
                    type="text"
                    value={
                      productoActual.rutaImagen || ""
                    }
                    onChange={e =>
                      setProductoActual({
                        ...productoActual,
                        rutaImagen:
                          e.target.value
                      })
                    }
                    placeholder="https://..."
                  />

                </div>


                <div className="productos-field span-2">

                  <label className="productos-switch">

                    <input
                      type="checkbox"
                      checked={
                        productoActual.activo
                      }
                      onChange={e =>
                        setProductoActual({
                          ...productoActual,
                          activo:
                            e.target.checked
                        })
                      }
                    />

                    <span className="productos-switch-ui"></span>

                    <div>

                      <strong>
                        Producto activo
                      </strong>

                      <small>
                        Los productos inactivos
                        no estarán disponibles
                        para los clientes.
                      </small>

                    </div>

                  </label>

                </div>

              </div>


              <div className="productos-modal-actions">

                <button
                  className="productos-btn-secondary"
                  onClick={() =>
                    setShowModal(false)
                  }
                >
                  Cancelar
                </button>


                <button
                  className="productos-btn-primary"
                  onClick={
                    manejarGuardarCambios
                  }
                >

                  <i className="bi bi-check-lg"></i>

                  {
                    modoEdicion
                      ? "Guardar cambios"
                      : "Crear producto"
                  }

                </button>

              </div>

            </div>

          </div>
        )}

      </div>

    </div>
  );
}