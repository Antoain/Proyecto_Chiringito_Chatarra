import React from 'react';
import { Link } from 'react-router-dom';
import './ClienteNavbar.css'; // Importa estilos personalizados para la barra de navegación


/**
 * Navbar del cliente en el Carrito con:
 * - Logo y categorías
 * - Íconos de favoritos, carrito
 * - Menú de contacto
 * - Perfil de usuario
 */

// Componente Navbar para clientes SIN barra de búsqueda
export function ClienteNavbarSinBusqueda({ categorias, cartCount }) {
  // Obtener datos del usuario desde localStorage
  const usuarioNombre = localStorage.getItem("nombreUsuario");
  const usuarioCorreo = localStorage.getItem("correoUsuario");

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark navbar-custom">
      <div className="container-fluid">

        {/* IZQUIERDA: Logo + Dropdown de categorías */}
        <div className="d-flex align-items-center">
          <Link className="navbar-brand me-2" to="/cliente">
            {/* Logo del sitio */}
            <img
              src="https://i.postimg.cc/76zgfDFZ/image.png"
              alt="Logo Chiringuito Chatarra"
              className="logo-image"
            />
          </Link>

          {/* Dropdown de categorías */}
          <div className="dropdown">
            <button
              className="btn btn-secondary dropdown-toggle no-caret"
              type="button"
              id="dropdownCategories"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <i className="bi bi-list me-1"></i> Categorías
            </button>

            <ul className="dropdown-menu">
              {categorias.map(categoria => (
                <li key={categoria.idCategoria}>
                  <Link
                    className="dropdown-item"
                    to={`/cliente/categoria/${categoria.idCategoria}`}
                  >
                    {categoria.descripcion}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* DERECHA: Íconos de favoritos, carrito, contacto y perfil */}
        <div className="d-flex align-items-center gap-3 ms-auto">
          {/* Ícono de favoritos */}
          <Link
            className="nav-link text-white"
            to="/cliente/favoritos"
            title="Favoritos"
          >
            <i className="bi bi-heart"></i>
          </Link>

          {/* Ícono de carrito con badge si hay productos */}
          <Link
            className="nav-link text-white position-relative"
            to="/cliente/carrito"
            title="Carrito"
          >
            <i className="bi bi-cart"></i>
            {cartCount > 0 && (
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Dropdown con información del administrador (Contacto) */}
          <div className="dropdown">
            <button
              className="btn btn-outline-light dropdown-toggle"
              type="button"
              id="dropdownAdmin"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <i className="bi bi-person-workspace"></i> Contáctanos
            </button>

            <ul
              className="dropdown-menu dropdown-menu-end"
              aria-labelledby="dropdownAdmin"
            >
              <li className="dropdown-item">
                <strong>Antony Tobías</strong>
              </li>
              <li className="dropdown-item small">
                tb0822032023@unab.edu.sv
              </li>
              <li>
                <a
                  className="dropdown-item text-primary"
                  href="mailto:tb0822032023@unab.edu.sv"
                >
                  <i className="bi bi-envelope-fill me-1"></i> Enviar correo
                </a>
              </li>
            </ul>
          </div>

          {/* Dropdown de usuario: muestra nombre y correo si está logueado */}
          <div className="dropdown">
            <button
              className="btn btn-outline-light dropdown-toggle"
              type="button"
              id="dropdownUser"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <i className="bi bi-person-circle"></i>
            </button>

            <ul
              className="dropdown-menu dropdown-menu-end"
              aria-labelledby="dropdownUser"
            >
              {usuarioNombre && usuarioCorreo ? (
                <>
                  {/* Nombre y correo del usuario */}
                  <li className="dropdown-item">
                    <strong>{usuarioNombre}</strong>
                  </li>
                  <li className="dropdown-item small">{usuarioCorreo}</li>
                  <li><hr className="dropdown-divider" /></li>
                  {/* Botón para cerrar sesión */}
                  <li>
                    <button
                      className="dropdown-item text-danger"
                      onClick={() => cerrarSesion()}
                    >
                      <i className="bi bi-box-arrow-right me-1"></i> Cerrar sesión
                    </button>
                  </li>
                </>
              ) : (
                // Si no hay sesión iniciada, muestra opción de iniciar sesión
                <li>
                  <Link className="dropdown-item" to="/login">
                    <i className="bi bi-box-arrow-in-right me-1"></i> Iniciar sesión
                  </Link>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
}

// Función que borra los datos del usuario del localStorage y redirige al inicio
const cerrarSesion = () => {
  localStorage.removeItem("idUsuario");
  localStorage.removeItem("nombreUsuario");
  localStorage.removeItem("correoUsuario");
  localStorage.removeItem("rol");
  window.location.href = "/";
};

export default ClienteNavbarSinBusqueda;
