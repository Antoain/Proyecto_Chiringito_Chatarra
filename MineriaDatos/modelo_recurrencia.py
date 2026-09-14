import pandas as pd

import joblib

from sklearn.ensemble import RandomForestClassifier
from sklearn.pipeline import Pipeline
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix
)

from sklearn.model_selection import cross_val_predict
from sklearn.metrics import f1_score
import numpy as np

from sklearn.model_selection import GridSearchCV

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer


# ==========================================
# CARGAR DATASET
# ==========================================

df = pd.read_csv("dataset_clientes_chch.csv")


# ==========================================
# VARIABLES PREDICTORAS Y TARGET
# ==========================================

X = df.drop(
    columns=[
        "IdRegistro",
        "ClienteRecurrente"
    ]
)

y = df["ClienteRecurrente"]


# ==========================================
# VARIABLES CATEGÓRICAS
# ==========================================

columnas_categoricas = [
    "IdCategoriaFavorita",
    "MetodoEntregaMasUsado"
]

columnas_numericas = [
    "TotalGastado",
    "TicketPromedio",
    "CantidadProductosComprados",
    "CantidadTiendasDiferentes",
    "PorcentajeCancelacion",
    "AntiguedadClienteDias",
    "DiasDesdeUltimaCompra",
    "FrecuenciaCompraDias"
]


# ==========================================
# PREPROCESAMIENTO
# ==========================================

preprocesador = ColumnTransformer(
    transformers=[
        (
            "categoricas",
            OneHotEncoder(
                handle_unknown="ignore"
            ),
            columnas_categoricas
        )
    ],
    remainder="passthrough"
)


# ==========================================
# DIVISIÓN ENTRENAMIENTO / PRUEBA
# ==========================================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y
)


# ==========================================
# COMPROBACIONES
# ==========================================

print("\n==============================")
print("PREPARACIÓN PARA ML")
print("==============================")

print(f"Dataset completo: {len(df)}")
print(f"Entrenamiento: {len(X_train)}")
print(f"Prueba: {len(X_test)}")


print("\n==============================")
print("VARIABLES PREDICTORAS")
print("==============================")

print(X.columns.tolist())


print("\n==============================")
print("DISTRIBUCIÓN ENTRENAMIENTO")
print("==============================")

print(y_train.value_counts())

print("\nPorcentajes:")

print(
    (
        y_train.value_counts(normalize=True)
        * 100
    ).round(2)
)


print("\n==============================")
print("DISTRIBUCIÓN PRUEBA")
print("==============================")

print(y_test.value_counts())

print("\nPorcentajes:")

print(
    (
        y_test.value_counts(normalize=True)
        * 100
    ).round(2)
)


# ==========================================
# MODELO RANDOM FOREST
# ==========================================

modelo = RandomForestClassifier(
    n_estimators=200,
    random_state=42,
    class_weight="balanced"
)


# ==========================================
# PIPELINE
# ==========================================

pipeline = Pipeline(
    steps=[
        (
            "preprocesador",
            preprocesador
        ),
        (
            "modelo",
            modelo
        )
    ]
)


# ==========================================
# ENTRENAMIENTO
# ==========================================

print("\n==============================")
print("ENTRENANDO RANDOM FOREST...")
print("==============================")

pipeline.fit(
    X_train,
    y_train
)

print("Entrenamiento completado.")


# ==========================================
# PREDICCIONES
# ==========================================

y_pred = pipeline.predict(
    X_test
)


# ==========================================
# EXACTITUD
# ==========================================

accuracy = accuracy_score(
    y_test,
    y_pred
)

print("\n==============================")
print("RESULTADOS DEL MODELO")
print("==============================")

print(
    f"Accuracy: {accuracy:.4f}"
)

print(
    f"Accuracy (%): {accuracy * 100:.2f}%"
)


# ==========================================
# MATRIZ DE CONFUSIÓN
# ==========================================

print("\n==============================")
print("MATRIZ DE CONFUSIÓN")
print("==============================")

print(
    confusion_matrix(
        y_test,
        y_pred
    )
)


# ==========================================
# REPORTE DE CLASIFICACIÓN
# ==========================================

print("\n==============================")
print("REPORTE DE CLASIFICACIÓN")
print("==============================")

print(
    classification_report(
        y_test,
        y_pred,
        target_names=[
            "No recurrente",
            "Recurrente"
        ]
    )
)

# ==========================================
# AJUSTE DE HIPERPARÁMETROS
# ==========================================

parametros = {
    "modelo__n_estimators": [
        100,
        200,
        300
    ],

    "modelo__max_depth": [
        None,
        5,
        10
    ],

    "modelo__min_samples_split": [
        2,
        5
    ],

    "modelo__min_samples_leaf": [
        1,
        2,
        4
    ],

    "modelo__class_weight": [
        "balanced",
        "balanced_subsample"
    ]
}


busqueda = GridSearchCV(
    estimator=pipeline,
    param_grid=parametros,
    scoring="f1",
    cv=5,
    n_jobs=-1
)


print("\n==============================")
print("BUSCANDO MEJORES PARÁMETROS...")
print("==============================")

busqueda.fit(
    X_train,
    y_train
)


print("\n==============================")
print("MEJORES PARÁMETROS")
print("==============================")

print(
    busqueda.best_params_
)

print(
    f"Mejor F1 en validación: "
    f"{busqueda.best_score_:.4f}"
)


# ==========================================
# PROBAR MEJOR MODELO
# ==========================================

mejor_modelo = busqueda.best_estimator_

y_pred_mejorado = mejor_modelo.predict(
    X_test
)


accuracy_mejorado = accuracy_score(
    y_test,
    y_pred_mejorado
)


print("\n==============================")
print("RESULTADOS MODELO AJUSTADO")
print("==============================")

print(
    f"Accuracy: "
    f"{accuracy_mejorado * 100:.2f}%"
)


print("\nMATRIZ DE CONFUSIÓN")

print(
    confusion_matrix(
        y_test,
        y_pred_mejorado
    )
)


print("\nREPORTE DE CLASIFICACIÓN")

print(
    classification_report(
        y_test,
        y_pred_mejorado,
        target_names=[
            "No recurrente",
            "Recurrente"
        ]
    )
)

# ==========================================
# BÚSQUEDA DEL MEJOR UMBRAL
# ==========================================

probabilidades_cv = cross_val_predict(
    mejor_modelo,
    X_train,
    y_train,
    cv=5,
    method="predict_proba",
    n_jobs=-1
)[:, 1]


umbrales = np.arange(
    0.30,
    0.71,
    0.01
)

mejor_umbral = 0.50
mejor_f1 = 0


for umbral in umbrales:

    predicciones_cv = (
        probabilidades_cv >= umbral
    ).astype(int)

    f1 = f1_score(
        y_train,
        predicciones_cv
    )

    if f1 > mejor_f1:

        mejor_f1 = f1
        mejor_umbral = umbral


print("\n==============================")
print("MEJOR UMBRAL")
print("==============================")

print(
    f"Umbral: {mejor_umbral:.2f}"
)

print(
    f"F1 validación: {mejor_f1:.4f}"
)


# ==========================================
# EVALUACIÓN FINAL EN TEST
# ==========================================

probabilidades_test = (
    mejor_modelo.predict_proba(
        X_test
    )[:, 1]
)


predicciones_umbral = (
    probabilidades_test
    >= mejor_umbral
).astype(int)


print("\n==============================")
print("MODELO CON UMBRAL AJUSTADO")
print("==============================")

print(
    f"Accuracy: "
    f"{accuracy_score(y_test, predicciones_umbral) * 100:.2f}%"
)


print("\nMATRIZ DE CONFUSIÓN")

print(
    confusion_matrix(
        y_test,
        predicciones_umbral
    )
)


print("\nREPORTE")

print(
    classification_report(
        y_test,
        predicciones_umbral,
        target_names=[
            "No recurrente",
            "Recurrente"
        ]
    )
)

# ==========================================
# IMPORTANCIA DE VARIABLES
# ==========================================

modelo_rf = (
    mejor_modelo
    .named_steps["modelo"]
)

preprocesador_final = (
    mejor_modelo
    .named_steps["preprocesador"]
)

nombres_variables = (
    preprocesador_final
    .get_feature_names_out()
)

importancias = (
    modelo_rf.feature_importances_
)


importancia_df = pd.DataFrame(
    {
        "Variable": nombres_variables,
        "Importancia": importancias
    }
)


importancia_df = (
    importancia_df
    .sort_values(
        by="Importancia",
        ascending=False
    )
)


print("\n==============================")
print("IMPORTANCIA DE VARIABLES")
print("==============================")

print(
    importancia_df.to_string(
        index=False
    )
)

# ==========================================
# GRÁFICA DE IMPORTANCIA
# ==========================================

import matplotlib.pyplot as plt


top_variables = (
    importancia_df
    .head(12)
    .sort_values(
        by="Importancia"
    )
)


plt.figure(
    figsize=(10, 6)
)

plt.barh(
    top_variables["Variable"],
    top_variables["Importancia"]
)

plt.title(
    "Variables más importantes para predecir recurrencia"
)

plt.xlabel(
    "Importancia"
)

plt.ylabel(
    "Variable"
)

plt.tight_layout()

plt.show()


# ==========================================
# GUARDAR MODELO FINAL
# ==========================================

joblib.dump(
    mejor_modelo,
    "modelo_recurrencia.pkl"
)

print("\n==============================")
print("MODELO GUARDADO")
print("==============================")

print(
    "Archivo: modelo_recurrencia.pkl"
)

print(
    f"Umbral de decisión: {mejor_umbral:.2f}"
)