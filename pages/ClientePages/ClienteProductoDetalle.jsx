import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  obtenerProductosPorId,
  obtenerFavoritosPorCliente,
  agregarFavorito,
  eliminarFavorito,
  obtenerResenasPorProducto,
  agregarResena,
  obtenerTiendaPorId,
  agregarCarrito,
  obtenerPromocionActiva
} from "../../services/data";
import "./ClientePagesCss/ClienteProductoDetail.css";

const moneda = valor => `$${Number(valor ?? 0).toFixed(2)}`;
const valorNumerico = valor => {
  const numero = Number(valor);
  return Number.isFinite(numero) ? numero : 0;
};
const favoritosNormalizados = data =>
  (Array.isArray(data) ? data : []).map(f => ({
    idProducto: f.idProducto ?? f.IdProducto,
    idFavorito: f.idFavorito ?? f.IdFavorito
  }));

const urlExternaSegura = valor => {
  if (!valor) return null;
  try {
    const url = new URL(valor);
    return ["https:", "http:"].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
};

function ImagenConRespaldo({ src, alt, className = "", icono = "bi-image" }) {
  const [fallo, setFallo] = useState(false);
  useEffect(() => setFallo(false), [src]);

  if (!src || fallo) {
    return (
      <div className={`cpd-imagen-vacia ${className}`} role="img" aria-label={`Sin imagen: ${alt}`}>
        <i className={`bi ${icono}`} aria-hidden="true" />
        <span>Imagen no disponible</span>
      </div>
    );
  }

  return <img className={className} src={src} alt={alt} onError={() => setFallo(true)} />;
}

function Estrellas({ valor = 0, interactiva = false, onChange }) {
  return (
    <div className={`cpd-estrellas ${interactiva ? "cpd-estrellas-editables" : ""}`}
      aria-label={`${valor} de 5 estrellas`}>
      {[1, 2, 3, 4, 5].map(numero => {
        const activa = numero <= Math.round(Number(valor));
        return interactiva ? (
          <button
            type="button"
            key={numero}
            onClick={() => onChange(numero)}
            className={activa ? "cpd-estrella-activa" : ""}
            aria-label={`Calificar con ${numero} estrella${numero > 1 ? "s" : ""}`}
            aria-pressed={Number(valor) === numero}
          >
            <i className={activa ? "bi bi-star-fill" : "bi bi-star"} />
          </button>
        ) : (
          <i key={numero} className={activa ? "bi bi-star-fill cpd-estrella-activa" : "bi bi-star"} aria-hidden="true" />
        );
      })}
    </div>
  );
}

export function ClienteProductoDetalles() {
  const { idProducto } = useParams();
  const idUsuario = localStorage.getItem("idUsuario");
  const resenasRef = useRef(null);

  const [producto, setProducto] = useState(null);
  const [tienda, setTienda] = useState(null);
  const [promocion, setPromocion] = useState(null);
  const [resenas, setResenas] = useState([]);
  const [favorito, setFavorito] = useState(false);
  const [idFavorito, setIdFavorito] = useState(null);

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState({ tipo: "", texto: "" });
  const [mensajeResena, setMensajeResena] = useState({ tipo: "", texto: "" });
  const [procesandoCarrito, setProcesandoCarrito] = useState(false);
  const [procesandoFavorito, setProcesandoFavorito] = useState(false);
  const [agregandoResena, setAgregandoResena] = useState(false);
  const [nuevoRating, setNuevoRating] = useState(5);
  const [nuevoComentario, setNuevoComentario] = useState("");

  // El producto es el único dato imprescindible. El resto carga de forma independiente.
  useEffect(() => {
    let vigente = true;
    setCargando(true);
    setError("");
    setProducto(null);
    setTienda(null);
    setPromocion(null);
    setResenas([]);
    setFavorito(false);
    setIdFavorito(null);
    setMensaje({ tipo: "", texto: "" });
    setMensajeResena({ tipo: "", texto: "" });

    const cargar = async () => {
      try {
        const data = await obtenerProductosPorId(idProducto);
        if (!vigente) return;
        if (!data) throw new Error("No encontramos este producto.");
        setProducto(data);

        const consultas = [
          obtenerPromocionActiva(idProducto),
          obtenerResenasPorProducto(idProducto),
          data.idTienda ? obtenerTiendaPorId(data.idTienda) : Promise.resolve(null),
          idUsuario ? obtenerFavoritosPorCliente() : Promise.resolve([])
        ];
        const [promo, opiniones, datosTienda, favs] = await Promise.allSettled(consultas);
        if (!vigente) return;

        if (promo.status === "fulfilled" && promo.value?.tienePromocion) {
          setPromocion(promo.value);
        }
        if (opiniones.status === "fulfilled" && Array.isArray(opiniones.value)) {
          setResenas(opiniones.value);
        }
        if (datosTienda.status === "fulfilled") setTienda(datosTienda.value);
        if (favs.status === "fulfilled") {
          const encontrado = favoritosNormalizados(favs.value).find(
            f => Number(f.idProducto) === Number(idProducto)
          );
          setFavorito(Boolean(encontrado));
          setIdFavorito(encontrado?.idFavorito ?? null);
        }
      } catch (err) {
        if (vigente) setError(err?.message || "No se pudo cargar el producto.");
      } finally {
        if (vigente) setCargando(false);
      }
    };

    cargar();
    return () => { vigente = false; };
  }, [idProducto, idUsuario]);

  const promedio = useMemo(() => {
    if (!resenas.length) return 0;
    return resenas.reduce((total, r) => total + valorNumerico(r.calificacion), 0) / resenas.length;
  }, [resenas]);

  const precioOriginal = valorNumerico(promocion?.precioOriginal ?? producto?.precio);
  const precioFinal = valorNumerico(promocion?.precioFinal ?? producto?.precio);
  const ahorro = Math.max(0, precioOriginal - precioFinal);
  const hayDescuento = Boolean(promocion && ahorro > 0);
  const stock = Math.max(0, Math.floor(valorNumerico(producto?.stock)));
  const disponible = producto?.activo !== false && stock > 0;
  const sitioTienda = urlExternaSegura(tienda?.paginaWebUrl);
  const facebookTienda = urlExternaSegura(tienda?.facebookUrl);

  const handleFavorito = async () => {
    if (!producto || procesandoFavorito) return;
    if (!idUsuario) {
      setMensaje({ tipo: "error", texto: "Inicia sesión para guardar productos en favoritos." });
      return;
    }
    setProcesandoFavorito(true);
    setMensaje({ tipo: "", texto: "" });
    try {
      if (favorito) {
        let favoritoEliminar = idFavorito;
        if (!favoritoEliminar) {
          const datos = favoritosNormalizados(await obtenerFavoritosPorCliente());
          favoritoEliminar = datos.find(f => Number(f.idProducto) === Number(producto.idProducto))?.idFavorito;
        }
        if (!favoritoEliminar) throw new Error("No se encontró el favorito que deseas quitar.");
        await eliminarFavorito(favoritoEliminar);
        setFavorito(false);
        setIdFavorito(null);
        setMensaje({ tipo: "exito", texto: "Producto eliminado de tus favoritos." });
      } else {
        await agregarFavorito(Number(producto.idProducto));
        setFavorito(true);
        // Refrescamos el identificador para poder quitarlo después.
        try {
          const datos = favoritosNormalizados(await obtenerFavoritosPorCliente());
          setIdFavorito(datos.find(f => Number(f.idProducto) === Number(producto.idProducto))?.idFavorito ?? null);
        } catch {
          setIdFavorito(null);
        }
        setMensaje({ tipo: "exito", texto: "Producto guardado en tus favoritos." });
      }
    } catch (err) {
      setMensaje({ tipo: "error", texto: err?.message || "No se pudieron actualizar los favoritos." });
    } finally {
      setProcesandoFavorito(false);
    }
  };

  const handleAgregarCarrito = async () => {
    if (!producto || procesandoCarrito) return;
    if (!idUsuario) {
      setMensaje({ tipo: "error", texto: "Inicia sesión para agregar productos al carrito." });
      return;
    }
    if (!disponible) {
      setMensaje({ tipo: "error", texto: "Este producto no tiene existencias disponibles." });
      return;
    }

    setProcesandoCarrito(true);
    setMensaje({ tipo: "", texto: "" });
    try {
      await agregarCarrito({ idProducto: Number(producto.idProducto), cantidad: 1 });
      window.dispatchEvent(new Event("carritoActualizado"));
      setMensaje({ tipo: "exito", texto: "¡Producto agregado al carrito correctamente!" });
    } catch (err) {
      setMensaje({ tipo: "error", texto: err?.message || "No se pudo agregar al carrito." });
    } finally {
      setProcesandoCarrito(false);
    }
  };

  const handleAgregarResena = async event => {
    event.preventDefault();
    setMensajeResena({ tipo: "", texto: "" });
    if (!idUsuario) {
      setMensajeResena({ tipo: "error", texto: "Debes iniciar sesión para publicar una reseña." });
      return;
    }
    const comentario = nuevoComentario.trim();
    if (!comentario || comentario.length > 1000) {
      setMensajeResena({ tipo: "error", texto: "Escribe un comentario de 1 a 1000 caracteres." });
      return;
    }
    if (!Number.isInteger(Number(nuevoRating)) || Number(nuevoRating) < 1 || Number(nuevoRating) > 5) {
      setMensajeResena({ tipo: "error", texto: "Selecciona una calificación entre 1 y 5 estrellas." });
      return;
    }

    setAgregandoResena(true);
    try {
      await agregarResena({
        idProducto: Number(producto.idProducto),
        calificacion: Number(nuevoRating),
        comentario
      });
      setNuevoComentario("");
      setNuevoRating(5);
      setMensajeResena({ tipo: "exito", texto: "¡Tu reseña se publicó correctamente!" });

      // La reseña ya se guardó: un fallo al recargar no debe presentarse como fallo al publicar.
      try {
        const actualizadas = await obtenerResenasPorProducto(idProducto);
        if (Array.isArray(actualizadas)) setResenas(actualizadas);
      } catch (err) {
        console.warn("Reseña publicada; no fue posible actualizar la lista:", err);
      }
    } catch (err) {
      setMensajeResena({ tipo: "error", texto: err?.message || "No se pudo publicar la reseña." });
    } finally {
      setAgregandoResena(false);
    }
  };

  if (cargando) {
    return (
      <main className="cpd-pagina">
        <div className="cpd-estado" role="status">
          <div className="spinner-border text-primary" />
          <h2>Cargando producto...</h2>
          <p>Estamos preparando los detalles para ti.</p>
        </div>
      </main>
    );
  }

  if (error || !producto) {
    return (
      <main className="cpd-pagina">
        <div className="cpd-estado">
          <i className="bi bi-exclamation-circle" />
          <h2>No pudimos mostrar el producto</h2>
          <p>{error || "El producto no está disponible."}</p>
          <Link to="/cliente" className="cpd-boton-primario">Volver al catálogo</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="cpd-pagina">
      <div className="cpd-contenedor">
        <nav className="cpd-migas" aria-label="Navegación">
          <Link to="/cliente"><i className="bi bi-house" /> Inicio</Link>
          <i className="bi bi-chevron-right" aria-hidden="true" />
          <span>{producto.nombre}</span>
        </nav>

        <div className="cpd-grid">
          <section className="cpd-galeria cpd-panel" aria-label="Imagen del producto">
            <div className="cpd-imagen-principal">
              <ImagenConRespaldo
                src={producto.rutaImagen}
                alt={`Imagen de ${producto.nombre}`}
                className="cpd-foto-producto"
              />
              {hayDescuento && (
                <span className="cpd-badge-descuento">
                  <i className="bi bi-tag-fill" /> -{valorNumerico(promocion.descuento)}%
                </span>
              )}
              {!disponible && <span className="cpd-badge-agotado">No disponible</span>}
            </div>
            <div className="cpd-galeria-pie">
              <i className="bi bi-image" /> Imagen del producto
            </div>
          </section>

          <section className="cpd-informacion cpd-panel">
            <span className="cpd-eyebrow">CHIRINGUITO CHATARRA · PRODUCTO</span>
            <h1>{producto.nombre}</h1>
            {producto.sku && <span className="cpd-sku">Código SKU: {producto.sku}</span>}

            <button
              type="button"
              className="cpd-rating-resumen"
              onClick={() => resenasRef.current?.scrollIntoView({ behavior: "smooth" })}
            >
              <Estrellas valor={promedio} />
              <strong>{resenas.length ? promedio.toFixed(1) : "Sin calificar"}</strong>
              <span>({resenas.length} {resenas.length === 1 ? "reseña" : "reseñas"})</span>
              <i className="bi bi-arrow-down-short" />
            </button>

            <div className="cpd-precios">
              {hayDescuento && <span className="cpd-precio-anterior">{moneda(precioOriginal)}</span>}
              <div className="cpd-precio-linea">
                <strong className="cpd-precio-actual">{moneda(precioFinal)}</strong>
                {hayDescuento && <span className="cpd-ahorro">Ahorras {moneda(ahorro)}</span>}
              </div>
              {hayDescuento && promocion.titulo && <p className="cpd-promocion-titulo">{promocion.titulo}</p>}
            </div>

            <div className="cpd-disponibilidad">
              {disponible ? (
                <><i className="bi bi-check-circle-fill" /><strong>Disponible</strong><span>{stock} unidades en stock</span></>
              ) : (
                <><i className="bi bi-exclamation-circle-fill" /><strong>Producto no disponible</strong></>
              )}
            </div>

            <div className="cpd-acciones">
              <button
                type="button"
                className="cpd-boton-primario"
                disabled={!disponible || procesandoCarrito}
                onClick={handleAgregarCarrito}
              >
                <i className="bi bi-cart-plus" />
                {procesandoCarrito ? "Agregando..." : disponible ? "Agregar al carrito" : "Sin existencias"}
              </button>
              <button
                type="button"
                className={`cpd-boton-favorito ${favorito ? "cpd-guardado" : ""}`}
                disabled={procesandoFavorito}
                onClick={handleFavorito}
                aria-pressed={favorito}
                title={favorito ? "Quitar de favoritos" : "Agregar a favoritos"}
              >
                <i className={favorito ? "bi bi-heart-fill" : "bi bi-heart"} />
              </button>
            </div>

            {mensaje.texto && (
              <div className={`cpd-aviso cpd-aviso-${mensaje.tipo}`} role={mensaje.tipo === "error" ? "alert" : "status"}>
                <i className={`bi ${mensaje.tipo === "error" ? "bi-exclamation-circle" : "bi-check-circle"}`} />
                <span>{mensaje.texto}</span>
                <button type="button" onClick={() => setMensaje({ tipo: "", texto: "" })} aria-label="Cerrar mensaje">
                  <i className="bi bi-x-lg" />
                </button>
              </div>
            )}

            <div className="cpd-descripcion">
              <h2>Descripción</h2>
              <p>{producto.descripcion || "Este producto todavía no tiene descripción."}</p>
            </div>
            <div className="cpd-confianza">
              <i className="bi bi-shield-check" />
              <span>Disponibilidad y precio confirmados al realizar el pedido.</span>
            </div>
          </section>

          <aside className="cpd-tienda cpd-panel">
            <div className="cpd-tienda-encabezado">
              <i className="bi bi-shop-window" />
              <div><span>VENDIDO POR</span><h2>Información de la tienda</h2></div>
            </div>
            <div className="cpd-tienda-imagen">
              <ImagenConRespaldo
                src={tienda?.fotoFachadaUrl}
                alt={tienda?.nombreNegocio || "Tienda"}
                className="cpd-foto-tienda"
                icono="bi-shop"
              />
            </div>
            <h3>{tienda?.nombreNegocio || "Tienda del producto"}</h3>
            {tienda?.eslogan && <p className="cpd-tienda-eslogan">{tienda.eslogan}</p>}
            <dl className="cpd-datos-tienda">
              <div><dt><i className="bi bi-clock" /> Horario</dt><dd>{tienda?.horario || "No especificado"}</dd></div>
              <div><dt><i className="bi bi-telephone" /> Contacto</dt><dd>{tienda?.numeroContacto || "No especificado"}</dd></div>
            </dl>
            {(sitioTienda || facebookTienda) && (
              <div className="cpd-enlaces-tienda">
                {sitioTienda && <a href={sitioTienda} target="_blank" rel="noopener noreferrer"><i className="bi bi-globe" /> Sitio web <i className="bi bi-box-arrow-up-right" /></a>}
                {facebookTienda && <a href={facebookTienda} target="_blank" rel="noopener noreferrer"><i className="bi bi-facebook" /> Facebook <i className="bi bi-box-arrow-up-right" /></a>}
              </div>
            )}
            <div className="cpd-tienda-nota"><i className="bi bi-info-circle" /> El envío y la entrega se seleccionan al comprar.</div>
          </aside>
        </div>

        <section ref={resenasRef} className="cpd-resenas-seccion" id="resenas">
          <header className="cpd-resenas-titulo">
            <div>
              <span className="cpd-eyebrow">OPINIONES DE COMPRADORES</span>
              <h2>Reseñas del producto</h2>
              <p>Conoce la experiencia de otros clientes.</p>
            </div>
            <div className="cpd-promedio">
              <strong>{resenas.length ? promedio.toFixed(1) : "—"}</strong>
              <Estrellas valor={promedio} />
              <small>{resenas.length} {resenas.length === 1 ? "reseña" : "reseñas"}</small>
            </div>
          </header>

          <div className="cpd-resenas-grid">
            <div className="cpd-panel cpd-lista-resenas">
              <h3>Opiniones publicadas</h3>
              {resenas.length === 0 ? (
                <div className="cpd-sin-resenas">
                  <i className="bi bi-chat-left-heart" />
                  <strong>Todavía no hay reseñas</strong>
                  <p>La primera opinión aparecerá aquí.</p>
                </div>
              ) : (
                resenas.map((resena, indice) => (
                  <article className="cpd-resena-item" key={resena.idResena ?? resena.idResenaProducto ?? indice}>
                    <div className="cpd-resena-cabecera">
                      <div className="cpd-avatar"><i className="bi bi-person" /></div>
                      <div className="cpd-resena-autor"><strong>{resena.usuario || "Cliente"}</strong><Estrellas valor={valorNumerico(resena.calificacion)} /></div>
                      <span className="cpd-resena-nota">{valorNumerico(resena.calificacion)}/5</span>
                    </div>
                    <p>{resena.comentario || "Sin comentario."}</p>
                  </article>
                ))
              )}
            </div>

            <div className="cpd-panel cpd-formulario-resena">
              <div className="cpd-formulario-icono"><i className="bi bi-pencil-square" /></div>
              <h3>Comparte tu experiencia</h3>
              <p className="cpd-requisito">Solo puedes publicar una reseña si compraste y recibiste el producto. Se permite una reseña por producto.</p>
              <form onSubmit={handleAgregarResena}>
                <label className="cpd-label">Tu calificación</label>
                <Estrellas valor={nuevoRating} interactiva onChange={setNuevoRating} />
                <label className="cpd-label" htmlFor="cpd-comentario">Tu comentario</label>
                <textarea
                  id="cpd-comentario"
                  rows={5}
                  maxLength={1000}
                  value={nuevoComentario}
                  onChange={e => setNuevoComentario(e.target.value)}
                  placeholder="Cuéntanos qué te pareció el producto..."
                />
                <div className="cpd-contador"><span>Máximo 1000 caracteres</span><span className={nuevoComentario.length >= 950 ? "cpd-cerca-limite" : ""}>{nuevoComentario.length}/1000</span></div>
                {mensajeResena.texto && (
                  <div className={`cpd-aviso cpd-aviso-${mensajeResena.tipo}`} role={mensajeResena.tipo === "error" ? "alert" : "status"}>
                    <span>{mensajeResena.texto}</span>
                  </div>
                )}
                <button type="submit" className="cpd-boton-primario" disabled={agregandoResena || !nuevoComentario.trim()}>
                  <i className="bi bi-send" /> {agregandoResena ? "Publicando..." : "Publicar reseña"}
                </button>
              </form>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default ClienteProductoDetalles;
