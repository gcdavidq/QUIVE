from db import get_db


def crear_notificacion(id_usuario: int, tipo_evento: str, tabla: str, id_referencia: int, mensaje: str):
    conn = get_db()
    cursor = conn.cursor()

    sql = """
        INSERT INTO Notificaciones (id_usuario, tipo_evento, tabla_referencia, id_referencia, mensaje)
        VALUES (%s, %s, %s, %s, %s)
    """
    cursor.execute(sql, (id_usuario, tipo_evento, tabla, id_referencia, mensaje))
    conn.commit()


def obtener_notificaciones(id_usuario: int, solo_no_leidas: bool = False):
    conn = get_db()
    cursor = conn.cursor()

    sql = """
        SELECT * FROM Notificaciones
        WHERE id_usuario = %s
    """
    if solo_no_leidas:
        sql += " AND leido = FALSE"

    sql += " ORDER BY fecha DESC"
    cursor.execute(sql, (id_usuario,))
    return cursor.fetchall()


def marcar_como_leida(id_notificacion: int):
    conn = get_db()
    cursor = conn.cursor()

    sql = "UPDATE Notificaciones SET leido = TRUE WHERE id_notificacion = %s"
    cursor.execute(sql, (id_notificacion,))
    conn.commit()