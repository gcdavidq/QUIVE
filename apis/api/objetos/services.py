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

def add_objetos_a_solicitud(id_solicitud: int, objetos: list):
    conn = get_db()
    cursor = conn.cursor()

    sql = """
        INSERT INTO Objetos_Solicitud (id_solicitud, id_tipo, cantidad, observaciones, imagen_url)
        VALUES (%s, %s, %s, %s, %s)
    """

    valores = [
        (
            id_solicitud,
            obj["id_tipo"],
            obj["cantidad"],
            obj.get("observaciones"),
            obj.get("imagen_url")
        )
        for obj in objetos
    ]

    cursor.executemany(sql, valores)
    conn.commit()

    # (Opcional) retornar los objetos insertados si necesitas sus IDs
    return cursor.rowcount  # o una lista si haces un SELECT posterior

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
