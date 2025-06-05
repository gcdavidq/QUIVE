from db import get_db
import pymysql

# --- Tipos de Objeto: CRUD para catálogo ---
def list_tipos_objeto():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM Tipos_Objeto")
    return cursor.fetchall()

def create_tipo_objeto(data: dict):
    conn = get_db()
    cursor = conn.cursor()
    sql = """
        INSERT INTO Tipos_Objeto (categoria, variante, descripcion, volumen_estimado, peso_estimado, es_fragil, necesita_embalaje, imagen_url)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
    """
    cursor.execute(sql, (
        data["categoria"], data.get("variante"), data.get("descripcion"),
        data["volumen_estimado"], data["peso_estimado"], data["es_fragil"],
        data["necesita_embalaje"], data.get("imagen_url")
    ))
    new_id = cursor.lastrowid
    cursor.execute("SELECT * FROM Tipos_Objeto WHERE id_tipo=%s", (new_id,))
    return cursor.fetchone()

def update_tipo_objeto(id_tipo: int, data: dict):
    conn = get_db()
    cursor = conn.cursor()
    campos = []
    valores = []
    for campo in ["categoría", "variante", "descripcion", "volumen_estimado", "peso_estimado", "es_fragil", "necesita_embalaje", "imagen_url"]:
        if campo in data:
            campos.append(f"{campo}=%s")
            valores.append(data[campo])
    if not campos:
        return {"error": "Nada para actualizar"}
    valores.append(id_tipo)
    sql = f"UPDATE Tipos_Objeto SET {', '.join(campos)} WHERE id_tipo=%s"
    cursor.execute(sql, tuple(valores))
    cursor.execute("SELECT * FROM Tipos_Objeto WHERE id_tipo=%s", (id_tipo,))
    return cursor.fetchone()

def delete_tipo_objeto(id_tipo: int):
    conn = get_db()
    cursor = conn.cursor()
    # Verificar si hay referencias en Objetos_Solicitud
    cursor.execute("SELECT id_objeto FROM Objetos_Solicitud WHERE id_tipo=%s", (id_tipo,))
    if cursor.fetchone():
        return {"error": "No se puede eliminar: hay objetos de solicitud referenciando este tipo"}
    cursor.execute("DELETE FROM Tipos_Objeto WHERE id_tipo=%s", (id_tipo,))
    return {"msg": "Tipo de objeto eliminado"}

# --- Objetos dentro de una Solicitud ---
def list_objetos_de_solicitud(id_solicitud: int):
    conn = get_db()
    cursor = conn.cursor()
    # Validar si la solicitud existe y pertenece al usuario o transportista (omitir aquí)
    sql = """
        SELECT o.id_objeto, o.id_tipo, t.categoria, t.variante, o.cantidad, o.observaciones, o.imagen_url
        FROM Objetos_Solicitud o
        JOIN Tipos_Objeto t ON o.id_tipo = t.id_tipo
        WHERE id_solicitud=%s
    """
    cursor.execute(sql, (id_solicitud,))
    return cursor.fetchall()

def add_objeto_a_solicitud(id_solicitud: int, data: dict):
    conn = get_db()
    cursor = conn.cursor()

    # (Opcional) Verificar que la solicitud esté en estado "en espera" y que el cliente sea el dueño
    sql = """
        INSERT INTO Objetos_Solicitud (id_solicitud, id_tipo, cantidad, observaciones, imagen_url)
        VALUES (%s, %s, %s, %s, %s)
    """
    cursor.execute(sql, (
        id_solicitud, data["id_tipo"], data["cantidad"], data.get("observaciones"), data.get("imagen_url")
    ))
    new_id = cursor.lastrowid
    return get_objeto_by_id(new_id)

def get_objeto_by_id(id_objeto: int):
    conn = get_db()
    cursor = conn.cursor()
    sql = """
        SELECT o.id_objeto, o.id_solicitud, o.id_tipo, t.categoria, t.variante, o.cantidad, o.observaciones, o.imagen_url
        FROM Objetos_Solicitud o
        JOIN Tipos_Objeto t ON o.id_tipo = t.id_tipo
        WHERE o.id_objeto=%s
    """
    cursor.execute(sql, (id_objeto,))
    return cursor.fetchone()

def update_objeto_de_solicitud(id_solicitud: int, id_objeto: int, data: dict):
    conn = get_db()
    cursor = conn.cursor()
    # (Opcional) Revisar que la solicitud esté en estado “en espera”
    campos = []
    valores = []
    for campo in ["cantidad", "observaciones", "imagen_url"]:
        if campo in data:
            campos.append(f"{campo}=%s")
            valores.append(data[campo])
    if not campos:
        return {"error": "Nada para actualizar"}
    valores.extend([id_solicitud, id_objeto])
    sql = f"UPDATE Objetos_Solicitud SET {', '.join(campos)} WHERE id_solicitud=%s AND id_objeto=%s"
    cursor.execute(sql, tuple(valores))
    return get_objeto_by_id(id_objeto)

def delete_objeto_de_solicitud(id_solicitud: int, id_objeto: int):
    conn = get_db()
    cursor = conn.cursor()
    # (Opcional) Revisar que la solicitud esté en estado “en espera”
    sql = "DELETE FROM Objetos_Solicitud WHERE id_solicitud=%s AND id_objeto=%s"
    cursor.execute(sql, (id_solicitud, id_objeto))
    return {"msg": "Objeto eliminado de la solicitud"}
