import React, { useState, useEffect } from "react";
import { 
  obtenerDepartamentos, 
  obtenerProvincias, 
  obtenerDistritos 
} from "../../services/data"; 
import './ClientePagesCss/ModalProcesarVenta.css' // Estilos del modal

const ModalProcesarVenta = ({ onClose, onConfirm, total, totalProductos }) => {
  // Estados para los combos jerárquicos de ubicación
  const [departamentos, setDepartamentos] = useState([]);
  const [provincias, setProvincias] = useState([]);
  const [distritos, setDistritos] = useState([]);

  const [selectedDepartamento, setSelectedDepartamento] = useState("");
  const [selectedProvincia, setSelectedProvincia] = useState("");
  const [selectedDistrito, setSelectedDistrito] = useState("");

  // Dirección y teléfono del cliente
  const [direccion, setDireccion] = useState("");
  const [telefono, setTelefono] = useState("");

  // Cargar departamentos al montar el componente
  useEffect(() => {
    async function fetchDepartamentos() {
      try {
        const data = await obtenerDepartamentos();
        setDepartamentos(data);
      } catch (error) {
        console.error("Error al obtener departamentos:", error);
      }
    }
    fetchDepartamentos();
  }, []);

  // Cuando se selecciona departamento carga las provincias correspondientes
  useEffect(() => {
    async function fetchProvincias() {
      if (selectedDepartamento) {
        try {
          const data = await obtenerProvincias(selectedDepartamento);
          setProvincias(data);
        } catch (error) {
          console.error("Error al obtener provincias:", error);
        }
      } else {
        setProvincias([]);
        setSelectedProvincia("");
      }
    }
    fetchProvincias();
  }, [selectedDepartamento]);

  // Cuando se selecciona provincia carga los distritos correspondientes
  useEffect(() => {
    async function fetchDistritos() {
      if (selectedProvincia) {
        try {
          const data = await obtenerDistritos(selectedProvincia);
          setDistritos(data);
        } catch (error) {
          console.error("Error al obtener distritos:", error);
        }
      } else {
        setDistritos([]);
        setSelectedDistrito("");
      }
    }
    fetchDistritos();
  }, [selectedProvincia]);

  // Maneja la confirmación de la compra
  const handleConfirm = () => {
    // Validar campos obligatorios
    if (!direccion.trim() || !telefono.trim() || !selectedDistrito) {
      alert("Por favor complete todos los campos necesarios.");
      return;
    }
    // Construye el objeto de venta
    const venta = {
      idUsuario: Number(localStorage.getItem("idUsuario")),
      idTienda: 1, 
      totalProducto: totalProductos, 
      montoTotal: total, 
      direccion,
      idDistrito: Number(selectedDistrito),
      telefono,
      estado: "Pendiente",
      detalleVenta: [] 
    };

    onConfirm(venta);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <h3 className="mb-3">Completar datos de compra</h3>
        
        <div className="mb-2">
          <label>Departamento:</label>
          <select value={selectedDepartamento} onChange={(e) => {
              setSelectedDepartamento(e.target.value);

              // Reiniciamos cascadas dependientes
              setSelectedProvincia("");
              setProvincias([]);
              setSelectedDistrito("");
              setDistritos([]);
            }}
            className="form-select">

            <option value="">Seleccione un departamento</option>
            {departamentos.map((dep) => (
              <option key={dep.idDepartamento} value={dep.idDepartamento}>
                {dep.descripcion}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-2">
          <label>Provincia:</label>
          <select value={selectedProvincia} onChange={(e) => {
              setSelectedProvincia(e.target.value);

              // Reiniciamos los distritos
              setSelectedDistrito("");
              setDistritos([]);
            }}
            className="form-select" disabled={!selectedDepartamento}>

            <option value="">Seleccione una provincia</option>
            {provincias.map((prov) => (
              <option key={prov.idProvincia} value={prov.idProvincia}>
                {prov.descripcion}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-2">
          <label>Distrito:</label>
          <select value={selectedDistrito} onChange={(e) => setSelectedDistrito(e.target.value)} className="form-select" disabled={!selectedProvincia}>

            <option value="">Seleccione un distrito</option>
            {distritos.map((dist) => (
              <option key={dist.idDistrito} value={dist.idDistrito}>
                {dist.descripcion}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-2">
          <label>Dirección:</label>
          <input type="text" className="form-control" value={direccion} onChange={(e) => setDireccion(e.target.value)} placeholder="Ingrese su dirección"/>
        </div>

        <div className="mb-2">
          <label>Teléfono:</label>
          <input type="text" className="form-control" value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="Ingrese su teléfono"/>
        </div>

        <div className="modal-actions mt-3 d-flex justify-content-end">
          <button onClick={handleConfirm} className="btn btn-success me-2">
            Confirmar Compra
          </button>
          <button onClick={onClose} className="btn btn-secondary">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

// Exportar el componente para usarlo en otras partes de la app
export default ModalProcesarVenta;
