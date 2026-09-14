import requests
import pandas as pd
import os


# ==========================================
# CONFIGURACIÓN
# ==========================================

URL_CATALOGO = (
    "http://localhost:5093/"
    "api/SIGAdministrador/CatalogoDisponible"
)

URL = (
    "http://localhost:5093/"
    "api/SIGAdministrador/DatasetRecomendaciones"
)

# Pega temporalmente aquí un JWT de Administrador.
TOKEN = os.getenv("CHCH_ADMIN_TOKEN")

if not TOKEN:
    raise RuntimeError(
        "Falta la variable de entorno CHCH_ADMIN_TOKEN."
    )

# ==========================================
# OBTENER DATOS DEL BACKEND
# ==========================================

headers = {
    "Authorization": f"Bearer {TOKEN}"
}

respuesta = requests.get(
    URL,
    headers=headers,
    timeout=10
)

respuesta.raise_for_status()

datos = respuesta.json()

df = pd.DataFrame(
    datos["dataset"]
)


print("\n==============================")
print("DATOS RECIBIDOS DEL BACKEND")
print("==============================")

print(
    f"Registros: {len(df)}"
)

print(df)


# ==========================================
# OBTENER CATÁLOGO DISPONIBLE
# ==========================================

respuesta_catalogo = requests.get(
    URL_CATALOGO,
    headers=headers,
    timeout=10
)

respuesta_catalogo.raise_for_status()

datos_catalogo = respuesta_catalogo.json()

catalogo = pd.DataFrame(
    datos_catalogo["productos"]
)

print("\n==============================")
print("CATÁLOGO DISPONIBLE")
print("==============================")

print(
    f"Productos disponibles: {len(catalogo)}"
)


# ==========================================
# POPULARIDAD POR PRODUCTO
# ==========================================

popularidad = (
    df.groupby(
        [
            "idProducto",
            "nombreProducto",
            "idCategoria",
            "idTienda"
        ]
    )
    .agg(
        CantidadVendida=(
            "cantidadComprada",
            "sum"
        ),

        NumeroCompras=(
            "numeroCompras",
            "sum"
        ),

        ClientesDiferentes=(
            "idCliente",
            "nunique"
        ),

        TotalGenerado=(
            "totalGastadoProducto",
            "sum"
        )
    )
    .reset_index()
)


# ==========================================
# NORMALIZAR MÉTRICAS
# ==========================================

columnas_puntaje = [
    "CantidadVendida",
    "NumeroCompras",
    "ClientesDiferentes",
    "TotalGenerado"
]


for columna in columnas_puntaje:

    maximo = popularidad[columna].max()

    if maximo > 0:
        popularidad[
            f"{columna}Norm"
        ] = (
            popularidad[columna]
            / maximo
        )
    else:
        popularidad[
            f"{columna}Norm"
        ] = 0


# ==========================================
# PUNTAJE DE POPULARIDAD
# ==========================================

popularidad["PuntajePopularidad"] = (
    popularidad["CantidadVendidaNorm"] * 0.35
    +
    popularidad["NumeroComprasNorm"] * 0.25
    +
    popularidad["ClientesDiferentesNorm"] * 0.25
    +
    popularidad["TotalGeneradoNorm"] * 0.15
)


popularidad["PuntajePopularidad"] = (
    popularidad["PuntajePopularidad"]
    * 100
).round(2)


# ==========================================
# RANKING
# ==========================================

ranking = (
    popularidad
    .sort_values(
        "PuntajePopularidad",
        ascending=False
    )
    .reset_index(drop=True)
)


ranking.index = (
    ranking.index + 1
)


print("\n==============================")
print("RANKING DE POPULARIDAD")
print("==============================")

print(
    ranking[
        [
            "idProducto",
            "nombreProducto",
            "CantidadVendida",
            "NumeroCompras",
            "ClientesDiferentes",
            "TotalGenerado",
            "PuntajePopularidad"
        ]
    ].to_string()
)


# ==========================================
# CATEGORÍA FAVORITA POR CLIENTE
# ==========================================

preferencias_categoria = (
    df.groupby(
        [
            "idCliente",
            "idCategoria"
        ]
    )
    .agg(
        CantidadComprada=(
            "cantidadComprada",
            "sum"
        ),
        NumeroCompras=(
            "numeroCompras",
            "sum"
        )
    )
    .reset_index()
)


preferencias_categoria["PuntajeCategoria"] = (
    preferencias_categoria["CantidadComprada"]
    +
    preferencias_categoria["NumeroCompras"]
)


categoria_favorita = (
    preferencias_categoria
    .sort_values(
        [
            "idCliente",
            "PuntajeCategoria"
        ],
        ascending=[
            True,
            False
        ]
    )
    .drop_duplicates(
        subset="idCliente"
    )
)


print("\n==============================")
print("CATEGORÍA FAVORITA POR CLIENTE")
print("==============================")

print(
    categoria_favorita[
        [
            "idCliente",
            "idCategoria",
            "CantidadComprada",
            "NumeroCompras",
            "PuntajeCategoria"
        ]
    ].to_string(index=False)
)

# ==========================================
# RECOMENDACIÓN PERSONALIZADA
# ==========================================

def recomendar_productos(id_cliente, top_n=5):

    # Buscar categoría favorita
    fila_cliente = categoria_favorita[
        categoria_favorita["idCliente"] == id_cliente
    ]

    if fila_cliente.empty:
        return pd.DataFrame()

    id_categoria = int(
        fila_cliente.iloc[0]["idCategoria"]
    )


    # Productos que el cliente ya compró
    productos_comprados = set(
        df[
            df["idCliente"] == id_cliente
        ]["idProducto"]
        .tolist()
    )


    # Productos disponibles de la categoría favorita
    candidatos = catalogo[
        catalogo["idCategoria"] == id_categoria
    ].copy()


    # Excluir productos ya comprados
    candidatos = candidatos[
        ~candidatos["idProducto"]
        .isin(productos_comprados)
    ]


    if candidatos.empty:
        return pd.DataFrame()


    # Agregar popularidad histórica cuando exista
    candidatos = candidatos.merge(
        ranking[
            [
                "idProducto",
                "PuntajePopularidad"
            ]
        ],
        on="idProducto",
        how="left"
    )


    # Productos sin compras históricas reciben 0
    candidatos["PuntajePopularidad"] = (
        candidatos["PuntajePopularidad"]
        .fillna(0)
    )


    # Priorizar popularidad y luego stock
    candidatos = candidatos.sort_values(
        [
            "PuntajePopularidad",
            "stock"
        ],
        ascending=[
            False,
            False
        ]
    )


    return candidatos.head(top_n)

# ==========================================
# PRUEBAS
# ==========================================

clientes = sorted(
    df["idCliente"].unique()
)


for cliente in clientes:

    print("\n==============================")
    print(
        f"RECOMENDACIONES CLIENTE {cliente}"
    )
    print("==============================")

    recomendaciones = recomendar_productos(
        cliente,
        top_n=5
    )

    if recomendaciones.empty:

        print(
            "No hay productos nuevos disponibles "
            "en su categoría favorita."
        )

    else:

        print(
    recomendaciones[
        [
            "idProducto",
            "nombreProducto",
            "idCategoria",
            "precio",
            "stock",
            "PuntajePopularidad"
        ]
    ].to_string(index=False)
)

        # ==========================================
# EVALUACIÓN FUNCIONAL DEL RECOMENDADOR
# ==========================================

print("\n==============================")
print("EVALUACIÓN DEL RECOMENDADOR")
print("==============================")


for cliente in clientes:

    recomendaciones = recomendar_productos(
        cliente,
        top_n=5
    )

    if recomendaciones.empty:

        print(
            f"Cliente {cliente}: "
            "sin candidatos disponibles."
        )

        continue


    categoria_cliente = int(
        categoria_favorita[
            categoria_favorita["idCliente"]
            == cliente
        ].iloc[0]["idCategoria"]
    )


    comprados = set(
        df[
            df["idCliente"] == cliente
        ]["idProducto"]
    )


    # Validaciones
    misma_categoria = (
        recomendaciones["idCategoria"]
        == categoria_cliente
    ).all()

    no_comprados = (
        ~recomendaciones["idProducto"]
        .isin(comprados)
    ).all()

    stock_disponible = (
        recomendaciones["stock"] > 0
    ).all()


    print(f"\nCliente {cliente}")

    print(
        f"  Misma categoría favorita: "
        f"{'OK' if misma_categoria else 'ERROR'}"
    )

    print(
        f"  Excluye productos comprados: "
        f"{'OK' if no_comprados else 'ERROR'}"
    )

    print(
        f"  Productos con stock: "
        f"{'OK' if stock_disponible else 'ERROR'}"
    )

# ==========================================
# GUARDAR RESULTADOS
# ==========================================

ranking.to_csv(
    "ranking_productos.csv",
    index=False
)

categoria_favorita.to_csv(
    "categorias_favoritas_clientes.csv",
    index=False
)


resultados_recomendaciones = []

for cliente in clientes:

    recomendaciones = recomendar_productos(
        cliente,
        top_n=5
    )

    if recomendaciones.empty:
        continue

    for _, producto in recomendaciones.iterrows():

        resultados_recomendaciones.append(
            {
                "IdCliente": int(cliente),

                "IdProducto": int(
                    producto["idProducto"]
                ),

                "NombreProducto":
                    producto["nombreProducto"],

                "IdCategoria": int(
                    producto["idCategoria"]
                ),

                "Precio": float(
                    producto["precio"]
                ),

                "Stock": int(
                    producto["stock"]
                ),

                "PuntajePopularidad": float(
                    producto["PuntajePopularidad"]
                )
            }
        )


df_recomendaciones = pd.DataFrame(
    resultados_recomendaciones
)

df_recomendaciones.to_csv(
    "recomendaciones_clientes.csv",
    index=False
)


print("\n==============================")
print("ARCHIVOS GENERADOS")
print("==============================")

print("ranking_productos.csv")
print("categorias_favoritas_clientes.csv")
print("recomendaciones_clientes.csv")