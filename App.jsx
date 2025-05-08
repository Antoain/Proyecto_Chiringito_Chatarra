import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

// ====== Importar las páginas específicas ========

// Páginas de Cliente
import ClienteLayout from './pages/ClientePages/ClienteLayout';
import ClienteLayoutSinBusqueda from './pages/ClientePages/ClienteLayoutSinBarra';
import ClienteHome from './pages/ClientePages/ClienteHome';
import ClienteFavoritos from './pages/ClientePages/ClienteFavoritos'
import ProductosPorCategoria from './pages/ClientePages/ClienteProductosPorCat';
import ClienteProductoDetalles from './pages/ClientePages/ClienteProductoDetalle';
import ClienteCarrito from './pages/ClientePages/ClienteCarrito';
// Páginas de Vendedor
import VendedorLayout from  './pages/VendedorPages/VendedorLayout'
import VendedorHome from './pages/VendedorPages/VendedorHome';
import VendedorTiendas from './pages/VendedorPages/VendedorTiendas'
import VendedorProductos from './pages/VendedorPages/VendedorProductos';
import VendedorVentas from './pages/VendedorPages/VendedorVentas'

// Páginas de Administrador
import AdminLayout from './pages/AdminsPages/AdminLayout';
import AdminHome from './pages/AdminsPages/AdminHome';
import AdministrarUsuarios from './pages/AdminsPages/AdminUsuarios';
import AdministrarCategorias from './pages/AdminsPages/AdminCategoria';
import AdministrarTiendas from './pages/AdminsPages/AdminTienda';
import AdministrarProductos from './pages/AdminsPages/AdminProducto';
// Páginas de autenticación
import LoginPage from './pages/LoginsPages/login';
import CrearCuenta from './pages/LoginsPages/CrearCuenta';  // Importar la página de registro


export function App() {
    return (
        <Router>
            <Routes>
                {/* Página principal */}
                <Route path="/" element={<LoginPage />} />
                
                {/* Ruta de registro */}
                <Route path="/register" element={<CrearCuenta />} />

                {/* Rutas para Cliente */}
                <Route path="/cliente" element={<ClienteLayout />} >
                    <Route index element={<ClienteHome />} />
                    <Route path="favoritos" element={<ClienteFavoritos />} /> 
                    <Route path="categoria/:idCategoria" element={<ProductosPorCategoria />} />

                </Route>

                <Route path="/cliente" element={<ClienteLayoutSinBusqueda />}>
                    <Route path="detalles/:idProducto" element={<ClienteProductoDetalles />} />
                    <Route path="carrito" element={<ClienteCarrito />} />
                </Route>

                {/* Rutas para Vendedor */}

                <Route path="/vendedor" element={<VendedorLayout />} >
                    <Route index element={<VendedorHome />} />
                    <Route path="ListaTiendas" element={<VendedorTiendas/>} />
                    <Route path="AdministrarProductos" element={<VendedorProductos/>} />
                    <Route path="ListaVentas" element={<VendedorVentas/>} />

                </Route>

        
                {/* Rutas para Administrador */}
                <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<AdminHome />} />
                    <Route path="usuarios" element={<AdministrarUsuarios />} />
                    <Route path="categorias" element={<AdministrarCategorias />} />
                    <Route path="tiendas" element={<AdministrarTiendas/>} />
                    <Route path="Productos" element={<AdministrarProductos/>} />
                </Route>
            </Routes>
        </Router>
    );
}

export default App;