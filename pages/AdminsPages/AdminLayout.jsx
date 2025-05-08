import React from 'react';
// Importa la barra de navegación del administrador desde la carpeta específica
import AdminNavbar from './AdminNavbar_CSS/AdminNavbar';
// Importa Outlet para renderizar rutas hijas desde React Router
import { Outlet } from 'react-router-dom';

// Componente de layout principal para el área de administrador
function AdminLayout() {
  return (
    <div>
      {/* NAVBAR SUPERIOR: aparece en todas las páginas del panel de administración */}
      <AdminNavbar />

      {/* CONTENIDO DINÁMICO: aquí se renderiza el componente hijo según la ruta actual */}
      <div className="admin-content">
        <Outlet />
      </div>
    </div>
  );
}

export default AdminLayout;
