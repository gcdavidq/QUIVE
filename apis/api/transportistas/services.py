from db import get_db
from flask import session
import pymysql

def get_my_documentos(user_id: int):
    """
    Obtiene URLs de documentos subidos por el transportista actual.
    """
    conn = get_db()
    cursor = conn.cursor()
    sql = """
        SELECT id_documento, licencia_conducir_url, tarjeta_propiedad_url, certificado_itv_url, estado_verificacion
        FROM Documentos_Transportista WHERE id_usuario=%s
    """
    cursor.execute(sql, (user_id,))
    return cursor.fetchone()

def upload_or_update_my_documentos(data: dict):
    """
    Inserta o actualiza Documentos_Transportista para el transportista actual.
    """
    user_id = data.get('id_usuario')
    conn = get_db()
    cursor = conn.cursor()

    # Verificar si ya existe registro
    cursor.execute("SELECT id_documento FROM Documentos_Transportista WHERE id_usuario=%s", (user_id,))
    existe = cursor.fetchone()
    if existe:
        # UPDATE
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
        # INSERT
        sql = """
            INSERT INTO Documentos_Transportista (id_usuario, licencia_conducir_url, tarjeta_propiedad_url, certificado_itv_url)
            VALUES (%s, %s, %s, %s)
        """
        cursor.execute(sql, (
            user_id,
            data.get("licencia_conducir_url"),
            data.get("tarjeta_propiedad_url"),
            data.get("certificado_itv_url")
        ))

    return get_my_documentos(user_id)

def get_documentos_by_id(id_usuario: int):
    """
    Admin o propio transportista pueden ver metadata de documentos.
    """
    conn = get_db()
    cursor = conn.cursor()
    sql = """
        SELECT id_documento, id_usuario, licencia_conducir_url, tarjeta_propiedad_url, certificado_itv_url, estado_verificacion
        FROM Documentos_Transportista WHERE id_usuario=%s
    """
    cursor.execute(sql, (id_usuario,))
    return cursor.fetchone()

def list_transportistas_verified(filters: dict):
    """
    Listado público de transportistas verificados, con filtros por proximidad,
    tipo de vehículo y reputación mínima.
    - Para proximidad, necesitarías lat/lng y calcular distancias (usando utils/geo.py).
    - Para reputación, debes agregar un JOIN con Calificaciones y promedio.
    Este ejemplo devuelve todos los verificados sin filtrar.
    """
    conn = get_db()
    cursor = conn.cursor()
    # Ejemplo básico: listar transportistas con estado_verificacion='verificado'
    sql = """
        SELECT u.id_usuario, u.nombre_completo, u.telefono, u.Ubicacion, dt.licencia_conducir_url, dt.tarjeta_propiedad_url, dt.certificado_itv_url
        FROM Usuarios u
        JOIN Documentos_Transportista dt ON u.id_usuario = dt.id_usuario
        WHERE u.tipo_usuario='transportista' AND dt.estado_verificacion='verificado'
    """
    cursor.execute(sql)
    return cursor.fetchall()

#-------tarifas de transportista-----------
def create_tarifa(data: dict):
    conn = get_db()
    cursor = conn.cursor()

    id_transportista = data["id_transportista"]

    # Verificar si ya existe una tarifa
    cursor.execute("SELECT id_tarifa FROM Tarifas_Transportista WHERE id_transportista=%s", (id_transportista,))
    existe = cursor.fetchone()
    if existe:
        raise Exception("La tarifa ya existe para este transportista. Usa PUT para actualizarla.")

    # Insertar nueva tarifa
    sql = """
        INSERT INTO Tarifas_Transportista (
            id_transportista, precio_por_m3, precio_por_kg, precio_por_km,
            recargo_fragil, recargo_embalaje
        ) VALUES (%s, %s, %s, %s, %s, %s)
    """
    cursor.execute(sql, (
        id_transportista,
        data["precio_por_m3"],
        data["precio_por_kg"],
        data["precio_por_km"],
        data.get("recargo_fragil", 0.0),
        data.get("recargo_embalaje", 0.0),
    ))

    conn.commit()
    return get_tarifa_by_transportista(id_transportista)

def update_tarifa(data: dict):
    conn = get_db()
    cursor = conn.cursor()

    id_transportista = data["id_transportista"]

    # Verificar si existe una tarifa
    cursor.execute("SELECT id_tarifa FROM Tarifas_Transportista WHERE id_transportista=%s", (id_transportista,))
    existe = cursor.fetchone()
    if not existe:
        raise Exception("No existe una tarifa para este transportista. Usa POST para crearla.")

    # Actualizar la tarifa existente
    sql = """
        UPDATE Tarifas_Transportista
        SET precio_por_m3=%s, precio_por_kg=%s, precio_por_km=%s,
            recargo_fragil=%s, recargo_embalaje=%s
        WHERE id_transportista=%s
    """
    cursor.execute(sql, (
        data["precio_por_m3"],
        data["precio_por_kg"],
        data["precio_por_km"],
        data.get("recargo_fragil", 0.0),
        data.get("recargo_embalaje", 0.0),
        id_transportista
    ))

    conn.commit()
    return get_tarifa_by_transportista(id_transportista)

def get_tarifa_by_transportista(id_transportista: int):
    conn = get_db()
    cursor = conn.cursor()
    sql = """
        SELECT * FROM Tarifas_Transportista WHERE id_transportista=%s
    """
    cursor.execute(sql, (id_transportista,))
    return cursor.fetchone()
