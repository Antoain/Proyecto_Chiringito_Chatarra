import React, {
  useEffect,
  useState
} from "react";

import {
  Outlet,
  useLocation
} from "react-router-dom";

import ClienteNavbar
  from "./ClienteNavbar_Css/ClienteNavbar";

import {
  obtenerCategorias,
  obtenerCarritoPorUsuario
} from "../../services/data";


function ClienteLayout() {

  const location =
    useLocation();


  // =====================================================
  // ESTADOS
  // =====================================================

  const [
    categorias,
    setCategorias
  ] = useState([]);

  const [
    busqueda,
    setBusqueda
  ] = useState("");

  const [
    cartCount,
    setCartCount
  ] = useState(0);


  // =====================================================
  // MOSTRAR BÚSQUEDA
  // =====================================================

  const mostrarBusqueda =
    location.pathname ===
      "/cliente" ||
    location.pathname.startsWith(
      "/cliente/categoria/"
    );


  // =====================================================
  // CATEGORÍAS
  // =====================================================

  useEffect(() => {

    const cargarCategorias =
      async () => {

        try {

          const data =
            await obtenerCategorias();

          setCategorias(
            Array.isArray(data)
              ? data
              : []
          );

        } catch (error) {

          console.error(
            "Error al obtener categorías:",
            error
          );
        }
      };


    cargarCategorias();

  }, []);


  // =====================================================
  // CARRITO
  // =====================================================

  const cargarContadorCarrito =
    async () => {

      try {

        const carrito =
          await obtenerCarritoPorUsuario();


        const cantidad =
          Array.isArray(carrito)
            ? carrito.reduce(
                (total, item) =>
                  total +
                  Number(
                    item.cantidad || 0
                  ),
                0
              )
            : 0;


        setCartCount(
          cantidad
        );

      } catch (error) {

        console.error(
          "Error obteniendo contador del carrito:",
          error
        );

        setCartCount(0);
      }
    };


  // Cuando cambia de página
  useEffect(() => {

    cargarContadorCarrito();

  }, [
    location.pathname
  ]);


  // Evento global para actualizar carrito sin cambiar de página
  useEffect(() => {

    const actualizar =
      () => {
        cargarContadorCarrito();
      };


    window.addEventListener(
      "carritoActualizado",
      actualizar
    );


    return () => {

      window.removeEventListener(
        "carritoActualizado",
        actualizar
      );

    };

  }, []);


  // =====================================================
  // LIMPIAR BÚSQUEDA AL SALIR DEL CATÁLOGO
  // =====================================================

  useEffect(() => {

    if (!mostrarBusqueda) {

      setBusqueda("");

    }

  }, [
    mostrarBusqueda
  ]);


  // =====================================================
  // RENDER
  // =====================================================

  return (

    <div>

      <ClienteNavbar
        categorias={categorias}
        mostrarBusqueda={
          mostrarBusqueda
        }
        busqueda={busqueda}
        setBusqueda={setBusqueda}
        cartCount={cartCount}
      />


      <main className="cliente-content">

        <Outlet
          context={{
            busqueda,
            setBusqueda,
            cartCount,
            refrescarCarrito:
              cargarContadorCarrito
          }}
        />

      </main>

    </div>
  );
}


export default ClienteLayout;