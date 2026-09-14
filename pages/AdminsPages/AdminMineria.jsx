import { useEffect, useState } from "react";
import "./AdminPagesCss/AdminMineria.css";

function AdminMineria() {

  const [idCliente, setIdCliente] = useState("");
  const [resultado, setResultado] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [clientes, setClientes] = useState([]);


  useEffect(() => {

    const cargarClientes = async () => {

      try {

        const token = localStorage.getItem("token");

        const response = await fetch(
          "http://localhost:5093/api/Mineria/Clientes",
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        if (!response.ok) {
          throw new Error(
            "No fue posible cargar los clientes."
          );
        }

        const datos = await response.json();

        setClientes(datos);

        if (datos.length > 0) {
          setIdCliente(
            datos[0].idCliente.toString()
          );
        }

      }
      catch (error) {

        console.error(
          "Error cargando clientes:",
          error
        );

        setError(
          "No fue posible cargar la lista de clientes."
        );
      }

    };

    cargarClientes();

  }, []);


  const analizarCliente = async () => {

    if (!idCliente) {
      setError(
        "Seleccione un cliente."
      );
      return;
    }

    try {

      setCargando(true);
      setError("");
      setResultado(null);

      const token = localStorage.getItem("token");

      const headers = {
        Authorization: `Bearer ${token}`
      };

      const [
        responseRecurrencia,
        responseSegmento,
        responseRecomendaciones,
        responseComportamiento
      ] = await Promise.all([

        fetch(
          `http://localhost:5093/api/Mineria/Recurrencia/${idCliente}`,
          { headers }
        ),

        fetch(
          `http://localhost:5093/api/Mineria/Segmento/${idCliente}`,
          { headers }
        ),

        fetch(
          `http://localhost:5093/api/Mineria/Recomendaciones/${idCliente}`,
          { headers }
        ),

        fetch(
          `http://localhost:5093/api/Mineria/Comportamiento/${idCliente}`,
          { headers }
        )

      ]);


      if (!responseRecurrencia.ok) {

        const errorData =
          await responseRecurrencia.json();

        throw new Error(
          errorData.mensaje ||
          "No fue posible analizar el cliente."
        );
      }


      const recurrencia =
        await responseRecurrencia.json();

      const segmento =
        responseSegmento.ok
          ? await responseSegmento.json()
          : null;

      const recomendaciones =
        responseRecomendaciones.ok
          ? await responseRecomendaciones.json()
          : null;

      const comportamiento =
        responseComportamiento.ok
          ? await responseComportamiento.json()
          : null;


      setResultado({
        recurrencia,
        segmento,
        recomendaciones,
        comportamiento
      });

    }
    catch (error) {

      console.error(error);

      setError(error.message);

    }
    finally {

      setCargando(false);

    }
  };


  return (
    <div className="admin-mineria">

      <h1>Minería de Datos</h1>

      <p>
        Analiza el comportamiento de los clientes
        mediante técnicas de minería de datos.
      </p>


      <div className="mineria-buscador">

        <label>
          Cliente
        </label>

        <select
          value={idCliente}
          onChange={(e) => {
            setIdCliente(e.target.value);
            setResultado(null);
            setError("");
          }}
        >

          <option value="">
            Seleccione un cliente
          </option>

          {
            clientes.map(cliente => (

              <option
                key={cliente.idCliente}
                value={cliente.idCliente}
              >
                {cliente.nombreCompleto}
                {" - "}
                {cliente.correo}
              </option>

            ))
          }

        </select>


        <button
          onClick={analizarCliente}
          disabled={
            cargando ||
            !idCliente
          }
        >
          {
            cargando
              ? "Analizando..."
              : "Analizar cliente"
          }
        </button>

      </div>


      {
        error && (
          <div className="mineria-error">
            {error}
          </div>
        )
      }


      {
        resultado && (
          <div className="mineria-resultado">

            <h2>
              Cliente #{resultado.recurrencia.idCliente}
            </h2>


            <div className="mineria-tarjetas">


              <div className="mineria-card">

                <h3>
                  Probabilidad de recurrencia
                </h3>

                <strong>
                  {
                    (
                      resultado
                        .recurrencia
                        .prediccion
                        .probabilidadRecurrencia
                      * 100
                    ).toFixed(2)
                  } %
                </strong>

              </div>


              <div className="mineria-card">

                <h3>
                  Predicción
                </h3>

                <strong>
                  {
                    resultado
                      .recurrencia
                      .prediccion
                      .clienteRecurrentePredicho === 1
                      ? "Cliente recurrente"
                      : "Cliente no recurrente"
                  }
                </strong>

              </div>


              <div className="mineria-card">

                <h3>
                  Segmentación
                </h3>

                <strong>
                  {
                    resultado.segmento
                      ? resultado
                          .segmento
                          .segmentacion
                          .segmento
                      : "Sin datos"
                  }
                </strong>

              </div>


              <div className="mineria-card">

                <h3>
                  Comportamiento
                </h3>

                <strong>
                  {
                    resultado.comportamiento
                      ? resultado
                          .comportamiento
                          .patronComportamiento
                      : "Sin datos"
                  }
                </strong>

              </div>


              <div className="mineria-card">

                <h3>
                  Pedidos
                </h3>

                <strong>
                  {
                    resultado
                      .recurrencia
                      .datosCliente
                      .cantidadPedidos
                  }
                </strong>

              </div>


              <div className="mineria-card">

                <h3>
                  Total gastado
                </h3>

                <strong>
                  $
                  {
                    Number(
                      resultado
                        .recurrencia
                        .datosCliente
                        .totalGastado
                    ).toFixed(2)
                  }
                </strong>

              </div>


              <div className="mineria-card">

                <h3>
                  Recencia
                </h3>

                <strong>
                  {
                    resultado.comportamiento
                      ? resultado
                          .comportamiento
                          .segmentoRecencia
                      : "Sin datos"
                  }
                </strong>

              </div>


              <div className="mineria-card">

                <h3>
                  Nivel de valor
                </h3>

                <strong>
                  {
                    resultado.comportamiento
                      ? resultado
                          .comportamiento
                          .segmentoValor
                      : "Sin datos"
                  }
                </strong>

              </div>


            </div>


            <div className="mineria-recomendaciones">

              <h3>
                Productos recomendados
              </h3>

              {
                resultado.recomendaciones &&
                resultado
                  .recomendaciones
                  .recomendaciones
                  .length > 0
                  ? (

                    <ul>

                      {
                        resultado
                          .recomendaciones
                          .recomendaciones
                          .map(producto => (

                            <li
                              key={
                                producto.idProducto
                              }
                            >

                              {
                                producto.nombreProducto
                              }

                              {" - $"}

                              {
                                Number(
                                  producto.precio
                                ).toFixed(2)
                              }

                              {" - Stock: "}

                              {
                                producto.stock
                              }

                            </li>

                          ))
                      }

                    </ul>

                  )
                  : (

                    <p>
                      No hay recomendaciones disponibles.
                    </p>

                  )
              }

            </div>

          </div>
        )
      }

    </div>
  );
}

export default AdminMineria;