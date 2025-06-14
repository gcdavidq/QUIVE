from db import get_db
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
    """
    Crea asignación con estado 'pendiente' e inserta registro.
    """
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
    new_id = cursor.lastrowid
    return get_asignacion_by_id(new_id)

def get_asignacion_by_id(id_asignacion: int):
    conn = get_db()
    cursor = conn.cursor()
    sql = "SELECT * FROM Asignaciones WHERE id_asignacion=%s"
    cursor.execute(sql, (id_asignacion,))
    return cursor.fetchone()

def change_estado_asignacion(id_asignacion: int, nuevo_estado: str):
    conn = get_db()
    cursor = conn.cursor()
    # Para confirmar, agregamos fecha_confirmacion
    cursor.execute("""
            UPDATE Asignaciones 
            SET estado = %s, fecha_confirmacion = NOW() 
            WHERE id_asignacion = %s
        """, (nuevo_estado, id_asignacion))

    # Insertar una notificación para el transportista
    cursor.execute("""
            SELECT id_transportista FROM Asignaciones WHERE id_asignacion = %s
        """, (id_asignacion,))
    id_transportista = cursor.fetchone()['id_transportista']

    mensaje = f"Has {'aceptado' if nuevo_estado == 'confirmado' else 'rechazado'} una solicitud"
    cursor.execute("""
            INSERT INTO Notificaciones (id_usuario, tipo, mensaje)
            VALUES (%s, 'asignacion', %s)
        """, (id_transportista, mensaje))
    print(mensaje)
    return {"mensaje": mensaje}