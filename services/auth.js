export const obtenerIdUsuario = () => {
    return localStorage.getItem("idUsuario");
  };
  
  export const obtenerRolUsuario = () => {
    return localStorage.getItem("rol");
  };
  
  export const estaAutenticado = () => {
    return !!localStorage.getItem("idUsuario");
  };
  