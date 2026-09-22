from db import get_db


def create_incidente(data: dict):
    # Verificar que la asignación esté en estado activo o completado
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT estado FROM Asignaciones WHERE id_asignacion=%s", (data["id_asignacion"],))
    row = cursor.fetchone()
    if not row or row["estado"] not in ("activo", "completado"):
        return {"error": "Solo se pueden reportar incidentes de un traslado en curso o finalizado"}

    sql = """
        INSERT INTO Incidentes (id_asignacion, descripcion, foto_url)
        VALUES (%s, %s, %s)
        RETURNING id_incidente
    """
    cursor.execute(sql, (data["id_asignacion"], data["descripcion"], data.get("foto_url")))
    res = cursor.fetchone()
    conn.commit()
    return get_incidente_by_id(res["id_incidente"])


def get_incidente_by_id(id_incidente: int):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM Incidentes WHERE id_incidente=%s", (id_incidente,))
    return cursor.fetchone()


def list_my_incidentes(user_id: int, tipo: str):
    """Incidentes de los servicios del usuario, según la parte que ocupa (rol real de la sesión)."""
    conn = get_db()
    cursor = conn.cursor()

    if tipo == "cliente":
        sql = """
            SELECT i.id_incidente, i.id_asignacion, i.descripcion, i.foto_url, i.fecha_reporte
            FROM Incidentes i
            JOIN Asignaciones a ON i.id_asignacion = a.id_asignacion
            JOIN Solicitudes s ON a.id_solicitud = s.id_solicitud
            WHERE s.id_cliente=%s
            ORDER BY i.fecha_reporte DESC
        """
    else:  # transportista
        sql = """
            SELECT i.id_incidente, i.id_asignacion, i.descripcion, i.foto_url, i.fecha_reporte
            FROM Incidentes i
            JOIN Asignaciones a ON i.id_asignacion = a.id_asignacion
            WHERE a.id_transportista=%s
            ORDER BY i.fecha_reporte DESC
        """
    cursor.execute(sql, (user_id,))
    return cursor.fetchall()


def list_incidentes_by_asignacion(id_asignacion: int):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM Incidentes WHERE id_asignacion=%s ORDER BY fecha_reporte DESC", (id_asignacion,))
    return cursor.fetchall()
