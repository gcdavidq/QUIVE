from db import get_db
from api.transportistas.services import perfil_publico_transportista
import json


def post_tracking(data: dict, id_transportista: int):
    """
    Inserta una posición GPS real en Seguimiento. Solo el transportista asignado
    puede reportar, y solo mientras el traslado está en curso.
    """
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT estado FROM Asignaciones
        WHERE id_asignacion=%s AND id_transportista=%s
    """, (data["id_asignacion"], id_transportista))
    row = cursor.fetchone()
    if not row or row["estado"] != "activo":
        return {"error": "Solo puedes reportar posición de un traslado tuyo que esté en curso"}

    cursor.execute("""
        INSERT INTO Seguimiento (id_asignacion, latitud, longitud, hora_ultima_actualizacion)
        VALUES (%s, %s, %s, NOW())
    """, (data["id_asignacion"], data["latitud"], data["longitud"]))
    return {"msg": "Coordenadas registradas"}


def get_ultimo_tracking(id_asignacion: int):
    """
    Devuelve la última ubicación registrada para una asignación.
    """
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT latitud, longitud, hora_ultima_actualizacion
        FROM Seguimiento
        WHERE id_asignacion=%s
        ORDER BY hora_ultima_actualizacion DESC
        LIMIT 1
    """, (id_asignacion,))
    return cursor.fetchone()


def get_servicio_en_seguimiento(user_id: int, rol: str):
    """
    Servicio que el usuario puede seguir ahora: el traslado en curso ('activa') o, si no
    hay ninguno, el próximo ya pagado ('confirmada'). Vale para ambos roles; la contraparte
    devuelta es el transportista (para el cliente) o el cliente (para el transportista).

    Toda la información sale de la base de datos. La posición del vehículo es la última
    fila real de Seguimiento (None si el transportista aún no ha reportado GPS); ya no se
    simula un avance a partir del reloj.
    """
    conn = get_db()
    cursor = conn.cursor()

    if rol == "transportista":
        filtro, contraparte = "a.id_transportista = %s", "s.id_cliente"
    else:
        filtro, contraparte = "s.id_cliente = %s", "a.id_transportista"

    cursor.execute(f"""
        SELECT
            s.id_solicitud, s.origen, s.destino, s.ruta, s.distancia, s.fecha_hora, s.estado,
            a.id_asignacion, a.precio, a.id_transportista,
            u.id_usuario AS contraparte_id,
            u.nombre_completo AS contraparte_nombre,
            u.telefono AS contraparte_telefono,
            u.foto_perfil_url AS contraparte_foto
        FROM Solicitudes s
        JOIN Asignaciones a ON a.id_solicitud = s.id_solicitud
                           AND a.estado IN ('confirmada', 'activo')
        JOIN Usuarios u ON u.id_usuario = {contraparte}
        WHERE {filtro} AND s.estado IN ('activa', 'confirmada')
        ORDER BY (s.estado = 'activa') DESC, s.fecha_hora ASC
        LIMIT 1
    """, (user_id,))
    servicio = cursor.fetchone()
    if not servicio:
        return None

    servicio.update(perfil_publico_transportista(servicio["id_transportista"]))

    # Inventario
    cursor.execute("""
        SELECT os.id_objeto, t.categoria, t.variante, os.cantidad
        FROM Objetos_Solicitud os
        JOIN Tipos_Objeto t ON os.id_tipo = t.id_tipo
        WHERE os.id_solicitud = %s
    """, (servicio["id_solicitud"],))
    servicio["objetos"] = cursor.fetchall()

    # Ruta planificada (polilínea guardada al crear la solicitud)
    try:
        servicio["ruta"] = json.loads(servicio["ruta"]) if servicio["ruta"] else []
    except (TypeError, json.JSONDecodeError):
        servicio["ruta"] = []

    servicio["ultima_posicion"] = get_ultimo_tracking(servicio["id_asignacion"])
    return servicio
