from db import get_db
from flask import session
from utils.security import check_password, hash_password
import pymysql

def update_current_user_profile(data: dict):
    """
    Actualiza los campos opcionales: nombre_completo, telefono, ubicacion, foto_perfil_url.
    """
    usuario = session.get("usuario")
    user_id = usuario["id_usuario"]

    campos = []
    valores = []
    for campo in ["nombre_completo", "telefono", "ubicacion", "foto_perfil_url"]:
        if campo in data:
            campos.append(f"{campo}=%s")
            valores.append(data[campo])
    if not campos:
        return {"error": "Nada para actualizar"}

    valores.append(user_id)
    sql = f"UPDATE Usuarios SET {', '.join(campos)} WHERE id_usuario=%s"
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(sql, tuple(valores))

    # Devolver perfil actualizado
    return get_current_user_profile()

def change_current_user_password(data: dict):
    """
    Cambia la contraseña del usuario actual después de validar la actual.
    """
    usuario = session.get("usuario")
    user_id = usuario["id_usuario"]

    conn = get_db()
    cursor = conn.cursor()
    sql_get = "SELECT contrasena_hash FROM Usuarios WHERE id_usuario=%s"
    cursor.execute(sql_get, (user_id,))
    row = cursor.fetchone()
    if not row:
        return {"error": "Usuario no encontrado"}

    if not check_password(data["contraseña_actual"], row["contrasena_hash"]):
        return {"error": "Contraseña actual incorrecta"}

    nueva_hash = hash_password(data["contraseña_nueva"])
    sql_upd = "UPDATE Usuarios SET contrasena_hash=%s WHERE id_usuario=%s"
    cursor.execute(sql_upd, (nueva_hash, user_id))
    return {"msg": "Contraseña cambiada exitosamente"}

def get_user_by_id(user_id: int):
    """
    Sólo admin o el propio usuario pueden consultar este endpoint.
    """
    conn = get_db()
    cursor = conn.cursor()
    sql = """
        SELECT id_usuario, nombre_completo, email, telefono, dni, Ubicacion, tipo_usuario, fecha_registro, estado_cuenta, foto_perfil_url
        FROM Usuarios WHERE id_usuario=%s
    """
    cursor.execute(sql, (user_id,))
    return cursor.fetchone()

def list_all_users(filters: dict):
    """
    (ADMIN) Lista todos, con filtros opcionales por tipo y estado_cuenta.
    """
    conn = get_db()
    cursor = conn.cursor()
    conditions = []
    valores = []
    if "tipo_usuario" in filters:
        conditions.append("tipo_usuario=%s")
        valores.append(filters["tipo_usuario"])
    if "estado_cuenta" in filters:
        conditions.append("estado_cuenta=%s")
        valores.append(filters["estado_cuenta"])
    where = f"WHERE {' AND '.join(conditions)}" if conditions else ""
    sql = f"""
        SELECT id_usuario, nombre_completo, email, telefono, dni, Ubicacion, tipo_usuario, fecha_registro, estado_cuenta, foto_perfil_url
        FROM Usuarios {where}
    """
    cursor.execute(sql, tuple(valores))
    return cursor.fetchall()

def change_user_status(user_id: int, nuevo_estado: str):
    """
    ADMIN: Cambia el estado de la cuenta (activo/inactivo/suspendido).
    """
    conn = get_db()
    cursor = conn.cursor()
    sql = "UPDATE Usuarios SET estado_cuenta=%s WHERE id_usuario=%s"
    cursor.execute(sql, (nuevo_estado, user_id))
    return {"msg": "Estado actualizado"}


def delete_user_account(id_usuario: int):
    db = get_db()
    try:
        # Borrar datos relacionados en orden correcto
        db.execute("""
            DELETE FROM Tarifas_Transportista WHERE id_transportista = ?;
            DELETE FROM Vehiculos WHERE id_usuario = ?;
            DELETE FROM Metodos_Pago WHERE id_usuario = ?;
            DELETE FROM solicitudes WHERE id_cliente = ?;
            DELETE FROM notificaciones WHERE id_usuario = ?;
            DELETE FROM calificaciones WHERE calificador = ?;
            DELETE FROM calificaciones WHERE calificado = ?;
            DELETE FROM incidentes WHERE id_usuario = ?;
            DELETE FROM asignaciones WHERE id_transportista = ?;
            DELETE FROM usuarios WHERE id_usuario = ?;
        """, (id_usuario,) * 10)

        db.commit()
        return {"msg": "OK"}

    except Exception as e:
        db.rollback()
        return {"error": str(e)}