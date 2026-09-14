import joblib
import pandas as pd

from pathlib import Path
from pydantic import BaseModel
from fastapi import FastAPI


# ==========================================
# MODELOS DE ENTRADA
# ==========================================

class ClienteRecurrenciaInput(BaseModel):
    TotalGastado: float
    TicketPromedio: float
    CantidadProductosComprados: int
    CantidadTiendasDiferentes: int
    PorcentajeCancelacion: float
    AntiguedadClienteDias: float
    DiasDesdeUltimaCompra: float
    FrecuenciaCompraDias: float
    IdCategoriaFavorita: int
    MetodoEntregaMasUsado: str


class ClienteSegmentacionInput(BaseModel):
    TotalGastado: float
    TicketPromedio: float
    CantidadProductosComprados: int
    CantidadTiendasDiferentes: int
    PorcentajeCancelacion: float
    AntiguedadClienteDias: float
    DiasDesdeUltimaCompra: float
    FrecuenciaCompraDias: float


# ==========================================
# CONFIGURACIÓN FASTAPI
# ==========================================

app = FastAPI(
    title="CHCH - Servicio de Minería de Datos",
    description=(
        "API interna para los modelos de minería "
        "de datos de Chiringuito Chatarra"
    ),
    version="1.0.0"
)


# ==========================================
# RUTAS DE ARCHIVOS
# ==========================================

BASE_DIR = Path(__file__).resolve().parent

RUTA_MODELO_RECURRENCIA = (
    BASE_DIR / "modelo_recurrencia.pkl"
)

RUTA_MODELO_SEGMENTACION = (
    BASE_DIR / "modelo_segmentacion.pkl"
)

RUTA_SCALER_SEGMENTACION = (
    BASE_DIR / "scaler_segmentacion.pkl"
)


# ==========================================
# CARGAR MODELO DE RECURRENCIA
# ==========================================

modelo_recurrencia = joblib.load(
    RUTA_MODELO_RECURRENCIA
)

# Umbral seleccionado durante la validación
# cruzada realizada en G.3.
UMBRAL_RECURRENCIA = 0.41


# ==========================================
# CARGAR MODELO DE SEGMENTACIÓN
# ==========================================

modelo_segmentacion = joblib.load(
    RUTA_MODELO_SEGMENTACION
)

scaler_segmentacion = joblib.load(
    RUTA_SCALER_SEGMENTACION
)


# Los números corresponden a los clusters
# obtenidos por este modelo K-Means específico.
NOMBRES_SEGMENTOS = {
    0: "Activo y diversificado",
    1: "Ocasional de bajo valor",
    2: "Alto valor",
    3: "En riesgo"
}


# ==========================================
# ENDPOINT GENERAL
# ==========================================

@app.get("/")
def inicio():

    return {
        "servicio": "Minería de Datos CHCH",
        "estado": "activo"
    }


# ==========================================
# HEALTH CHECK
# ==========================================

@app.get("/health")
def health():

    return {
        "status": "ok"
    }


# ==========================================
# ESTADO MODELO DE RECURRENCIA
# ==========================================

@app.get("/modelo/recurrencia/estado")
def estado_modelo_recurrencia():

    return {
        "modelo": "Predicción de recurrencia",
        "estado": "cargado",
        "umbral": UMBRAL_RECURRENCIA,
        "archivo": RUTA_MODELO_RECURRENCIA.name
    }


# ==========================================
# PREDICCIÓN DE RECURRENCIA
# ==========================================

@app.post("/modelo/recurrencia/predecir")
def predecir_recurrencia(
    cliente: ClienteRecurrenciaInput
):

    datos_cliente = pd.DataFrame([
        {
            "TotalGastado":
                cliente.TotalGastado,

            "TicketPromedio":
                cliente.TicketPromedio,

            "CantidadProductosComprados":
                cliente.CantidadProductosComprados,

            "CantidadTiendasDiferentes":
                cliente.CantidadTiendasDiferentes,

            "PorcentajeCancelacion":
                cliente.PorcentajeCancelacion,

            "AntiguedadClienteDias":
                cliente.AntiguedadClienteDias,

            "DiasDesdeUltimaCompra":
                cliente.DiasDesdeUltimaCompra,

            "FrecuenciaCompraDias":
                cliente.FrecuenciaCompraDias,

            "IdCategoriaFavorita":
                cliente.IdCategoriaFavorita,

            "MetodoEntregaMasUsado":
                cliente.MetodoEntregaMasUsado
        }
    ])

    probabilidad = (
        modelo_recurrencia
        .predict_proba(datos_cliente)[0][1]
    )

    prediccion = (
        1
        if probabilidad >= UMBRAL_RECURRENCIA
        else 0
    )

    return {
        "probabilidadRecurrencia": round(
            float(probabilidad),
            4
        ),

        "umbral": UMBRAL_RECURRENCIA,

        "clienteRecurrentePredicho":
            prediccion
    }


# ==========================================
# ESTADO MODELO DE SEGMENTACIÓN
# ==========================================

@app.get("/modelo/segmentacion/estado")
def estado_modelo_segmentacion():

    return {
        "modelo": "Segmentación de clientes",
        "estado": "cargado",
        "algoritmo": "K-Means",
        "clusters": 4,
        "archivoModelo":
            RUTA_MODELO_SEGMENTACION.name,

        "archivoScaler":
            RUTA_SCALER_SEGMENTACION.name
    }


# ==========================================
# PREDICCIÓN DE SEGMENTO
# ==========================================

@app.post("/modelo/segmentacion/predecir")
def predecir_segmento(
    cliente: ClienteSegmentacionInput
):

    datos_cliente = pd.DataFrame([
        {
            "TotalGastado":
                cliente.TotalGastado,

            "TicketPromedio":
                cliente.TicketPromedio,

            "CantidadProductosComprados":
                cliente.CantidadProductosComprados,

            "CantidadTiendasDiferentes":
                cliente.CantidadTiendasDiferentes,

            "PorcentajeCancelacion":
                cliente.PorcentajeCancelacion,

            "AntiguedadClienteDias":
                cliente.AntiguedadClienteDias,

            "DiasDesdeUltimaCompra":
                cliente.DiasDesdeUltimaCompra,

            "FrecuenciaCompraDias":
                cliente.FrecuenciaCompraDias
        }
    ])

    # Aplicar exactamente el mismo escalado
    # utilizado al entrenar K-Means.
    datos_escalados = (
        scaler_segmentacion
        .transform(datos_cliente)
    )

    cluster = int(
        modelo_segmentacion
        .predict(datos_escalados)[0]
    )

    segmento = NOMBRES_SEGMENTOS.get(
        cluster,
        "Segmento desconocido"
    )

    return {
        "cluster": cluster,
        "segmento": segmento
    }