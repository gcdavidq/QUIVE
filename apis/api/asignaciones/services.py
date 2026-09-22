from db import get_db
from api.notificaciones.services import crear_notificacion
from api.pagos.services import create_pago_min
from datetime import datetime, timedelta


def list_my_asignaciones(user_id, tipo):
    """
    Si soy cliente: retorna asignaciones para mis solicitudes.
    Si soy transportista: retorna asignaciones recientes.
    """
    conn = get_db()
    cursor = conn.cursor()
    inicial = """
                SELECT
                    a.id_asignacion,
                    a.id_solicitud,
                    a.estado,
                    a.precio,
                    -- Estado efectivo del servicio: combina el estado de la asignación
                    -- (respuesta del transportista) con el de la solicitud (pago y ejecución).
                    CASE
                        WHEN a.estado IN ('rechazada', 'cancelada') THEN a.estado
                        WHEN s.estado = 'cancelada' THEN 'cancelada'
                        WHEN a.estado = 'pendiente' THEN 'pendiente'
                        WHEN a.estado = 'completado' OR s.estado = 'finalizada' THEN 'finalizada'
                        WHEN a.estado = 'activo' OR s.estado = 'activa' THEN 'activa'
                        WHEN s.estado = 'confirmada' THEN 'confirmada'
                        ELSE 'aceptada'
                    END AS estado_servicio,

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
        cursor.execute(inicial + """
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

    cursor.execute("""
        INSERT INTO Asignaciones (id_solicitud, id_transportista, fecha_confirmacion, estado, precio)
        VALUES (%s, %s, %s, 'pendiente', %s)
        RETURNING id_asignacion
    """, (id_solicitud, id_transportista, None, precio))
    id_asignacion = cursor.fetchone()["id_asignacion"]

    # Notificar al transportista
    crear_notificacion(
        id_usuario=id_transportista,
        tipo_evento='asignacion_creada',
        tabla='Asignaciones',
        id_referencia=id_asignacion,
        mensaje='Tienes una nueva solicitud de mudanza disponible.'
    )

    return get_asignacion_by_id(id_asignacion)


def get_asignacion_by_id(id_asignacion: int):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM Asignaciones WHERE id_asignacion=%s", (id_asignacion,))
    return cursor.fetchone()


def precio_cotizado(id_solicitud: int, id_transportista: int):
    """Precio que el servidor cotizó para ese transportista en esa solicitud (None si no hay cotización)."""
    from api.transportistas.services import cotizar_transportista
    return cotizar_transportista(id_solicitud, id_transportista)


def change_estado_asignacion(id_asignacion: int, data: dict, id_actor: int):
    """
    Cambia el estado de una asignación. La ruta ya validó qué estados puede fijar
    cada rol; aquí se valida la transición y que el método de cobro sea del actor.
    """
    conn = get_db()
    cursor = conn.cursor()
    nuevo_estado = data['estado']

    # 1. Obtener solicitud relacionada
    cursor.execute("""
        SELECT s.id_cliente, a.id_transportista, a.estado, s.fecha_hora
        FROM Asignaciones a
        JOIN Solicitudes s ON a.id_solicitud = s.id_solicitud
        WHERE a.id_asignacion = %s
    """, (id_asignacion,))
    resultado = cursor.fetchone()

    if not resultado:
        return {"error": "Asignación no encontrada", "status": 404}

    id_cliente = resultado['id_cliente']
    id_transportista = resultado['id_transportista']
    fecha_solicitada = resultado['fecha_hora']

    # 2. Transiciones válidas
    if nuevo_estado in ('confirmada', 'rechazada') and resultado['estado'] != 'pendiente':
        return {"error": "Esta asignación ya fue respondida.", "status": 409}
    if nuevo_estado == 'cancelada':
        if resultado['estado'] not in ('pendiente', 'confirmada'):
            return {"error": "La asignación ya no se puede cancelar.", "status": 409}
        ahora = datetime.now()
        fecha_limite = fecha_solicitada - timedelta(hours=2)
        if ahora > fecha_limite:
            return {"error": "No se puede cancelar la solicitud con menos de 2 horas de anticipación."}

    # 3. Al confirmar, el transportista debe indicar un método de cobro propio
    metodo_cobro = None
    if nuevo_estado == 'confirmada':
        metodo = data.get('metodo_pago') or {}
        id_metodo = metodo.get('id') if isinstance(metodo, dict) else metodo
        cursor.execute("""
            SELECT id, tipo_metodo FROM Metodos_Pago_Usuario
            WHERE id = %s AND usuario_id = %s
        """, (id_metodo, id_actor))
        metodo_cobro = cursor.fetchone()
        if not metodo_cobro:
            return {"error": "Debes confirmar con un método de cobro registrado en tu cuenta."}

    # 4. Actualizar estado
    cursor.execute("""
        UPDATE Asignaciones
        SET estado = %s, fecha_confirmacion = NOW()
        WHERE id_asignacion = %s
    """, (nuevo_estado, id_asignacion))

    # 5. Notificaciones a la contraparte
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
        crear_notificacion(
            id_usuario=id_transportista,
            tipo_evento="asignacion_cancelada_cliente",
            tabla='Asignaciones',
            id_referencia=id_asignacion,
            mensaje="El cliente ha cancelado la asignación."
        )

    # 6. Registrar el pago (lado receptor) si fue confirmada
    if metodo_cobro:
        create_pago_min(id_asignacion, metodo_cobro['id'], metodo_cobro['tipo_metodo'])

    return {"mensaje": f"Estado actualizado a {nuevo_estado}"}


def delete_asignacion(id_asignacion: int) -> bool:
    """
    Elimina la asignación con el id dado y notifica al transportista.
    """
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT id_transportista, id_solicitud
        FROM Asignaciones
        WHERE id_asignacion = %s
    """, (id_asignacion,))
    asignacion = cursor.fetchone()

    if not asignacion:
        return False

    id_transportista = asignacion["id_transportista"]

    cursor.execute("DELETE FROM Asignaciones WHERE id_asignacion = %s", (id_asignacion,))

    crear_notificacion(
        id_usuario=id_transportista,
        tipo_evento="asignacion_eliminada",
        tabla="Asignaciones",
        id_referencia=id_asignacion,
        mensaje="El cliente ha cancelado una asignación que te había sido asignada."
    )

    return True