import React, { useState, useEffect } from "react";
import {
  obtenerDepartamentos,
  obtenerProvincias,
  obtenerDistritos
} from "../../services/data";
import "./ClientePagesCss/ModalProcesarVenta.css";

const ModalProcesarVenta = ({
  onClose,
  onConfirm,
  carrito
}) => {
  const [departamentos, setDepartamentos] = useState([]);
  const [provincias, setProvincias] = useState([]);
  const [distritos, setDistritos] = useState([]);

  const [selectedDepartamento, setSelectedDepartamento] = useState("");
  const [selectedProvincia, setSelectedProvincia] = useState("");
  const [selectedDistrito, setSelectedDistrito] = useState("");

  const [direccion, setDireccion] = useState("");
  const [telefono, setTelefono] = useState("");
  const [metodoPago, setMetodoPago] = useState("EFECTIVO");

  const [metodosEntrega, setMetodosEntrega] = useState({});

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

  useEffect(() => {
    async function fetchProvincias() {
      if (!selectedDepartamento) {
        setProvincias([]);
        setSelectedProvincia("");
        return;
      }

      try {
        const data = await obtenerProvincias(selectedDepartamento);
        setProvincias(data);
      } catch (error) {
        console.error("Error al obtener provincias:", error);
      }
    }

    fetchProvincias();
  }, [selectedDepartamento]);

  useEffect(() => {
    async function fetchDistritos() {
      if (!selectedProvincia) {
        setDistritos([]);
        setSelectedDistrito("");
        return;
      }

      try {
        const data = await obtenerDistritos(selectedProvincia);
        setDistritos(data);
      } catch (error) {
        console.error("Error al obtener distritos:", error);
      }
    }

    fetchDistritos();
  }, [selectedProvincia]);

  const tiendas = Array.from(
    new Map(
      carrito
        .filter(item => item?.idProductoNavigation?.idTienda)
        .map(item => [
          item.idProductoNavigation.idTienda,
          {
            idTienda: item.idProductoNavigation.idTienda,
            nombre:
              item.idProductoNavigation
                ?.idTiendaNavigation
                ?.nombreNegocio || `Tienda ${item.idProductoNavigation.idTienda}`
          }
        ])
    ).values()
  );

  const handleMetodoEntregaChange = (
    idTienda,
    tipoMetodo
  ) => {
    setMetodosEntrega(prev => ({
      ...prev,
      [idTienda]: tipoMetodo
    }));
  };

  const handleConfirm = () => {
    if (
      !direccion.trim() ||
      !telefono.trim() ||
      !selectedDistrito ||
      !metodoPago
    ) {
      alert("Por favor complete todos los campos necesarios.");
      return;
    }

    const tiendasSinMetodo = tiendas.filter(
      tienda => !metodosEntrega[tienda.idTienda]
    );

    if (tiendasSinMetodo.length > 0) {
      alert(
        "Debe seleccionar un método de entrega para cada tienda."
      );
      return;
    }

    const checkout = {
      idDistrito: Number(selectedDistrito),
      direccionEntrega: direccion.trim(),
      telefono: telefono.trim(),
      metodoPago,
      metodosEntrega: tiendas.map(tienda => ({
        idTienda: tienda.idTienda,
        tipoMetodo: metodosEntrega[tienda.idTienda]
      }))
    };

    onConfirm(checkout);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <h3 className="mb-3">
          Completar datos de compra
        </h3>

        <div className="mb-2">
          <label>Departamento:</label>

          <select
            value={selectedDepartamento}
            onChange={(e) => {
              setSelectedDepartamento(e.target.value);

              setSelectedProvincia("");
              setProvincias([]);

              setSelectedDistrito("");
              setDistritos([]);
            }}
            className="form-select"
          >
            <option value="">
              Seleccione un departamento
            </option>

            {departamentos.map(dep => (
              <option
                key={dep.idDepartamento}
                value={dep.idDepartamento}
              >
                {dep.descripcion}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-2">
          <label>Provincia:</label>

          <select
            value={selectedProvincia}
            onChange={(e) => {
              setSelectedProvincia(e.target.value);

              setSelectedDistrito("");
              setDistritos([]);
            }}
            className="form-select"
            disabled={!selectedDepartamento}
          >
            <option value="">
              Seleccione una provincia
            </option>

            {provincias.map(prov => (
              <option
                key={prov.idProvincia}
                value={prov.idProvincia}
              >
                {prov.descripcion}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-2">
          <label>Distrito:</label>

          <select
            value={selectedDistrito}
            onChange={(e) =>
              setSelectedDistrito(e.target.value)
            }
            className="form-select"
            disabled={!selectedProvincia}
          >
            <option value="">
              Seleccione un distrito
            </option>

            {distritos.map(dist => (
              <option
                key={dist.idDistrito}
                value={dist.idDistrito}
              >
                {dist.descripcion}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-2">
          <label>Dirección:</label>

          <input
            type="text"
            className="form-control"
            value={direccion}
            onChange={(e) =>
              setDireccion(e.target.value)
            }
            placeholder="Ingrese su dirección"
          />
        </div>

        <div className="mb-2">
          <label>Teléfono:</label>

          <input
            type="text"
            className="form-control"
            value={telefono}
            onChange={(e) =>
              setTelefono(e.target.value)
            }
            placeholder="Ingrese su teléfono"
          />
        </div>

        <div className="mb-3">
          <label>Método de pago:</label>

          <select
            className="form-select"
            value={metodoPago}
            onChange={(e) =>
              setMetodoPago(e.target.value)
            }
          >
            <option value="EFECTIVO">
              Efectivo
            </option>

            <option value="TRANSFERENCIA">
              Transferencia
            </option>
          </select>
        </div>

        <hr />

        <h5>Método de entrega por tienda</h5>

        {tiendas.map(tienda => (
          <div
            key={tienda.idTienda}
            className="mb-3"
          >
            <label className="fw-bold">
              {tienda.nombre}
            </label>

            <select
              className="form-select"
              value={
                metodosEntrega[tienda.idTienda] || ""
              }
              onChange={(e) =>
                handleMetodoEntregaChange(
                  tienda.idTienda,
                  e.target.value
                )
              }
            >
              <option value="">
                Seleccione método de entrega
              </option>

              <option value="ENVIO">
                Envío
              </option>

              <option value="RECOGER_TIENDA">
                Recoger en tienda
              </option>
            </select>
          </div>
        ))}

        <div className="modal-actions mt-3 d-flex justify-content-end">
          <button
            onClick={handleConfirm}
            className="btn btn-success me-2"
          >
            Confirmar Compra
          </button>

          <button
            onClick={onClose}
            className="btn btn-secondary"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalProcesarVenta;