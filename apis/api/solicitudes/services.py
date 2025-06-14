from db import get_db
from flask import session
from datetime import datetime, timedelta
import json

# Nota: para el cálculo de tarifa necesitarías utilidades en utils/geo.py.
# Aquí haremos un cálculo de tarifa ficticio (p. ej. 10 unidades por objeto).
def get_solicitud_by_id(id_solicitud: int):
    conn = get_db()
    cursor = conn.cursor()
    sql = "SELECT * FROM Solicitudes WHERE id_solicitud=%s"
    cursor.execute(sql, (id_solicitud,))
    return cursor.fetchone()

def create_solcitud(data: dict):
    user_id = data["id_usuario"]
    conn = get_db()
    cursor = conn.cursor()

    # 1) Insertar en Solicitudes
    sql_insert = """
        INSERT INTO Solicitudes (id_cliente, origen, destino, ruta, distancia, tiempo_estimado, fecha_hora, estado)
        VALUES (%s, %s, %s, %s, %s, %s, %s, 'en espera')
    """
    cursor.execute(sql_insert, (
        user_id, data["origen"], data["destino"], data['ruta'], data["distancia"], data["tiempo_estimado"], data["fecha_hora"]
    ))
    id_sol = cursor.lastrowid

    return {
        "id_solicitud": id_sol,
    }

def actualizar_solicitud_completa(id_solicitud, data):
    conn = get_db()
    cursor = conn.cursor()
    # Actualizar solicitud existente
    sql_update = """
                UPDATE Solicitudes
                SET origen = %s,
                    destino = %s,
                    ruta = %s,
                    distancia = %s,
                    tiempo_estimado = %s,
                    fecha_hora = %s
                WHERE id_solicitud = %s
            """
    cursor.execute(sql_update, (
        data["origen"],
        data["destino"],
        data["ruta"],
        data["distancia"],
        data["tiempo_estimado"],
        data["fecha_hora"],
        id_solicitud
    ))
    conn.commit()
    return {
        "id_solicitud": id_solicitud
    }

def update_solicitud(id_solicitud: int, data: dict):
    """
    Permite reprogramar o cancelar (si faltan > 2 horas).
    """
    conn = get_db()
    cursor = conn.cursor()
    # Obtener solicitud
    cursor.execute("SELECT fecha_hora, estado FROM Solicitudes WHERE id_solicitud=%s", (id_solicitud,))
    sol = cursor.fetchone()
    if not sol:
        return {"error": "Solicitud no encontrada"}

    ahora = datetime.utcnow()
    fecha_hora = sol["fecha_hora"]
    diff = fecha_hora - ahora
    if data.get("cancelar"):
        if diff < timedelta(hours=2):
            return {"error": "No puedes cancelar con menos de 2 horas de anticipación"}
        cursor.execute("UPDATE Solicitudes SET estado='cancelado' WHERE id_solicitud=%s", (id_solicitud,))
        # (Enviar notificación a transportista si había sido asignado)
        return {"msg": "Solicitud cancelada"}
    elif data.get("fecha_hora"):
        if diff < timedelta(hours=2):
            return {"error": "No puedes reprogramar con menos de 2 horas de anticipación"}
        nueva_fecha = data["fecha_hora"]
        cursor.execute("UPDATE Solicitudes SET fecha_hora=%s, estado='en espera' WHERE id_solicitud=%s", (nueva_fecha, id_solicitud))
        # (Notificar transportista si había sido asignado)
        return {"msg": "Solicitud reprogramada", "nueva_fecha_hora": nueva_fecha}
    else:
        return {"error": "Datos inválidos"}

def list_solicitudes_disponibles(filters: dict):
    """
    Listar solicitudes cercanas y pendientes de asignación.
    En esteejemplo  devolvemos todas con estado 'en espera'.
    En producción: aplicar proximidad, tipo de vehículo, reputación, etc.
    """
    conn = get_db()
    cursor = conn.cursor()
    sql = "SELECT * FROM Solicitudes WHERE estado='en espera'"
    cursor.execute(sql)
    return cursor.fetchall()