from db import get_db


# --- Tipos de Objeto: CRUD para catálogo ---
def list_tipos_objeto():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM Tipos_Objeto")
    return cursor.fetchall()


def create_tipo_objeto(data: dict):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO Tipos_Objeto (categoria, variante, descripcion, volumen_estimado, peso_estimado, es_fragil, necesita_embalaje, imagen_url)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        RETURNING id_tipo
    """, (
        data["categoria"], data.get("variante"), data.get("descripcion"),
        data["volumen_estimado"], data["peso_estimado"], data["es_fragil"],
        data["necesita_embalaje"], data.get("imagen_url")
    ))
    new_id = cursor.fetchone()["id_tipo"]
    cursor.execute("SELECT * FROM Tipos_Objeto WHERE id_tipo=%s", (new_id,))
    return cursor.fetchone()


# --- Objetos dentro de una Solicitud ---
def list_objetos_de_solicitud(id_solicitud: int):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT o.id_objeto, o.id_tipo, t.categoria, t.variante, o.cantidad, o.observaciones, o.imagen_url
        FROM Objetos_Solicitud o
        JOIN Tipos_Objeto t ON o.id_tipo = t.id_tipo
        WHERE o.id_solicitud=%s
    """, (id_solicitud,))
    return cursor.fetchall()


def add_objetos_a_solicitud(id_solicitud: int, objetos: list):
    conn = get_db()
    cursor = conn.cursor()
    count = 0
    for obj in objetos:
        cursor.execute("""
            INSERT INTO Objetos_Solicitud (id_solicitud, id_tipo, cantidad, observaciones, imagen_url)
            VALUES (%s, %s, %s, %s, %s)
        """, (
            id_solicitud,
            obj["id_tipo"],
            obj["cantidad"],
            obj.get("observaciones"),
            obj.get("imagen_url")
        ))
        count += 1
    return count


def get_objeto_by_id(id_objeto: int):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT o.id_objeto, o.id_solicitud, o.id_tipo, t.categoria, t.variante, o.cantidad, o.observaciones, o.imagen_url
        FROM Objetos_Solicitud o
        JOIN Tipos_Objeto t ON o.id_tipo = t.id_tipo
        WHERE o.id_objeto=%s
    """, (id_objeto,))
    return cursor.fetchone()


def delete_objetos_de_solicitud(id_solicitud: int):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM Objetos_Solicitud WHERE id_solicitud = %s", (id_solicitud,))
    return cursor.rowcount