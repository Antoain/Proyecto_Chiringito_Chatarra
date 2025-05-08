import React, { useState, useEffect } from 'react';
import ClienteNavbar from './ClienteNavbar_Css/ClienteNavbar';
import { Outlet } from 'react-router-dom';
import { obtenerCategorias } from '../../services/data';

function ClienteLayout() {
  // Estado para guardar las categorías del sistema
  const [categorias, setCategorias] = useState([]);

  // Estado para manejar el valor de búsqueda global
  const [busqueda, setBusqueda] = useState("");

  // Efecto para cargar las categorías al montar el componente
  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const data = await obtenerCategorias(); // Llama a la API de categorías
        setCategorias(data); // Guarda en el estado
      } catch (error) {
        console.error("Error al obtener categorías:", error); // Log de error
      }
    };

    fetchCategorias();
  }, []); // Solo se ejecuta una vez

  return (
    <div>
      {/* Navbar con barra de búsqueda. Se pasa el estado de búsqueda como prop */}
      <ClienteNavbar 
        categorias={categorias} 
        busqueda={busqueda} 
        setBusqueda={setBusqueda} 
      />

      {/* Outlet de rutas hijas, se pasa el contexto de búsqueda a los hijos */}
      <div className="cliente-content">
        <Outlet context={{ busqueda, setBusqueda }} />
      </div>
    </div>
  );
}

export default ClienteLayout;
