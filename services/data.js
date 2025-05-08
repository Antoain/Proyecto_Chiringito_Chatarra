// ============================= FETCH PARA USUARIOS ===============================

const BASE_URL_Usuarios = 'https://localhost:7059/api/Usuario';

// Autenticar usuario con su correo y clave
export async function autenticarUsuario(correo, clave) {
  const datos = { correo, clave };

  try {
      const response = await fetch(`${BASE_URL_Usuarios}/login`, 
      {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(datos), // Convertimos los datos a JSON antes de enviarlos
      });

      // Verificamos si la solicitud fue exitosa
      if (!response.ok) {
          throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }

      // Convertimos la respuesta en JSON
      const resultado = await response.json();
      console.log("Datos recibidos desde el backend:", resultado); 

      return resultado;
  } catch (error) {
      console.error('Error en la autenticación:', error);
      throw error;
  }
}

// Registrar un nuevo usuario en el sistema
export const registrarUsuario = async (usuario) => {
  const payload = {
      Nombres: usuario.nombre,
      Apellidos: usuario.apellido,
      Correo: usuario.correo,
      Clave: usuario.clave,
      Rol: usuario.rol || 'Cliente' // Si el rol no está definido, se asigna 'Cliente' por defecto
  };

  try {
      const response = await fetch(`${BASE_URL_Usuarios}/register`, 
      {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
      });

      if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.mensaje || 'Error al registrar el usuario');
      }

      return await response.json();
  } catch (error) {
      console.error('Error al registrar el usuario:', error);
      throw error;
  }
};

// Obtener la lista de usuarios
export const obtenerUsuarios = async () => {
  try {
      const response = await fetch(`${BASE_URL_Usuarios}/ObtenerUsuarios`, 
      {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
      });

      // Si la solicitud no es exitosa, capturamos el error y lo mostramos
      if (!response.ok) {
          const errorHTML = await response.text();
          throw new Error(`Error al obtener usuarios (Status: ${response.status}): ${errorHTML}`);
      }

      return await response.json();
  } catch (error) {
      console.error('Error al obtener usuarios:', error);
      throw error;
  }
};

// Eliminar un usuario según su ID
export const eliminarUsuario = async (id) => {
  const response = await fetch(`${BASE_URL_Usuarios}/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
      throw new Error(`Error al eliminar el usuario (Status: ${response.status})`);
  }
};

// Actualizar datos de un usuario existente
export const actualizarUsuario = async (usuario) => {
  try {
      const response = await fetch(`${BASE_URL_Usuarios}/Editar?id=${usuario.idUsuario}`, { 
          method: 'PUT',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify(usuario), // Enviamos los datos actualizados del usuario
      });

      if (!response.ok) {
          const error = await response.json();
          throw new Error(error.mensaje || 'Error al actualizar el usuario.');
      }

      return await response.json();
  } catch (error) {
      console.error('Error al intentar actualizar usuario:', error);
      throw error;
  }
};

// ============================ CATEGORÍAS ============================

const BASE_URL_Categorias = 'https://localhost:7059/api/Categoria'; 

// Obtener todas las categorías disponibles
export const obtenerCategorias = async () => {
    try {
        const response = await fetch(`${BASE_URL_Categorias}/ObtenerCategorias`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
            throw new Error('Error al obtener las categorías');
        }

        return await response.json(); // Devuelve la lista de categorías en formato JSON
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
};

// Obtener una categoría específica por ID
export const obtenerCategoriaPorId = async (id) => {
    try {
        const response = await fetch(`${BASE_URL_Categorias}/ObtenerPorID${id}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
            throw new Error('Error al obtener la categoría');
        }

        return await response.json(); // Devuelve la categoría obtenida
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
};

// Crear una nueva categoría en la base de datos
export const crearCategoria = async (categoria) => {
    try {
        const response = await fetch(`${BASE_URL_Categorias}/PostCategorias`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(categoria), // Convierte el objeto categoría en JSON antes de enviarlo
        });

        if (!response.ok) {
            throw new Error('Error al crear la categoría');
        }

        return await response.json(); // Devuelve la respuesta del servidor con los datos de la nueva categoría
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
};

// Actualizar una categoría existente según su ID
export const actualizarCategoria = async (id, categoria) => {
    try {
        const response = await fetch(`${BASE_URL_Categorias}/Editar?id=${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(categoria), // Envía los datos actualizados de la categoría
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.mensaje || 'Error al actualizar la categoría');
        }

        return await response.json(); // Devuelve la categoría actualizada
    } catch (error) {
        console.error('Error al intentar actualizar la categoría:', error);
        throw error;
    }
};

// Eliminar una categoría por su ID
export const eliminarCategoria = async (id) => {
    try {
        const response = await fetch(`${BASE_URL_Categorias}/Delete${id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
            throw new Error('Error al eliminar la categoría');
        }
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
};

// Obtener productos asociados a una categoría específica
export const obtenerProductosPorCategoria = async (idCategoria) => {
    try {
        const response = await fetch(`${BASE_URL_Categorias}/ObtenerProductosPorCategoria/${idCategoria}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
            throw new Error('Error al obtener productos por categoría');
        }

        return await response.json(); // Devuelve la lista de productos de la categoría especificada
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
};

// ============================ TIENDAS ============================

const BASE_URL_TIENDA = 'https://localhost:7059/api/Tienda';

// Obtener todas las tiendas disponibles
export const obtenerTiendas = async () => {
    try {
        const response = await fetch(`${BASE_URL_TIENDA}/ObtenerTiendas`);

        if (!response.ok) {
            throw new Error('Error al obtener las tiendas');
        }

        return await response.json(); // Devuelve la lista de tiendas en formato JSON
    } catch (error) {
        console.error('Error en obtenerTiendas:', error);
        throw error;
    }
};

// Obtener una tienda específica por ID
export const obtenerTiendaPorId = async (id) => {
    try {
        const response = await fetch(`${BASE_URL_TIENDA}/ObtenerTienda/${id}`);

        if (!response.ok) {
            throw new Error('Error al obtener la tienda');
        }

        return await response.json(); // Devuelve la tienda obtenida
    } catch (error) {
        console.error('Error en obtenerTiendaPorId:', error);
        throw error;
    }
};

// Crear una nueva tienda en la base de datos
export const crearTienda = async (tienda) => {
    try {
        const response = await fetch(`${BASE_URL_TIENDA}/CrearTienda`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(tienda),
        });

        if (!response.ok) {
            throw new Error('Error al crear la tienda');
        }

        return await response.json();
    } catch (error) {
        console.error('Error al crear la tienda:', error);
        throw error;
    }
};

// Actualizar una tienda existente
export const actualizarTienda = async (idTienda, tienda) => {
    try {
        const response = await fetch(`${BASE_URL_TIENDA}/Editar?id=${idTienda}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(tienda),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error al actualizar la tienda: ${errorText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error al actualizar la tienda:', error);
        throw error;
    }
};

// Eliminar una tienda según su ID
export const eliminarTienda = async (id) => {
    try {
        const response = await fetch(`${BASE_URL_TIENDA}/EliminarTienda/${id}`, { method: 'DELETE' });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Error al eliminar la tienda');
        }
    } catch (error) {
        console.error('Error al eliminar la tienda:', error);
        throw error;
    }
};

// Obtener tiendas asociadas a un vendedor específico
export const obtenerTiendasPorVendedor = async (idVendedor) => {
  try {
    const response = await fetch(`${BASE_URL_TIENDA}/ObtenerTiendasPorVendedor/${idVendedor}`);

    // Si la respuesta no es exitosa, lanzamos un error con el mensaje correspondiente
    if (!response.ok) {
      throw new Error('Error al obtener las tiendas del vendedor.');
    }

    return await response.json(); // Devuelve la lista de tiendas asociadas al vendedor
  } catch (error) {
    console.error('Error en obtenerTiendasPorVendedor:', error);
    throw error; // Propaga el error para que pueda ser manejado por la lógica del frontend
  }
};


// ============================ VENDEDORES ============================

const BASE_URL_VENDEDOR = 'https://localhost:7059/api/Vendedor';

// Obtener todos los vendedores registrados en la base de datos
export const obtenerVendedores = async () => {
    try {
        const response = await fetch(`${BASE_URL_VENDEDOR}/ObtenerVendedores`);

        if (!response.ok) {
            throw new Error('Error al obtener la lista de vendedores');
        }

        return await response.json();
    } catch (error) {
        console.error('Error en obtenerVendedores:', error);
        throw error;
    }
};


// ============================== APARTADO DE PRODUCTOS ============================== 

const BASE_URL_PRODUCTOS = 'https://localhost:7059/api/Producto';

// Obtener todos los productos disponibles en la base de datos
export const obtenerProductos = async () => {
  try {
    const response = await fetch(`${BASE_URL_PRODUCTOS}/ObtenerProductos`);

    if (!response.ok) {
      throw new Error('Error al obtener los productos');
    }

    return await response.json(); // Devuelve la lista de productos
  } catch (error) {
    console.error('Error en obtenerProductos:', error);
    throw error;
  }
};

// Obtener un producto específico por su ID
export const obtenerProductosPorId = async (id) => {
  try {
    const response = await fetch(`${BASE_URL_PRODUCTOS}/ObtenerProducto/${id}`);

    if (!response.ok) {
      throw new Error('Error al obtener el producto');
    }

    return await response.json(); // Devuelve los detalles del producto solicitado
  } catch (error) {
    console.error('Error en obtenerProducto:', error);
    throw error;
  }
};

// Crear un nuevo producto
export const crearProductos = async (producto) => {
  console.log("Enviando producto a la API:", producto); // Mensaje de depuración

  try {
    const productoParaEnviar = { ...producto };
    delete productoParaEnviar.idProducto; // Se elimina el ID porque normalmente lo genera el backend

    const response = await fetch(`${BASE_URL_PRODUCTOS}/CrearProductos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productoParaEnviar),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error al crear el producto: ${errorText}`);
    }

    // Si la API responde con "No Content" (código 204), no devuelve JSON, por eso retornamos `null`
    return response.status === 204 ? null : await response.json();
  } catch (error) {
    console.error('Error al crear el producto:', error);
    throw error;
  }
};

// Actualizar un producto existente
export const actualizarProductos = async (idProducto, producto) => {
  try {
    const response = await fetch(`${BASE_URL_PRODUCTOS}/EditarProductos/${idProducto}`, { 
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(producto), // Convierte el producto a JSON antes de enviarlo
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error al actualizar el producto: ${errorText}`);
    }

    return response.status === 204 ? null : await response.json(); // Manejo de respuesta vacía
  } catch (error) {
    console.error('Error al actualizar el producto:', error);
    throw error;
  }
};

// Eliminar un producto por su ID
export const eliminarProductos = async (id) => {
  try {
    const response = await fetch(`${BASE_URL_PRODUCTOS}/EliminarProducto/${id}`, { method: 'DELETE' });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Error al eliminar el producto');
    }

    return; // No retornamos nada porque la API probablemente responde con "No Content"
  } catch (error) {
    console.error('Error al eliminar el producto:', error);
    throw error;
  }
};

// Obtener productos vendidos por un vendedor específico
export const obtenerProductosPorVendedor = async (idVendedor) => {
  try {
    const response = await fetch(`${BASE_URL_PRODUCTOS}/ObtenerProductosPorVendedor/${idVendedor}`);

    if (!response.ok) {
      throw new Error('Error al obtener los productos del vendedor.');
    }

    return await response.json(); // Devuelve los productos asociados al vendedor
  } catch (error) {
    console.error('Error en obtenerProductosPorVendedor:', error);
    throw error;
  }
};

// ============================== APARTADO DE RESEÑAS DE PRODUCTOS ============================== 

const BASE_URL_RESENASP = 'https://localhost:7059/api/ReseniaProducto';

// Obtener reseñas de un producto específico
export const obtenerResenasPorProducto = async (idProducto) => {
  try {
    const response = await fetch(`${BASE_URL_RESENASP}/ObtenerResenas/${idProducto}`);

    // Si no se encontraron reseñas, devolvemos un array vacío
    if (!response.ok) {
      if (response.status === 404) {
        return [];
      }
      throw new Error("Error al obtener las reseñas");
    }

    return await response.json(); // Devuelve las reseñas obtenidas
  } catch (error) {
    console.error("Error en obtenerResenasPorProducto:", error);
    return []; // Devuelve un array vacío en caso de error
  }
};

// Agregar una reseña a un producto
export const agregarResena = async (resena) => {
  try {
    const response = await fetch(`${BASE_URL_RESENASP}/Agregar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(resena), // Convierte la reseña a formato JSON antes de enviarla
    });

    if (!response.ok) {
      throw new Error("Error al agregar reseña");
    }

    return await response.json(); // Devuelve la reseña agregada
  } catch (error) {
    console.error("Error al agregarResena:", error);
  }
};


// ============================== APARTADO DE FAVORITOS ============================== 

const BASE_URL_FAVORITOS = "https://localhost:7059/api/Favoritos";

// Agregar un producto a los favoritos de un usuario
export const agregarFavorito = async (idUsuario, idProducto) => {
  try {
    const response = await fetch(`${BASE_URL_FAVORITOS}/Agregar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idUsuario, idProducto }), // Enviamos el ID del usuario y producto
    });

    return await response.json(); // Devuelve la respuesta del backend
  } catch (error) {
    console.error("Error al agregar favorito:", error);
  }
};

// Obtener los productos favoritos de un usuario específico
export const obtenerFavoritosPorCliente = async (idUsuario) => {
  try {
    const response = await fetch(`${BASE_URL_FAVORITOS}/ObtenerFavorito/${idUsuario}`);

    return await response.json(); // Devuelve la lista de productos favoritos
  } catch (error) {
    console.error("Error al obtener favoritos:", error);
    return []; // Retorna un array vacío en caso de error
  }
};

// Eliminar un producto de los favoritos de un usuario
export const eliminarFavorito = async (idFavorito) => {
  try {
    const response = await fetch(`${BASE_URL_FAVORITOS}/Eliminar/${idFavorito}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Error al eliminar favorito.");
    }

    return await response.json(); // Devuelve la respuesta tras eliminar el favorito
  } catch (error) {
    console.error("Error al eliminar favorito:", error);
    return { mensaje: "Error al eliminar de favoritos." }; // Devuelve un mensaje en caso de error
  }
};

// ============================== APARTADO DEL CARRITO ============================== 

const BASE_URL_CARRITO = "https://localhost:7059/api/Carrito";

// Agregar un producto al carrito
export const agregarCarrito = async (carrito) => {
  try {
    const response = await fetch(`${BASE_URL_CARRITO}/Agregar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(carrito), // Enviamos el producto con su cantidad al carrito
    });

    if (!response.ok) {
      throw new Error("Error al agregar el producto al carrito.");
    }

    return await response.json(); // Devuelve la respuesta del backend
  } catch (error) {
    console.error("Error en agregarAlCarrito:", error);
    throw error;
  }
};

// Obtener los productos del carrito de un usuario
export const obtenerCarritoPorUsuario = async (idUsuario) => {
  try {
    const response = await fetch(`${BASE_URL_CARRITO}/ObtenerCarrito/${idUsuario}`);

    if (response.status === 404) {
      return []; // Si el backend indica que el carrito está vacío, retorna un array vacío
    }

    if (!response.ok) {
      throw new Error("Error al obtener el carrito");
    }

    return await response.json(); // Devuelve los productos en el carrito
  } catch (error) {
    console.error("Error en obtenerCarritoPorUsuario:", error);
    return []; // Retorna un array vacío en caso de error
  }
};

// Eliminar un producto del carrito
export const eliminarDelCarrito = async (idCarrito) => {
  try {
    const response = await fetch(`${BASE_URL_CARRITO}/Eliminar/${idCarrito}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Error al eliminar el producto del carrito.");
    }

    return await response.json(); // Devuelve la respuesta tras eliminar el producto
  } catch (error) {
    console.error("Error en eliminarDelCarrito:", error);
    throw error;
  }
};

// Actualizar la cantidad de un producto en el carrito
export const actualizarCantidadEnBackend = async (idCarrito, nuevaCantidad) => {
  try {
    const response = await fetch(`${BASE_URL_CARRITO}/ActualizarCantidad/${idCarrito}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cantidad: nuevaCantidad }), // Enviamos la nueva cantidad del producto
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error en la API: ${errorText}`);
    }

    return await response.json(); // Devuelve la respuesta tras actualizar la cantidad
  } catch (error) {
    console.error("Error en actualizarCantidadEnBackend:", error);
    return null; // Retorna null en caso de error
  }
};



// ============================== APARTADO DE VENTA ============================== 

const BASE_URL_VENTA = "https://localhost:7059/api/Venta";

// Realizar una venta con los datos proporcionados
export const realizarVenta = async (venta) => {
  try {
    const response = await fetch(`${BASE_URL_VENTA}/RealizarVenta`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(venta), // Convertimos la venta en formato JSON antes de enviarla
    });

    return await response.json(); // Devuelve la respuesta del backend con los detalles de la venta
  } catch (error) {
    console.error("Error al realizar la venta:", error);
    return null; // Retorna null en caso de error
  }
};

// Obtener ventas realizadas por un vendedor específico
export const obtenerVentasPorVendedor = async (idVendedor) => {
  try {
    const response = await fetch(`${BASE_URL_VENTA}/ObtenerVentasPorVendedor/${idVendedor}`);

    if (!response.ok) throw new Error("Error al obtener las ventas");

    return await response.json(); // Devuelve la lista de ventas realizadas por el vendedor
  } catch (error) {
    console.error("Error en obtenerVentasPorVendedor:", error);
    throw error;
  }
};

// ============================== APARTADO DE LOCALIZACIÓN ============================== 

const BASE_URL_LOCALIZACION = "https://localhost:7059/api/Localizacion";

// Obtener la lista de departamentos disponibles
export const obtenerDepartamentos = async () => {
  try {
    const response = await fetch(`${BASE_URL_LOCALIZACION}/Departamentos`);

    if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

    return await response.json(); // Devuelve la lista de departamentos
  } catch (error) {
    console.error("Error al obtener los departamentos:", error);
    return []; // Retorna un array vacío en caso de error
  }
};

// Obtener las provincias según el ID del departamento
export const obtenerProvincias = async (idDepartamento) => {
  try {
    const response = await fetch(`${BASE_URL_LOCALIZACION}/Provincias/${idDepartamento}`);

    if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

    return await response.json(); // Devuelve la lista de provincias del departamento
  } catch (error) {
    console.error("Error al obtener las provincias:", error);
    return []; // Retorna un array vacío en caso de error
  }
};

// Obtener los distritos según el ID de la provincia
export const obtenerDistritos = async (idProvincia) => {
  try {
    const response = await fetch(`${BASE_URL_LOCALIZACION}/Distritos/${idProvincia}`);

    if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

    return await response.json(); // Devuelve la lista de distritos de la provincia
  } catch (error) {
    console.error("Error al obtener los distritos:", error);
    return []; // Retorna un array vacío en caso de error
  }
};