import { apiFetch } from "./api";

// ======================================================
// CHECKOUT / PEDIDOS
// ======================================================

export const realizarCheckout = async (checkout) => {
  return apiFetch(
    "/Pedido/Checkout",
    {
      method: "POST",
      body: JSON.stringify(checkout),
    },
    true
  );
};


// ======================================================
// USUARIOS
// ======================================================

// LOGIN - público
export const autenticarUsuario = async (correo, clave) => {
  return apiFetch(
    "/Usuario/login",
    {
      method: "POST",
      body: JSON.stringify({
        correo,
        clave,
      }),
    },
    false
  );
};


// REGISTRO - público
export const registrarUsuario = async (usuario) => {
  const payload = {
    Nombres: usuario.nombre,
    Apellidos: usuario.apellido,
    Correo: usuario.correo,
    Clave: usuario.clave,
    Rol: usuario.rol || "Cliente",
  };

  return apiFetch(
    "/Usuario/register",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    false
  );
};


// LISTAR USUARIOS - Administrador
export const obtenerUsuarios = async () => {
  return apiFetch(
    "/Usuario/ObtenerUsuarios",
    {},
    true
  );
};


// ELIMINAR USUARIO - Administrador
export const eliminarUsuario = async (id) => {
  return apiFetch(
    `/Usuario/${id}`,
    {
      method: "DELETE",
    },
    true
  );
};


// ACTUALIZAR USUARIO
export const actualizarUsuario = async (usuario) => {
  return apiFetch(
    `/Usuario/Editar?id=${usuario.idUsuario}`,
    {
      method: "PUT",
      body: JSON.stringify(usuario),
    },
    true
  );
};


// ======================================================
// CATEGORÍAS
// ======================================================

// Público
export const obtenerCategorias = async () => {
  return apiFetch(
    "/Categoria/ObtenerCategorias",
    {},
    false
  );
};


// Público
export const obtenerCategoriaPorId = async (id) => {
  return apiFetch(
    `/Categoria/ObtenerPorID${id}`,
    {},
    false
  );
};


// Administrador
export const crearCategoria = async (categoria) => {
  return apiFetch(
    "/Categoria/PostCategorias",
    {
      method: "POST",
      body: JSON.stringify(categoria),
    },
    true
  );
};


// Administrador
export const actualizarCategoria = async (
  id,
  categoria
) => {
  return apiFetch(
    `/Categoria/Editar?id=${id}`,
    {
      method: "PUT",
      body: JSON.stringify(categoria),
    },
    true
  );
};


// Administrador
export const eliminarCategoria = async (id) => {
  return apiFetch(
    `/Categoria/Delete${id}`,
    {
      method: "DELETE",
    },
    true
  );
};


// Público
export const obtenerProductosPorCategoria = async (
  idCategoria
) => {
  return apiFetch(
    `/Categoria/ObtenerProductosPorCategoria/${idCategoria}`,
    {},
    false
  );
};


// ======================================================
// TIENDAS
// ======================================================

// Público
export const obtenerTiendas = async () => {
  return apiFetch(
    "/Tienda/ObtenerTiendas",
    {},
    false
  );
};


// Público
export const obtenerTiendaPorId = async (id) => {
  return apiFetch(
    `/Tienda/ObtenerTienda/${id}`,
    {},
    false
  );
};


// Vendedor
export const crearTienda = async (tienda) => {
  return apiFetch(
    "/Tienda/CrearTienda",
    {
      method: "POST",
      body: JSON.stringify(tienda),
    },
    true
  );
};


// Vendedor propietario o Administrador
export const actualizarTienda = async (
  idTienda,
  tienda
) => {
  return apiFetch(
    `/Tienda/Editar/${idTienda}`,
    {
      method: "PUT",
      body: JSON.stringify(tienda),
    },
    true
  );
};


// Vendedor propietario o Administrador
export const eliminarTienda = async (id) => {
  return apiFetch(
    `/Tienda/EliminarTienda/${id}`,
    {
      method: "DELETE",
    },
    true
  );
};


// Vendedor o Administrador
export const obtenerTiendasPorVendedor = async (
  idVendedor
) => {
  try {
    return await apiFetch(
      `/Tienda/ObtenerTiendasPorVendedor/${idVendedor}`,
      {},
      true
    );
  } catch (error) {
    if (error.status === 404) {
      return [];
    }

    throw error;
  }
};


// ======================================================
// VENDEDORES
// ======================================================

// Administrador
export const obtenerVendedores = async () => {
  return apiFetch(
    "/Vendedor/ObtenerVendedores",
    {},
    true
  );
};


// ======================================================
// PEDIDOS DEL VENDEDOR
// ======================================================

export const obtenerPedidosVendedor = async () => {
  try {
    return await apiFetch(
      "/SIGVendedor/Pedidos",
      {},
      true
    );
  } catch (error) {
    if (error.status === 404) {
      return [];
    }

    throw error;
  }
};


// ======================================================
// SIG VENDEDOR
// ======================================================

export const obtenerDashboardVendedor = async () => {
  return apiFetch(
    "/SIGVendedor/Dashboard",
    {},
    true
  );
};


// ======================================================
// PRODUCTOS
// ======================================================

// Público
export const obtenerProductos = async () => {
  return apiFetch(
    "/Producto/ObtenerProductos",
    {},
    false
  );
};


// Público
export const obtenerProductosPorId = async (id) => {
  return apiFetch(
    `/Producto/ObtenerProducto/${id}`,
    {},
    false
  );
};


// Vendedor
export const crearProductos = async (producto) => {
  const productoParaEnviar = {
    ...producto,
  };

  delete productoParaEnviar.idProducto;

  return apiFetch(
    "/Producto/CrearProductos",
    {
      method: "POST",
      body: JSON.stringify(productoParaEnviar),
    },
    true
  );
};


// Vendedor propietario o Administrador
export const actualizarProductos = async (
  idProducto,
  producto
) => {
  return apiFetch(
    `/Producto/EditarProductos/${idProducto}`,
    {
      method: "PUT",
      body: JSON.stringify(producto),
    },
    true
  );
};


// Vendedor propietario o Administrador
export const eliminarProductos = async (id) => {
  return apiFetch(
    `/Producto/EliminarProducto/${id}`,
    {
      method: "DELETE",
    },
    true
  );
};


// Vendedor o Administrador
export const obtenerProductosPorVendedor = async (
  idVendedor
) => {
  try {
    return await apiFetch(
      `/Producto/ObtenerProductosPorVendedor/${idVendedor}`,
      {},
      true
    );
  } catch (error) {
    if (error.status === 404) {
      return [];
    }

    throw error;
  }
};


// ======================================================
// RESEÑAS
// ======================================================

// Público
export const obtenerResenasPorProducto = async (
  idProducto
) => {
  try {
    return await apiFetch(
      `/ReseniaProducto/ObtenerResenas/${idProducto}`,
      {},
      false
    );
  } catch (error) {
    if (error.status === 404) {
      return [];
    }

    throw error;
  }
};


// Cliente
export const agregarResena = async (resena) => {
  const payload = {
    idProducto: Number(resena.idProducto),
    calificacion: Number(resena.calificacion),
    comentario: resena.comentario,
  };

  return apiFetch(
    "/ReseniaProducto/Agregar",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    true
  );
};


// ======================================================
// FAVORITOS
// ======================================================

// Cliente
export const agregarFavorito = async (idProducto) => {
  return apiFetch(
    "/Favoritos/Agregar",
    {
      method: "POST",
      body: JSON.stringify({
        idProducto: Number(idProducto),
      }),
    },
    true
  );
};


// Cliente
export const obtenerFavoritosPorCliente = async () => {
  try {
    return await apiFetch(
      "/Favoritos/ObtenerFavoritos",
      {},
      true
    );
  } catch (error) {
    if (error.status === 404) {
      return [];
    }

    throw error;
  }
};


// Cliente
export const eliminarFavorito = async (
  idFavorito
) => {
  return apiFetch(
    `/Favoritos/Eliminar/${idFavorito}`,
    {
      method: "DELETE",
    },
    true
  );
};


// ======================================================
// CARRITO
// ======================================================

// Cliente
export const agregarCarrito = async (carrito) => {
  return apiFetch(
    "/Carrito/Agregar",
    {
      method: "POST",
      body: JSON.stringify({
        idProducto: Number(carrito.idProducto),
        cantidad: Number(carrito.cantidad),
      }),
    },
    true
  );
};


// Cliente
export const obtenerCarritoPorUsuario = async () => {
  try {
    return await apiFetch(
      "/Carrito/ObtenerCarrito",
      {},
      true
    );
  } catch (error) {
    if (error.status === 404) {
      return [];
    }

    throw error;
  }
};


// Cliente
export const eliminarDelCarrito = async (
  idCarrito
) => {
  return apiFetch(
    `/Carrito/Eliminar/${idCarrito}`,
    {
      method: "DELETE",
    },
    true
  );
};


// Cliente
export const actualizarCantidadEnBackend = async (
  idCarrito,
  nuevaCantidad
) => {
  return apiFetch(
    `/Carrito/ActualizarCantidad/${idCarrito}`,
    {
      method: "PUT",
      body: JSON.stringify({
        cantidad: Number(nuevaCantidad),
      }),
    },
    true
  );
};


// ======================================================
// LOCALIZACIÓN
// ======================================================

// Público
export const obtenerDepartamentos = async () => {
  return apiFetch(
    "/Localizacion/Departamentos",
    {},
    false
  );
};


export const obtenerProvincias = async (
  idDepartamento
) => {
  return apiFetch(
    `/Localizacion/Provincias/${idDepartamento}`,
    {},
    false
  );
};


export const obtenerDistritos = async (
  idProvincia
) => {
  return apiFetch(
    `/Localizacion/Distritos/${idProvincia}`,
    {},
    false
  );
};


// ======================================================
// INVENTARIO
// ======================================================

// Vendedor
export const obtenerMiInventario = async () => {
  try {
    return await apiFetch(
      "/Inventario/MiInventario",
      {},
      true
    );
  } catch (error) {
    if (error.status === 404) {
      return [];
    }

    throw error;
  }
};


// Vendedor

export const obtenerMovimientosInventario = async () => {
  try {
    return await apiFetch(
      "/Inventario/Movimientos",
      {},
      true
    );
  } catch (error) {
    if (error.status === 404) {
      return [];
    }

    throw error;
  }
};