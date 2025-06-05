from db import get_db
from flask import session
import pymysql

def list_my_pagos():
    """
    Lista todos los pagos del cliente actual.
    """
    usuario = session.get("usuario")
    user_id = usuario["id_usuario"]
    conn = get_db()
    cursor = conn.cursor()
    sql = """
        SELECT p.id_pago, p.id_asignacion, p.monto_total, p.metodo_pago, p.estado_pago
        FROM Pagos p
        JOIN Asignaciones a ON p.id_asignacion = a.id_asignacion
        JOIN Solicitudes s ON a.id_solicitud = s.id_solicitud
        WHERE s.id_cliente=%s
    """
    cursor.execute(sql, (user_id,))
    return cursor.fetchall()

def create_pago(data: dict):
    """
    Inicia transacción de pago para una asignación finalizada.
    """
    conn = get_db()
    cursor = conn.cursor()
    # Validar estado de asignación
    cursor.execute("SELECT estado FROM Asignaciones WHERE id_asignacion=%s", (data["id_asignacion"],))
    row = cursor.fetchone()
    if not row or row["estado"] != "completado":
        return {"error": "Asignación no válida para pago"}

    # Insertar en Pagos
    sql = """
        INSERT INTO Pagos (id_asignacion, monto_total, metodo_pago, estado_pago)
        VALUES (%s, %s, %s, 'pendiente')
    """
    cursor.execute(sql, (data["id_asignacion"], data["monto_total"], data["metodo_pago"]))
    new_id = cursor.lastrowid
    # (Acá en frontend rediriges a la URL de checkout de la pasarela correspondiente)
    return {"id_pago": new_id, "checkout_url": "https://pasarela.example.com/checkout/" + str(new_id)}

def webhook_pago(data: dict):
    """
    Recibido desde la pasarela para notificar estado.
    """
    conn = get_db()
    cursor = conn.cursor()
    id_pago = data.get("id_pago")
    estado_pago = data.get("estado_pago")
    transaccion_id = data.get("transaccion_id")

    cursor.execute("SELECT * FROM Pagos WHERE id_pago=%s", (id_pago,))
    pago = cursor.fetchone()
    if not pago:
        return {"error": "Pago no encontrado"}

    nuevo_estado = "completado" if estado_pago == "completado" else "fallido"
    cursor.execute("UPDATE Pagos SET estado_pago=%s WHERE id_pago=%s", (nuevo_estado, id_pago))

    # Si se completó, notificar al cliente para que califique y al transportista
    # (Implementar notificaciones con api/notificaciones/services.py)
    return {"msg": f"Estado actualizado a {nuevo_estado}"}

def refund_pago(id_pago: int):
    """
    ADMIN: emitir reembolso
    """
    conn = get_db()
    cursor = conn.cursor()
    # Podrías integrar con pasarela para reembolso y luego:
    cursor.execute("UPDATE Pagos SET estado_pago='fallido' WHERE id_pago=%s", (id_pago,))
    return {"msg": "Reembolso ejecutado (estado fallido)"}

# Métodos de pago (tabla Metodos_Pago)
def list_my_metodos():
    usuario = session.get("usuario")
    user_id = usuario["id_usuario"]
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM Metodos_Pago WHERE id_usuario=%s", (user_id,))
    return cursor.fetchall()

def create_metodo(data: dict):
    usuario = session.get("usuario")
    user_id = usuario["id_usuario"]
    conn = get_db()
    cursor = conn.cursor()
    sql = """
        INSERT INTO Metodos_Pago (id_usuario, tipo, entidad, dato)
        VALUES (%s, %s, %s, %s)
    """
    cursor.execute(sql, (user_id, data["tipo"], data["entidad"], data["dato"]))
    new_id = cursor.lastrowid
    cursor.execute("SELECT * FROM Metodos_Pago WHERE id_metodo=%s", (new_id,))
    return cursor.fetchone()

def update_metodo(id_metodo: int, data: dict):
    usuario = session.get("usuario")
    user_id = usuario["id_usuario"]
    conn = get_db()
    cursor = conn.cursor()
    # Validar propiedad
    cursor.execute("SELECT id_usuario FROM Metodos_Pago WHERE id_metodo=%s", (id_metodo,))
    row = cursor.fetchone()
    if not row or row["id_usuario"] != user_id:
        return {"error": "Método de pago no encontrado o no te pertenece"}

    campos = []
    valores = []
    for campo in ["tipo", "entidad", "dato"]:
        if campo in data:
            campos.append(f"{campo}=%s")
            valores.append(data[campo])
    if not campos:
        return {"error": "Nada para actualizar"}
    valores.append(id_metodo)
    sql = f"UPDATE Metodos_Pago SET {', '.join(campos)} WHERE id_metodo=%s"
    cursor.execute(sql, tuple(valores))
    cursor.execute("SELECT * FROM Metodos_Pago WHERE id_metodo=%s", (id_metodo,))
    return cursor.fetchone()

def delete_metodo(id_metodo: int):
    usuario = session.get("usuario")
    user_id = usuario["id_usuario"]
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id_usuario FROM Metodos_Pago WHERE id_metodo=%s", (id_metodo,))
    row = cursor.fetchone()
    if not row or row["id_usuario"] != user_id:
        return {"error": "Método de pago no encontrado o no te pertenece"}
    cursor.execute("DELETE FROM Metodos_Pago WHERE id_metodo=%s", (id_metodo,))
    return {"msg": "Método de pago eliminado"}
