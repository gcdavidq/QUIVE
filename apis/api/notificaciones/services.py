from db import get_db
from flask import session
import pymysql
from datetime import datetime

def subscribe_device(data: dict):
    """
    Guarda token de dispositivo para recibir push (por ejemplo, en tabla PushTokens).
    Actualmente es un stub porque aún no creamos la tabla PushTokens.
    """
    usuario = session.get("usuario")
    user_id = usuario["id_usuario"]
    # Aquí podrías hacer: INSERT INTO PushTokens (id_usuario, device_token, plataforma) VALUES (...)
    return {"msg": f"Device token '{data['device_token']}' registrado para usuario {user_id}"}

def unsubscribe_device(data: dict):
    """
    Elimina token de dispositivo de tabla PushTokens (stub).
    """
    usuario = session.get("usuario")
    user_id = usuario["id_usuario"]
    # Aquí pondrías: DELETE FROM PushTokens WHERE device_token = ...
    return {"msg": f"Device token '{data['device_token']}' eliminado para usuario {user_id}"}

def list_my_notificaciones():
    """
    Devuelve todas las notificaciones del usuario logueado,
    ordenadas por fecha descendente.
    """
    usuario = session.get("usuario")
    user_id = usuario["id_usuario"]
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT id_notificacion, tipo, mensaje, leido, fecha
        FROM Notificaciones
        WHERE id_usuario=%s
        ORDER BY fecha DESC
    """, (user_id,))
    return cursor.fetchall()

def send_notification(data: dict):
    """
    Admin envía notificación a un usuario o grupo.
    Inserta en la tabla Notificaciones.
    """
    conn = get_db()
    cursor = conn.cursor()
    sql = """
        INSERT INTO Notificaciones (id_usuario, tipo, mensaje, leido, fecha)
        VALUES (%s, %s, %s, FALSE, %s)
    """
    ahora = datetime.utcnow()
    cursor.execute(sql, (data["id_usuario"], data["tipo"], data["mensaje"], ahora))
    return {"msg": f"Notificación enviada a usuario {data['id_usuario']}"}
