import pandas as pd

from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score
import matplotlib.pyplot as plt


# ==========================================
# CARGAR DATASET
# ==========================================

df = pd.read_csv(
    "dataset_clientes_chch.csv"
)


# ==========================================
# VARIABLES PARA SEGMENTACIÓN
# ==========================================

variables_segmentacion = [
    "TotalGastado",
    "TicketPromedio",
    "CantidadProductosComprados",
    "CantidadTiendasDiferentes",
    "PorcentajeCancelacion",
    "AntiguedadClienteDias",
    "DiasDesdeUltimaCompra",
    "FrecuenciaCompraDias"
]


X = df[
    variables_segmentacion
].copy()


# ==========================================
# INFORMACIÓN ORIGINAL
# ==========================================

print("\n==============================")
print("SEGMENTACIÓN DE CLIENTES")
print("==============================")

print(
    f"Clientes: {X.shape[0]}"
)

print(
    f"Variables: {X.shape[1]}"
)


print("\n==============================")
print("VARIABLES UTILIZADAS")
print("==============================")

print(
    variables_segmentacion
)


# ==========================================
# ESCALAR VARIABLES
# ==========================================

scaler = StandardScaler()

X_escalado = scaler.fit_transform(
    X
)


# ==========================================
# COMPROBAR ESCALADO
# ==========================================

X_escalado_df = pd.DataFrame(
    X_escalado,
    columns=variables_segmentacion
)


print("\n==============================")
print("PRIMEROS DATOS ESCALADOS")
print("==============================")

print(
    X_escalado_df.head()
)


print("\n==============================")
print("PROMEDIOS DESPUÉS DEL ESCALADO")
print("==============================")

print(
    X_escalado_df
    .mean()
    .round(3)
)


print("\n==============================")
print("DESVIACIÓN ESTÁNDAR")
print("==============================")

print(
    X_escalado_df
    .std(ddof=0)
    .round(3)
)


# ==========================================
# BUSCAR NÚMERO ÓPTIMO DE CLUSTERS
# ==========================================

valores_k = range(2, 9)

inercias = []
silhouettes = []


for k in valores_k:

    kmeans = KMeans(
        n_clusters=k,
        random_state=42,
        n_init=10
    )

    etiquetas = kmeans.fit_predict(
        X_escalado
    )

    inercias.append(
        kmeans.inertia_
    )

    silhouettes.append(
        silhouette_score(
            X_escalado,
            etiquetas
        )
    )


# ==========================================
# MOSTRAR RESULTADOS
# ==========================================

print("\n==============================")
print("EVALUACIÓN DE CLUSTERS")
print("==============================")

for k, inercia, silhouette in zip(
    valores_k,
    inercias,
    silhouettes
):

    print(
        f"K={k} | "
        f"Inercia={inercia:.2f} | "
        f"Silhouette={silhouette:.4f}"
    )


# ==========================================
# MÉTODO DEL CODO
# ==========================================

plt.figure(
    figsize=(7, 5)
)

plt.plot(
    list(valores_k),
    inercias,
    marker="o"
)

plt.title(
    "Método del codo"
)

plt.xlabel(
    "Número de clusters (K)"
)

plt.ylabel(
    "Inercia"
)

plt.xticks(
    list(valores_k)
)

plt.tight_layout()

plt.show()


# ==========================================
# SILHOUETTE SCORE
# ==========================================

plt.figure(
    figsize=(7, 5)
)

plt.plot(
    list(valores_k),
    silhouettes,
    marker="o"
)

plt.title(
    "Silhouette Score por número de clusters"
)

plt.xlabel(
    "Número de clusters (K)"
)

plt.ylabel(
    "Silhouette Score"
)

plt.xticks(
    list(valores_k)
)

plt.tight_layout()

plt.show()


# ==========================================
# K-MEANS DEFINITIVO
# ==========================================

kmeans_final = KMeans(
    n_clusters=4,
    random_state=42,
    n_init=10
)

clusters = kmeans_final.fit_predict(
    X_escalado
)


# ==========================================
# ASIGNAR CLUSTER A CADA CLIENTE
# ==========================================

df["Cluster"] = clusters


print("\n==============================")
print("DISTRIBUCIÓN DE CLUSTERS")
print("==============================")

print(
    df["Cluster"]
    .value_counts()
    .sort_index()
)


print("\nPORCENTAJES")

print(
    (
        df["Cluster"]
        .value_counts(normalize=True)
        .sort_index()
        * 100
    ).round(2)
)


# ==========================================
# PERFIL DE CADA CLUSTER
# ==========================================

perfil_clusters = (
    df.groupby("Cluster")[
        variables_segmentacion
    ]
    .mean()
    .round(2)
)


print("\n==============================")
print("PERFIL DE LOS CLUSTERS")
print("==============================")

print(
    perfil_clusters.to_string()
)


# ==========================================
# RECURRENCIA POR CLUSTER
# SOLO PARA INTERPRETACIÓN
# ==========================================

recurrencia_clusters = (
    df.groupby("Cluster")[
        "ClienteRecurrente"
    ]
    .agg(
        ["count", "sum", "mean"]
    )
)

recurrencia_clusters.columns = [
    "Clientes",
    "Recurrentes",
    "TasaRecurrencia"
]

recurrencia_clusters[
    "TasaRecurrencia"
] = (
    recurrencia_clusters[
        "TasaRecurrencia"
    ]
    * 100
).round(2)


print("\n==============================")
print("RECURRENCIA POR CLUSTER")
print("==============================")

print(
    recurrencia_clusters
)

# ==========================================
# NOMBRES DE LOS SEGMENTOS
# ==========================================

nombres_segmentos = {
    0: "Activo y diversificado",
    1: "Ocasional de bajo valor",
    2: "Alto valor",
    3: "En riesgo"
}


df["Segmento"] = (
    df["Cluster"]
    .map(nombres_segmentos)
)


print("\n==============================")
print("SEGMENTOS ASIGNADOS")
print("==============================")

print(
    df[
        [
            "IdRegistro",
            "Cluster",
            "Segmento"
        ]
    ].head(10)
)

# ==========================================
# GUARDAR RESULTADO DE SEGMENTACIÓN
# ==========================================

df.to_csv(
    "clientes_segmentados.csv",
    index=False
)

print("\nArchivo generado:")
print("clientes_segmentados.csv")

import joblib


joblib.dump(
    kmeans_final,
    "modelo_segmentacion.pkl"
)

joblib.dump(
    scaler,
    "scaler_segmentacion.pkl"
)


print("\n==============================")
print("MODELO DE SEGMENTACIÓN GUARDADO")
print("==============================")

print("modelo_segmentacion.pkl")
print("scaler_segmentacion.pkl")