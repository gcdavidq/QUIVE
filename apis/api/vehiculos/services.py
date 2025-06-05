from db import get_db
import pymysql


def list_my_vehiculos(user_id):
    conn = get_db()
    cursor = conn.cursor()
    sql = """
        SELECT v.id_vehiculo, v.id_tipo_vehiculo, t.nombre AS tipo_vehiculo, v.placa, v.estado
        FROM Vehiculos v
        JOIN Tipos_Vehiculo t ON v.id_tipo_vehiculo = t.id_tipo_vehiculo
        WHERE v.id_usuario=%s
    """
    cursor.execute(sql, (user_id,))
    return cursor.fetchall()


def create_my_vehiculo(data: dict):
    conn = get_db()
    cursor = conn.cursor()

    sql = """
        INSERT INTO Vehiculos (id_usuario, id_tipo_vehiculo, placa)
        VALUES (%s, %s, %s)
    """
    cursor.execute(sql, (
        data["id_usuario"],
        data["id_tipo_vehiculo"],
        data["placa"]
    ))
    new_id = cursor.lastrowid
    return get_vehiculo_by_id(new_id)


def get_vehiculo_by_id(id_vehiculo: int):
    conn = get_db()
    cursor = conn.cursor()
    sql = """
        SELECT v.id_vehiculo, v.id_usuario, v.id_tipo_vehiculo, t.nombre AS tipo_nombre, v.placa, v.estado
        FROM Vehiculos v
        JOIN Tipos_Vehiculo t ON v.id_tipo_vehiculo = t.id_tipo_vehiculo
        WHERE v.id_vehiculo=%s
    """
    cursor.execute(sql, (id_vehiculo,))
    return cursor.fetchone()


def update_my_vehiculo(id_vehiculo: int, data: dict):
    conn = get_db()
    cursor = conn.cursor()
    # Verificar que el vehiculo pertenezca al usuario
    cursor.execute(
        "SELECT id_usuario FROM Vehiculos WHERE id_vehiculo=%s", (id_vehiculo,))
    row = cursor.fetchone()
    if not row or row["id_usuario"] != data["id_usuario"]:
        return {"error": "Vehículo no encontrado o no pertenece al transportista"}

    campos = []
    valores = []
    for campo in ["id_tipo_vehiculo", "placa", "estado"]:
        if campo in data:
            campos.append(f"{campo}=%s")
            valores.append(data[campo])
    if not campos:
        return {"error": "Nada para actualizar"}
    valores.append(id_vehiculo)
    sql = f"UPDATE Vehiculos SET {', '.join(campos)} WHERE id_vehiculo=%s"
    cursor.execute(sql, tuple(valores))
    return get_vehiculo_by_id(id_vehiculo)


def delete_my_vehiculo(id_vehiculo: int, user_id: int):
    conn = get_db()
    cursor = conn.cursor()
    # Verificar que el vehiculo pertenezca al usuario
    cursor.execute("SELECT id_usuario FROM Vehiculos WHERE id_vehiculo=%s", (id_vehiculo,))
    row = cursor.fetchone()
    if not row or row["id_usuario"] != user_id:
        return {"error": "Vehículo no encontrado o no pertenece al transportista"}

    cursor.execute("DELETE FROM Vehiculos WHERE id_vehiculo=%s", (id_vehiculo,))
    return {"msg": "Vehículo eliminado"}


def list_tipos_vehiculo():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT id_tipo_vehiculo, nombre FROM Tipos_Vehiculo")
    return cursor.fetchall()

def datos_tipos_vehiculo(id_tipo_vehiculo: int):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT capacidad_volumen, capacidad_peso, descripcion, largo, ancho, alto FROM Tipos_Vehiculo WHERE id_tipo_vehiculo = %s", (id_tipo_vehiculo,))
    return cursor.fetchall()


#Opciones solo para el admin
#--------------------------------------------------
def create_tipo_vehiculo(data: dict):
    conn = get_db()
    cursor = conn.cursor()
    sql = """
        INSERT INTO Tipos_Vehiculo (nombre, capacidad_volumen, capacidad_peso, descripcion, largo, ancho, alto)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
    """
    cursor.execute(sql, (
        data["nombre"],
        data["capacidad_volumen"],
        data["capacidad_peso"],
        data.get("descripcion"),
        data.get("largo"),
        data.get("ancho"),
        data.get("alto"),
    ))
    new_id = cursor.lastrowid
    cursor.execute("SELECT * FROM Tipos_Vehiculo WHERE id_tipo_vehiculo=%s", (new_id,))
    return cursor.fetchone()


def update_tipo_vehiculo(id_tipo: int, data: dict):
    conn = get_db()
    cursor = conn.cursor()
    campos = []
    valores = []
    for campo in ["nombre", "capacidad_volumen", "capacidad_peso", "descripcion", "largo", "ancho", "alto"]:
        if campo in data:
            campos.append(f"{campo}=%s")
            valores.append(data[campo])
    if not campos:
        return {"error": "Nada para actualizar"}
    valores.append(id_tipo)
    sql = f"UPDATE Tipos_Vehiculo SET {', '.join(campos)} WHERE id_tipo_vehiculo=%s"
    cursor.execute(sql, tuple(valores))
    cursor.execute("SELECT * FROM Tipos_Vehiculo WHERE id_tipo_vehiculo=%s", (id_tipo,))
    return cursor.fetchone()


def delete_tipo_vehiculo(id_tipo: int):
    conn = get_db()
    cursor = conn.cursor()
    # Verificar que no haya vehículos asociados
    cursor.execute("SELECT id_vehiculo FROM Vehiculos WHERE id_tipo_vehiculo=%s", (id_tipo,))
    if cursor.fetchone():
        return {"error": "No se puede eliminar: hay vehículos asociados"}
    cursor.execute("DELETE FROM Tipos_Vehiculo WHERE id_tipo_vehiculo=%s", (id_tipo,))
    return {"msg": "Tipo de vehículo eliminado"}
