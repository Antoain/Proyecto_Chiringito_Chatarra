import React from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({
  children,
  rolesPermitidos = []
}) {
  const token = localStorage.getItem("token");
  const rol = localStorage.getItem("rol");

  // No autenticado
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // Autenticado pero sin rol permitido
  if (
    rolesPermitidos.length > 0 &&
    !rolesPermitidos.includes(rol)
  ) {
    if (rol === "Cliente") {
      return <Navigate to="/cliente" replace />;
    }

    if (rol === "Vendedor") {
      return <Navigate to="/vendedor" replace />;
    }

    if (rol === "Administrador") {
      return <Navigate to="/admin" replace />;
    }

    return <Navigate to="/" replace />;
  }

  return children;
}