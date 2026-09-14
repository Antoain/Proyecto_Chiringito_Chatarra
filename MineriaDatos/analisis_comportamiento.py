import requests
import pandas as pd
import os

# ==========================================
# CONFIGURACIÓN
# ==========================================

URL = (
    "http://localhost:5093/"
    "api/SIGAdministrador/DatasetClientes"
)

TOKEN = os.getenv("CHCH_ADMIN_TOKEN")
if not TOKEN:
    raise RuntimeError(
        "No se encontró la variable de entorno CHCH_ADMIN_TOKEN."
    )

headers = {
    "Authorization": f"Bearer {TOKEN}"
}


# ==========================================
# OBTENER DATOS REALES
# ==========================================

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
print("DATASET DE COMPORTAMIENTO")
print("==============================")

print(
    f"Clientes recibidos: {len(df)}"
)

print(
    f"Columnas: {len(df.columns)}"
)

print("\nColumnas disponibles:")

for columna in df.columns:
    print(f"- {columna}")


print("\n==============================")
print("PRIMEROS REGISTROS")
print("==============================")

print(
    df.head().to_string(index=False)
)


# ==========================================
# VERIFICAR NULOS
# ==========================================

print("\n==============================")
print("VALORES NULOS")
print("==============================")

print(
    df.isnull().sum()
)

# ==========================================
# CLIENTES CON HISTORIAL DE COMPRA
# ==========================================

clientes_con_compra = df[
    df["cantidadPedidos"] > 0
].copy()


print("\n==============================")
print("CLIENTES CON COMPRAS")
print("==============================")

print(
    f"Clientes con compras: "
    f"{len(clientes_con_compra)}"
)

print(
    f"Clientes sin compras: "
    f"{len(df) - len(clientes_con_compra)}"
)

# ==========================================
# ANÁLISIS DE RECENCIA Y FRECUENCIA
# ==========================================

print("\n==============================")
print("RECENCIA Y FRECUENCIA")
print("==============================")

columnas_rf = [
    "idCliente",
    "cantidadPedidos",
    "diasDesdeUltimaCompra",
    "frecuenciaCompraDias",
    "antiguedadClienteDias"
]

print(
    clientes_con_compra[
        columnas_rf
    ].to_string(index=False)
)

def clasificar_recencia(dias):

    if pd.isna(dias):
        return "Sin compras"

    if dias <= 7:
        return "Muy reciente"

    elif dias <= 30:
        return "Reciente"

    elif dias <= 90:
        return "Inactivo reciente"

    else:
        return "Inactivo"


df["NivelRecencia"] = (
    df["diasDesdeUltimaCompra"]
    .apply(clasificar_recencia)
)


print("\n==============================")
print("CLASIFICACIÓN DE RECENCIA")
print("==============================")

print(
    df[
        [
            "idCliente",
            "diasDesdeUltimaCompra",
            "NivelRecencia"
        ]
    ].to_string(index=False)
)

# ==========================================
# ANÁLISIS DE GASTO Y VALOR DEL CLIENTE
# ==========================================

print("\n==============================")
print("GASTO Y VALOR DEL CLIENTE")
print("==============================")

columnas_valor = [
    "idCliente",
    "totalGastado",
    "ticketPromedio",
    "cantidadProductosComprados",
    "cantidadTiendasDiferentes"
]

print(
    clientes_con_compra[
        columnas_valor
    ].to_string(index=False)
)

def clasificar_valor(total_gastado):

    if total_gastado <= 0:
        return "Sin valor generado"

    elif total_gastado < 50:
        return "Valor bajo"

    elif total_gastado < 200:
        return "Valor medio"

    else:
        return "Valor alto"


df["NivelValorCliente"] = (
    df["totalGastado"]
    .apply(clasificar_valor)
)

print("\n==============================")
print("CLASIFICACIÓN POR VALOR")
print("==============================")

print(
    df[
        [
            "idCliente",
            "totalGastado",
            "ticketPromedio",
            "NivelValorCliente"
        ]
    ].to_string(index=False)
)

# ==========================================
# ANÁLISIS DE CANCELACIONES
# ==========================================

print("\n==============================")
print("ANÁLISIS DE CANCELACIONES")
print("==============================")

print(
    df[
        [
            "idCliente",
            "cantidadPedidos",
            "cantidadPedidosCancelados",
            "porcentajeCancelacion"
        ]
    ].to_string(index=False)
)


def clasificar_cancelacion(fila):

    if fila["cantidadPedidos"] == 0:
        return "Sin compras"

    porcentaje = fila["porcentajeCancelacion"]

    if porcentaje == 0:
        return "Sin cancelaciones"

    elif porcentaje <= 10:
        return "Cancelación baja"

    elif porcentaje <= 30:
        return "Cancelación moderada"

    else:
        return "Cancelación alta"


df["NivelCancelacion"] = df.apply(
    clasificar_cancelacion,
    axis=1
)


print("\n==============================")
print("CLASIFICACIÓN DE CANCELACIONES")
print("==============================")

print(
    df[
        [
            "idCliente",
            "cantidadPedidosCancelados",
            "porcentajeCancelacion",
            "NivelCancelacion"
        ]
    ].to_string(index=False)
)


# ==========================================
# CATEGORÍAS Y MÉTODOS DE ENTREGA
# ==========================================

print("\n==============================")
print("PREFERENCIAS DE COMPRA")
print("==============================")

print(
    clientes_con_compra[
        [
            "idCliente",
            "idCategoriaFavorita",
            "metodoEntregaMasUsado"
        ]
    ].to_string(index=False)
)


# ==========================================
# DISTRIBUCIÓN DE CATEGORÍAS FAVORITAS
# ==========================================

categorias = (
    clientes_con_compra[
        "idCategoriaFavorita"
    ]
    .dropna()
    .value_counts()
)

print("\n==============================")
print("CATEGORÍAS FAVORITAS")
print("==============================")

print(categorias)


# ==========================================
# MÉTODOS DE ENTREGA MÁS UTILIZADOS
# ==========================================

metodos_entrega = (
    clientes_con_compra[
        "metodoEntregaMasUsado"
    ]
    .dropna()
    .value_counts()
)

print("\n==============================")
print("MÉTODOS DE ENTREGA")
print("==============================")

if metodos_entrega.empty:
    print(
        "No hay suficientes datos "
        "sobre métodos de entrega."
    )
else:
    print(metodos_entrega)


# ==========================================
# CLASIFICACIÓN DE COMPORTAMIENTO
# ==========================================

def clasificar_comportamiento(fila):

    if fila["cantidadPedidos"] == 0:
        return "Sin historial"

    if (
        fila["clienteRecurrente"] == 1
        and fila["NivelValorCliente"] == "Valor alto"
        and fila["NivelRecencia"] == "Muy reciente"
    ):
        return "Cliente VIP"

    if (
        fila["clienteRecurrente"] == 1
        and fila["NivelRecencia"] in [
            "Muy reciente",
            "Reciente"
        ]
    ):
        return "Cliente frecuente"

    if (
        fila["NivelValorCliente"] == "Valor bajo"
        and fila["cantidadPedidos"] == 1
    ):
        return "Cliente nuevo"

    if (
        fila["NivelCancelacion"]
        in [
            "Cancelación moderada",
            "Cancelación alta"
        ]
    ):
        return "Cliente en riesgo"

    if (
        fila["NivelRecencia"]
        in [
            "Inactivo reciente",
            "Inactivo"
        ]
    ):
        return "Cliente inactivo"

    return "Cliente ocasional"


df["PatronComportamiento"] = df.apply(
    clasificar_comportamiento,
    axis=1
)

print("\n==============================")
print("PATRONES DE COMPORTAMIENTO")
print("==============================")

print(
    df[
        [
            "idCliente",
            "cantidadPedidos",
            "totalGastado",
            "NivelRecencia",
            "NivelValorCliente",
            "NivelCancelacion",
            "clienteRecurrente",
            "PatronComportamiento"
        ]
    ].to_string(index=False)
)


# ==========================================
# RESUMEN GENERAL
# ==========================================

print("\n==============================")
print("RESUMEN DE COMPORTAMIENTO")
print("==============================")

total_clientes = len(df)

clientes_compradores = (
    df["cantidadPedidos"] > 0
).sum()

clientes_recurrentes = (
    df["clienteRecurrente"] == 1
).sum()

clientes_sin_historial = (
    df["cantidadPedidos"] == 0
).sum()


print(
    f"Total de clientes: "
    f"{total_clientes}"
)

print(
    f"Clientes con compras: "
    f"{clientes_compradores}"
)

print(
    f"Clientes recurrentes: "
    f"{clientes_recurrentes}"
)

print(
    f"Clientes sin historial: "
    f"{clientes_sin_historial}"
)


print("\nPatrones detectados:")

print(
    df["PatronComportamiento"]
    .value_counts()
)


# ==========================================
# GUARDAR RESULTADOS
# ==========================================

columnas_salida = [
    "idCliente",
    "cantidadPedidos",
    "totalGastado",
    "ticketPromedio",
    "diasDesdeUltimaCompra",
    "frecuenciaCompraDias",
    "idCategoriaFavorita",
    "metodoEntregaMasUsado",
    "NivelRecencia",
    "NivelValorCliente",
    "NivelCancelacion",
    "clienteRecurrente",
    "PatronComportamiento"
]


df[
    columnas_salida
].to_csv(
    "comportamiento_clientes.csv",
    index=False
)


print("\n==============================")
print("ARCHIVO GENERADO")
print("==============================")

print(
    "comportamiento_clientes.csv"
)