import psycopg2
from db import get_db


def get_my_documentos(user_id: int):
    """Obtiene URLs de documentos subidos por el transportista actual."""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT id_documento, licencia_conducir_url, tarjeta_propiedad_url, certificado_itv_url, estado_verificacion
        FROM Documentos_Transportista WHERE id_usuario=%s
    """, (user_id,))
    return cursor.fetchone()


def upload_or_update_my_documentos(data: dict):
    """Inserta o actualiza Documentos_Transportista para el transportista actual."""
    user_id = data.get('id_usuario')
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT id_documento FROM Documentos_Transportista WHERE id_usuario=%s", (user_id,))
    existe = cursor.fetchone()
    if existe:
        campos = []
        valores = []
        for campo in ["licencia_conducir_url", "tarjeta_propiedad_url", "certificado_itv_url"]:
            if campo in data:
                campos.append(f"{campo}=%s")
                valores.append(data[campo])
        valores.append(user_id)
        sql = f"UPDATE Documentos_Transportista SET {', '.join(campos)} WHERE id_usuario=%s"
        cursor.execute(sql, tuple(valores))
    else:
        cursor.execute("""
            INSERT INTO Documentos_Transportista (id_usuario, licencia_conducir_url, tarjeta_propiedad_url, certificado_itv_url)
            VALUES (%s, %s, %s, %s)
        """, (
            user_id,
            data.get("licencia_conducir_url"),
            data.get("tarjeta_propiedad_url"),
            data.get("certificado_itv_url")
        ))

    return get_my_documentos(user_id)


def get_documentos_by_id(id_usuario: int):
    """Admin o propio transportista pueden ver metadata de documentos."""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT id_documento, id_usuario, licencia_conducir_url, tarjeta_propiedad_url, certificado_itv_url, estado_verificacion
        FROM Documentos_Transportista WHERE id_usuario=%s
    """, (id_usuario,))
    return cursor.fetchone()


def perfil_publico_transportista(id_transportista: int) -> dict:
    """
    Datos reales que un cliente puede ver de un transportista: vehículo activo,
    reputación (None si nadie lo ha calificado), viajes completados y verificación documental.
    """
    cursor = get_db().cursor()
    cursor.execute("""
        SELECT t.nombre AS tipo_vehiculo, v.placa, t.capacidad_volumen, t.capacidad_peso
        FROM Vehiculos v
        JOIN Tipos_Vehiculo t ON v.id_tipo_vehiculo = t.id_tipo_vehiculo
        WHERE v.id_usuario = %s AND v.estado = 'activo'
        ORDER BY v.id_vehiculo
        LIMIT 1
    """, (id_transportista,))
    vehiculo = cursor.fetchone()

    cursor.execute("""
        SELECT AVG(puntaje)::NUMERIC(3,2) AS promedio, COUNT(*) AS cantidad
        FROM Calificaciones WHERE calificado = %s
    """, (id_transportista,))
    calif = cursor.fetchone()

    cursor.execute("""
        SELECT COUNT(*) AS viajes FROM Asignaciones
        WHERE id_transportista = %s AND estado = 'completado'
    """, (id_transportista,))
    viajes = cursor.fetchone()["viajes"]

    cursor.execute("SELECT estado_verificacion FROM Documentos_Transportista WHERE id_usuario = %s", (id_transportista,))
    doc = cursor.fetchone()

    return {
        "vehiculo": vehiculo,
        "transportista_calificacion": float(calif["promedio"]) if calif["promedio"] is not None else None,
        "transportista_calificaciones": calif["cantidad"],
        "transportista_viajes": viajes,
        "documentos_verificados": bool(doc) and doc["estado_verificacion"] == "verificado",
    }


def _mapa_es_demo(ids):
    """{id_usuario: es_demo}. None si la migración 001 (columna es_demo) aún no se aplicó."""
    cursor = get_db().cursor()
    try:
        cursor.execute("SELECT id_usuario, es_demo FROM Usuarios WHERE id_usuario = ANY(%s)", (list(ids),))
    except psycopg2.errors.UndefinedColumn:
        return None
    return {f["id_usuario"]: f["es_demo"] for f in cursor.fetchall()}


def _precio_desde_tarifa(tarifa, distancia_metros):
    """Única fórmula de cotización del sistema: tarifa por km del transportista x distancia de la mudanza."""
    if not tarifa or tarifa.get("precio_por_km") is None or distancia_metros is None:
        return None
    return round(float(tarifa["precio_por_km"]) * float(distancia_metros) / 1000.0, 2)


def cotizar_transportista(id_solicitud: int, id_transportista: int):
    """Precio cotizado para un transportista candidato de la solicitud; None si no es candidato o no tiene tarifa."""
    cursor = get_db().cursor()
    cursor.execute("""
        SELECT s.distancia, tt.precio_por_km
        FROM Solicitudes s
        JOIN DistanciasSolicitud ds ON ds.id_solicitud = s.id_solicitud AND ds.id_transportista = %s
        JOIN Tarifas_Transportista tt ON tt.id_transportista = ds.id_transportista
        WHERE s.id_solicitud = %s
        LIMIT 1
    """, (id_transportista, id_solicitud))
    fila = cursor.fetchone()
    if not fila:
        return None
    return _precio_desde_tarifa(fila, fila["distancia"])


def list_transportistas_verified(id_solicitud):
    """
    Candidatos para una solicitud, solo con datos reales:
    - sin tarifa registrada no hay cotización, así que el transportista no se ofrece;
    - sin calificaciones el promedio es None (la UI muestra "sin calificaciones"), no un valor por defecto.
    """
    def calcular_puntaje(t, pesos):
        # Sin historial se usa un valor neutro solo para ordenar; nunca se muestra.
        calif_score = float(t["promedio_calificaciones"]) / 5.0 if t["promedio_calificaciones"] is not None else 0.5
        incidentes_score = 1 / (1 + float(t["cantidad_incidentes"]))
        precio_score = 1 / (1 + float(t["precio_estimado_total"]))

        return (
            pesos["calificacion"] * calif_score +
            pesos["incidentes"] * incidentes_score +
            pesos["precio"] * precio_score
        )

    pesos = {
        "calificacion": 0.5,
        "incidentes": 0.2,
        "precio": 0.3
    }
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM ObtenerTransportistasRecomendados(%s)", (id_solicitud,))
    resultados = cursor.fetchall()
    if not resultados:
        return []

    ids = list({t["id_transportista"] for t in resultados})

    cursor.execute("SELECT distancia, id_cliente FROM Solicitudes WHERE id_solicitud = %s", (id_solicitud,))
    solicitud = cursor.fetchone()
    distancia = solicitud["distancia"] if solicitud else None

    # Las cuentas demo solo operan entre sí: un cliente real nunca recibe un transportista demo.
    es_demo = _mapa_es_demo(ids + [solicitud["id_cliente"]]) if solicitud else None
    if es_demo is not None:
        cliente_demo = es_demo.get(solicitud["id_cliente"], False)
        resultados = [t for t in resultados if es_demo.get(t["id_transportista"], False) == cliente_demo]

    cursor.execute("SELECT id_transportista, precio_por_km FROM Tarifas_Transportista WHERE id_transportista = ANY(%s)", (ids,))
    tarifas = {f["id_transportista"]: f for f in cursor.fetchall()}

    cursor.execute("""
        SELECT calificado, AVG(puntaje)::NUMERIC(3,2) AS promedio, COUNT(*) AS cantidad
        FROM Calificaciones WHERE calificado = ANY(%s) GROUP BY calificado
    """, (ids,))
    calificaciones = {f["calificado"]: f for f in cursor.fetchall()}

    cursor.execute("SELECT id_usuario, estado_verificacion FROM Documentos_Transportista WHERE id_usuario = ANY(%s)", (ids,))
    documentos = {f["id_usuario"]: f["estado_verificacion"] for f in cursor.fetchall()}

    candidatos, vistos = [], set()
    for t in resultados:
        id_t = t["id_transportista"]
        if id_t in vistos:  # un transportista con 2 vehículos activos salía duplicado
            continue
        precio = _precio_desde_tarifa(tarifas.get(id_t), distancia)
        if precio is None:
            continue
        vistos.add(id_t)
        calif = calificaciones.get(id_t)
        t["precio_estimado_total"] = precio
        t["promedio_calificaciones"] = float(calif["promedio"]) if calif else None
        t["cantidad_calificaciones"] = calif["cantidad"] if calif else 0
        t["documentos_verificados"] = documentos.get(id_t) == "verificado"
        t["puntaje"] = calcular_puntaje(t, pesos)
        candidatos.append(t)

    return sorted(candidatos, key=lambda x: x["puntaje"], reverse=True)


# ------- Tarifas de transportista -----------
def create_tarifa(data: dict):
    conn = get_db()
    cursor = conn.cursor()

    id_transportista = data["id_transportista"]

    cursor.execute("SELECT id_tarifa FROM Tarifas_Transportista WHERE id_transportista=%s", (id_transportista,))
    existe = cursor.fetchone()
    if existe:
        return {"error": "La tarifa ya existe para este transportista. Usa PUT para actualizarla."}

    cursor.execute("""
        INSERT INTO Tarifas_Transportista (
            id_transportista, precio_por_m3, precio_por_kg, precio_por_km,
            recargo_fragil, recargo_embalaje
        ) VALUES (%s, %s, %s, %s, %s, %s)
    """, (
        id_transportista,
        data["precio_por_m3"],
        data["precio_por_kg"],
        data["precio_por_km"],
        data.get("recargo_fragil", 0.0),
        data.get("recargo_embalaje", 0.0),
    ))

    return get_tarifa_by_transportista(id_transportista)


def update_tarifa(data: dict):
    conn = get_db()
    cursor = conn.cursor()

    id_transportista = data["id_transportista"]

    cursor.execute("SELECT id_tarifa FROM Tarifas_Transportista WHERE id_transportista=%s", (id_transportista,))
    existe = cursor.fetchone()
    if not existe:
        return {"error": "No existe una tarifa para este transportista. Usa POST para crearla."}

    cursor.execute("""
        UPDATE Tarifas_Transportista
        SET precio_por_m3=%s, precio_por_kg=%s, precio_por_km=%s,
            recargo_fragil=%s, recargo_embalaje=%s
        WHERE id_transportista=%s
    """, (
        data["precio_por_m3"],
        data["precio_por_kg"],
        data["precio_por_km"],
        data.get("recargo_fragil", 0.0),
        data.get("recargo_embalaje", 0.0),
        id_transportista
    ))

    return get_tarifa_by_transportista(id_transportista)


def get_tarifa_by_transportista(id_transportista: int):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM Tarifas_Transportista WHERE id_transportista=%s", (id_transportista,))
    return cursor.fetchone()
