// Importaciones necesarias de React y otros módulos
import React, { useEffect, useState } from 'react';
import { obtenerVentasPorVendedor } from '../../services/data'; // Servicio para obtener las ventas del vendedor
import './VendedorPagesCss/VendedorTiendas.css'; // Estilos del componente

// Componente principal que muestra las ventas del vendedor
export function VendedorVentas() {
    // Estado para almacenar la lista de ventas
    const [ventas, setVentas] = useState([]);
    
    // Estado para manejar errores si falla la carga de datos
    const [error, setError] = useState('');

    // Se obtiene el ID del vendedor que ha iniciado sesión desde el localStorage
    const idVendedor = localStorage.getItem("idVendedor");

    // useEffect se ejecuta una vez que el componente se monta
    useEffect(() => {
        // Función asincrónica para cargar las ventas desde el servicio
        const fetchVentas = async () => {
            try {
                // Llamada al servicio para obtener las ventas del vendedor
                const data = await obtenerVentasPorVendedor(idVendedor);
                setVentas(data); // Guardar ventas en el estado
            } catch (error) {
                // En caso de error, mostrar mensaje
                setError('Error al cargar las ventas.');
                console.error(error); // Mostrar error en consola para debug
            }
        };

        // Solo se ejecuta si hay un ID de vendedor válido
        if (idVendedor) fetchVentas();
    }, [idVendedor]); // El efecto depende del ID del vendedor

    // Si ocurre un error, se muestra un mensaje en pantalla
    if (error) return <div className="alert alert-danger">{error}</div>;

    // Renderizado del componente
    return (
        <div className="vendedor-background"> {/* Fondo personalizado */}
            <div className="vendedor-container"> {/* Contenedor principal */}
                <h1>Mis Ventas</h1> {/* Título de la página */}

                {/* Si no hay ventas, se muestra un mensaje */}
                {ventas.length === 0 ? (
                    <p>No se han registrado ventas.</p>
                ) : (
                    // Si hay ventas, se muestra una tabla con los datos
                    <table className="vendedor-table">
                        <thead>
                            <tr>
                                <th>ID Venta</th>
                                <th>Fecha</th>
                                <th>Monto Total</th>
                                <th>Tienda</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* Iterar sobre cada venta y mostrar sus datos */}
                            {ventas.map((venta) => (
                                <tr key={venta.idVenta}>
                                    <td>{venta.idVenta}</td>
                                    {/* Mostrar fecha o un texto alternativo */}
                                    <td>{venta.fechaVenta || "Sin fecha"}</td>
                                    {/* Mostrar monto total con dos decimales */}
                                    <td>${venta.montoTotal.toFixed(2)}</td>
                                    {/* Mostrar el nombre de la tienda o un texto por defecto */}
                                    <td>{venta.idTiendaNavigation?.nombreNegocio || "No definido"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

// Exportar el componente para usarlo en otras partes de la app
export default VendedorVentas;
