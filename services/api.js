const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5093/api";

export async function apiFetch(
  endpoint,
  options = {},
  requiereAuth = true
) {
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (requiereAuth && token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      ...options,
      headers,
    }
  );

  // Si no hay contenido
  if (response.status === 204) {
    return null;
  }

  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const mensaje =
      data?.mensaje ||
      `Error ${response.status}: ${response.statusText}`;

    const error = new Error(mensaje);

    error.status = response.status;
    error.data = data;

    throw error;
  }

  return data;
}