from utils.calcular_distancia import calcular_ruta_ors
import json
from datetime import datetime, timedelta
from db import get_db
from api.notificaciones.services import crear_notificacion
from api.pagos.services import update_pago_by_asignacion
from api.transportistas.services import perfil_publico_transportista


def get_solicitud_by_user_id(user_id: int):
    """
    Obtiene la solicitud pendiente del usuario con detalle completo.
    """
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM ObtenerSolicitudesConDetalle(%s, %s, NULL)", (user_id, 'en espera'))
    fila = cursor.fetchone()

    if fila:
        # Convertir objetos timedelta a string legible
        for key, value in fila.items():
            if isinstance(value, timedelta):
                fila[key] = str(value)

        # Si hay campo 'objetos' en formato JSON string
        if "objetos" in fila and isinstance(fila["objetos"], str):
            try:
                fila["objetos"] = json.loads(fila["objetos"])
            except json.JSONDecodeError:
                pass

        # La función SQL une con una asignación cualquiera (LIMIT 1), que puede ser una
        # rechazada o cancelada. Se sustituye por la asignación vigente de la solicitud.
        cursor.execute("""
            SELECT a.id_asignacion, a.estado AS estado_asignacion, a.precio,
                   u.id_usuario AS id_transportista, u.nombre_completo AS nombre, u.foto_perfil_url AS foto
            FROM Asignaciones a
            JOIN Usuarios u ON u.id_usuario = a.id_transportista
            WHERE a.id_solicitud = %s AND a.estado IN ('pendiente', 'confirmada')
            ORDER BY a.id_asignacion DESC
            LIMIT 1
        """, (fila["id_solicitud"],))
        vigente = cursor.fetchone()
        for campo in ("id_asignacion", "estado_asignacion", "precio", "id_transportista", "nombre", "foto"):
            fila[campo] = vigente[campo] if vigente else None
        if vigente:
            fila.update(perfil_publico_transportista(vigente["id_transportista"]))

    return fila


def get_solicitud_by_id(id_solicitud: int):
    conn = get_db()
    cursor = conn.cursor()
    sql = "SELECT * FROM Solicitudes WHERE id_solicitud=%s"
    cursor.execute(sql, (id_solicitud,))
    return cursor.fetchone()


def create_solicitud(data: dict):
    user_id = data["id_usuario"]
    conn = get_db()
    cursor = conn.cursor()

    # 1) Insertar la nueva solicitud
    cursor.execute("""
        INSERT INTO Solicitudes (id_cliente, origen, destino, ruta, distancia, tiempo_estimado, fecha_hora, estado)
        VALUES (%s, %s, %s, %s, %s, %s, %s, 'en espera')
        RETURNING id_solicitud
    """, (
        user_id,
        data["origen"],
        data["destino"],
        data['ruta'],
        data["distancia"],
        data["tiempo_estimado"],
        data["fecha_hora"]
    ))
    id_sol = cursor.fetchone()["id_solicitud"]

    # 2) Obtener todos los transportistas activos
    cursor.execute("""
        SELECT id_usuario, ubicacion FROM Usuarios
        WHERE tipo_usuario = 'transportista' AND estado_cuenta = 'activo'
    """)
    transportistas = cursor.fetchall()

    # 3) Calcular distancias y preparar lote
    for t in transportistas:
        try:
            distancias = calcular_ruta_ors(data["origen"], data["destino"], t["ubicacion"])
            cursor.execute("""
                INSERT INTO DistanciasSolicitud (
                    id_solicitud, id_transportista,
                    distancia_origen, distancia_destino,
                    ruta_destino, ruta_origen
                ) VALUES (%s, %s, %s, %s, %s, %s)
            """, (
                id_sol,
                t["id_usuario"],
                distancias["distancia_trans_origen_km"],
                distancias["distancia_trans_destino_km"],
                json.dumps(distancias["ruta_origen"]),
                json.dumps(distancias["ruta_destino"])
            ))
        except Exception as e:
            continue

    return {"id_solicitud": id_sol}


def actualizar_solicitud_completa(id_solicitud, data):
    conn = get_db()
    cursor = conn.cursor()

    # 1) Actualizar solicitud
    cursor.execute("""
        UPDATE Solicitudes
        SET origen = %s, destino = %s, ruta = %s,
            distancia = %s, tiempo_estimado = %s, fecha_hora = %s
        WHERE id_solicitud = %s
    """, (
        data["origen"], data["destino"], data["ruta"],
        data["distancia"], data["tiempo_estimado"], data["fecha_hora"],
        id_solicitud
    ))

    # 2) Eliminar distancias previas
    cursor.execute("DELETE FROM DistanciasSolicitud WHERE id_solicitud = %s", (id_solicitud,))

    # 3) Obtener transportistas activos
    cursor.execute("""
        SELECT id_usuario, ubicacion FROM Usuarios
        WHERE tipo_usuario = 'transportista' AND estado_cuenta = 'activo'
    """)
    transportistas = cursor.fetchall()

    # 4) Calcular distancias y preparar lote
    for t in transportistas:
        try:
            distancias = calcular_ruta_ors(data["origen"], data["destino"], t["ubicacion"])
            cursor.execute("""
                INSERT INTO DistanciasSolicitud (
                    id_solicitud, id_transportista,
                    distancia_origen, distancia_destino,
                    ruta_origen, ruta_destino
                ) VALUES (%s, %s, %s, %s, %s, %s)
            """, (
                id_solicitud,
                t["id_usuario"],
                distancias["distancia_trans_origen_km"],
                distancias["distancia_trans_destino_km"],
                json.dumps(distancias["ruta_origen"]),
                json.dumps(distancias["ruta_destino"])
            ))
        except Exception as e:
            continue

    return {"id_solicitud": id_solicitud}


# estado nuevo -> (estado previo exigido en la solicitud, estado que pasa a tener la asignación)
_TRANSICIONES_TRANSPORTISTA = {
    "activa": ("confirmada", "activo"),
    "finalizada": ("activa", "completado"),
}


def change_estado_solicitud(id_solicitud: int, nuevo_estado: str, data: dict, id_actor: int):
    """
    La ruta ya validó qué estados puede fijar cada rol. Aquí se valida la transición:
      cliente:        en espera -> confirmada (paga)  |  * -> cancelada
      transportista:  confirmada -> activa -> finalizada (solo el transportista que aceptó)
    """
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT id_cliente, estado, fecha_hora FROM Solicitudes WHERE id_solicitud = %s", (id_solicitud,))
    solicitud = cursor.fetchone()
    if not solicitud:
        return {"error": "Solicitud no encontrada", "status": 404}

    # La asignación vigente es la que el transportista aceptó, no una cualquiera del historial.
    cursor.execute("""
        SELECT id_asignacion, id_transportista, precio, estado
        FROM Asignaciones
        WHERE id_solicitud = %s AND estado IN ('confirmada', 'activo', 'completado')
        ORDER BY fecha_confirmacion DESC NULLS LAST
        LIMIT 1
    """, (id_solicitud,))
    asignacion = cursor.fetchone()

    id_cliente = solicitud['id_cliente']
    id_transportista = asignacion['id_transportista'] if asignacion else None

    if nuevo_estado == 'cancelada':
        if solicitud['estado'] in ('activa', 'finalizada', 'cancelada'):
            return {"error": "La solicitud ya no se puede cancelar.", "status": 409}
        ahora = datetime.now()
        fecha_limite = solicitud['fecha_hora'] - timedelta(hours=2)
        if ahora > fecha_limite:
            return {"error": "No se puede cancelar la solicitud con menos de 2 horas de anticipación."}

    elif nuevo_estado == 'confirmada':
        if solicitud['estado'] != 'en espera':
            return {"error": "La solicitud ya fue confirmada o cerrada.", "status": 409}
        if not asignacion or asignacion['estado'] != 'confirmada':
            return {"error": "Aún no hay un transportista que haya aceptado esta solicitud."}
        # El método de pago debe ser del cliente; el monto es el de la asignación, no el que envíe el navegador.
        cursor.execute(
            "SELECT id, tipo_metodo FROM Metodos_Pago_Usuario WHERE id = %s AND usuario_id = %s",
            (data.get('metodo_pago'), id_actor),
        )
        metodo = cursor.fetchone()
        if not metodo:
            return {"error": "Debes pagar con un método de pago registrado en tu cuenta."}
        try:
            update_pago_by_asignacion(
                id_asignacion=asignacion['id_asignacion'],
                monto_total=asignacion['precio'],
                pagador_id=metodo['id'],
                tipo_metodo_pagador=metodo['tipo_metodo']
            )
        except ValueError as e:
            return {"error": str(e)}

    elif nuevo_estado in _TRANSICIONES_TRANSPORTISTA:
        previo, estado_asignacion = _TRANSICIONES_TRANSPORTISTA[nuevo_estado]
        if not asignacion or asignacion['id_transportista'] != id_actor:
            return {"error": "Solo el transportista asignado puede actualizar este traslado.", "status": 403}
        if solicitud['estado'] != previo:
            return {"error": f"La solicitud debe estar '{previo}' para pasar a '{nuevo_estado}'.", "status": 409}
        cursor.execute("UPDATE Asignaciones SET estado = %s WHERE id_asignacion = %s",
                       (estado_asignacion, asignacion['id_asignacion']))
    else:
        return {"error": "Estado no válido"}

    cursor.execute("UPDATE Solicitudes SET estado = %s WHERE id_solicitud = %s", (nuevo_estado, id_solicitud))

    # Notificar a la contraparte
    if nuevo_estado == 'cancelada' and id_transportista:
        crear_notificacion(
            id_usuario=id_transportista,
            tipo_evento="solicitud_cancelada",
            tabla="Solicitudes",
            id_referencia=id_solicitud,
            mensaje="El cliente ha cancelado la solicitud antes del servicio."
        )
    elif nuevo_estado == 'confirmada':
        crear_notificacion(
            id_usuario=id_transportista,
            tipo_evento="solicitud_confirmada",
            tabla="Solicitudes",
            id_referencia=id_solicitud,
            mensaje="El cliente confirmó y pagó el servicio. Ya puedes iniciar el traslado en la fecha pactada."
        )
    elif nuevo_estado in ('activa', 'finalizada'):
        crear_notificacion(
            id_usuario=id_cliente,
            tipo_evento=f"solicitud_{nuevo_estado}",
            tabla="Solicitudes",
            id_referencia=id_solicitud,
            mensaje="Tu transportista inició el traslado." if nuevo_estado == 'activa'
                    else "Tu mudanza fue entregada y el servicio quedó finalizado."
        )

    return {"mensaje": f"Estado de la solicitud actualizado a '{nuevo_estado}'"}


def list_solicitudes_disponibles(filters: dict):
    """
    Listar solicitudes cercanas y pendientes de asignación.
    """
    conn = get_db()
    cursor = conn.cursor()
    sql = "SELECT * FROM Solicitudes WHERE estado='en espera'"
    cursor.execute(sql)
    return cursor.fetchall()


def update_solicitud(id_solicitud: int, data: dict, id_actor: int):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM Solicitudes WHERE id_solicitud = %s", (id_solicitud,))
    solicitud = cursor.fetchone()
    if not solicitud:
        return {"error": "Solicitud no encontrada"}

    if data.get("cancelar"):
        return change_estado_solicitud(id_solicitud, "cancelada", {}, id_actor)

    if "fecha_hora" in data and data["fecha_hora"]:
        cursor.execute("UPDATE Solicitudes SET fecha_hora = %s WHERE id_solicitud = %s", (data["fecha_hora"], id_solicitud))
        conn.commit()

    return get_solicitud_by_id(id_solicitud)