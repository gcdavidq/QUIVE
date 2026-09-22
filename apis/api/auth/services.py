from db import get_db
from utils.security import hash_password, check_password
from google.auth.transport import requests
from google.oauth2 import id_token
from config import config


def verificar_existencia_usuario(email: str, dni: str, telefono: str) -> bool:
    """Verifica si ya existe un usuario con el mismo email, DNI o teléfono."""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT id_usuario FROM Usuarios
        WHERE email = %s OR dni = %s OR telefono = %s
    """, (email, dni, telefono))
    return cursor.fetchone() is not None


def registrar_usuario(data: dict) -> dict:
    """Registra un nuevo usuario y devuelve sus datos (sin contraseña)."""
    if verificar_existencia_usuario(data["email"], data["dni"], data["telefono"]):
        return {"error": "Email, DNI o teléfono ya registrados"}

    conn = get_db()
    cursor = conn.cursor()
    hashed = hash_password(data["contrasena"])

    cursor.execute("""
        INSERT INTO Usuarios
        (nombre_completo, email, telefono, dni, contrasena_hash, ubicacion, tipo_usuario, foto_perfil_url)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        RETURNING id_usuario
    """, (
        data["nombre_completo"], data["email"], data["telefono"], data["dni"],
        hashed, data["ubicacion"], data["tipo_usuario"], data["foto_perfil_url"]
    ))
    user_id = cursor.fetchone()["id_usuario"]

    cursor.execute("""
        SELECT id_usuario, nombre_completo, email, telefono, dni, ubicacion, tipo_usuario, fecha_registro, estado_cuenta, foto_perfil_url
        FROM Usuarios WHERE id_usuario=%s
    """, (user_id,))
    return {"usuario": cursor.fetchone()}


def actualizar_usuario(data: dict) -> dict:
    """Actualiza los datos de un usuario existente y devuelve los datos actualizados."""
    if "id_usuario" not in data or not data["id_usuario"]:
        return {"error": "Se requiere id_usuario para actualizar."}

    conn = get_db()
    cursor = conn.cursor()

    hashed = hash_password(data["contrasena"]) if data.get("contrasena") else None
    password_clause = ", contrasena_hash = %s" if hashed else ""

    sql_update = f"""
        UPDATE Usuarios
        SET nombre_completo = %s,
            email = %s,
            telefono = %s,
            dni = %s,
            ubicacion = %s,
            tipo_usuario = %s,
            foto_perfil_url = %s
            {password_clause}
        WHERE id_usuario = %s
    """

    params = [
        data["nombre_completo"],
        data["email"],
        data["telefono"],
        data["dni"],
        data["ubicacion"],
        data["tipo_usuario"],
        data["foto_perfil_url"]
    ]
    if hashed:
        params.append(hashed)
    params.append(data["id_usuario"])
    cursor.execute(sql_update, params)

    cursor.execute("""
        SELECT id_usuario, nombre_completo, email, telefono, dni, ubicacion, tipo_usuario, fecha_registro, estado_cuenta, foto_perfil_url
        FROM Usuarios WHERE id_usuario=%s
    """, (data["id_usuario"],))
    return {"usuario": cursor.fetchone()}


def login_user(data: dict) -> dict:
    """
    Verifica credenciales y retorna datos del usuario si es válido.
    Acepta indistintamente email, dni o identificador.
    """
    conn = get_db()
    cursor = conn.cursor()

    identificador = data.get("identificador") or data.get("email") or data.get("dni") or ""
    email = data.get("email") or identificador
    dni = data.get("dni") or identificador

    sql_get = "SELECT * FROM Usuarios WHERE email = %s OR dni = %s"
    cursor.execute(sql_get, (email, dni))
    usuario = cursor.fetchone()
    if not usuario:
        return {"error": "Credenciales inválidas"}

    if usuario.get("estado_cuenta") != "activo":
        return {"error": "Cuenta no activa"}

    contrasena = data.get("contrasena") or data.get("password") or ""
    if not usuario.get("contrasena_hash") or not check_password(contrasena, usuario["contrasena_hash"]):
        return {"error": "Credenciales inválidas"}

    usuario.pop("contrasena_hash", None)
    return {
        "usuario": usuario
    }


def verify_google_token(token):
    """
    Verifica el token de Google y extrae la información del usuario.
    """
    try:
        CLIENT_ID = config.GOOGLE_CLIENT_ID

        idinfo = id_token.verify_oauth2_token(token, requests.Request(), CLIENT_ID)

        if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
            raise ValueError('Wrong issuer.')

        return {
            'email': idinfo['email'],
            'nombre': idinfo['name'],
            'google_id': idinfo['sub'],
            'foto_perfil': idinfo.get('picture', '')
        }
    except ValueError as e:
        return None


def create_or_get_google_user(google_data):
    """
    Busca un usuario existente por email o crea uno nuevo para Google OAuth.
    COMPATIBILIDAD: No afecta usuarios existentes que se registraron normalmente.
    """
    conn = get_db()
    cursor = conn.cursor()

    sql_get = "SELECT * FROM Usuarios WHERE email = %s"
    cursor.execute(sql_get, (google_data['email'],))
    usuario = cursor.fetchone()

    if usuario:
        # CASO 1: Usuario existente — vincular Google si no lo tiene
        if not usuario.get('google_id'):
            cursor.execute("""
                UPDATE Usuarios
                SET google_id = %s
                WHERE email = %s
            """, (google_data['google_id'], google_data['email']))

            usuario['google_id'] = google_data['google_id']

        if usuario["estado_cuenta"] != "activo":
            return {"error": "Cuenta no activa"}

        if 'contrasena_hash' in usuario:
            del usuario['contrasena_hash']

        return {"usuario": usuario}

    else:
        # CASO 2: Usuario completamente nuevo vía Google
        cursor.execute("""
            INSERT INTO Usuarios (
                nombre_completo, email, google_id, foto_perfil_url,
                tipo_usuario, estado_cuenta, dni, telefono, ubicacion, contrasena_hash
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id_usuario
        """, (
            google_data['nombre'],
            google_data['email'],
            google_data['google_id'],
            google_data['foto_perfil'],
            'cliente',
            'activo',
            None,
            '',
            '',
            None
        ))
        user_id = cursor.fetchone()["id_usuario"]

        cursor.execute("SELECT * FROM Usuarios WHERE id_usuario = %s", (user_id,))
        nuevo_usuario = cursor.fetchone()

        if 'contrasena_hash' in nuevo_usuario:
            del nuevo_usuario['contrasena_hash']

        return {
            "usuario": nuevo_usuario,
            "needs_completion": True
        }