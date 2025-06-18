from db import get_db
from api.notificaciones.services import crear_notificacion
from datetime import datetime

def list_my_asignaciones(user_id, tipo):
    """
    Si soy cliente: retorna asignaciones para mis solicitudes activas/próximas.
    Si soy transportista: retorna asignaciones recientes (pendiente, confirmado, activo).
    """
    conn = get_db()
    cursor = conn.cursor()
    inicial = """
                SELECT 
                    a.id_asignacion,
                    a.estado,
                    a.precio,

                    s.origen,
                    s.destino,
                    s.distancia,
                    s.fecha_hora,

                    u.id_usuario AS usuario_id,
                    u.nombre_completo AS usuario_nombre,
                    u.telefono AS usuario_telefono,
                    u.foto_perfil_url AS usuario_foto

                FROM Asignaciones a
                """
    if tipo == 'transportista':
        cursor.execute(inicial+"""
                JOIN Solicitudes s ON a.id_solicitud = s.id_solicitud
                JOIN Usuarios u ON s.id_cliente = u.id_usuario
                WHERE a.id_transportista = %s
                ORDER BY a.fecha_confirmacion DESC
            """, (user_id,))
    elif tipo == 'cliente':
        cursor.execute(inicial + """
                JOIN Solicitudes s ON a.id_solicitud = s.id_solicitud
                JOIN Usuarios u ON a.id_transportista = u.id_usuario
                WHERE s.id_cliente = %s
                ORDER BY a.fecha_confirmacion DESC
            """, (user_id,))
    return cursor.fetchall()

def create_asignacion(data: dict):
    conn = get_db()
    cursor = conn.cursor()

    id_solicitud = data["id_solicitud"]
    id_transportista = data["id_transportista"]
    precio = data["precio"]

    sql = """
        INSERT INTO Asignaciones (id_solicitud, id_transportista, fecha_confirmacion, estado, precio)
        VALUES (%s, %s, %s, 'pendiente', %s)
    """
    cursor.execute(sql, (id_solicitud, id_transportista, None, precio))
    id_asignacion = cursor.lastrowid

    # Notificar al transportista
    crear_notificacion(
        id_usuario=id_transportista,
        tipo_evento='asignacion_creada',
        tabla='Asignaciones',
        id_referencia=id_asignacion,
        mensaje='Tienes una nueva solicitud de mudanza disponible.'
    )

    conn.commit()
    return get_asignacion_by_id(id_asignacion)

def get_asignacion_by_id(id_asignacion: int):
    conn = get_db()
    cursor = conn.cursor()
    sql = "SELECT * FROM Asignaciones WHERE id_asignacion=%s"
    cursor.execute(sql, (id_asignacion,))
    return cursor.fetchone()

def change_estado_asignacion(id_asignacion: int, nuevo_estado: str):
    conn = get_db()
    cursor = conn.cursor()

    # 1. Actualizar estado y fecha
    cursor.execute("""
        UPDATE Asignaciones 
        SET estado = %s, fecha_confirmacion = NOW() 
        WHERE id_asignacion = %s
    """, (nuevo_estado, id_asignacion))

    # 2. Obtener cliente (a través de la solicitud)
    cursor.execute("""
        SELECT s.id_cliente, a.id_transportista
        FROM Asignaciones a
        JOIN Solicitudes s ON a.id_solicitud = s.id_solicitud
        WHERE a.id_asignacion = %s
    """, (id_asignacion,))
    resultado = cursor.fetchone()

    if not resultado:
        return {"error": "Asignación no encontrada"}, 404

    id_cliente = resultado['id_cliente']

    # 3. Crear notificación para el cliente
    mensaje = f"Tu solicitud ha sido {'aceptada' if nuevo_estado == 'confirmado' else 'rechazada'} por el transportista."
    crear_notificacion(
        id_usuario=id_cliente,
        tipo_evento=f"asignacion_{nuevo_estado}",
        tabla='Asignaciones',
        id_referencia=id_asignacion,
        mensaje=mensaje
    )

    conn.commit()
    return {"mensaje": mensaje}

def delete_asignacion(id_asignacion: int) -> bool:
    """
    Elimina la asignación con el id dado y notifica al transportista.
    Devuelve True si se eliminó alguna fila, False si no existía.
    """
    conn = get_db()
    cursor = conn.cursor()

    # 1. Obtener id del transportista y solicitud antes de eliminar
    cursor.execute("""
        SELECT id_transportista, id_solicitud 
        FROM Asignaciones 
        WHERE id_asignacion = %s
    """, (id_asignacion,))
    asignacion = cursor.fetchone()

    if not asignacion:
        return False

    id_transportista = asignacion["id_transportista"]

    # 2. Eliminar la asignación
    cursor.execute(
        "DELETE FROM Asignaciones WHERE id_asignacion = %s",
        (id_asignacion,)
    )
    conn.commit()

    # 3. Crear notificación para el transportista
    mensaje = "El cliente ha cancelado una asignación que te había sido asignada."
    crear_notificacion(
        id_usuario=id_transportista,
        tipo_evento="asignacion_eliminada",
        tabla="Asignaciones",
        id_referencia=id_asignacion,
        mensaje=mensaje
    )

    return True