import pandas as pd

# ==========================================
# CARGAR DATASET
# ==========================================

df = pd.read_csv("dataset_clientes_chch.csv")


# ==========================================
# INFORMACIÓN GENERAL
# ==========================================

print("\n==============================")
print("INFORMACIÓN DEL DATASET")
print("==============================")

print(f"Filas: {df.shape[0]}")
print(f"Columnas: {df.shape[1]}")


# ==========================================
# COLUMNAS
# ==========================================

print("\n==============================")
print("COLUMNAS")
print("==============================")

print(df.columns.tolist())


# ==========================================
# PRIMEROS REGISTROS
# ==========================================

print("\n==============================")
print("PRIMEROS 5 REGISTROS")
print("==============================")

print(df.head())


# ==========================================
# VALORES NULOS
# ==========================================

print("\n==============================")
print("VALORES NULOS")
print("==============================")

print(df.isnull().sum())


# ==========================================
# ESTADÍSTICAS GENERALES
# ==========================================

print("\n==============================")
print("ESTADÍSTICAS")
print("==============================")

print(df.describe())


# ==========================================
# DISTRIBUCIÓN DEL TARGET
# ==========================================

print("\n==============================")
print("CLIENTES RECURRENTES")
print("==============================")

print(df["ClienteRecurrente"].value_counts())


print("\nPORCENTAJES")

porcentajes = (
    df["ClienteRecurrente"]
    .value_counts(normalize=True)
    * 100
)

print(porcentajes.round(2))


# ==========================================
# GRÁFICA 1
# DISTRIBUCIÓN DE CLIENTES
# ==========================================

import matplotlib.pyplot as plt

conteo = (
    df["ClienteRecurrente"]
    .value_counts()
    .sort_index()
)

plt.figure(figsize=(7, 5))

plt.bar(
    ["No recurrente", "Recurrente"],
    conteo.values
)

plt.title("Distribución de clientes")
plt.xlabel("Tipo de cliente")
plt.ylabel("Cantidad de clientes")

plt.tight_layout()
plt.show()


# ==========================================
# COMPARACIÓN DE COMPORTAMIENTO
# ==========================================

variables = [
    "TotalGastado",
    "TicketPromedio",
    "CantidadProductosComprados",
    "CantidadTiendasDiferentes",
    "PorcentajeCancelacion",
    "AntiguedadClienteDias",
    "DiasDesdeUltimaCompra",
    "FrecuenciaCompraDias"
]

comparacion = (
    df.groupby("ClienteRecurrente")[variables]
    .mean()
    .round(2)
)

print("\n==============================")
print("PROMEDIOS SEGÚN RECURRENCIA")
print("==============================")

print(comparacion)


# ==========================================
# GRÁFICA 2
# DÍAS DESDE ÚLTIMA COMPRA
# ==========================================

datos_no_recurrentes = df[
    df["ClienteRecurrente"] == 0
]["DiasDesdeUltimaCompra"]

datos_recurrentes = df[
    df["ClienteRecurrente"] == 1
]["DiasDesdeUltimaCompra"]

plt.figure(figsize=(7, 5))

plt.boxplot(
    [datos_no_recurrentes, datos_recurrentes],
    tick_labels=[
        "No recurrente",
        "Recurrente"
    ]
)

plt.title("Días desde la última compra")
plt.xlabel("Tipo de cliente")
plt.ylabel("Días")

plt.tight_layout()
plt.show()

# ==========================================
# CORRELACIÓN CON CLIENTE RECURRENTE
# ==========================================

columnas_numericas = [
    "TotalGastado",
    "TicketPromedio",
    "CantidadProductosComprados",
    "CantidadTiendasDiferentes",
    "PorcentajeCancelacion",
    "AntiguedadClienteDias",
    "DiasDesdeUltimaCompra",
    "FrecuenciaCompraDias",
    "ClienteRecurrente"
]

correlaciones = (
    df[columnas_numericas]
    .corr()["ClienteRecurrente"]
    .drop("ClienteRecurrente")
    .sort_values()
)

print("\n==============================")
print("CORRELACIÓN CON RECURRENCIA")
print("==============================")

print(correlaciones.round(3))


# ==========================================
# GRÁFICA DE CORRELACIONES
# ==========================================

plt.figure(figsize=(9, 5))

plt.barh(
    correlaciones.index,
    correlaciones.values
)

plt.axvline(
    x=0,
    linewidth=1
)

plt.title("Correlación de variables con la recurrencia")
plt.xlabel("Coeficiente de correlación")
plt.ylabel("Variable")

plt.tight_layout()
plt.show()