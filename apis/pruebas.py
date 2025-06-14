import pymysql
from decimal import Decimal

# Conexión a la base de datos
conn = pymysql.connect(
    host='tramway.proxy.rlwy.net',
    port= 27353,
    user='root',
    password='csbMTGDfyqRzbyWHEvyllSEVSRXsOrqg',
    db='quive',
    cursorclass=pymysql.cursors.DictCursor  # Para recibir dicts
)

def obtener_transportistas_recomendados(id_solicitud, conn):
    def calcular_puntaje(t, pesos):
        calif_score = float(t["promedio_calificaciones"]) / 5.0
        incidentes_score = 1 / (1 + float(t["cantidad_incidentes"]))
        precio_score = 1 / (1 + float(t["precio_estimado_total"]))

        return (
            pesos["calificacion"] * calif_score +
            pesos["incidentes"] * incidentes_score +
            pesos["precio"] * precio_score
        )

    pesos = {
        "calificacion": 0.5,
        "incidentes": 0.2,
        "precio": 0.3
    }

    with conn.cursor() as cursor:
        cursor.callproc("ObtenerTransportistasRecomendados", (id_solicitud,))
        resultados = cursor.fetchall()
    for t in resultados:
        t["puntaje"] = calcular_puntaje(t, pesos)

    transportistas_ordenados = sorted(resultados, key=lambda x: x["puntaje"], reverse=True)

    return transportistas_ordenados


# Ejemplo de uso
lista = obtener_transportistas_recomendados(8, conn)

for t in lista:
    print(f"{t['nombre_completo']} - Puntaje: {t['puntaje']:.3f} - Precio: {t['precio_estimado_total']} - Calificación: {t['promedio_calificaciones']}")
