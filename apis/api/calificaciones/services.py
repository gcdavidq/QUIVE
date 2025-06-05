from db import get_db
from flask import session
import pymysql

def create_calificacion(data: dict):
    """
    Crea calificación si el pago de la asignación está completado
    y no existe ya una calificación para esa asignación.
    """
    conn = get_db()
    cursor = conn.cursor()
    # Verificar pago completado
    sql_pago = """
        SELECT p.estado_pago
        FROM Pagos p
        WHERE p.id_asignacion=%s
    """
    cursor.execute(sql_pago, (data["id_asignacion"],))
    row_pago = cursor.fetchone()
    if not row_pago or row_pago["estado_pago"] != "completado":
        return {"error": "No puedes calificar sin pago completado"}

    # Verificar que no exista ya calificación para esa asignación por ese usuario
    sql_existe = """
        SELECT id_calificacion FROM Calificaciones
        WHERE id_asignacion=%s AND calificador=%s
    """
    cursor.execute(sql_existe, (data["id_asignacion"], data["calificador"]))
    if cursor.fetchone():
        return {"error": "Ya dejaste una calificación para esta asignación"}

    sql_ins = """
        INSERT INTO Calificaciones (id_asignacion, calificador, calificado, puntaje, comentario)
        VALUES (%s, %s, %s, %s, %s)
    """
    cursor.execute(sql_ins, (
        data["id_asignacion"], data["calificador"], data["calificado"],
        data["puntaje"], data.get("comentario")
    ))
    new_id = cursor.lastrowid
    return get_calificacion_by_id(new_id)

def get_calificacion_by_id(id_calificacion: int):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM Calificaciones WHERE id_calificacion=%s", (id_calificacion,))
    return cursor.fetchone()

def list_calificaciones_de_usuario(id_usuario: int):
    conn = get_db()
    cursor = conn.cursor()
    sql = """
        SELECT id_calificacion, id_asignacion, calificador, calificado, puntaje, comentario
        FROM Calificaciones
        WHERE calificado=%s
    """
    cursor.execute(sql, (id_usuario,))
    return cursor.fetchall()

def list_my_calificaciones():
    usuario = session.get("usuario")
    user_id = usuario["id_usuario"]
    conn = get_db()
    cursor = conn.cursor()
    # Calificaciones que yo di u recibí
    sql = """
        SELECT id_calificacion, id_asignacion, calificador, calificado, puntaje, comentario
        FROM Calificaciones
        WHERE calificador=%s OR calificado=%s
    """
    cursor.execute(sql, (user_id, user_id))
    return cursor.fetchall()
