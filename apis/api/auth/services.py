from db import get_db
from utils.security import hash_password, check_password
import pymysql

def register_user(data: dict) -> dict:
    """
    Inserta un nuevo usuario en la tabla Usuarios.
    Retorna el registro del usuario (sin contrasena_hash).
    """
    conn = get_db()
    cursor = conn.cursor()
    # Verificar que email, dni o teléfono no existan ya
    sql_check = """
        SELECT id_usuario FROM Usuarios
        WHERE email = %s OR dni = %s OR telefono = %s
    """
    cursor.execute(sql_check, (data["email"], data["dni"], data["telefono"]))
    if cursor.fetchone():
        return {"error": "Email, DNI o teléfono ya registrados"}

    hashed = hash_password(data["contrasena"])
    sql_insert = """
        INSERT INTO Usuarios
        (nombre_completo, email, telefono, dni, contrasena_hash, Ubicacion, tipo_usuario, foto_perfil_url)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
    """
    cursor.execute(sql_insert, (
        data["nombre_completo"], data["email"], data["telefono"], data["dni"],
        hashed, data["ubicacion"], data["tipo_usuario"], data["foto_perfil_url"]
    ))
    user_id = cursor.lastrowid

    # Obtener usuario insertado (sin contrasena_hash)
    sql_get = "SELECT id_usuario, nombre_completo, email, telefono, dni, Ubicacion, tipo_usuario, fecha_registro, estado_cuenta, foto_perfil_url FROM Usuarios WHERE id_usuario=%s"
    cursor.execute(sql_get, (user_id,))
    usuario = cursor.fetchone()

    return usuario

def login_user(data: dict) -> dict:
    """
    Verifica credenciales y retorna JWT si es válido.
    """
    conn = get_db()
    cursor = conn.cursor()
    sql_get = "SELECT * FROM Usuarios WHERE email=%s OR dni=%s"
    cursor.execute(sql_get, (data["email"],data["dni"]))
    usuario = cursor.fetchone()
    if not usuario:
        return {"error": "Credenciales inválidas"}

    if usuario["estado_cuenta"] != "activo":
        return {"error": "Cuenta no activa"}

    if not check_password(data["contrasena"], usuario["contrasena_hash"]):
        return {"error": "Credenciales inválidas"}

    return {
        "usuario": usuario
    }

# En una implementación completa agregarías reset password, refresh token, logout, etc.
