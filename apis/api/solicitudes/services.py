from db import get_db
from flask import session
from datetime import datetime, timedelta
import pymysql

# Nota: para el cálculo de tarifa necesitarías utilidades en utils/geo.py.
# Aquí haremos un cálculo de tarifa ficticio (p. ej. 10 unidades por objeto).

def list_my_solicitudes():
    usuario = session.get("usuario")
    user_id = usuario["id_usuario"]
    conn = get_db()
    cursor = conn.cursor()
    sql = """
        SELECT * FROM Solicitudes WHERE id_cliente=%s
    """
    cursor.execute(sql, (user_id,))
    return cursor.fetchall()

def get_solicitud_by_id(id_solicitud: int):
    conn = get_db()
    cursor = conn.cursor()
    sql = "SELECT * FROM Solicitudes WHERE id_solicitud=%s"
    cursor.execute(sql, (id_solicitud,))
    return cursor.fetchone()

def create_solcitud(data: dict):
    usuario = session.get("usuario")
    user_id = usuario["id_usuario"]
    conn = get_db()
    cursor = conn.cursor()

    # 1) Insertar en Solicitudes
    sql_insert = """
        INSERT INTO Solicitudes (id_cliente, origen, destino, fecha_hora, estado)
        VALUES (%s, %s, %s, %s, 'en espera')
    """
    cursor.execute(sql_insert, (
        user_id, data["origen"], data["destino"], data["fecha_hora"]
    ))
    id_sol = cursor.lastrowid

    # 2) Insertar Objetos_Solicitud
    for obj in data["objetos"]:
        sql_obj = """
            INSERT INTO Objetos_Solicitud (id_solicitud, id_tipo, cantidad, observaciones, imagen_url)
            VALUES (%s, %s, %s, %s, %s)
        """
        cursor.execute(sql_obj, (
            id_sol, obj["id_tipo"], obj["cantidad"],
            obj.get("observaciones"), obj.get("imagen_url")
        ))

    # 3) Calcular tarifa estimada (ejemplo simple: 10 por objeto)
    tarifa_estimada = 0
    for obj in data["objetos"]:
        tarifa_estimada += obj["cantidad"] * 10

    return {
        "id_solicitud": id_sol,
        "tarifa_estimada": tarifa_estimada,
        "estado": "en espera"
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

def get_tarifa_detallada(id_solicitud: int):
    """
    Retorna desglose de tarifa: distancia, volumen, servicios.
    Aquí devolvemos un ejemplo fijo.
    """
    # En producción: calcula sobre la base de datos y utilidades de geo
    return {
        "id_solicitud": id_solicitud,
        "distancia_km": 5.2,
        "costo_distancia": 52.0,
        "costo_volumen": 20.0,
        "servicios_adicionales": {
            "embalaje": True,
            "costo_embalaje": 15.0,
            "ayudante": 1,
            "costo_ayudante": 10.0
        },
        "costo_total": 97.0
    }
