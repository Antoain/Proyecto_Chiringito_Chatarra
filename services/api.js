const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5093/api";


// ======================================================
// LIMPIAR SESIÓN
// ======================================================

const limpiarSesion = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("rol");
  localStorage.removeItem("idUsuario");
  localStorage.removeItem("idVendedor");
  localStorage.removeItem("nombreUsuario");
  localStorage.removeItem("correoUsuario");
};


// ======================================================
// API FETCH
// ======================================================

export async function apiFetch(
  endpoint,
  options = {},
  requiereAuth = true
) {
  const token =
    localStorage.getItem("token");


  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };


  if (
    requiereAuth &&
    token
  ) {
    headers.Authorization =
      `Bearer ${token}`;
  }


  let response;


  // ====================================================
  // PETICIÓN
  // ====================================================

  try {

    response =
      await fetch(
        `${API_BASE_URL}${endpoint}`,
        {
          ...options,
          headers,
        }
      );

  } catch (error) {

    const networkError =
      new Error(
        "No se pudo conectar con el servidor."
      );


    networkError.status = 0;

    networkError.data = null;

    networkError.originalError =
      error;


    throw networkError;
  }


  // ====================================================
  // SESIÓN EXPIRADA / TOKEN INVÁLIDO
  // ====================================================

  if (
    response.status === 401 &&
    requiereAuth
  ) {

    limpiarSesion();


    const rutaActual =
      window.location.pathname;


    if (
      rutaActual !== "/" &&
      rutaActual !== "/register"
    ) {

      window.location.replace("/");

    }


    const error =
      new Error(
        "Tu sesión ha expirado. Inicia sesión nuevamente."
      );


    error.status = 401;
    error.data = null;


    throw error;
  }


  // ====================================================
  // RESPUESTA SIN CONTENIDO
  // ====================================================

  if (
    response.status === 204
  ) {
    return null;
  }


  // ====================================================
  // LEER RESPUESTA
  // ====================================================

  let data = null;


  try {

    data =
      await response.json();

  } catch {

    data = null;

  }


  // ====================================================
  // ERRORES HTTP
  // ====================================================

  if (
    !response.ok
  ) {

    const mensaje =
      data?.mensaje ||
      data?.message ||
      `Error ${response.status}: ${response.statusText}`;


    const error =
      new Error(
        mensaje
      );


    error.status =
      response.status;

    error.data =
      data;


    throw error;
  }


  return data;
}