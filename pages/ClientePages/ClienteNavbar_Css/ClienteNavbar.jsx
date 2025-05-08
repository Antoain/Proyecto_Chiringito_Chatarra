import React from 'react';
import { Link } from 'react-router-dom';
import './ClienteNavbar.css';

/**
 * Navbar principal del cliente con:
 * - Logo y categorías
 * - Barra de búsqueda
 * - Íconos de favoritos, carrito
 * - Menú de contacto
 * - Perfil de usuario
 */
export function ClienteNavbar({ categorias, busqueda, setBusqueda, cartCount }) {
  const usuarioNombre = localStorage.getItem("nombreUsuario");
  const usuarioCorreo = localStorage.getItem("correoUsuario");

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark navbar-custom">
      <div className="container-fluid">
        {/* Sección izquierda: logo y menú de categorías */}
        <div className="d-flex align-items-center">
          <Link className="navbar-brand me-2" to="/cliente">
            <img
              src="https://i.postimg.cc/76zgfDFZ/image.png"
              alt="Logo Chiringuito Chatarra"
              className="logo-image"
            />
          </Link>

          {/* Menú desplegable de categorías */}
          <div className="dropdown">
            <button className="btn btn-secondary dropdown-toggle no-caret" type="button"
              id="dropdownCategories"
              data-bs-toggle="dropdown"
              aria-expanded="false">
              <i className="bi bi-list me-1"></i> Categorías
            </button>
            <ul className="dropdown-menu">
              {categorias.map(categoria => (
                <li key={categoria.idCategoria}>
                  <Link className="dropdown-item" to={`/cliente/categoria/${categoria.idCategoria}`}>
                    {categoria.descripcion}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Centro: barra de búsqueda */}
        <div className="mx-auto search-container">
          <input
            className="form-control"
            type="search"
            placeholder="Buscar productos..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        {/* Sección derecha: íconos, contacto y perfil de usuario */}
        <div className="d-flex align-items-center gap-3">
          {/* Ícono de favoritos */}
          <Link className="nav-link text-white" to="/cliente/favoritos" title="Favoritos">
            <i className="bi bi-heart"></i>
          </Link>

          {/* Ícono de carrito con contador */}
          <Link className="nav-link text-white position-relative" to="/cliente/carrito" title="Carrito">
            <i className="bi bi-cart"></i>
            {cartCount > 0 && (
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Menú de contacto del administrador */}
          <div className="dropdown">
            <button className="btn btn-outline-light dropdown-toggle" type="button"
              id="dropdownAdmin"
              data-bs-toggle="dropdown"
              aria-expanded="false">
              <i className="bi bi-person-workspace"></i> Contáctanos
            </button>
            <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="dropdownAdmin">
              <li className="dropdown-item">
                <strong>Antony Tobías</strong>
              </li>
              <li className="dropdown-item small">tb0822032023@unab.edu.sv</li>
              <li>
                <a className="dropdown-item text-primary" href="mailto:tb0822032023@unab.edu.sv">
                  <i className="bi bi-envelope-fill me-1"></i> Enviar correo
                </a>
              </li>
            </ul>
          </div>

          {/* Menú del usuario logueado o login */}
          <div className="dropdown">
            <button className="btn btn-outline-light dropdown-toggle" type="button"
              id="dropdownUser"
              data-bs-toggle="dropdown"
              aria-expanded="false">
              <i className="bi bi-person-circle"></i>
            </button>
            <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="dropdownUser">
              {usuarioNombre && usuarioCorreo ? (
                <>
                  <li className="dropdown-item">
                    <strong>{usuarioNombre}</strong>
                  </li>
                  <li className="dropdown-item small">{usuarioCorreo}</li>
                  <li>
                    <hr className="dropdown-divider" />
                  </li>
                  <li>
                    <button className="dropdown-item text-danger" onClick={() => cerrarSesion()}>
                      <i className="bi bi-box-arrow-right me-1"></i> Cerrar sesión
                    </button>
                  </li>
                </>
              ) : (
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

/**
 * Limpia el almacenamiento local y redirige al inicio
 */
const cerrarSesion = () => {
  localStorage.removeItem("idUsuario");
  localStorage.removeItem("nombreUsuario");
  localStorage.removeItem("correoUsuario");
  localStorage.removeItem("rol");
  window.location.href = "/";
};

export default ClienteNavbar;
