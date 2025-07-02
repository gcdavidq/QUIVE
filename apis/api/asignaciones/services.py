from db import get_db
from api.notificaciones.services import crear_notificacion
from api.pagos.services import create_pago_min
from datetime import datetime, timedelta

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
                    s.estado AS estado_solicitud,
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

def change_estado_asignacion(id_asignacion: int, data: dict):
    conn = get_db()
    cursor = conn.cursor()
    nuevo_estado = data['estado']
    # 1. Obtener solicitud relacionada y su hora programada
    cursor.execute("""
        SELECT s.id_cliente, a.id_transportista, s.fecha_hora
        FROM Asignaciones a
        JOIN Solicitudes s ON a.id_solicitud = s.id_solicitud
        WHERE a.id_asignacion = %s
    """, (id_asignacion,))
    resultado = cursor.fetchone()

    if not resultado:
        return {"error": "Asignación no encontrada"}, 404

    id_cliente = resultado['id_cliente']
    id_transportista = resultado['id_transportista']
    fecha_solicitada = resultado['fecha_hora']

    # 2. Si se quiere cancelar, verificar que falten al menos 2 horas
    if nuevo_estado == 'cancelada':
        ahora = datetime.now()
        fecha_limite = fecha_solicitada - timedelta(hours=2)

        if ahora > fecha_limite:
            return {
                "error": "No se puede cancelar la solicitud con menos de 2 horas de anticipación."
            }, 400

    # 3. Actualizar estado
    cursor.execute("""
        UPDATE Asignaciones 
        SET estado = %s, fecha_confirmacion = NOW() 
        WHERE id_asignacion = %s
    """, (nuevo_estado, id_asignacion))

    # 4. Notificaciones
    if nuevo_estado in ['confirmada', 'rechazada']:
        mensaje = f"Tu solicitud ha sido {'aceptada' if nuevo_estado == 'confirmada' else 'rechazada'} por el transportista."
        crear_notificacion(
            id_usuario=id_cliente,
            tipo_evento=f"asignacion_{nuevo_estado}",
            tabla='Asignaciones',
            id_referencia=id_asignacion,
            mensaje=mensaje
        )

    elif nuevo_estado == 'cancelada':
        mensaje = "El cliente ha cancelado la asignación."
        crear_notificacion(
            id_usuario=id_transportista,
            tipo_evento="asignacion_cancelada_cliente",
            tabla='Asignaciones',
            id_referencia=id_asignacion,
            mensaje=mensaje
        )

    # 5. Registrar el pago si la asignación fue confirmada
    if nuevo_estado == 'confirmada' and 'metodo_pago' in data:
        metodo_pago = data['metodo_pago']
        tipo_metodo = data['tipo_metodo']
        create_pago_min(id_asignacion, metodo_pago['id'], tipo_metodo)

    conn.commit()
    return {"mensaje": f"Estado actualizado a {nuevo_estado}"}


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