import React from 'react';
import VendedorNavbar from './VendedorNavbar_CSS/VendedorNavbar';
import { Outlet } from 'react-router-dom';

function VendedorLayout() {
  return (
    <div>
      {/* Navbar superior */}
      <VendedorNavbar />

      {/* Contenido dinámico */}
      <div className="Vendedor-content" >
        <Outlet />
      </div>
    </div>
  );
}
// Exportar el componente para usarlo en otras partes de la app
export default VendedorLayout;