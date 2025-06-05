from db import get_db
from flask import session
import pymysql

def create_incidente(data: dict):
    # Verificar que la asignación esté en estado activo o completado
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT estado FROM Asignaciones WHERE id_asignacion=%s", (data["id_asignacion"],))
    row = cursor.fetchone()
    if not row or row["estado"] not in ("activo", "completado"):
        return {"error": "Asignación no válida para reporte de incidente"}

    sql = """
        INSERT INTO Incidentes (id_asignacion, descripcion, foto_url)
        VALUES (%s, %s, %s)
    """
    cursor.execute(sql, (data["id_asignacion"], data["descripcion"], data.get("foto_url")))
    new_id = cursor.lastrowid
    return get_incidente_by_id(new_id)

def get_incidente_by_id(id_incidente: int):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM Incidentes WHERE id_incidente=%s", (id_incidente,))
    return cursor.fetchone()

def list_my_incidentes():
    usuario = session.get("usuario")
    user_id = usuario["id_usuario"]
    tipo = usuario["tipo_usuario"]
    conn = get_db()
    cursor = conn.cursor()

    if tipo == "cliente":
        sql = """
            SELECT i.id_incidente, i.id_asignacion, i.descripcion, i.foto_url, i.fecha_reporte
            FROM Incidentes i
            JOIN Asignaciones a ON i.id_asignacion = a.id_asignacion
            JOIN Solicitudes s ON a.id_solicitud = s.id_solicitud
            WHERE s.id_cliente=%s
        """
        cursor.execute(sql, (user_id,))
    else:  # transportista
        sql = """
            SELECT i.id_incidente, i.id_asignacion, i.descripcion, i.foto_url, i.fecha_reporte
            FROM Incidentes i
            JOIN Asignaciones a ON i.id_asignacion = a.id_asignacion
            WHERE a.id_transportista=%s
        """
        cursor.execute(sql, (user_id,))
    return cursor.fetchall()

def list_incidentes_by_asignacion(id_asignacion: int):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM Incidentes WHERE id_asignacion=%s", (id_asignacion,))
    return cursor.fetchall()

def change_incidente_status(id_incidente: int, nuevo_estado: str):
    # En el PDF se menciona cambiar estado (abierto, en revisión, resuelto, rechazado).
    # Pero la tabla Incidentes no tiene campo estado. Si deseas agregarlo, tendrías que alterar la tabla.
    # Aquí simplemente devolvemos la info del incidente.
    return get_incidente_by_id(id_incidente)
