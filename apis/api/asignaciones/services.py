from db import get_db
from flask import session
from datetime import datetime

def list_my_asignaciones():
    """
    Si soy cliente: retorna asignaciones para mis solicitudes activas/próximas.
    Si soy transportista: retorna asignaciones recientes (pendiente, confirmado, activo).
    """
    usuario = session.get("usuario")
    user_id = usuario["id_usuario"]
    tipo = usuario["tipo_usuario"]
    conn = get_db()
    cursor = conn.cursor()

    if tipo == "cliente":
        sql = """
            SELECT a.id_asignacion, a.id_solicitud, a.id_transportista, a.fecha_confirmacion, a.estado
            FROM Asignaciones a
            JOIN Solicitudes s ON a.id_solicitud = s.id_solicitud
            WHERE s.id_cliente=%s AND a.estado IN ('pendiente', 'confirmado', 'activo')
        """
        cursor.execute(sql, (user_id,))
    else:  # transportista
        sql = """
            SELECT id_asignacion, id_solicitud, id_transportista, fecha_confirmacion, estado
            FROM Asignaciones
            WHERE id_transportista=%s AND estado IN ('pendiente', 'confirmado', 'activo')
        """
        cursor.execute(sql, (user_id,))
    return cursor.fetchall()

def create_asignacion(data: dict):
    """
    Crea asignación con estado 'pendiente' e inserta registro.
    """
    conn = get_db()
    cursor = conn.cursor()
    id_solicitud = data["id_solicitud"]
    id_transportista = data["id_transportista"]

    sql = """
        INSERT INTO Asignaciones (id_solicitud, id_transportista, fecha_confirmacion, estado)
        VALUES (%s, %s, %s, 'pendiente')
    """
    cursor.execute(sql, (id_solicitud, id_transportista, None))
    new_id = cursor.lastrowid
    return get_asignacion_by_id(new_id)

def get_asignacion_by_id(id_asignacion: int):
    conn = get_db()
    cursor = conn.cursor()
    sql = "SELECT * FROM Asignaciones WHERE id_asignacion=%s"
    cursor.execute(sql, (id_asignacion,))
    return cursor.fetchone()

def change_estado_asignacion(id_asignacion: int, nuevo_estado: str):
    conn = get_db()
    cursor = conn.cursor()
    # Para confirmar, agregamos fecha_confirmacion
    if nuevo_estado == "confirmado":
        now = datetime.utcnow()
        sql = "UPDATE Asignaciones SET estado='confirmado', fecha_confirmacion=%s WHERE id_asignacion=%s"
        cursor.execute(sql, (now, id_asignacion))
    else:
        sql = "UPDATE Asignaciones SET estado=%s WHERE id_asignacion=%s"
        cursor.execute(sql, (nuevo_estado, id_asignacion))
    return get_asignacion_by_id(id_asignacion)

def cancel_asignacion(id_asignacion: int):
    """
    Cliente o transportista pueden cancelar (se podrían agregar reglas de penalidad).
    """
    conn = get_db()
    cursor = conn.cursor()
    sql = "UPDATE Asignaciones SET estado='cancelado' WHERE id_asignacion=%s"
    cursor.execute(sql, (id_asignacion,))
    return {"msg": "Asignación cancelada"}
