import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

// Componente de barra de navegación para la vista de vendedor
export function VendedorNavbar() {
  const navigate = useNavigate(); 

  // Función que maneja el cierre de sesión
  const handleLogout = () => {
    localStorage.clear(); // Limpia todos los datos guardados localmente (incluye idVendedor, tokens, etc.)
    navigate('/'); // Redirige al usuario a la página principal o de login
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container-fluid">

        {/* Título o logo de la barra de navegación */}
        <a className="navbar-brand">Chiringuito Chatarra</a>

        {/* Botón de hamburguesa para dispositivos móviles */}
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

        {/* Contenido colapsable del navbar, incluye enlaces de navegación y botón de logout */}
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          
          {/* Lista de enlaces de navegación para el vendedor */}
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">

            {/* Enlace al dashboard o pantalla principal del vendedor */}
            <li className="nav-item">
              <Link className="nav-link" to="/vendedor">
                Home
              </Link>
            </li>

            {/* Enlace para gestionar las tiendas del vendedor */}
            <li className="nav-item">
              <Link className="nav-link" to="/vendedor/ListaTiendas">
                Lista de Tiendas
              </Link>
            </li>

            {/* Enlace para visualizar las ventas realizadas */}
            <li className="nav-item">
              <Link className="nav-link" to="/vendedor/ListaVentas">
                Lista de Ventas
              </Link>
            </li>

            {/* Enlace a la sección de administración de productos */}
            <li className="nav-item">
              <Link className="nav-link" to="/vendedor/AdministrarProductos">
                Administrar Productos
              </Link>
            </li>
          </ul>

          {/* Botón para cerrar sesión */}
          <button
            className="btn btn-danger"
            onClick={handleLogout}
          >
            <i className="bi bi-box-arrow-right"></i> Cerrar Sesión
          </button>
        </div>
      </div>
    </nav>
  );
}

// Exportar el componente para usarlo en otras partes de la app
export default VendedorNavbar;
