import React from 'react';
// Importamos el archivo de estilos CSS
import './AdminPagesCss/AdminHome.css';

// Componente funcional que representa la página de inicio del administrador
export function AdminHome() {
  return (
    // Contenedor principal con clase para estilos
    <div className="admin-home">
      {/* Mensaje de bienvenida */}
      <div className="welcome-message">
        <h1>Bienvenido al área de administración</h1>
        <p>Accede a alguna de las opciones para empezar</p>
      </div>
    </div>
  );
}

// Exportación por defecto del componente
export default AdminHome;