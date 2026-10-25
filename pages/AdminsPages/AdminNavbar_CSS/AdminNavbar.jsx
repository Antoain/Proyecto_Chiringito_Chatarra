
import React from "react";
import {
  NavLink,
  useNavigate
} from "react-router-dom";

const opciones = [
  {
    titulo: "PRINCIPAL",
    enlaces: [
      {
        nombre: "Dashboard",
        ruta: "/admin",
        icono: "bi-speedometer2",
        exacta: true
      },
      {
        nombre: "Minería de datos",
        ruta: "/admin/mineria",
        icono: "bi-diagram-3"
      }
    ]
  },
  {
    titulo: "ADMINISTRACIÓN",
    enlaces: [
      {
        nombre: "Usuarios",
        ruta: "/admin/usuarios",
        icono: "bi-people"
      },
      {
        nombre: "Tiendas",
        ruta: "/admin/tiendas",
        icono: "bi-shop"
      },
      {
        nombre: "Categorías",
        ruta: "/admin/categorias",
        icono: "bi-grid"
      },
      {
        nombre: "Pedidos",
        ruta: "/admin/pedidos",
        icono: "bi-bag-check"
      },
      {
        nombre: "Entregas",
        ruta: "/admin/entregas",
        icono: "bi-truck"
      },
      {
        nombre: "Productos",
        ruta: "/admin/Productos",
        icono: "bi-box-seam"
      },
      {
        nombre: "Promociones",
        ruta: "/admin/promociones",
        icono: "bi-tags"
      },
      
    ]
  }
];

export function AdminNavbar({
  menuAbierto = false,
  cerrarMenu = () => {}
}) {
  const navigate = useNavigate();

  const cerrarSesion = () => {
    // Eliminar exclusivamente los datos de sesión.
    localStorage.removeItem("token");
    localStorage.removeItem("rol");
    localStorage.removeItem("idUsuario");
    localStorage.removeItem("idVendedor");
    localStorage.removeItem("nombreUsuario");
    localStorage.removeItem("correoUsuario");

    cerrarMenu();
    navigate("/", { replace: true });
  };

  const nombre =
    localStorage.getItem("nombreUsuario") ||
    "Administrador";

  return (
    <>
      {menuAbierto && (
        <button
          type="button"
          className="al-overlay"
          aria-label="Cerrar menú de administración"
          onClick={cerrarMenu}
        />
      )}

      <aside
        className={
          `al-sidebar ${menuAbierto ? "al-sidebar-abierto" : ""}`
        }
        id="al-sidebar"
        aria-label="Navegación administrativa"
      >
        {/* MARCA */}

        <div className="al-sidebar-marca">
          <NavLink
            to="/admin"
            end
            className="al-logo"
            onClick={cerrarMenu}
          >
            <span className="al-logo-icono">
              <i className="bi bi-shop-window" />
            </span>

            <span className="al-logo-textos">
              <strong>Chiringuito</strong>
              <small>CHATARRA · ADMIN</small>
            </span>
          </NavLink>

          <button
            className="al-sidebar-cerrar"
            type="button"
            aria-label="Cerrar navegación"
            onClick={cerrarMenu}
          >
            <i className="bi bi-x-lg" />
          </button>
        </div>

        {/* IDENTIDAD */}

        <div className="al-sidebar-identidad">
          <span className="al-sidebar-identidad-icono">
            <i className="bi bi-shield-check" />
          </span>

          <div>
            <strong>Centro de control</strong>
            <small>Panel de administración</small>
          </div>
        </div>

        {/* ENLACES */}

        <nav className="al-nav" aria-label="Secciones">
          {opciones.map(grupo => (
            <div
              className="al-nav-grupo"
              key={grupo.titulo}
            >
              <span className="al-nav-titulo">
                {grupo.titulo}
              </span>

              {grupo.enlaces.map(enlace => (
                <NavLink
                  key={enlace.ruta}
                  to={enlace.ruta}
                  end={enlace.exacta}
                  onClick={cerrarMenu}
                  className={({ isActive }) =>
                    `al-nav-enlace ${
                      isActive
                        ? "al-nav-enlace-activo"
                        : ""
                    }`
                  }
                >
                  <i className={`bi ${enlace.icono}`} />

                  <span>{enlace.nombre}</span>

                  <i className="bi bi-chevron-right al-nav-flecha" />
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* PIE */}

        <div className="al-sidebar-pie">
          <div className="al-perfil">
            <span className="al-perfil-avatar">
              {nombre.charAt(0).toUpperCase()}
            </span>

            <div>
              <strong title={nombre}>
                {nombre}
              </strong>
              <small>Administrador</small>
            </div>
          </div>

          <button
            type="button"
            className="al-cerrar-sesion"
            onClick={cerrarSesion}
          >
            <i className="bi bi-box-arrow-right" />
            Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  );
}

export default AdminNavbar;
