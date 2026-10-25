
import React, {
  useEffect,
  useState
} from "react";

import {
  Outlet,
  useLocation
} from "react-router-dom";

import AdminNavbar from "./AdminNavbar_CSS/AdminNavbar";

import "./AdminNavbar_CSS/AdminNavbar.css";

const paginas = {
  "/admin": {
    titulo: "Dashboard",
    descripcion: "Visión general de la plataforma",
    icono: "bi-speedometer2"
  },
  "/admin/usuarios": {
    titulo: "Usuarios",
    descripcion: "Administración de cuentas",
    icono: "bi-people"
  },
  "/admin/tiendas": {
    titulo: "Tiendas",
    descripcion: "Gestión de negocios",
    icono: "bi-shop"
  },
  "/admin/categorias": {
    titulo: "Categorías",
    descripcion: "Organización del catálogo",
    icono: "bi-grid"
  },
  "/admin/productos": {
    titulo: "Productos",
    descripcion: "Supervisión del catálogo",
    icono: "bi-box-seam"
  },
  "/admin/promociones": {
  titulo: "Promociones",
  descripcion: "Supervisión de descuentos y campañas",
  icono: "bi-tags"
  },
  "/admin/pedidos": {
  titulo: "Pedidos",
  descripcion: "Supervisión de pedidos globales",
  icono: "bi-bag-check"
  },
  "/admin/entregas": {
  titulo: "Entregas",
  descripcion: "Supervisión logística global",
  icono: "bi-truck"
  },
  "/admin/mineria": {
    titulo: "Minería de datos",
    descripcion: "Análisis y predicciones",
    icono: "bi-diagram-3"
  }
};

function AdminLayout() {
  const location = useLocation();

  const [menuAbierto, setMenuAbierto] =
    useState(false);

  const ruta = location.pathname
    .replace(/\/+$/, "")
    .toLowerCase() || "/admin";

  const pagina = paginas[ruta] || {
    titulo: "Administración",
    descripcion: "Centro de control",
    icono: "bi-gear"
  };

  useEffect(() => {
    setMenuAbierto(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!menuAbierto) return;

    const overflowAnterior =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const cerrarConEscape = evento => {
      if (evento.key === "Escape") {
        setMenuAbierto(false);
      }
    };

    document.addEventListener(
      "keydown",
      cerrarConEscape
    );

    return () => {
      document.body.style.overflow =
        overflowAnterior;

      document.removeEventListener(
        "keydown",
        cerrarConEscape
      );
    };
  }, [menuAbierto]);

  return (
    <div className="al-layout">
      <AdminNavbar
        menuAbierto={menuAbierto}
        cerrarMenu={() => setMenuAbierto(false)}
      />

      <div className="al-principal">
        {/* BARRA SUPERIOR */}

        <header className="al-topbar">
          <div className="al-topbar-izquierda">
            <button
              type="button"
              className="al-menu-boton"
              onClick={() =>
                setMenuAbierto(valor => !valor)
              }
              aria-label={
                menuAbierto
                  ? "Cerrar menú"
                  : "Abrir menú"
              }
              aria-expanded={menuAbierto}
              aria-controls="al-sidebar"
            >
              <i
                className={
                  `bi ${
                    menuAbierto
                      ? "bi-x-lg"
                      : "bi-list"
                  }`
                }
              />
            </button>

            <div className="al-topbar-titulo">
              <span>
                PANEL ADMINISTRATIVO
              </span>

              <div>
                <i className={`bi ${pagina.icono}`} />
                <h2>{pagina.titulo}</h2>
              </div>
            </div>
          </div>

          <div className="al-topbar-derecha">
            <span className="al-topbar-descripcion">
              {pagina.descripcion}
            </span>

            <span
              className="al-topbar-rol"
              title="Sesión de administrador"
            >
              <i className="bi bi-shield-check" />
              Administrador
            </span>
          </div>
        </header>

        {/* PÁGINAS */}

        <div className="al-contenido">
          <Outlet />
        </div>

        {/* PIE GLOBAL */}

        <footer className="al-footer">
          <span>
            Chiringuito Chatarra · Administración
          </span>

          <span>
            Sistema de información gerencial
          </span>
        </footer>
      </div>
    </div>
  );
}

export default AdminLayout;
