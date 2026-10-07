import React, {
  useEffect,
  useMemo,
  useState
} from "react";

import {
  obtenerDepartamentos,
  obtenerProvincias,
  obtenerDistritos,
  obtenerMetodosEntregaPorTienda
} from "../../services/data";

import "./ClientePagesCss/ModalProcesarVenta.css";


const ModalProcesarVenta = ({
  onClose,
  onConfirm,
  carrito
}) => {

  // =====================================================
  // LOCALIZACIÓN
  // =====================================================

  const [
    departamentos,
    setDepartamentos
  ] = useState([]);

  const [
    provincias,
    setProvincias
  ] = useState([]);

  const [
    distritos,
    setDistritos
  ] = useState([]);


  const [
    selectedDepartamento,
    setSelectedDepartamento
  ] = useState("");

  const [
    selectedProvincia,
    setSelectedProvincia
  ] = useState("");

  const [
    selectedDistrito,
    setSelectedDistrito
  ] = useState("");


  // =====================================================
  // DATOS DE ENTREGA
  // =====================================================

  const [
    direccion,
    setDireccion
  ] = useState("");

  const [
    telefono,
    setTelefono
  ] = useState("");

  const [
    metodoPago,
    setMetodoPago
  ] = useState("EFECTIVO");


  // =====================================================
  // MÉTODOS DE ENTREGA
  // =====================================================

  const [
    metodosDisponibles,
    setMetodosDisponibles
  ] = useState({});

  const [
    metodosEntrega,
    setMetodosEntrega
  ] = useState({});

  const [
    cargandoMetodos,
    setCargandoMetodos
  ] = useState(false);

  const [
    errorMetodos,
    setErrorMetodos
  ] = useState("");


  // =====================================================
  // TIENDAS DEL CARRITO
  // =====================================================

  const tiendas = useMemo(() => {

    return Array.from(
      new Map(
        carrito
          .filter(
            item =>
              item
                ?.idProductoNavigation
                ?.idTienda
          )
          .map(
            item => {

              const producto =
                item.idProductoNavigation;

              const idTienda =
                producto.idTienda;


              return [
                idTienda,
                {
                  idTienda,

                  nombre:
                    producto
                      ?.idTiendaNavigation
                      ?.nombreNegocio ||
                    `Tienda ${idTienda}`
                }
              ];
            }
          )
      ).values()
    );

  }, [carrito]);


  // =====================================================
  // CARGAR DEPARTAMENTOS
  // =====================================================

  useEffect(() => {

    const cargarDepartamentos =
      async () => {

        try {

          const data =
            await obtenerDepartamentos();


          setDepartamentos(
            Array.isArray(data)
              ? data
              : []
          );

        } catch (error) {

          console.error(
            "Error al obtener departamentos:",
            error
          );
        }
      };


    cargarDepartamentos();

  }, []);


  // =====================================================
  // CARGAR PROVINCIAS
  // =====================================================

  useEffect(() => {

    const cargarProvincias =
      async () => {

        if (!selectedDepartamento) {

          setProvincias([]);

          setSelectedProvincia("");

          return;
        }


        try {

          const data =
            await obtenerProvincias(
              selectedDepartamento
            );


          setProvincias(
            Array.isArray(data)
              ? data
              : []
          );

        } catch (error) {

          console.error(
            "Error al obtener provincias:",
            error
          );
        }
      };


    cargarProvincias();

  }, [
    selectedDepartamento
  ]);


  // =====================================================
  // CARGAR DISTRITOS
  // =====================================================

  useEffect(() => {

    const cargarDistritos =
      async () => {

        if (!selectedProvincia) {

          setDistritos([]);

          setSelectedDistrito("");

          return;
        }


        try {

          const data =
            await obtenerDistritos(
              selectedProvincia
            );


          setDistritos(
            Array.isArray(data)
              ? data
              : []
          );

        } catch (error) {

          console.error(
            "Error al obtener distritos:",
            error
          );
        }
      };


    cargarDistritos();

  }, [
    selectedProvincia
  ]);


  // =====================================================
  // CARGAR MÉTODOS ACTIVOS POR TIENDA
  // =====================================================

  useEffect(() => {

    const cargarMetodos =
      async () => {

        if (
          !tiendas ||
          tiendas.length === 0
        ) {
          return;
        }


        try {

          setCargandoMetodos(true);

          setErrorMetodos("");


          const resultados =
            await Promise.all(
              tiendas.map(
                async tienda => {

                  try {

                    const metodos =
                      await obtenerMetodosEntregaPorTienda(
                        tienda.idTienda
                      );


                    return {
                      idTienda:
                        tienda.idTienda,

                      metodos:
                        Array.isArray(
                          metodos
                        )
                          ? metodos
                          : []
                    };

                  } catch (error) {

                    console.error(
                      `Error cargando métodos de la tienda ${tienda.idTienda}:`,
                      error
                    );


                    return {
                      idTienda:
                        tienda.idTienda,

                      metodos: []
                    };
                  }
                }
              )
            );


          const mapa = {};


          resultados.forEach(
            resultado => {

              mapa[
                resultado.idTienda
              ] =
                resultado.metodos;

            }
          );


          setMetodosDisponibles(
            mapa
          );


          // Seleccionar automáticamente
          // si solo existe un método disponible

          const seleccionInicial = {};


          resultados.forEach(
            resultado => {

              if (
                resultado.metodos.length ===
                1
              ) {

                seleccionInicial[
                  resultado.idTienda
                ] =
                  resultado
                    .metodos[0]
                    .tipoMetodo;
              }
            }
          );


          setMetodosEntrega(
            seleccionInicial
          );


          const tiendasSinMetodos =
            resultados.filter(
              resultado =>
                resultado.metodos
                  .length === 0
            );


          if (
            tiendasSinMetodos.length > 0
          ) {

            setErrorMetodos(
              "Una o más tiendas no tienen métodos de entrega activos."
            );
          }

        } catch (error) {

          console.error(
            "Error cargando métodos de entrega:",
            error
          );


          setErrorMetodos(
            "No se pudieron cargar los métodos de entrega."
          );

        } finally {

          setCargandoMetodos(
            false
          );
        }
      };


    cargarMetodos();

  }, [tiendas]);


  // =====================================================
  // CAMBIAR MÉTODO
  // =====================================================

  const handleMetodoEntregaChange = (
    idTienda,
    tipoMetodo
  ) => {

    setMetodosEntrega(
      prev => ({
        ...prev,

        [idTienda]:
          tipoMetodo
      })
    );
  };


  // =====================================================
  // CONFIRMAR
  // =====================================================

  const handleConfirm = () => {

    if (
      !direccion.trim() ||
      !telefono.trim() ||
      !selectedDistrito ||
      !metodoPago
    ) {

      alert(
        "Por favor complete todos los campos necesarios."
      );

      return;
    }


    const tiendasSinMetodo =
      tiendas.filter(
        tienda =>
          !metodosEntrega[
            tienda.idTienda
          ]
      );


    if (
      tiendasSinMetodo.length > 0
    ) {

      alert(
        "Debe seleccionar un método de entrega para cada tienda."
      );

      return;
    }


    const checkout = {

      idDistrito:
        Number(
          selectedDistrito
        ),

      direccionEntrega:
        direccion.trim(),

      telefono:
        telefono.trim(),

      metodoPago,

      metodosEntrega:
        tiendas.map(
          tienda => ({

            idTienda:
              tienda.idTienda,

            tipoMetodo:
              metodosEntrega[
                tienda.idTienda
              ]
          })
        )
    };


    console.log(
      "CHECKOUT ENVIADO:",
      JSON.stringify(
        checkout,
        null,
        2
      )
    );

    onConfirm(
      checkout
    );
  };


  // =====================================================
  // RENDER
  // =====================================================

  return (

    <div className="modal-overlay">

      <div className="modal-container">


        <h3 className="mb-3">
          Completar datos de compra
        </h3>


        {/* ================================================= */}
        {/* UBICACIÓN */}
        {/* ================================================= */}

        <div className="mb-2">

          <label>
            Departamento:
          </label>

          <select
            value={
              selectedDepartamento
            }
            onChange={e => {

              setSelectedDepartamento(
                e.target.value
              );

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


            {departamentos.map(
              dep => (

                <option
                  key={
                    dep.idDepartamento
                  }
                  value={
                    dep.idDepartamento
                  }
                >

                  {
                    dep.descripcion
                  }

                </option>

              )
            )}

          </select>

        </div>


        <div className="mb-2">

          <label>
            Provincia:
          </label>

          <select
            value={
              selectedProvincia
            }
            onChange={e => {

              setSelectedProvincia(
                e.target.value
              );

              setSelectedDistrito("");

              setDistritos([]);
            }}
            className="form-select"
            disabled={
              !selectedDepartamento
            }
          >

            <option value="">
              Seleccione una provincia
            </option>


            {provincias.map(
              prov => (

                <option
                  key={
                    prov.idProvincia
                  }
                  value={
                    prov.idProvincia
                  }
                >

                  {
                    prov.descripcion
                  }

                </option>

              )
            )}

          </select>

        </div>


        <div className="mb-2">

          <label>
            Distrito:
          </label>

          <select
            value={
              selectedDistrito
            }
            onChange={e =>
              setSelectedDistrito(
                e.target.value
              )
            }
            className="form-select"
            disabled={
              !selectedProvincia
            }
          >

            <option value="">
              Seleccione un distrito
            </option>


            {distritos.map(
              dist => (

                <option
                  key={
                    dist.idDistrito
                  }
                  value={
                    dist.idDistrito
                  }
                >

                  {
                    dist.descripcion
                  }

                </option>

              )
            )}

          </select>

        </div>


        {/* ================================================= */}
        {/* DIRECCIÓN */}
        {/* ================================================= */}

        <div className="mb-2">

          <label>
            Dirección:
          </label>

          <input
            type="text"
            className="form-control"
            value={
              direccion
            }
            onChange={e =>
              setDireccion(
                e.target.value
              )
            }
            placeholder="Ingrese su dirección"
          />

        </div>


        <div className="mb-2">

          <label>
            Teléfono:
          </label>

          <input
            type="text"
            className="form-control"
            value={
              telefono
            }
            onChange={e =>
              setTelefono(
                e.target.value
              )
            }
            placeholder="Ingrese su teléfono"
          />

        </div>


        {/* ================================================= */}
        {/* PAGO */}
        {/* ================================================= */}

        <div className="mb-3">

          <label>
            Método de pago:
          </label>

          <select
            className="form-select"
            value={
              metodoPago
            }
            onChange={e =>
              setMetodoPago(
                e.target.value
              )
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


        {/* ================================================= */}
        {/* MÉTODOS DE ENTREGA */}
        {/* ================================================= */}

        <h5>
          Método de entrega por tienda
        </h5>


        {cargandoMetodos && (

          <div className="alert alert-info">

            Cargando métodos de entrega...

          </div>

        )}


        {errorMetodos && (

          <div className="alert alert-warning">

            {errorMetodos}

          </div>

        )}


        {!cargandoMetodos &&
          tiendas.map(
            tienda => {

              const opciones =
                metodosDisponibles[
                  tienda.idTienda
                ] || [];


              return (

                <div
                  key={
                    tienda.idTienda
                  }
                  className="mb-3"
                >

                  <label className="fw-bold">

                    {
                      tienda.nombre
                    }

                  </label>


                  {opciones.length === 0 ? (

                    <div className="alert alert-danger mt-2 mb-0">

                      Esta tienda no tiene
                      métodos de entrega
                      activos.

                    </div>

                  ) : (

                    <select
                      className="form-select"
                      value={
                        metodosEntrega[
                          tienda.idTienda
                        ] || ""
                      }
                      onChange={e =>
                        handleMetodoEntregaChange(
                          tienda.idTienda,
                          e.target.value
                        )
                      }
                    >

                      <option value="">

                        Seleccione método de entrega

                      </option>


                      {opciones.map(
                        metodo => (

                          <option
                            key={
                              metodo.idMetodoEntrega
                            }
                            value={
                              metodo.tipoMetodo
                            }
                          >

                            {
                              metodo.nombre
                            }

                          </option>

                        )
                      )}

                    </select>

                  )}

                </div>

              );
            }
          )
        }


        {/* ================================================= */}
        {/* ACCIONES */}
        {/* ================================================= */}

        <div className="modal-actions mt-3 d-flex justify-content-end">

          <button
            type="button"
            onClick={
              handleConfirm
            }
            className="btn btn-success me-2"
            disabled={
              cargandoMetodos ||
              tiendas.some(
                tienda =>
                  (
                    metodosDisponibles[
                      tienda.idTienda
                    ] || []
                  ).length === 0
              )
            }
          >

            Confirmar Compra

          </button>


          <button
            type="button"
            onClick={
              onClose
            }
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