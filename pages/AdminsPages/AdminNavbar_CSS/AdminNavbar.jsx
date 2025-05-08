import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export function AdminNavbar() {
  const navigate = useNavigate(); // Hook para redirigir

  const handleLogout = () => {
    // Eliminar datos de sesión (si se usan)
    localStorage.clear(); // Esto borra cualquier dato en localStorage

    // Redirigir al login
    navigate('/');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container-fluid">
        <a className="navbar-brand">Chiringuito Chatarra</a>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className="nav-link" to="/admin">
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/admin/usuarios">
                Usuarios
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/admin/tiendas">
                Tiendas
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/admin/categorias">
                Categorías
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/admin/productos">
                Productos
              </Link>
            </li>
          </ul>

          <button
            className="btn btn-danger"
            onClick={handleLogout} // Llama a la función para cerrar sesión
          >
            <i className="bi bi-box-arrow-right"></i> Cerrar Sesión
          </button>
        </div>
      </div>
    </nav>
  );
}

export default AdminNavbar;
