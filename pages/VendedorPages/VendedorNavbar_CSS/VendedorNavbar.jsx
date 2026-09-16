import React from "react";
import {
  NavLink,
  useNavigate
} from "react-router-dom";

import "./VendedorNavbar.css";


export function VendedorNavbar() {

  const navigate = useNavigate();

  const nombre =
    localStorage.getItem("nombreUsuario") ||
    "Vendedor";


  const handleLogout = () => {

    localStorage.removeItem("token");
    localStorage.removeItem("idUsuario");
    localStorage.removeItem("idVendedor");
    localStorage.removeItem("rol");
    localStorage.removeItem("nombreUsuario");
    localStorage.removeItem("correoUsuario");

    navigate("/");
  };


  const claseNav = ({ isActive }) =>
    isActive
      ? "vendedor-nav-link active"
      : "vendedor-nav-link";


  return (

    <header className="vendedor-navbar">

      <div className="vendedor-navbar-container">


        {/* ========================= */}
        {/* MARCA */}
        {/* ========================= */}

        <NavLink
          to="/vendedor"
          className="vendedor-brand"
        >

          <div className="vendedor-brand-icon">
            <i className="bi bi-shop"></i>
          </div>

          <div className="vendedor-brand-text">

            <strong>
              Chiringuito Chatarra
            </strong>

            <span>
              Portal del vendedor
            </span>

          </div>

        </NavLink>


        {/* ========================= */}
        {/* BOTÓN MOBILE */}
        {/* ========================= */}

        <button
          className="navbar-toggler vendedor-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#vendedorNavbar"
          aria-controls="vendedorNavbar"
          aria-expanded="false"
          aria-label="Mostrar navegación"
        >

          <span className="navbar-toggler-icon"></span>

        </button>


        {/* ========================= */}
        {/* NAVEGACIÓN */}
        {/* ========================= */}

        <div
          className="collapse navbar-collapse vendedor-collapse"
          id="vendedorNavbar"
        >

          <nav className="vendedor-nav">

            <NavLink
              end
              to="/vendedor"
              className={claseNav}
            >

              <i className="bi bi-grid"></i>

              <span>
                Dashboard
              </span>

            </NavLink>


            <NavLink
              to="/vendedor/ListaTiendas"
              className={claseNav}
            >

              <i className="bi bi-shop-window"></i>

              <span>
                Tiendas
              </span>

            </NavLink>


            <NavLink
              to="/vendedor/AdministrarProductos"
              className={claseNav}
            >

              <i className="bi bi-box-seam"></i>

              <span>
                Productos
              </span>

            </NavLink>


            <NavLink
              to="/vendedor/ListaVentas"
              className={claseNav}
            >

              <i className="bi bi-receipt"></i>

              <span>
                Ventas
              </span>

            </NavLink>

          </nav>


          {/* ========================= */}
          {/* USUARIO */}
          {/* ========================= */}

          <div className="vendedor-user">

            <div className="vendedor-user-info">

              <div className="vendedor-avatar">
                {nombre
                  .trim()
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div className="vendedor-user-text">

                <strong>
                  {nombre}
                </strong>

                <span>
                  Vendedor
                </span>

              </div>

            </div>


            <button
              type="button"
              className="vendedor-logout"
              onClick={handleLogout}
              title="Cerrar sesión"
            >

              <i className="bi bi-box-arrow-right"></i>

              <span>
                Salir
              </span>

            </button>

          </div>

        </div>

      </div>

    </header>
  );
}


export default VendedorNavbar;