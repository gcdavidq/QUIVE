from db import get_db


def create_calificacion(data: dict, id_calificador: int):
    """
    Crea la calificación del usuario autenticado hacia su contraparte en la asignación.
    Requiere servicio finalizado y pago completado, y una sola calificación por parte.
    """
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT a.estado, a.id_transportista, s.id_cliente, p.estado_pago
        FROM Asignaciones a
        JOIN Solicitudes s ON a.id_solicitud = s.id_solicitud
        LEFT JOIN Pagos p ON p.id_asignacion = a.id_asignacion
        WHERE a.id_asignacion = %s
    """, (data["id_asignacion"],))
    fila = cursor.fetchone()
    if not fila:
        return {"error": "Asignación no encontrada"}
    if fila["estado"] != "completado":
        return {"error": "Solo puedes calificar un servicio finalizado"}
    if fila["estado_pago"] != "completado":
        return {"error": "No puedes calificar sin pago completado"}

    # La contraparte se deriva de la asignación; no se acepta del cliente.
    calificado = fila["id_transportista"] if id_calificador == fila["id_cliente"] else fila["id_cliente"]

    cursor.execute("""
        SELECT id_calificacion FROM Calificaciones
        WHERE id_asignacion=%s AND calificador=%s
    """, (data["id_asignacion"], id_calificador))
    if cursor.fetchone():
        return {"error": "Ya dejaste una calificación para esta asignación"}

    cursor.execute("""
        INSERT INTO Calificaciones (id_asignacion, calificador, calificado, puntaje, comentario)
        VALUES (%s, %s, %s, %s, %s)
        RETURNING id_calificacion
    """, (
        data["id_asignacion"], id_calificador, calificado,
        data["puntaje"], data.get("comentario")
    ))
    row = cursor.fetchone()
    conn.commit()
    return get_calificacion_by_id(row["id_calificacion"])


def get_calificacion_by_id(id_calificacion: int):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM Calificaciones WHERE id_calificacion=%s", (id_calificacion,))
    return cursor.fetchone()


def list_calificaciones_de_usuario(id_usuario: int):
    """Calificaciones recibidas por un usuario, con el nombre de quien calificó."""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT c.id_calificacion, c.id_asignacion, c.calificador, c.calificado, c.puntaje, c.comentario,
               u.nombre_completo AS calificador_nombre
        FROM Calificaciones c
        JOIN Usuarios u ON u.id_usuario = c.calificador
        WHERE c.calificado=%s
        ORDER BY c.id_calificacion DESC
    """, (id_usuario,))
    return cursor.fetchall()


def list_my_calificaciones(user_id: int):
    """Calificaciones que el usuario dio o recibió."""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT id_calificacion, id_asignacion, calificador, calificado, puntaje, comentario
        FROM Calificaciones
        WHERE calificador=%s OR calificado=%s
        ORDER BY id_calificacion DESC
    """, (user_id, user_id))
    return cursor.fetchall()
