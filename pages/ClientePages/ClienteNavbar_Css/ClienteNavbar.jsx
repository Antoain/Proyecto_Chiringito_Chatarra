import React from "react";
import {
  Link,
  NavLink
} from "react-router-dom";

import "./ClienteNavbar.css";


export function ClienteNavbar({
  categorias = [],
  mostrarBusqueda = false,
  busqueda = "",
  setBusqueda = () => {},
  cartCount = 0
}) {

  const usuarioNombre =
    localStorage.getItem(
      "nombreUsuario"
    );

  const usuarioCorreo =
    localStorage.getItem(
      "correoUsuario"
    );


  // =====================================================
  // CLASE NAVLINK
  // =====================================================

  const claseNav = ({
    isActive
  }) => {

    return (
      "cliente-nav-link" +
      (
        isActive
          ? " active"
          : ""
      )
    );
  };


  // =====================================================
  // LOGOUT
  // =====================================================

  const cerrarSesion = () => {

    localStorage.removeItem(
      "token"
    );

    localStorage.removeItem(
      "idUsuario"
    );

    localStorage.removeItem(
      "idVendedor"
    );

    localStorage.removeItem(
      "nombreUsuario"
    );

    localStorage.removeItem(
      "correoUsuario"
    );

    localStorage.removeItem(
      "rol"
    );


    window.location.href = "/";
  };


  return (

    <nav className="cliente-navbar">

      <div className="cliente-navbar-container">


        {/* ================================================= */}
        {/* BRAND */}
        {/* ================================================= */}

        <Link
          to="/cliente"
          className="cliente-brand"
        >

          <div className="cliente-brand-icon">

            <i className="bi bi-recycle"></i>

          </div>


          <div>

            <strong>
              Chiringuito
            </strong>

            <span>
              Chatarra
            </span>

          </div>

        </Link>


        {/* ================================================= */}
        {/* CATEGORÍAS */}
        {/* ================================================= */}

        <div className="dropdown cliente-categories">

          <button
            className="cliente-category-btn dropdown-toggle"
            type="button"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >

            <i className="bi bi-grid"></i>

            <span>
              Categorías
            </span>

          </button>


          <ul className="dropdown-menu cliente-category-menu">

            {categorias.length === 0 ? (

              <li>

                <span className="dropdown-item-text text-muted">

                  Sin categorías

                </span>

              </li>

            ) : (

              categorias.map(
                categoria => (

                  <li
                    key={
                      categoria.idCategoria
                    }
                  >

                    <Link
                      className="dropdown-item"
                      to={
                        `/cliente/categoria/${categoria.idCategoria}`
                      }
                    >

                      {
                        categoria.descripcion
                      }

                    </Link>

                  </li>

                )
              )

            )}

          </ul>

        </div>


        {/* ================================================= */}
        {/* BÚSQUEDA CONDICIONAL */}
        {/* ================================================= */}

        {mostrarBusqueda && (

          <div className="cliente-search">

            <i className="bi bi-search"></i>

            <input
              type="search"
              value={busqueda}
              onChange={e =>
                setBusqueda(
                  e.target.value
                )
              }
              placeholder="Buscar productos..."
            />

            {busqueda && (

              <button
                type="button"
                onClick={() =>
                  setBusqueda("")
                }
                title="Limpiar búsqueda"
              >

                <i className="bi bi-x"></i>

              </button>

            )}

          </div>

        )}


        {/* ================================================= */}
        {/* NAVEGACIÓN */}
        {/* ================================================= */}

        <div
          className={
            mostrarBusqueda
              ? "cliente-nav-actions"
              : "cliente-nav-actions cliente-nav-actions-spacer"
          }
        >


          <NavLink
            to="/cliente"
            end
            className={claseNav}
            title="Inicio"
          >

            <i className="bi bi-house"></i>

            <span>
              Inicio
            </span>

          </NavLink>


          <NavLink
            to="/cliente/favoritos"
            className={claseNav}
            title="Favoritos"
          >

            <i className="bi bi-heart"></i>

            <span>
              Favoritos
            </span>

          </NavLink>


          <NavLink
            to="/cliente/pedidos"
            className={claseNav}
            title="Mis pedidos"
          >

            <i className="bi bi-bag-check"></i>

            <span>
              Pedidos
            </span>

          </NavLink>


          <NavLink
            to="/cliente/carrito"
            className={
              ({ isActive }) =>
                "cliente-nav-link cliente-cart-link" +
                (
                  isActive
                    ? " active"
                    : ""
                )
            }
            title="Carrito"
          >

            <div className="cliente-cart-icon">

              <i className="bi bi-cart3"></i>

              {cartCount > 0 && (

                <span className="cliente-cart-badge">

                  {
                    cartCount > 99
                      ? "99+"
                      : cartCount
                  }

                </span>

              )}

            </div>

            <span>
              Carrito
            </span>

          </NavLink>


          {/* ============================================= */}
          {/* USUARIO */}
          {/* ============================================= */}

          <div className="dropdown">

            <button
              className="cliente-user-btn dropdown-toggle"
              type="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >

              <div className="cliente-user-avatar">

                {
                  usuarioNombre
                    ?.charAt(0)
                    ?.toUpperCase() ||
                  <i className="bi bi-person"></i>
                }

              </div>


              <div className="cliente-user-info">

                <strong>

                  {
                    usuarioNombre ||
                    "Mi cuenta"
                  }

                </strong>

                <span>

                  {
                    usuarioCorreo ||
                    "Cliente"
                  }

                </span>

              </div>

            </button>


            <ul className="dropdown-menu dropdown-menu-end cliente-user-menu">


              {usuarioNombre && (

                <>

                  <li className="cliente-user-dropdown-header">

                    <span>
                      Sesión iniciada como
                    </span>

                    <strong>
                      {usuarioNombre}
                    </strong>

                    {usuarioCorreo && (

                      <small>
                        {usuarioCorreo}
                      </small>

                    )}

                  </li>


                  <li>
                    <hr className="dropdown-divider" />
                  </li>

                </>

              )}


              <li>

                <Link
                  className="dropdown-item"
                  to="/cliente/pedidos"
                >

                  <i className="bi bi-bag-check"></i>

                  Mis pedidos

                </Link>

              </li>


              <li>

                <Link
                  className="dropdown-item"
                  to="/cliente/favoritos"
                >

                  <i className="bi bi-heart"></i>

                  Favoritos

                </Link>

              </li>


              <li>
                <hr className="dropdown-divider" />
              </li>


              <li>

                <button
                  type="button"
                  className="dropdown-item text-danger"
                  onClick={
                    cerrarSesion
                  }
                >

                  <i className="bi bi-box-arrow-right"></i>

                  Cerrar sesión

                </button>

              </li>


            </ul>

          </div>


        </div>


      </div>

    </nav>
  );
}


export default ClienteNavbar;