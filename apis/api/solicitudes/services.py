from utils.calcular_distancia import calcular_ruta_ors
import json
from datetime import datetime, timedelta
from db import get_db
from api.notificaciones.services import crear_notificacion  # Asegúrate de tener esta función disponible
from api.pagos.services import update_pago_by_asignacion

def get_solicitud_by_user_id(user_id: int):
    """
    Versión corregida para PyMySQL que convierte campos timedelta a strings.
    """
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("CALL ObtenerSolicitudesConDetalle(%s, 'en espera', Null)", (user_id,))
    fila = cursor.fetchone()

    if fila:
        # Convertir objetos timedelta a string legible (ej: "0:39:00")
        for key, value in fila.items():
            if isinstance(value, timedelta):
                fila[key] = str(value)

        # Si hay campo 'objetos' en formato JSON string
        if "objetos" in fila and isinstance(fila["objetos"], str):
            try:
                fila["objetos"] = json.loads(fila["objetos"])
            except json.JSONDecodeError:
                pass

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
    sql_insert = """
        INSERT INTO Solicitudes (id_cliente, origen, destino, ruta, distancia, tiempo_estimado, fecha_hora, estado)
        VALUES (%s, %s, %s, %s, %s, %s, %s, 'en espera')
    """
    cursor.execute(sql_insert, (
        user_id,
        data["origen"],
        data["destino"],
        data['ruta'],
        data["distancia"],
        data["tiempo_estimado"],
        data["fecha_hora"]
    ))
    id_sol = cursor.lastrowid

    # 2) Obtener todos los transportistas activos
    cursor.execute("""
        SELECT id_usuario, Ubicacion FROM Usuarios
        WHERE tipo_usuario = 'transportista' AND estado_cuenta = 'activo'
    """)
    transportistas = cursor.fetchall()

    # 3) Calcular distancias y preparar lote
    valores = []
    for t in transportistas:
        try:
            distancias = calcular_ruta_ors(data["origen"], data["destino"], t["Ubicacion"])
            valores.append((
                id_sol,
                t["id_usuario"],
                distancias["distancia_trans_origen_km"],
                distancias["distancia_trans_destino_km"],
                json.dumps(distancias["ruta_origen"]),
                json.dumps(distancias["ruta_destino"])
            ))
        except Exception as e:
            print(f"Error en transportista {t['id_usuario']}: {e}")
            continue

    # 4) Ejecutar inserción múltiple
    if valores:
        sql_distancia = """
            INSERT INTO DistanciasSolicitud (
                id_solicitud,
                id_transportista,
                distancia_origen, 
                distancia_destino,
                ruta_destino,
                ruta_origen
            ) VALUES (%s, %s, %s, %s, %s, %s)
        """
        cursor.executemany(sql_distancia, valores)

    conn.commit()

    return {
        "id_solicitud": id_sol
    }


def actualizar_solicitud_completa(id_solicitud, data):
    conn = get_db()
    cursor = conn.cursor()

    # 1) Actualizar solicitud
    sql_update = """
        UPDATE Solicitudes
        SET origen = %s,
            destino = %s,
            ruta = %s,
            distancia = %s,
            tiempo_estimado = %s,
            fecha_hora = %s
        WHERE id_solicitud = %s
    """
    cursor.execute(sql_update, (
        data["origen"],
        data["destino"],
        data["ruta"],
        data["distancia"],
        data["tiempo_estimado"],
        data["fecha_hora"],
        id_solicitud
    ))

    # 2) Eliminar distancias previas de esta solicitud
    cursor.execute("DELETE FROM DistanciasSolicitud WHERE id_solicitud = %s", (id_solicitud,))

    # 3) Obtener transportistas activos
    cursor.execute("""
        SELECT id_usuario, Ubicacion FROM Usuarios
        WHERE tipo_usuario = 'transportista' AND estado_cuenta = 'activo'
    """)
    transportistas = cursor.fetchall()

    # 4) Calcular distancias y preparar lote
    valores = []
    for t in transportistas:
        try:
            distancias = calcular_ruta_ors(data["origen"], data["destino"], t["Ubicacion"])
            valores.append((
                id_solicitud,
                t["id_usuario"],
                distancias["distancia_trans_origen_km"],
                distancias["distancia_trans_destino_km"],
                json.dumps(distancias["ruta_origen"]),
                json.dumps(distancias["ruta_destino"])
            ))
        except Exception as e:
            print(f"Error en transportista {t['id_usuario']}: {e}")
            continue

    # 5) Ejecutar inserción múltiple
    if valores:
        sql_distancia = """
            INSERT INTO DistanciasSolicitud (
                id_solicitud,
                id_transportista,
                distancia_origen, 
                distancia_destino,
                ruta_origen,
                ruta_destino
            ) VALUES (%s, %s, %s, %s, %s, %s)
        """
        cursor.executemany(sql_distancia, valores)

    conn.commit()

    return {
        "id_solicitud": id_solicitud
    }

def change_estado_solicitud(id_solicitud: int, nuevo_estado: str, data: dict):
    conn = get_db()
    cursor = conn.cursor()

    # 1. Obtener cliente, transportista (si lo hay) y fecha de la solicitud
    cursor.execute("""
        SELECT s.id_cliente, a.id_transportista, s.fecha_hora
        FROM Solicitudes s
        LEFT JOIN Asignaciones a ON s.id_solicitud = a.id_solicitud
        WHERE s.id_solicitud = %s
    """, (id_solicitud,))
    resultado = cursor.fetchone()

    if not resultado:
        return {"error": "Solicitud no encontrada"}, 404

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

    # 3. Actualizar estado en la tabla Solicitudes
    cursor.execute("""
        UPDATE Solicitudes 
        SET estado = %s 
        WHERE id_solicitud = %s
    """, (nuevo_estado, id_solicitud))

    if nuevo_estado == 'confirmada':
        pago = update_pago_by_asignacion(
            id_asignacion=data['id_asignacion'],
        monto_total=data['monto'],
        pagador_id=data['metodo_pago'],
        tipo_metodo_pagador=data['tipo_metodo'])
    # 4. Enviar notificaciones según el nuevo estado
    if nuevo_estado == 'cancelada' and id_transportista:
        mensaje = "El cliente ha cancelado la solicitud antes del servicio."
        crear_notificacion(
            id_usuario=id_transportista,
            tipo_evento="solicitud_cancelada",
            tabla="Solicitudes",
            id_referencia=id_solicitud,
            mensaje=mensaje
        )

    elif nuevo_estado in ['confirmada', 'activa', 'finalizada']:
        mensaje = f"Tu solicitud ha sido marcada como '{nuevo_estado}'."
        crear_notificacion(
            id_usuario=id_cliente,
            tipo_evento=f"solicitud_{nuevo_estado}",
            tabla="Solicitudes",
            id_referencia=id_solicitud,
            mensaje=mensaje
        )

    conn.commit()
    return {"mensaje": f"Estado de la solicitud actualizado a '{nuevo_estado}'"}

def list_solicitudes_disponibles(filters: dict):
    """
    Listar solicitudes cercanas y pendientes de asignación.
    En esteejemplo  devolvemos todas con estado 'en espera'.
    En producción: aplicar proximidad, tipo de vehículo, reputación, etc.
    """
    conn = get_db()
    cursor = conn.cursor()
    sql = "SELECT * FROM Solicitudes WHERE estado='en espera'"
    cursor.execute(sql)
    return cursor.fetchall()