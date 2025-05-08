import React, { useState, useEffect } from 'react';
import ClienteNavbarSinBusqueda from './ClienteNavbar_Css/ClienteNavbarSinBarra';
import { Outlet } from 'react-router-dom';
import { obtenerCategorias } from '../../services/data';

function ClienteLayoutSinBusqueda() {
  const [categorias, setCategorias] = useState([]);

  // Al montar el componente, obtiene las categorías disponibles desde la API
  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const data = await obtenerCategorias(); // Llama al servicio
        setCategorias(data); // Guarda las categorías en el estado
      } catch (error) {
        console.error("Error al obtener categorías:", error); // Log de errores
      }
    };

    fetchCategorias();
  }, []); // Solo se ejecuta una vez al montar el componente

  return (
    <div>
      {/* Navbar sin barra de búsqueda, recibe las categorías como prop */}
      <ClienteNavbarSinBusqueda categorias={categorias} />

      {/* Área para renderizar rutas hijas (Outlet de React Router) */}
      <div className="cliente-content">
        <Outlet />
      </div>
    </div>
  );
}

export default ClienteLayoutSinBusqueda;
