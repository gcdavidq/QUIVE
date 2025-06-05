from db import get_db
from flask import session
import pymysql

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

def get_ruta_tracking(id_asignacion: int):
    """
    Devuelve todos los puntos de seguimiento (o un resumen si son muchos).
    """
    conn = get_db()
    cursor = conn.cursor()
    sql = """
        SELECT ST_X(ubicacion_actual) AS latitud, ST_Y(ubicacion_actual) AS longitud, hora_ultima_actualizacion
        FROM Seguimiento
        WHERE id_asignacion=%s
        ORDER BY hora_ultima_actualizacion ASC
    """
    cursor.execute(sql, (id_asignacion,))
    return cursor.fetchall()
