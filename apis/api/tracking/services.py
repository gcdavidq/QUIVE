from db import get_db
from flask import session
from datetime import datetime, timedelta
import json

def post_tracking(data: dict):
    """
    Insertar coordenadas en la tabla Seguimiento.
    """
    # Verificar que el transportista tenga asignación activa
    conn = get_db()
    cursor = conn.cursor()
    sql_check = """
        SELECT estado FROM Asignaciones
        WHERE id_asignacion=%s AND id_transportista=%s
    """
    cursor.execute(sql_check, (data["id_asignacion"], session.get("usuario")["id_usuario"]))
    row = cursor.fetchone()
    if not row or row["estado"] not in ("confirmado", "activo"):
        return {"error": "Asignación no válida o no activa"}

    sql_insert = """
        INSERT INTO Seguimiento (id_asignacion, ubicacion_actual, hora_ultima_actualizacion)
        VALUES (%s, POINT(%s, %s), %s)
    """
    cursor.execute(sql_insert, (
        data["id_asignacion"],
        data["latitud"], data["longitud"],
        data["hora_ultima_actualizacion"]
    ))
    return {"msg": "Coordenadas registradas"}

def get_ultimo_tracking(id_asignacion: int):
    """
    Devuelve la última ubicación registrada para una asignación.
    """
    conn = get_db()
    cursor = conn.cursor()
    sql = """
        SELECT ST_X(ubicacion_actual) AS latitud, ST_Y(ubicacion_actual) AS longitud, hora_ultima_actualizacion
        FROM Seguimiento
        WHERE id_asignacion=%s
        ORDER BY hora_ultima_actualizacion DESC
        LIMIT 1
    """
    cursor.execute(sql, (id_asignacion,))
    return cursor.fetchone()

def get_ruta_tracking_s(user_id: int):
    """
    Recupera los datos de la solicitud activa del usuario y calcula la ruta restante en tiempo real.
    """
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("CALL ObtenerSolicitudesConDetalle(%s, 'activa', Null)", (user_id,))
    fila = cursor.fetchone()

    if fila:
        # Parsear timedelta a string
        for key, value in fila.items():
            if isinstance(value, timedelta):
                fila[key] = str(value)

        # Convertir 'objetos' en JSON
        if "objetos" in fila and isinstance(fila["objetos"], str):
            try:
                fila["objetos"] = json.loads(fila["objetos"])
            except json.JSONDecodeError:
                pass

        # Calcular ruta actual en tiempo real
        try:
            fecha_hora = fila["fecha_hora"]
            tiempo_total_horas = float(fila["tiempo_total_estimado_horas"])
            tiempo_ruta_horas = float(fila["tiempo_solo_ruta"])
            tiempo_antes_mudanza = tiempo_total_horas - tiempo_ruta_horas

            # Convertir rutas a arrays
            puntos_origen = json.loads(fila["ruta_transportista_origen"])
            puntos_mudanza = json.loads(fila["ruta"])

            # Calcular tiempo actual
            ahora = datetime.now()
            inicio_viaje = fecha_hora - timedelta(minutes=tiempo_antes_mudanza)
            minutos_transcurridos = (ahora - inicio_viaje).total_seconds() / 60
            print(inicio_viaje)
            print(ahora)
            total_puntos_origen = len(puntos_origen)
            total_puntos_mudanza = len(puntos_mudanza)

            # Progreso en origen
            puntos_recorridos_origen = 0
            if tiempo_antes_mudanza > 0:
                puntos_recorridos_origen = int(
                    min(minutos_transcurridos, tiempo_antes_mudanza * 60) / (tiempo_antes_mudanza * 60) * total_puntos_origen
                )
                print(puntos_recorridos_origen)

            # Progreso en mudanza
            minutos_post_mudanza = minutos_transcurridos - (tiempo_antes_mudanza * 60)
            puntos_recorridos_mudanza = 0
            if tiempo_ruta_horas > 0 and minutos_post_mudanza > 0:
                puntos_recorridos_mudanza = int(
                    min(minutos_post_mudanza, tiempo_ruta_horas * 60) / (tiempo_ruta_horas * 60) * total_puntos_mudanza
                )

            # Recortar rutas
            ruta_restante_origen = puntos_origen[puntos_recorridos_origen:] if puntos_origen else []
            ruta_restante_mudanza = puntos_mudanza[puntos_recorridos_mudanza:] if puntos_mudanza else []
            ruta_actual = ruta_restante_origen + ruta_restante_mudanza
            fila["ruta_actual"] = ruta_actual

        except Exception as e:
            print(f"[Error calculando ruta actual]: {e}")
            fila["ruta_actual"] = []

    return fila